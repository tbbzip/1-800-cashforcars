import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const modulePath = fileURLToPath(new URL("../app/ad-click-attribution.ts", import.meta.url));
const inquiryRoutePath = fileURLToPath(new URL("../app/api/inquiry/route.ts", import.meta.url));
const offerRoutePath = fileURLToPath(new URL("../app/api/offer/route.ts", import.meta.url));
const { normalizeAdClickAttribution, adClickRows } = loadTypeScript(modulePath);

const gclid = "Cj0KCQjw-TEST_gclid.value~1";

test("well-formed click IDs are kept with an ISO capture time", () => {
  assert.deepEqual(
    { ...normalizeAdClickAttribution({ gclid, gbraid: "0AAAAA-gb", wbraid: "CjkKwb_1", capturedAt: "2026-09-29T20:00:00Z" }) },
    { gclid, gbraid: "0AAAAA-gb", wbraid: "CjkKwb_1", capturedAt: "2026-09-29T20:00:00.000Z" },
  );
});

test("malformed or missing click IDs are dropped instead of failing the lead", () => {
  for (const input of [null, [], "gclid", {}, { gclid: "" }, { gclid: "has space" }, { gclid: "<script>" }, { gclid: "a".repeat(513) }, { capturedAt: "2026-09-29T20:00:00Z" }]) {
    assert.deepEqual({ ...normalizeAdClickAttribution(input) }, {});
  }
  assert.deepEqual({ ...normalizeAdClickAttribution({ gclid, capturedAt: "not a date", extra: "x" }) }, { gclid });
});

test("email rows list only the IDs that are present", () => {
  assert.deepEqual(adClickRows({}), []);
  assert.deepEqual(adClickRows({ wbraid: "w1", capturedAt: "2026-09-29T20:00:00.000Z" }), [
    ["Google Ads click ID (wbraid)", "w1"],
    ["Ad click seen (UTC)", "2026-09-29T20:00:00.000Z"],
  ]);
});

const inquiry = {
  lead: { year: "2014", make: "Honda", model: "Civic", fullName: "Alex Example", notes: "", phone: "619-555-0142", streetAddress: "123 Example Street", city: "San Diego", state: "CA", zip: "92154", runningStatus: "runs", ownershipStatus: "owner_with_title" },
  locale: "en", sourcePath: "/", selectionMethod: "dropdown",
  submissionId: "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210", turnstileToken: "test-only-token",
};

function providerMock(calls) {
  return async (url, options) => {
    calls.push({ url, options });
    return Response.json(calls.length === 1 ? { success: true } : { id: "mock" });
  };
}

test("quick inquiry emails carry the click IDs; bad IDs never block delivery", async () => {
  let calls = [];
  let { POST } = loadTypeScript(inquiryRoutePath, providerMock(calls));
  let response = await POST(new Request("http://localhost/api/inquiry", { method: "POST", body: JSON.stringify({ ...inquiry, attribution: { gclid, gbraid: "0AAAAA-gb", capturedAt: "2026-09-29T20:00:00Z" } }) }));
  assert.equal(response.status, 200);
  const email = JSON.parse(calls[1].options.body);
  assert.match(email.text, new RegExp(`Google Ads click ID \\(gclid\\): ${gclid.replace(/[.]/g, "\\.")}`));
  assert.match(email.text, /Google Ads click ID \(gbraid\): 0AAAAA-gb/);
  assert.match(email.text, /Ad click seen \(UTC\): 2026-09-29T20:00:00\.000Z/);
  assert.match(email.html, /Google Ads click ID \(gclid\)/);

  calls = [];
  ({ POST } = loadTypeScript(inquiryRoutePath, providerMock(calls)));
  response = await POST(new Request("http://localhost/api/inquiry", { method: "POST", body: JSON.stringify({ ...inquiry, attribution: { gclid: "<bad>" } }) }));
  assert.equal(response.status, 200);
  assert.doesNotMatch(JSON.parse(calls[1].options.body).text, /click ID/);
});

test("detailed offer emails carry the click IDs", async () => {
  const calls = [];
  const { POST } = loadTypeScript(offerRoutePath, providerMock(calls));
  const lead = {
    year: "2010", make: "Toyota", model: "Corolla", firstName: "Test", phone: "6195550100", email: "seller@example.invalid",
    streetAddress: "123 Example St", city: "San Diego", state: "CA", zip: "92154", hasTitle: true, mileage: "Under 150,000",
    drives: true, catalyticConverter: true, bodyDamage: "Normal wear", access: "Home driveway", airbagsDeployed: false, hasKeys: true,
  };
  const response = await POST(new Request("http://localhost/api/offer", { method: "POST", body: JSON.stringify({ lead, turnstileToken: "test-only-token", attribution: { wbraid: "CjkKwb_1" } }) }));
  assert.equal(response.status, 200);
  const email = JSON.parse(calls[1].options.body);
  assert.match(email.text, /Google Ads click ID \(wbraid\): CjkKwb_1/);
  assert.match(email.html, />Ad click</);
});
