import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const {
  INITIAL_DEMO_INPUT,
  DEMO_YEARS,
  DEMO_SCENARIOS,
  DEMO_VIN,
  DEMO_VEHICLE,
  DEMO_VIN_VEHICLES,
  getMakesForYear,
  getModelsForYearMake,
  validateDemoInput,
  getDemoEstimate,
  lookupDemoVin,
} = loadTypeScript(fileURLToPath(new URL("../app/(prototype)/estimate-preview/demo-data.ts", import.meta.url)));

const validInput = {
  year: "2014",
  make: "Honda",
  model: "Civic",
  zip: "92154",
  mileage: "100to150k",
  running: "runs",
  condition: "good",
  ownership: "owner_with_title",
};

function assertRange(result) {
  assert.equal(result.status, "range");
  assert(Number.isFinite(result.lower));
  assert(Number.isFinite(result.upper));
  assert(result.lower > 0);
  assert(result.upper > result.lower);
  assert.equal(result.lower % 50, 0);
  assert.equal(result.upper % 50, 0);
  assertFactors(result);
  return result;
}

function assertFactors(result) {
  assert(Array.isArray(result.factors));
  assert(result.factors.length > 0);
  assert(result.factors.every((factor) => typeof factor === "string" && factor.trim().length > 0));
}

function assertInvalid(input, field) {
  const errors = validateDemoInput(input);
  assert(errors && typeof errors === "object" && !Array.isArray(errors));
  assert(Object.keys(errors).length > 0);
  if (field) assert.equal(typeof errors[field], "string", `Expected an error for ${field}`);
  const result = getDemoEstimate(input);
  assert.equal(result.status, "invalid");
  assert.deepEqual(result.errors, errors);
  assert.equal(result.lower, undefined);
  assert.equal(result.upper, undefined);
}

test("the initial form requires every estimate input before producing a result", () => {
  assert.deepEqual(Object.keys(INITIAL_DEMO_INPUT).sort(), Object.keys(validInput).sort());
  assert(Object.values(INITIAL_DEMO_INPUT).every((value) => value === ""));
  for (const field of Object.keys(validInput)) {
    assertInvalid({ ...validInput, [field]: "" }, field);
  }
  assertInvalid(INITIAL_DEMO_INPUT);
  assert.deepEqual(validateDemoInput(validInput), {});
});

test("malformed values and unknown enums never become numeric estimates", () => {
  for (const input of [undefined, null, [], "vehicle", 2014, NaN, Infinity, {}]) {
    assertInvalid(input);
  }
  for (const field of Object.keys(validInput)) {
    for (const value of [undefined, null, NaN, Infinity, -Infinity, 2014, {}, []]) {
      assertInvalid({ ...validInput, [field]: value }, field);
    }
  }
  for (const field of ["mileage", "running", "condition", "ownership"]) {
    for (const value of ["unknown", "constructor", "toString", "__proto__"]) {
      assertInvalid({ ...validInput, [field]: value }, field);
    }
  }
});

test("ZIP validation rejects malformed service-area lookalikes before area checking", () => {
  for (const zip of ["9215", "921540", "92154-1234", "abc92154", "92154abc", "9 2 1 5 4", "9215x4", "92154\n0000", "９２１５４"]) {
    assertInvalid({ ...validInput, zip }, "zip");
  }
});

test("well-formed ZIPs outside the service area cannot receive a price range", () => {
  const input = { ...validInput, zip: "10001" };
  assert.deepEqual(validateDemoInput(input), {});
  const result = getDemoEstimate(input);
  assert.equal(result.status, "out-of-area");
  assert.equal(result.zip, input.zip);
  assert.equal(result.lower, undefined);
  assert.equal(result.upper, undefined);
  assertFactors(result);
  const uncertain = getDemoEstimate({ ...input, running: "not_sure", ownership: "not_sure" });
  assert.equal(uncertain.status, "out-of-area");
});

