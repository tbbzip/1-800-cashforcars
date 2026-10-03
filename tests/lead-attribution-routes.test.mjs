import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const submissionId = "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210";
const quickLead = {
  year: "2014", make: "Honda", model: "Civic", fullName: "Alex Example",
  phone: "619-555-0142", streetAddress: "123 Example Street", city: "San Diego",
  state: "CA", zip: "92154", runningStatus: "runs", ownershipStatus: "owner_with_title", notes: "",
};
const fullLead = {
  year: "2010", make: "Toyota", model: "Corolla", firstName: "Test",
  phone: "6195550100", email: "seller@example.invalid", streetAddress: "123 Example St",
  city: "San Diego", state: "CA", zip: "92154", hasTitle: true, mileage: "Under 150,000",
  drives: true, catalyticConverter: true, bodyDamage: "Normal wear", access: "Home driveway",
  airbagsDeployed: false, hasKeys: true,
};
const cases = [
  {
    name: "quick inquiry", path: "inquiry", idLabel: "Inquiry ID", keyPrefix: "quick-inquiry",
    payload: { lead: quickLead, locale: "en", sourcePath: "/junk-cars", selectionMethod: "dropdown", submissionId },
  },
  {
    name: "detailed offer", path: "offer", idLabel: "Submission ID", keyPrefix: "offer-form",
    payload: { lead: fullLead, locale: "en", submissionId },
  },
];

function createRoute(scenario, onEmail) {
  const routePath = fileURLToPath(new URL(`../app/api/${scenario.path}/route.ts`, import.meta.url));
  return loadTypeScript(routePath, async (url, options) => {
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") return Response.json({ success: true });
    assert.equal(url, "https://api.resend.com/emails");
    return onEmail(options);
  });
}

function request(scenario, attribution, extra = {}) {
  return new Request(`http://localhost/api/${scenario.path}`, {
    method: "POST",
    body: JSON.stringify({ ...scenario.payload, turnstileToken: "test-only-token", attribution, ...extra }),
  });
}

