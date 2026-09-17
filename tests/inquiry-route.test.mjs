import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const routePath = fileURLToPath(new URL("../app/api/inquiry/route.ts", import.meta.url));
const validationPath = fileURLToPath(new URL("../app/inquiry-validation.ts", import.meta.url));
const formatterPath = fileURLToPath(new URL("../app/server/inquiry-email.ts", import.meta.url));
const submission = {
  lead: { year: "2014", make: "Honda", model: "Civic", fullName: "Alex Example", notes: "Call after 5 pm.\nThe vehicle is in the driveway.", phone: "619-555-0142", streetAddress: "123 Example Street", city: "San Diego", state: "CA", zip: "92154", runningStatus: "runs", ownershipStatus: "owner_with_title" },
  locale: "en", sourcePath: "/junk-cars", selectionMethod: "dropdown",
  submissionId: "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210", turnstileToken: "test-only-token",
};
const request = (payload) => new Request("http://localhost/api/inquiry", { method: "POST", body: JSON.stringify(payload) });

test("VIN, dropdown and manual inquiries deliver identity, screening and complete pickup address", async () => {
  for (const selectionMethod of ["vin", "dropdown", "manual"]) {
    const calls = [];
    const { POST } = loadTypeScript(routePath, async (url, options) => {
      calls.push({ url, options });
      return Response.json(calls.length === 1 ? { success: true } : { id: "mock-inquiry" });
    }, { OFFER_BCC_EMAIL: "copy@example.invalid, ,archive@example.invalid" });
    const payload = { ...submission, selectionMethod };
    if (selectionMethod === "vin") payload.lead = { ...submission.lead, vin: "1HGBH41JXMN109186", year: "1991", model: "Accord", phone: "+1 (619) 555-0142" };
    const result = await POST(request(payload));
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), { ok: true, id: "mock-inquiry" });
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /turnstile/);
    assert.match(calls[1].url, /resend/);
    assert.ok(calls.every((call) => call.options.signal instanceof AbortSignal));
    const email = JSON.parse(calls[1].options.body);
    assert.equal("reply_to" in email, false);
    assert.deepEqual(email.to, ["leads@example.invalid"]);
    assert.deepEqual(email.bcc, ["copy@example.invalid", "archive@example.invalid"]);
    assert.equal(email.subject, `New lead: ${payload.lead.year} ${payload.lead.make} ${payload.lead.model} | Runs | Owner with title | San Diego 92154`);
    assert.ok(email.text.startsWith("Full name: Alex Example\n"));
    assert.match(email.text, /Notes: Call after 5 pm\.\nThe vehicle is in the driveway\./);
    assert.match(email.html, /Call after 5 pm\.<br \/>The vehicle is in the driveway\./);
    assert.match(email.html, /href="tel:\+16195550142"/);
    assert.doesNotMatch(email.text, /not a completed condition assessment|All inquiries require|have not been verified/);
    assert.match(email.text, /Pickup street address: 123 Example Street/);
    assert.match(email.text, /Pickup city \/ state \/ ZIP: San Diego, CA 92154/);
    assert.doesNotMatch(email.text, /Apt \/ unit \/ space/);
    assert.match(email.text, /Page: \/junk-cars/);
    assert.match(email.text, new RegExp(`Selection method: ${selectionMethod}`));
    assert.match(email.text, /Language: en/);
    assert.match(email.text, /Running status: Runs/);
    assert.match(email.text, /Ownership \/ title: Owner with title/);
    if (selectionMethod === "vin") {
      assert.match(email.subject, /1991 Honda Accord/);
      assert.match(email.text, /Vehicle: 1991 Honda Accord/);
      assert.match(email.text, /VIN: 1HGBH41JXMN109186/);
    }
    assert.equal(email.tags[0].value, "quick_inquiry");
    assert.equal(calls[1].options.headers["Idempotency-Key"], `quick-inquiry/${submission.submissionId}`);
  }
});