test("unsupported or malformed years produce empty dropdown options and validation errors", () => {
  for (const year of ["", "2007", "2023", "2014x", "2014.0", "02014", "NaN", "Infinity", "constructor", "__proto__"]) {
    assert.deepEqual(getMakesForYear(year), []);
    assert.deepEqual(getModelsForYearMake(year, "Honda"), []);
    assertInvalid({ ...validInput, year }, "year");
  }
  assert.deepEqual(getModelsForYearMake("2014", ""), []);
  assert.deepEqual(getModelsForYearMake("2014", "Unknown make"), []);
  assert.deepEqual(getModelsForYearMake("2014", "__proto__"), []);
});

test("every selectable catalog tuple is valid and produces a finite, rounded range", () => {
  assert(DEMO_YEARS.length > 0);
  assert.equal(DEMO_YEARS[0], "2022");
  assert.equal(DEMO_YEARS.at(-1), "2008");
  assert.equal(new Set(DEMO_YEARS).size, DEMO_YEARS.length);
  assert(DEMO_YEARS.every((year) => typeof year === "string" && /^\d{4}$/.test(year)));
  assert.deepEqual(DEMO_YEARS, [...DEMO_YEARS].sort((a, b) => Number(b) - Number(a)));
  for (const year of DEMO_YEARS) {
    const makes = getMakesForYear(year);
    assert(makes.length > 0);
    assert.equal(new Set(makes).size, makes.length);
    for (const make of makes) {
      assert.equal(typeof make, "string");
      const models = getModelsForYearMake(year, make);
      assert(models.length > 0);
      assert.equal(new Set(models).size, models.length);
      for (const model of models) {
        const input = { ...validInput, year, make, model };
        assert.equal(typeof model, "string");
        assert.deepEqual(validateDemoInput(input), {}, `${year} ${make} ${model}`);
        assertRange(getDemoEstimate(input));
      }
    }
  }
});

test("a make or model outside the selected year cannot be carried into an estimate", () => {
  assertInvalid({ ...validInput, make: "Unknown make" }, "make");
  assertInvalid({ ...validInput, model: "Unknown model" }, "model");
  assertInvalid({ ...validInput, make: "__proto__" }, "make");
  assertInvalid({ ...validInput, model: "constructor" }, "model");

  let yearSpecificTuple;
  for (const previousYear of DEMO_YEARS) {
    for (const make of getMakesForYear(previousYear)) {
      for (const model of getModelsForYearMake(previousYear, make)) {
        const nextYear = DEMO_YEARS.find((year) => !getModelsForYearMake(year, make).includes(model));
        if (nextYear) yearSpecificTuple = { previousYear, nextYear, make, model };
      }
    }
  }
  assert(yearSpecificTuple, "The sample catalog should contain year-specific model availability");
  const { previousYear, nextYear, make, model } = yearSpecificTuple;
  assert(getModelsForYearMake(previousYear, make).includes(model));
  assert(!getModelsForYearMake(nextYear, make).includes(model));
  assertInvalid({ ...validInput, year: nextYear, make, model });
  assert.deepEqual(getModelsForYearMake(nextYear, ""), []);
  assertInvalid({ ...validInput, year: nextYear, make: "", model: "" });
  const nextMake = getMakesForYear(nextYear)[0];
  const nextModel = getModelsForYearMake(nextYear, nextMake)[0];
  assertRange(getDemoEstimate({ ...validInput, year: nextYear, make: nextMake, model: nextModel }));
});

test("estimates are deterministic and leave the submitted input unchanged", () => {
  const input = Object.freeze({ ...validInput });
  const result = assertRange(getDemoEstimate(input));
  assert.deepEqual(getDemoEstimate(input), result);
  assert.deepEqual(input, validInput);
});

