import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const routePath = fileURLToPath(new URL("../app/api/offer/route.ts", import.meta.url));
const lead = {
  year: "2010", make: "Toyota", model: "Corolla", firstName: "Test",
  phone: "6195550100", email: "seller@example.invalid", streetAddress: "123 Example St",
  city: "San Diego", state: "CA", zip: "92154", hasTitle: true, mileage: "Under 150,000",
  drives: true, catalyticConverter: true, bodyDamage: "Normal wear", access: "Home driveway",
  airbagsDeployed: false, hasKeys: true,
};

const loadRoute = (fetchMock) => loadTypeScript(routePath, fetchMock);

function request(payload) {
  return new Request("http://localhost/api/offer", { method: "POST", body: JSON.stringify(payload) });
}

test("complete detailed offer preserves contact, pickup address and condition delivery", async () => {
  const calls = [];
  const { POST } = loadRoute(async (url, options) => {
    calls.push({ url, options });
    return Response.json(calls.length === 1 ? { success: true } : { id: "mock-delivery" });
  });
  const result = await POST(request({ lead, turnstileToken: "test-only-token" }));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { ok: true, id: "mock-delivery" });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /turnstile/);
  assert.match(calls[1].url, /resend/);
  assert.ok(calls.every((call) => call.options.signal instanceof AbortSignal));
  const email = JSON.parse(calls[1].options.body);
  assert.equal(email.reply_to, lead.email);
  assert.match(email.text, /Email: seller@example.invalid/);
  assert.match(email.text, /Street: 123 Example St/);
  assert.match(email.text, /Catalytic converter installed: Yes/);
  assert.equal(email.tags[0].value, "offer_form");
});

test("detailed offers still require full contact, address and condition fields", async () => {
  let calls = 0;
  const { POST } = loadRoute(async () => { calls++; throw new Error("Unexpected provider call"); });
  for (const field of ["email", "streetAddress", "city", "state", "mileage", "bodyDamage", "hasTitle", "catalyticConverter"]) {
    const incomplete = { ...lead };
    delete incomplete[field];
    const response = await POST(request({ lead: incomplete, turnstileToken: "test-only-token" }));
    assert.equal(response.status, 400, `${field} remains required`);
    assert.ok((await response.json()).missing.includes(field), `${field} is identified`);
  }
  assert.equal(calls, 0);
});

test("malformed, missing security, invalid contact and outside-area payloads never call a provider", async () => {
  let calls = 0;
  const { POST } = loadRoute(async () => { calls++; throw new Error("Unexpected provider call"); });
  for (const payload of [null, [], "invalid", { lead: null }, { lead: [] }, { lead },
    { lead: { ...lead, email: "invalid" }, turnstileToken: "test-only-token" },
    { lead: { ...lead, zip: "90210" }, turnstileToken: "test-only-token" }]) {
    const response = await POST(request(payload));
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, "string");
  }
  assert.equal(calls, 0);
});

test("failed security cannot send a lead and returns a retryable message", async () => {
  let calls = 0;
  const { POST } = loadRoute(async () => { calls++; return Response.json({ success: false }); });
  const response = await POST(request({ lead, turnstileToken: "test-only-token" }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Retry the security check/);
  assert.equal(calls, 1);
});

test("provider network failures return JSON and never claim success", async () => {
  for (const failingCall of [1, 2]) {
    let calls = 0;
    const { POST } = loadRoute(async () => {
      if (++calls === failingCall) throw new Error("Private provider error");
      return Response.json({ success: true });
    });
    const response = await POST(request({ lead, turnstileToken: "test-only-token" }));
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.ok, undefined);
    assert.doesNotMatch(body.error, /Private provider error/);
  }
});

test("email rejection or an invalid acceptance response never records success", async () => {
  for (const providerResponse of [Response.json({ message: "Provider internals" }, { status: 500 }), Response.json({})]) {
    let calls = 0;
    const { POST } = loadRoute(async () => ++calls === 1 ? Response.json({ success: true }) : providerResponse);
    const response = await POST(request({ lead, turnstileToken: "test-only-token" }));
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.ok, undefined);
    assert.doesNotMatch(body.error, /Provider internals/);
  }
});

test("an ambiguous provider failure and retry use the same normalized submission key with a fresh security token", async () => {
  const id = "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210";
  const emails = [];
  const tokens = [];
  const { POST } = loadRoute(async (url, options) => {
    if (url.includes("turnstile")) {
      tokens.push(options.body.get("response"));
      return Response.json({ success: true });
    }
    emails.push({ key: options.headers["Idempotency-Key"], body: options.body });
    if (emails.length === 1) throw new Error("Acceptance unknown because the connection closed");
    return Response.json({ id: "same-accepted-message" });
  });
  const first = await POST(request({ lead, submissionId: ` ${id.toUpperCase()} `, turnstileToken: "first-token" }));
  const retry = await POST(request({ lead, submissionId: id, turnstileToken: "fresh-token" }));
  assert.equal(first.status, 502);
  assert.equal(retry.status, 200);
  assert.deepEqual(tokens, ["first-token", "fresh-token"]);
  assert.deepEqual(emails.map((email) => email.key), [`offer-form/${id}`, `offer-form/${id}`]);
  assert.equal(emails[0].body, emails[1].body);
});

test("already-open legacy forms get a stable hashed key for unchanged normalized details", async () => {
  const keys = [];
  const { POST } = loadRoute(async (url, options) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    keys.push(options.headers["Idempotency-Key"]);
    return Response.json({ id: "mock-delivery" });
  });
  for (const details of [lead, { ...lead, firstName: ` ${lead.firstName} ` }, { ...lead, phone: "6195550199" }]) {
    const response = await POST(request({ lead: details, turnstileToken: "test-token" }));
    assert.equal(response.status, 200);
  }
  assert.match(keys[0], /^offer-form\/legacy\/[a-f0-9]{64}$/);
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[0], keys[2]);
  assert.doesNotMatch(keys[0], /seller|6195550100|Test/);
});

test("explicit malformed submission IDs are rejected before contacting a provider", async () => {
  let calls = 0;
  const { POST } = loadRoute(async () => { calls++; throw new Error("Unexpected provider request"); });
  for (const submissionId of [null, "", "not-a-uuid", [], "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210-extra"]) {
    const response = await POST(request({ lead, submissionId, turnstileToken: "test-token" }));
    assert.equal(response.status, 400);
    assert.deepEqual((await response.json()).missing, ["submissionId"]);
  }
  assert.equal(calls, 0);
});