test("retries keep the same email idempotency key and body", async () => {
  const messages = [];
  const { POST } = loadTypeScript(routePath, async (url, options) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    messages.push({ headers: options.headers, body: options.body });
    return Response.json({ id: "same-delivery" });
  });
  for (const turnstileToken of ["first-token", "fresh-token"]) {
    const result = await POST(request({ ...submission, turnstileToken }));
    assert.equal(result.status, 200);
  }
  assert.equal(messages[0].headers["Idempotency-Key"], messages[1].headers["Idempotency-Key"]);
  assert.equal(messages[0].body, messages[1].body);
});

test("full names support Unicode and a single name; legacy firstName remains compatible", async () => {
  const names = [];
  const { POST } = loadTypeScript(routePath, async (url, options) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    names.push(JSON.parse(options.body).text.split("\n")[0]);
    return Response.json({ id: "mock-name-inquiry" });
  });
  for (const lead of [
    { ...submission.lead, fullName: "  María   O’Neill 李  " },
    { ...submission.lead, fullName: "李" },
    { ...submission.lead, fullName: undefined, firstName: "Legacy Seller" },
    { ...submission.lead, fullName: "Canonical Seller", firstName: "Ignored Legacy" },
  ]) {
    assert.equal((await POST(request({ ...submission, lead }))).status, 200);
  }
  assert.deepEqual(names, [
    "Full name: María O’Neill 李", "Full name: 李", "Full name: Legacy Seller", "Full name: Canonical Seller",
  ]);
  const invalid = await POST(request({ ...submission, lead: { ...submission.lead, fullName: "", firstName: "Legacy must not override an explicit empty name" } }));
  assert.equal(invalid.status, 400);
  assert.ok((await invalid.json()).missing.includes("fullName"));
});

test("omitted or blank optional notes normalize to empty and do not add a notes section", async () => {
  const { normalizeInquiry } = loadTypeScript(validationPath);
  const messages = [];
  const { POST } = loadTypeScript(routePath, async (url, options) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    messages.push(JSON.parse(options.body));
    return Response.json({ id: "mock-no-notes-inquiry" });
  });
  for (const notes of [undefined, "", "  \r\n\t "]) {
    const payload = { ...submission, lead: { ...submission.lead, notes } };
    assert.equal(normalizeInquiry(payload).lead.notes, "");
    assert.equal((await POST(request(payload))).status, 200);
    assert.doesNotMatch(messages.at(-1).text, /^Notes:/m);
    assert.doesNotMatch(messages.at(-1).html, />\s*Notes\s*</);
  }
});

test("notes enforce the shared length limit without silently truncating the submitted text", async () => {
  const { INQUIRY_NOTES_MAX_LENGTH, normalizeInquiry, validateInquiry } = loadTypeScript(validationPath);
  const maximum = { ...submission, lead: { ...submission.lead, notes: "N".repeat(INQUIRY_NOTES_MAX_LENGTH) } };
  assert.deepEqual(validateInquiry(normalizeInquiry(maximum)), []);
  const oversized = { ...submission, lead: { ...submission.lead, notes: maximum.lead.notes + "!" } };
  assert.equal(normalizeInquiry(oversized).lead.notes.length, INQUIRY_NOTES_MAX_LENGTH + 1);
  let calls = 0;
  const { POST } = loadTypeScript(routePath, async () => { calls++; throw new Error("Unexpected provider call"); });
  const result = await POST(request(oversized));
  assert.equal(result.status, 400);
  assert.ok((await result.json()).missing.includes("notes"));
  assert.equal(calls, 0);
});

test("multiline notes keep their formatting and escape HTML in the delivered message", async () => {
  let message;
  const { POST } = loadTypeScript(routePath, async (url, options) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    message = JSON.parse(options.body);
    return Response.json({ id: "mock-multiline-inquiry" });
  });
  const notes = 'First line <img src=x onerror="alert(1)">\r\nSecond & final\rThird line';
  const result = await POST(request({ ...submission, lead: { ...submission.lead, notes } }));
  assert.equal(result.status, 200);
  assert.ok(message.text.includes('Notes: First line <img src=x onerror="alert(1)">\nSecond & final\nThird line'));
  assert.match(message.html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;<br \/>Second &amp; final<br \/>Third line/);
  assert.doesNotMatch(message.html, /<img|<script/);
});