test("higher mileage lowers the range for the same vehicle", () => {
  const low = assertRange(getDemoEstimate({ ...validInput, mileage: "under100k" }));
  const medium = assertRange(getDemoEstimate({ ...validInput, mileage: "100to150k" }));
  const high = assertRange(getDemoEstimate({ ...validInput, mileage: "over150k" }));
  assert(low.lower > medium.lower && medium.lower > high.lower);
  assert(low.upper > medium.upper && medium.upper > high.upper);
});

test("a non-running vehicle and greater damage each lower its range", () => {
  const good = assertRange(getDemoEstimate(validInput));
  const nonRunning = assertRange(getDemoEstimate({ ...validInput, running: "does_not_run" }));
  const minor = assertRange(getDemoEstimate({ ...validInput, condition: "minor_damage" }));
  const major = assertRange(getDemoEstimate({ ...validInput, condition: "major_damage" }));
  assert(nonRunning.lower < good.lower && nonRunning.upper < good.upper);
  assert(minor.lower < good.lower && minor.upper < good.upper);
  assert(major.lower < minor.lower && major.upper < minor.upper);
});

test("missing title lowers the fictional range and explains the adjustment", () => {
  const withTitle = assertRange(getDemoEstimate(validInput));
  const withoutTitle = assertRange(getDemoEstimate({ ...validInput, ownership: "owner_without_title" }));
  assert(withoutTitle.lower < withTitle.lower && withoutTitle.upper < withTitle.upper);
  assert.match(withoutTitle.factors.join(" "), /title/i);
});

test("uncertain running status or ownership requires review without exposing a range", () => {
  for (const change of [{ running: "not_sure" }, { ownership: "not_sure" }]) {
    const result = getDemoEstimate({ ...validInput, ...change });
    assert.equal(result.status, "manual-review");
    assert(Array.isArray(result.reasons));
    assert(result.reasons.length > 0);
    assert(result.reasons.every((reason) => typeof reason === "string" && reason.trim().length > 0));
    assert.equal(result.lower, undefined);
    assert.equal(result.upper, undefined);
    assertFactors(result);
  }
});

test("preset scenarios demonstrate a normal range, a lower damaged range, and review", () => {
  assert.equal(DEMO_SCENARIOS.length, 3);
  assert.deepEqual(DEMO_SCENARIOS.map(({ id }) => id), ["running-sedan", "non-running", "title-review"]);
  for (const scenario of DEMO_SCENARIOS) {
    assert.equal(typeof scenario.title, "string");
    assert(scenario.title.trim().length > 0);
    assert.equal(typeof scenario.description, "string");
    assert(scenario.description.trim().length > 0);
    assert.deepEqual(validateDemoInput(scenario.input), {});
  }
  assert.deepEqual(DEMO_SCENARIOS[0].input, validInput);
  const normal = assertRange(getDemoEstimate(DEMO_SCENARIOS[0].input));
  const damaged = assertRange(getDemoEstimate(DEMO_SCENARIOS[1].input));
  assert(damaged.lower < normal.lower && damaged.upper < normal.upper);
  assert.equal(getDemoEstimate(DEMO_SCENARIOS[2].input).status, "manual-review");
});

test("VIN lookup resolves only the explicitly supplied fictional demo identifiers", () => {
  assert.equal(DEMO_VIN, "DEMOHONDA20140001");
  assert.deepEqual(DEMO_VEHICLE, { year: "2014", make: "Honda", model: "Civic" });
  assert.deepEqual(DEMO_VIN_VEHICLES[DEMO_VIN], DEMO_VEHICLE);
  assert.deepEqual(lookupDemoVin(DEMO_VIN), DEMO_VEHICLE);
  for (const [vin, vehicle] of Object.entries(DEMO_VIN_VEHICLES)) {
    assert.match(vin, /^DEMO/);
    assert.deepEqual(lookupDemoVin(vin), vehicle);
    assert.deepEqual(validateDemoInput({ ...validInput, ...vehicle }), {});
  }
  for (const unknown of ["", "DEMOHONDA20140002", "1".repeat(17), "constructor", "__proto__"]) {
    assert.equal(lookupDemoVin(unknown), null);
  }
});
