import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const { initialVinVehicleState, vinVehicleReducer, readVinVehicleResult } = loadTypeScript(
  fileURLToPath(new URL("../app/hooks/use-vin-vehicle.ts", import.meta.url)),
);
const vin = "1HGCM82633A004352";
const anotherVin = "1G1JC5244R7252367";
const decoded = { year: "2003", make: "HONDA", model: "Accord" };

test("changing VIN clears the previous car and ignores its late response", () => {
  let state = initialVinVehicleState(vin);
  state = vinVehicleReducer(state, { type: "resolved", vin, requestId: 0, fields: decoded, warning: false });
  state = vinVehicleReducer(state, { type: "change-vin", vin: anotherVin });
  assert.deepEqual(state.fields, { year: "", make: "", model: "" });
  assert.equal(state.status, "idle");
  const unchanged = vinVehicleReducer(state, { type: "resolved", vin, requestId: 0, fields: decoded, warning: false });
  assert.equal(unchanged, state);
});

test("manual corrections, including intentionally cleared values, win over a late decode", () => {
  let state = initialVinVehicleState(vin);
  state = vinVehicleReducer(state, { type: "edit", vin, field: "model", value: "Accord EX" });
  state = vinVehicleReducer(state, { type: "edit", vin, field: "year", value: "" });
  state = vinVehicleReducer(state, { type: "resolved", vin, requestId: 0, fields: decoded, warning: false });
  assert.deepEqual(state.fields, { year: "", make: "HONDA", model: "Accord EX" });
  assert.equal(state.status, "success");
});

test("retry preserves manual work and rejects a response from the previous attempt", () => {
  let state = initialVinVehicleState(vin);
  state = vinVehicleReducer(state, { type: "edit", vin, field: "make", value: "Honda" });
  state = vinVehicleReducer(state, { type: "failed", vin, requestId: 0 });
  assert.equal(state.status, "error");
  state = vinVehicleReducer(state, { type: "retry" });
  assert.equal(state.fields.make, "Honda");
  assert.equal(state.status, "loading");
  assert.equal(vinVehicleReducer(state, { type: "resolved", vin, requestId: 0, fields: decoded, warning: false }), state);
  state = vinVehicleReducer(state, { type: "resolved", vin, requestId: 1, fields: decoded, warning: true });
  assert.deepEqual(state.fields, { year: "2003", make: "Honda", model: "Accord" });
  assert.equal(state.warning, true);
});

test("partial provider responses preserve missing fields for manual completion", () => {
  assert.deepEqual(readVinVehicleResult({ vehicle: { vin, year: " 2003 ", make: "HONDA" }, warning: "Check the model" }, vin), {
    fields: { year: "2003", make: "HONDA", model: "" }, warning: true,
  });
  assert.equal(readVinVehicleResult({ vehicle: { vin, ...decoded }, warning: " " }, vin).warning, false);
});

test("malformed or mismatched lookup responses cannot populate vehicle fields", () => {
  for (const result of [null, {}, { vehicle: [] }, { vehicle: { year: 2003 } }, { vehicle: { vin: anotherVin, ...decoded } }]) {
    assert.throws(() => readVinVehicleResult(result, vin));
  }
});