test("invalid input never reaches Turnstile or email providers", async () => {
  let calls = 0;
  const { POST } = loadTypeScript(routePath, async () => { calls++; throw new Error("Unexpected provider call"); });
  const invalid = [null, [], "invalid", {}, { ...submission, lead: null }, { ...submission, lead: [] },
    { ...submission, turnstileToken: "" }, { ...submission, turnstileToken: "a".repeat(2049) },
    { ...submission, sourcePath: "https://external.invalid/page" }, { ...submission, sourcePath: "//external.invalid" },
    { ...submission, sourcePath: "/\\external.invalid" }, { ...submission, submissionId: "not-a-uuid" },
    { ...submission, selectionMethod: "other" },
    ...["fullName", "phone", "streetAddress", "city", "state", "zip", "year", "make", "model", "runningStatus", "ownershipStatus"].map((field) => ({ ...submission, lead: { ...submission.lead, [field]: "" } })),
    ...["90210", "92154extra", "921540"].map((zip) => ({ ...submission, lead: { ...submission.lead, zip } })),
    ...["123", "call6195550142", "+446195550142"].map((phone) => ({ ...submission, lead: { ...submission.lead, phone } })),
    ...["1899", String(new Date().getFullYear() + 2), "2014extra"].map((year) => ({ ...submission, lead: { ...submission.lead, year } })),
    ...["", "1HGBH41JXMN10918", "1HGBH41JXMN1091867", "IHGBH41JXMN109186"].map((vin) => ({ ...submission, selectionMethod: "vin", lead: { ...submission.lead, vin } })),
  ];
  for (const payload of invalid) {
    const response = await POST(request(payload));
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, "string");
  }
  const malformed = await POST(new Request("http://localhost/api/inquiry", { method: "POST", body: "{not JSON" }));
  assert.equal(malformed.status, 400);
  assert.equal(calls, 0);
});

test("missing or malformed pickup street, city and state are rejected before provider calls", async () => {
  let calls = 0;
  const { POST } = loadTypeScript(routePath, async () => { calls++; throw new Error("Unexpected provider call"); });
  for (const field of ["streetAddress", "city", "state"]) {
    for (const value of [undefined, null, true, false, 123, {}, [], "", " \n\t "]) {
      const result = await POST(request({ ...submission, lead: { ...submission.lead, [field]: value } }));
      assert.equal(result.status, 400);
      assert.ok((await result.json()).missing.includes(field));
    }
  }
  for (const state of ["NV", "TX", "California", "CAX", "US-CA"]) {
    const result = await POST(request({ ...submission, lead: { ...submission.lead, state } }));
    assert.equal(result.status, 400);
    assert.ok((await result.json()).missing.includes("state"));
  }
  assert.equal(calls, 0);
});

test("pickup address is normalized, bounded and includes an optional unit in delivery", async () => {
  const { normalizeInquiry, validateInquiry } = loadTypeScript(validationPath);
  const normalized = normalizeInquiry({ ...submission, lead: {
    ...submission.lead, streetAddress: "  123   Example Street  ", addressLine2: "  Unit 4B  ", city: " San   Diego ", state: " ca ",
  } });
  assert.equal(normalized.lead.streetAddress, "123 Example Street");
  assert.equal(normalized.lead.addressLine2, "Unit 4B");
  assert.equal(normalized.lead.city, "San Diego");
  assert.equal(normalized.lead.state, "CA");
  assert.deepEqual(validateInquiry(normalized), []);
  const oversized = normalizeInquiry({ ...submission, lead: { ...submission.lead, streetAddress: "S".repeat(241), addressLine2: "U".repeat(241), city: "C".repeat(241) } });
  assert.equal(oversized.lead.streetAddress.length, 240);
  assert.equal(oversized.lead.addressLine2.length, 240);
  assert.equal(oversized.lead.city.length, 240);

  let email;
  const { POST } = loadTypeScript(routePath, async (url, options) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    email = JSON.parse(options.body);
    return Response.json({ id: "mock-address-inquiry" });
  });
  const result = await POST(request(normalized));
  assert.equal(result.status, 200);
  assert.match(email.text, /Pickup street address: 123 Example Street/);
  assert.match(email.text, /Apt \/ unit \/ space: Unit 4B/);
  assert.match(email.text, /Pickup city \/ state \/ ZIP: San Diego, CA 92154/);
  assert.match(email.html, /123 Example Street/);
  assert.match(email.html, /Unit 4B/);
  assert.match(email.html, /San Diego, CA 92154/);
});

