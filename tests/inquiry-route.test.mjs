import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const routePath = fileURLToPath(new URL("../app/api/inquiry/route.ts", import.meta.url));
const validationPath = fileURLToPath(new URL("../app/inquiry-validation.ts", import.meta.url));
const formatterPath = fileURLToPath(new URL("../app/server/inquiry-email.ts", import.meta.url));
const submission = {
  lead: { year: "2014", make: "Honda", model: "Civic", firstName: "Alex Example", phone: "619-555-0142", streetAddress: "123 Example Street", city: "San Diego", state: "CA", zip: "92154", runningStatus: "runs", ownershipStatus: "owner_with_title" },
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
    assert.match(email.subject, /^Quick vehicle inquiry:/);
    assert.match(email.text, /not a completed condition assessment/);
    assert.match(email.text, /Alex Example/);
    assert.match(email.text, /Pickup street address: 123 Example Street/);
    assert.match(email.text, /Pickup city \/ state \/ ZIP: San Diego, CA 92154/);
    assert.doesNotMatch(email.text, /Apt \/ unit \/ space/);
    assert.match(email.text, /Page: \/junk-cars/);
    assert.match(email.text, new RegExp(`Selection method: ${selectionMethod}`));
    assert.match(email.text, /Language: en/);
    assert.match(email.text, /Running status \(seller-reported\): Runs/);
    assert.match(email.text, /Ownership \/ title \(seller-reported\): Seller reports they are the owner and have the title/);
    assert.match(email.text, /have not been verified/);
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

test("invalid input never reaches Turnstile or email providers", async () => {
  let calls = 0;
  const { POST } = loadTypeScript(routePath, async () => { calls++; throw new Error("Unexpected provider call"); });
  const invalid = [null, [], "invalid", {}, { ...submission, lead: null }, { ...submission, lead: [] },
    { ...submission, turnstileToken: "" }, { ...submission, turnstileToken: "a".repeat(2049) },
    { ...submission, sourcePath: "https://external.invalid/page" }, { ...submission, sourcePath: "//external.invalid" },
    { ...submission, sourcePath: "/\\external.invalid" }, { ...submission, submissionId: "not-a-uuid" },
    { ...submission, selectionMethod: "other" },
    ...["firstName", "phone", "streetAddress", "city", "state", "zip", "year", "make", "model", "runningStatus", "ownershipStatus"].map((field) => ({ ...submission, lead: { ...submission.lead, [field]: "" } })),
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

test("all supported screening answers remain valid inquiries for human review", async () => {
  const { inquiryRunningStatuses, inquiryOwnershipStatuses } = loadTypeScript(validationPath);
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
      assert.match(email.text, /All inquiries require human review/);
      assert.match(email.text, /no offer or eligibility has been confirmed/);
      if (runningStatus === "not_sure") assert.match(email.text, /Running status \(seller-reported\): Not sure/);
      if (ownershipStatus === "not_sure") assert.match(email.text, /Seller is not sure about ownership or title status/);
    }
  }
  assert.equal(emails.length, 12);
});

test("source URLs are reduced to internal pathnames and HTML values are escaped", async () => {
  const { normalizeInquiry, validateInquiry } = loadTypeScript(validationPath);
  const { formatInquiryEmail } = loadTypeScript(formatterPath);
  const normalized = normalizeInquiry({ ...submission, locale: "es", sourcePath: "/es/junk-cars?email=private@example.invalid#private", lead: { ...submission.lead, firstName: '<script>alert("test")</script>', model: "Civic & <test>" } });
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

test("review examples match the exact production formatter", () => {
  const { normalizeInquiry } = loadTypeScript(validationPath);
  const { formatInquiryEmail } = loadTypeScript(formatterPath);
  const message = formatInquiryEmail(normalizeInquiry(submission));
  const directory = new URL("../audits/2026-09-16-address-update/", import.meta.url);
  assert.equal(readFileSync(new URL("quick-inquiry-example.html", directory), "utf8"), message.html);
  assert.equal(readFileSync(new URL("quick-inquiry-example.txt", directory), "utf8"), message.text);
});