for (const scenario of cases) {
  test(`${scenario.name} delivers attribution and visible identity in readable HTML and plain text`, async () => {
    let sent;
    const { POST } = createRoute(scenario, async (options) => {
      sent = { email: JSON.parse(options.body), key: options.headers["Idempotency-Key"] };
      return Response.json({ id: "mock-attribution-delivery" });
    });
    const result = await POST(request(scenario, {
      gclid: "TEST_gclid-value.1", capturedAt: "2026-10-03T15:00:00Z",
      submissionPage: "https://www.1-800-cashforcars.com/offer?email=SECRET_EMAIL_TOKEN#private-fragment",
      submittedAt: "2026-10-03T15:05:00Z", deviceType: "mobile", browserLanguage: "en-US",
      firstTouch: {
        source: "google", medium: "organic", capturedAt: "2026-10-01T12:00:00Z",
        landingPage: "https://www.1-800-cashforcars.com/junk-cars?private=SECRET_FIRST_QUERY",
        referrer: "https://www.google.com/search?q=SECRET_SEARCH_QUERY",
      },
      lastTouch: {
        source: "google", medium: "cpc", campaign: "SD-2026", campaignId: "23919195304",
        adGroupId: "123456", creativeId: "456789", targetId: "kwd-123:aud-456",
        keyword: "cash & damaged cars", content: "condition & tow", matchType: "p", network: "g", device: "m",
        physicalLocationId: "9000001", interestLocationId: "9000002",
        landingPage: "https://www.1-800-cashforcars.com/?private=SECRET_LAST_QUERY",
        referrer: "https://PRIVATE_USER:PRIVATE_PASSWORD@www.google.com/search?q=SECRET_SEARCH_QUERY",
        gclid: "TEST_gclid-value.1", capturedAt: "2026-10-03T15:00:00Z",
      },
      currentVisit: {
        source: "direct / unknown", medium: "none", capturedAt: "2026-10-03T15:01:00Z",
        landingPage: "https://www.1-800-cashforcars.com/offer?private=SECRET_CURRENT_QUERY",
      },
      ipAddress: "DO-NOT-DELIVER-IP", userAgent: "DO-NOT-DELIVER-UA",
    }));
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), { ok: true, id: "mock-attribution-delivery" });
    assert.equal(sent.key, `${scenario.keyPrefix}/${submissionId}`);
    assert.ok(sent.email.text.includes(`${scenario.idLabel}: ${submissionId}`));
    assert.ok(sent.email.text.includes("Google Ads click ID (gclid): TEST_gclid-value.1"));
    assert.ok(sent.email.text.includes("2026-10-03T15:05:00.000Z"));
    assert.ok(sent.email.text.includes("en-US"));
    assert.ok(sent.email.text.includes("Latest acquisition: source / medium: google / cpc"));
    assert.ok(sent.email.text.includes("Latest acquisition: matched keyword (not search term): cash & damaged cars"));
    assert.ok(sent.email.text.includes("Latest acquisition: campaign ID: 23919195304"));
    assert.ok(sent.email.text.includes("Latest acquisition: ad group ID: 123456"));
    assert.ok(sent.email.text.includes("Latest acquisition: ad / creative ID: 456789"));
    assert.ok(sent.email.text.includes("Latest acquisition: targeting ID: kwd-123:aud-456"));
    assert.ok(sent.email.text.includes("Latest acquisition: keyword match type: Phrase"));
    assert.ok(sent.email.text.includes("Latest acquisition: network: Google Search"));
    assert.ok(sent.email.text.includes("Latest acquisition: ad-click device: Mobile"));
    assert.ok(sent.email.text.includes("Latest acquisition: Google geographic ID (not pickup ZIP): 9000001"));
    assert.ok(sent.email.text.includes("First recorded visit: source / medium: google / organic"));
    assert.ok(sent.email.text.includes("Current visit: source / medium: direct / unknown / none"));
    assert.ok(sent.email.text.includes("Latest acquisition: referring site: https://www.google.com"));
    assert.ok(sent.email.text.includes("Submission page: https://www.1-800-cashforcars.com/offer"));
    assert.match(sent.email.html, />Request details<\/h2>/);
    assert.match(sent.email.html, />Lead attribution<\/h2>/);
    assert.ok(sent.email.html.includes(submissionId));
    assert.ok(sent.email.html.includes("TEST_gclid-value.1"));
    assert.ok(sent.email.html.includes("cash &amp; damaged cars"));
    assert.ok(sent.email.html.includes("condition &amp; tow"));
    for (const body of [sent.email.text, sent.email.html]) {
      assert.doesNotMatch(body, /SECRET_|PRIVATE_USER|PRIVATE_PASSWORD|private-fragment|DO-NOT-DELIVER/);
    }
    assert.match(sent.email.html, /table-layout:fixed/);
    assert.match(sent.email.html, /overflow-wrap:anywhere/);
  });

  test(`${scenario.name} remains deliverable with old, absent or malformed optional attribution`, async () => {
    for (const attribution of [undefined, null, [], "invalid", { arbitrary: "DO-NOT-DELIVER", gclid: "<script>" },
      { deviceType: ["mobile"] }, { deviceType: { toString: null } },
      { firstTouch: [], lastTouch: { campaign: "<script>" }, currentVisit: { network: "invalid" } }]) {
      let email;
      const { POST } = createRoute(scenario, async (options) => {
        email = JSON.parse(options.body);
        return Response.json({ id: "mock-old-form" });
      });
      const response = await POST(request(scenario, attribution));
      assert.equal(response.status, 200);
      assert.ok(email.text.includes(`${scenario.idLabel}: ${submissionId}`));
      assert.doesNotMatch(email.text, /DO-NOT-DELIVER|<script>/);
      assert.doesNotMatch(email.html, /DO-NOT-DELIVER|<script>/);
    }

    let legacyEmail;
    const { POST } = createRoute(scenario, async (options) => {
      legacyEmail = JSON.parse(options.body);
      return Response.json({ id: "mock-click-only" });
    });
    assert.equal((await POST(request(scenario, { wbraid: "CjkKwb_1" }))).status, 200);
    assert.match(legacyEmail.text, /Google Ads click ID \(wbraid\): CjkKwb_1/);
  });

  test(`${scenario.name} retry retains the exact attribution email body and idempotency key`, async () => {
    const emails = [];
    const { POST } = createRoute(scenario, async (options) => {
      emails.push({ body: options.body, key: options.headers["Idempotency-Key"] });
      if (emails.length === 1) throw new Error("Ambiguous provider response");
      return Response.json({ id: "mock-retry-accepted" });
    });
    const attribution = {
      gclid: "TEST_stable-retry", capturedAt: "2026-10-03T15:00:00Z",
      submissionPage: "https://www.1-800-cashforcars.com/offer", submittedAt: "2026-10-03T15:05:00Z", browserLanguage: "en-US",
    };
    const first = await POST(request(scenario, attribution));
    const retry = await POST(request(scenario, attribution, { turnstileToken: "fresh-test-token" }));
    assert.equal(first.status, 502);
    assert.equal(retry.status, 200);
    assert.equal(emails.length, 2);
    assert.deepEqual(emails[0], emails[1]);
  });
}

test("legacy detailed offers show a stable opaque submission reference matching their existing idempotency key", async () => {
  const scenario = cases[1];
  const emails = [];
  const { POST } = createRoute(scenario, async (options) => {
    emails.push({ email: JSON.parse(options.body), key: options.headers["Idempotency-Key"] });
    return Response.json({ id: "mock-legacy-offer" });
  });
  const payload = { submissionId: undefined };
  assert.equal((await POST(request(scenario, undefined, payload))).status, 200);
  assert.equal((await POST(request(scenario, undefined, payload))).status, 200);
  assert.deepEqual(emails[0], emails[1]);
  const reference = emails[0].key.replace(/^offer-form\//, "");
  assert.match(reference, /^legacy\/[a-f0-9]{64}$/);
  assert.ok(emails[0].email.text.includes(`Submission ID: ${reference}`));
  assert.ok(emails[0].email.html.includes(reference));
  assert.doesNotMatch(reference, /seller|6195550100|Test/);
});