test("VIN requests require year, make and model even when the VIN format is valid", async () => {
  let calls = 0;
  const { POST } = loadTypeScript(routePath, async () => { calls++; throw new Error("Unexpected provider call"); });
  for (const field of ["year", "make", "model"]) {
    const lead = { ...submission.lead, vin: "1HGBH41JXMN109186" };
    delete lead[field];
    const result = await POST(request({ ...submission, selectionMethod: "vin", lead }));
    assert.equal(result.status, 400);
    assert.ok((await result.json()).missing.includes(field));
  }
  assert.equal(calls, 0);
});

test("missing, invalid or incorrectly typed screening answers are rejected before provider calls", async () => {
  let calls = 0;
  const { POST } = loadTypeScript(routePath, async () => { calls++; throw new Error("Unexpected provider call"); });
  for (const field of ["runningStatus", "ownershipStatus"]) {
    for (const answer of [undefined, null, true, false, 0, {}, [], "unknown", "RUNS", "verified_owner"]) {
      const result = await POST(request({ ...submission, lead: { ...submission.lead, [field]: answer } }));
      assert.equal(result.status, 400);
      assert.ok((await result.json()).missing.includes(field));
    }
  }
  assert.equal(calls, 0);
});

test("all 12 screening combinations remain valid and show their exact labels in the inbox subject", async () => {
  const { inquiryRunningStatuses, inquiryOwnershipStatuses } = loadTypeScript(validationPath);
  const runningLabels = { runs: "Runs", does_not_run: "Does not run", not_sure: "Not sure" };
  const ownershipLabels = {
    owner_with_title: "Owner with title", owner_without_title: "Owner without title",
    authorized_seller: "Authorized by the owner", not_sure: "Other / not sure",
  };
  const emails = [];
  const { POST } = loadTypeScript(routePath, async (url, options) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    emails.push(JSON.parse(options.body));
    return Response.json({ id: "mock-human-review-inquiry" });
  });
  for (const runningStatus of inquiryRunningStatuses) {
    for (const ownershipStatus of inquiryOwnershipStatuses) {
      const result = await POST(request({ ...submission, lead: { ...submission.lead, runningStatus, ownershipStatus } }));
      assert.equal(result.status, 200, `${runningStatus}/${ownershipStatus} is accepted for review`);
      const email = emails.at(-1);
      assert.equal(email.subject, `New lead: 2014 Honda Civic | ${runningLabels[runningStatus]} | ${ownershipLabels[ownershipStatus]} | San Diego 92154`);
      assert.ok(email.text.includes(`Running status: ${runningLabels[runningStatus]}\n`));
      assert.ok(email.text.includes(`Ownership / title: ${ownershipLabels[ownershipStatus]}\n`));
    }
  }
  assert.equal(emails.length, 12);
});

