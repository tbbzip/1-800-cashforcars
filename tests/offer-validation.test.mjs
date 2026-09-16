import assert from "node:assert/strict";
import test from "node:test";
import { getOfferSubmissionIdentity, isValidPhone, normalizeOfferSubmissionId, offerPrefill, validateOfferLead, validateOfferStep } from "../app/offer-validation.ts";

const lead = {
  year: "2010", make: "Toyota", model: "Corolla", vin: "", trim: "",
  firstName: "Test", lastName: "", phone: "(619) 555-0100", email: "seller@example.invalid", zip: "92154",
  streetAddress: "123 Test Lane", addressLine2: "", city: "San Diego", state: "CA", accessNotes: "",
  hasTitle: true, paperwork: "", mileage: "Under 150,000", drives: true,
  catalyticConverter: true, tiresInflated: null, wheelsAttached: null, rolls: null,
  bodyDamage: "Normal wear", access: "Home driveway", airbagsDeployed: false, hasKeys: true,
};

test("the complete detailed questionnaire accepts its original required fields", () => {
  assert.deepEqual(validateOfferLead(lead), []);
});

test("the detailed questionnaire still requires email and the full pickup address", () => {
  assert.deepEqual(validateOfferStep({ ...lead, streetAddress: "", city: "", state: "", email: "" }, 0), ["streetAddress", "city", "state", "email"]);
  assert.deepEqual(validateOfferLead({ ...lead, vin: "", trim: "", lastName: "", addressLine2: "", accessNotes: "" }), []);
});

test("the first step validates contact details before later condition steps", () => {
  assert.deepEqual(validateOfferStep({ ...lead, phone: "123", email: "broken" }, 0), ["phone", "email"]);
  assert.deepEqual(validateOfferStep({ ...lead, mileage: "", bodyDamage: "", access: "" }, 0), []);
  assert.equal(isValidPhone("+1 (619) 555-0100"), true);
  assert.equal(isValidPhone("26195550100"), false);
});

test("title and mobility follow-up answers stay required when relevant", () => {
  assert.deepEqual(validateOfferStep({ ...lead, hasTitle: false }, 0), ["paperwork"]);
  assert.deepEqual(validateOfferStep({ ...lead, hasTitle: false, paperwork: "I don't have any paperwork" }, 0), []);
  assert.deepEqual(validateOfferStep({ ...lead, drives: false }, 1), ["tiresInflated", "wheelsAttached", "rolls"]);
  assert.deepEqual(validateOfferStep({ ...lead, drives: false, tiresInflated: false, wheelsAttached: false, rolls: false }, 1), []);
});

test("empty selections and invalid years cannot pass client or server validation", () => {
  assert.deepEqual(validateOfferStep({ ...lead, year: "1899", make: "  ", hasTitle: null, zip: "921" }, 0), ["year", "make", "zip", "hasTitle"]);
  assert.ok(validateOfferLead({ ...lead, year: "9999" }).includes("year"));
});

test("VIN and manual-selection query values are normalized without trusting arrays", () => {
  assert.deepEqual(offerPrefill({ year: "2010", make: " Toyota ", model: "Corolla", vin: "1hgcm82633a004352" }), {
    initialVin: "1HGCM82633A004352", initialYear: "2010", initialMake: "Toyota", initialModel: "Corolla",
  });
  assert.deepEqual(offerPrefill({ year: ["2010", "2020"], make: ["Toyota"], model: "\u0000Corolla", vin: ["bad"] }), {
    initialVin: "", initialYear: "", initialMake: "", initialModel: "Corolla",
  });
  assert.equal(offerPrefill({ year: "2010junk" }).initialYear, "");
  assert.equal(offerPrefill({ make: "A".repeat(101) }).initialMake.length, 100);
});

test("unchanged detailed offers reuse their submission ID; changed seller details or language get a new ID", () => {
  let generated = 0;
  const createId = () => `logical-request-${++generated}`;
  const first = getOfferSubmissionIdentity(lead, "en", null, createId);
  const retry = getOfferSubmissionIdentity({ ...lead }, "en", first, createId);
  assert.equal(retry, first);
  assert.equal(generated, 1);
  const changed = getOfferSubmissionIdentity({ ...lead, phone: "6195550199" }, "en", retry, createId);
  assert.notEqual(changed.id, first.id);
  assert.notEqual(getOfferSubmissionIdentity(lead, "es", first, createId).id, first.id);
  assert.equal(generated, 3);
});

test("submission IDs normalize UUID casing and reject malformed identifiers", () => {
  const id = "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210";
  assert.equal(normalizeOfferSubmissionId(` ${id.toUpperCase()} `), id);
  for (const invalid of [undefined, null, "", "seller@example.invalid", id + "extra", [id], "00000000-0000-0000-0000-000000000000"]) {
    assert.equal(normalizeOfferSubmissionId(invalid), "");
  }
});