test("source URLs are reduced to internal pathnames and HTML values are escaped", async () => {
  const { normalizeInquiry, validateInquiry } = loadTypeScript(validationPath);
  const { formatInquiryEmail } = loadTypeScript(formatterPath);
  const normalized = normalizeInquiry({ ...submission, locale: "es", sourcePath: "/es/junk-cars?email=private@example.invalid#private", lead: { ...submission.lead, fullName: '<script>alert("test")</script>', model: "Civic & <test>" } });
  assert.deepEqual(validateInquiry(normalized), []);
  assert.equal(normalized.sourcePath, "/es/junk-cars");
  const message = formatInquiryEmail(normalized);
  assert.match(message.html, /&lt;script&gt;/);
  assert.match(message.html, /Civic &amp; &lt;test&gt;/);
  assert.doesNotMatch(message.html, /<script>|private@example.invalid/);
  assert.match(message.text, /Language: es/);
  assert.doesNotMatch(message.text, /private@example.invalid/);
});

test("failed, malformed or unavailable security never sends email", async () => {
  for (const security of [Response.json({ success: false }), Response.json({ success: "true" }), new Response("private provider response", { status: 502 })]) {
    let calls = 0;
    const { POST } = loadTypeScript(routePath, async () => { calls++; return security; });
    const result = await POST(request(submission));
    assert.equal(result.status, 400);
    assert.equal(calls, 1);
    assert.doesNotMatch(JSON.stringify(await result.json()), /private provider response/);
  }
});

test("timeouts and provider rejection return safe JSON and no success", async () => {
  for (const failingCall of [1, 2]) {
    let calls = 0;
    const { POST } = loadTypeScript(routePath, async () => {
      if (++calls === failingCall) throw new DOMException("PRIVATE lead/provider text", "TimeoutError");
      return Response.json({ success: true });
    });
    const result = await POST(request({ ...submission, locale: "es" }));
    assert.equal(result.status, 502);
    const body = await result.json();
    assert.equal(body.ok, undefined);
    assert.doesNotMatch(body.error, /PRIVATE|Alex Example/);
  }
  for (const delivery of [Response.json({ message: "PRIVATE" }, { status: 429 }), Response.json({}), new Response("PRIVATE"), Response.json({ id: "" })]) {
    let calls = 0;
    const { POST } = loadTypeScript(routePath, async () => ++calls === 1 ? Response.json({ success: true }) : delivery);
    const result = await POST(request(submission));
    assert.equal(result.status, 502);
    assert.doesNotMatch(JSON.stringify(await result.json()), /PRIVATE|"ok":true/);
  }
});

test("missing provider configuration fails safely without any delivery bypass", async () => {
  for (const env of [{ TURNSTILE_SECRET_KEY: undefined }, { RESEND_API_KEY: undefined }, { RESEND_FROM_EMAIL: undefined }]) {
    const { POST } = loadTypeScript(routePath, async (url) => {
      assert.match(url, /turnstile/);
      return Response.json({ success: true });
    }, env);
    const result = await POST(request(submission));
    assert.equal(result.status, 503);
    assert.equal((await result.json()).ok, undefined);
  }
});

test("formatter presents scannable lead information and clickable phone without the lengthy disclaimer", () => {
  const { normalizeInquiry } = loadTypeScript(validationPath);
  const { formatInquiryEmail } = loadTypeScript(formatterPath);
  const message = formatInquiryEmail(normalizeInquiry(submission));
  assert.equal(message.subject, "New lead: 2014 Honda Civic | Runs | Owner with title | San Diego 92154");
  assert.ok(message.text.startsWith("Full name: Alex Example\nPhone:"));
  assert.match(message.html, /<h[1-6]\b[^>]*>\s*2014 Honda Civic\s*<\/h[1-6]>/);
  for (const section of ["Contact", "Pickup", "Vehicle details", "Notes"]) {
    assert.ok(message.html.includes(`>${section}</`), `${section} is a distinct section`);
  }
  assert.match(message.html, /href="tel:\+16195550142"/);
  assert.match(message.html, /<div style="[^"]*display:none;[^"]*">Alex Example · 619-555-0142 · 123 Example Street<\/div>/);
  assert.doesNotMatch(message.html, /not a completed condition assessment|All inquiries require|have not been verified/);
  assert.ok(message.html.indexOf("Full name") < message.html.indexOf("Selection method"));
  assert.ok(message.html.indexOf("Notes") < message.html.indexOf("Selection method"));
});
