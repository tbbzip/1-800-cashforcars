import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Exercise the real routes with isolated caches and injected provider calls.
// No test can access the network, a browser, credentials, or a lead endpoint.
function loadRoute(name, fetchMock, { now = Date.now, timeout } = {}) {
  const path = new URL(`../app/api/vehicle/${name}/route.ts`, import.meta.url);
  const compiled = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  class Clock extends Date {
    static now() { return now(); }
  }
  const exports = {};
  new Function("exports", "fetch", "Date", "AbortSignal", compiled)(
    exports, fetchMock, Clock, { timeout: timeout ?? AbortSignal.timeout.bind(AbortSignal) },
  );
  return (query = "") => exports.GET(new Request(`http://localhost/api/vehicle/${name}${query}`));
}

const results = (rows) => Response.json({ Results: rows });
const toyota = { MakeId: 448, MakeName: "TOYOTA" };
const toyotaModel = { Make_ID: 448, Model_Name: "Corolla" };
const vin = "3GNDA13D76S000000"; // Public NHTSA LanguageExamples sample, not a customer VIN.
const vehicle = { Make: "CHEVROLET", Model: "HHR", ModelYear: "2006", ErrorCode: "0" };
const vinQuery = `?vin=${vin}`;

async function assertError(response, status) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const data = await response.json();
  assert.equal(typeof data.error, "string");
  assert.equal(data.vehicle, undefined);
  assert.doesNotMatch(data.error, /private upstream details/);
}

test("makes are the complete car/truck union, normalized and sorted, without year filtering", async () => {
  const calls = [];
  const get = loadRoute("options", async (url, options) => {
    calls.push(url);
    assert.equal(options.cache, "no-store");
    assert(options.signal instanceof AbortSignal);
    return results(url.includes("/car?")
      ? [toyota, { MakeId: 452, MakeName: "BMW" }]
      : [toyota, { MakeId: 483, MakeName: " JEEP " }]);
  });
  const response = await get();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { makes: [
    { id: 452, name: "BMW" }, { id: 483, name: "Jeep" }, { id: 448, name: "Toyota" },
  ] });
  assert.deepEqual(calls.sort(), [
    "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json",
    "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/truck?format=json",
  ]);
  assert.match(response.headers.get("cache-control"), /s-maxage=86400/);
  await get();
  assert.equal(calls.length, 2);
});

test("models are specific to both year and make, sorted and deduplicated case-insensitively", async () => {
  const calls = [];
  const get = loadRoute("options", async (url) => {
    calls.push(url);
    if (url.includes("/474/")) return results([{ Model_Name: "Civic" }]);
    if (url.includes("/2011?")) return results([{ Model_Name: "Prius" }]);
    return results([toyotaModel, { Model_Name: " Camry " }, { Model_Name: "COROLLA" }]);
  });
  assert.deepEqual(await (await get("?year=2010&makeId=448")).json(), { models: ["Camry", "COROLLA"] });
  assert.deepEqual(await (await get("?year=2011&makeId=448")).json(), { models: ["Prius"] });
  assert.deepEqual(await (await get("?year=2010&makeId=474")).json(), { models: ["Civic"] });
  assert.equal(calls.length, 3);
  assert(calls.every((url) => /^https:\/\/vpic\.nhtsa\.dot\.gov\/api\/vehicles\/GetModelsForMakeIdYear\/makeId\/\d+\/modelyear\/\d{4}\?format=json$/.test(url)));
});

test("missing, duplicate, unknown, malformed and out-of-range catalog parameters never contact vPIC", async () => {
  let calls = 0;
  const get = loadRoute("options", async () => { calls++; throw new Error("Unexpected provider call"); });
  const badQueries = [
    "?year=2010", "?makeId=448", "?year=&makeId=448", "?year=2010&makeId=",
    "?year=1899&makeId=448", `?year=${new Date().getFullYear() + 2}&makeId=448`,
    "?year=2010.0&makeId=448", "?year=2010x&makeId=448", "?year=02010&makeId=448",
    "?year=2010&makeId=0", "?year=2010&makeId=-448", "?year=2010&makeId=0448",
    "?year=2010&makeId=1e3", "?year=2010&makeId=1.5", "?year=2010&makeId=1000000",
    "?year=2010&makeId=448/../474", "?year=2010&makeId=448&year=2011",
    "?year=2010&makeId=448&makeId=474", "?year=2010&makeId=448&model=Camry", "?unexpected=1",
  ];
  for (const query of badQueries) await assertError(await get(query), 400);
  assert.equal(calls, 0);
});

test("1900–1995 uses manual-model fallback without a provider call; supported year boundaries work", async () => {
  let calls = 0;
  const get = loadRoute("options", async () => { calls++; return results([toyotaModel]); });
  for (const year of [1900, 1950, 1995]) {
    assert.deepEqual(await (await get(`?year=${year}&makeId=448`)).json(), { models: [] });
  }
  assert.equal(calls, 0);
  for (const year of [1996, new Date().getFullYear() + 1]) {
    assert.deepEqual(await (await get(`?year=${year}&makeId=448`)).json(), { models: ["Corolla"] });
  }
  assert.equal(calls, 2);
});

test("an unlisted model combination returns an empty list for manual entry", async () => {
  const get = loadRoute("options", async () => results([]));
  const response = await get("?year=2010&makeId=999999");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { models: [] });
});

test("catalog errors and malformed data never poison a later successful retry", async () => {
  const failures = [
    async () => { throw new Error("private upstream details"); },
    async () => new Response("private upstream details", { status: 503 }),
    async () => new Response("not JSON", { status: 200 }),
    async () => Response.json(null), async () => Response.json({ Results: {} }),
    async () => results([null]), async () => results([[]]),
    async () => results([{ Model_Name: 123 }]), async () => results([{ Model_Name: "  " }]),
  ];
  for (const failure of failures) {
    let calls = 0;
    const get = loadRoute("options", async (...args) => ++calls === 1 ? failure(...args) : results([toyotaModel]));
    await assertError(await get("?year=2010&makeId=448"), 502);
    assert.deepEqual(await (await get("?year=2010&makeId=448")).json(), { models: ["Corolla"] });
    assert.equal(calls, 2);
  }
});

test("invalid or empty makes are provider errors instead of unusable dropdown values", async () => {
  for (const rows of [[], [{ MakeId: "448", MakeName: "Toyota" }], [{ MakeId: 0, MakeName: "Toyota" }], [{ MakeId: 448, MakeName: " " }]]) {
    const get = loadRoute("options", async () => results(rows));
    await assertError(await get(), 502);
  }
});

test("simultaneous catalog requests share work, parameter order shares cache, and expiration refreshes", async () => {
  let now = 1000;
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const get = loadRoute("options", async () => { calls++; await gate; return results([toyotaModel]); }, { now: () => now });
  const first = get("?year=2010&makeId=448");
  const second = get("?makeId=448&year=2010");
  release();
  assert((await Promise.all([first, second])).every((response) => response.status === 200));
  assert.equal(calls, 1);
  await get("?year=2010&makeId=448");
  assert.equal(calls, 1);
  now += 86400001;
  await get("?year=2010&makeId=448");
  assert.equal(calls, 2);
});

test("VIN lookup normalizes pasted separators, retains warning and returns only clean strings", async () => {
  const calls = [];
  const get = loadRoute("lookup", async (url, options) => {
    calls.push(url);
    assert.equal(options.cache, "no-store");
    assert(options.signal instanceof AbortSignal);
    return results([{ ...vehicle, Trim: "Not Applicable", EngineCylinders: 4, ErrorCode: "1", ErrorText: " Verify VIN " }]);
  });
  const response = await get("?vin=" + encodeURIComponent(" 3gnda13d76s-000000 "));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.vehicle.vin, vin);
  assert.equal(data.vehicle.make, "CHEVROLET");
  assert.equal(data.vehicle.model, "HHR");
  assert.equal(data.vehicle.year, "2006");
  assert.equal(data.vehicle.trim, "");
  assert.equal(data.vehicle.engineCylinders, "");
  assert.equal(data.warning, "Verify VIN");
  assert.equal(data.source, "NHTSA vPIC");
  assert(Object.values(data.vehicle).every((value) => typeof value === "string"));
  await get(vinQuery);
  assert.deepEqual(calls, [`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`]);
});

test("missing, invalid or duplicated VINs never contact the provider", async () => {
  let calls = 0;
  const get = loadRoute("lookup", async () => { calls++; throw new Error("Unexpected provider call"); });
  for (const query of ["", "?vin=", "?vin=bad", "?vin=3GNDA13D76S00000I", "?vin=3GNDA13D76S00000O", "?vin=3GNDA13D76S00000Q", "?vin=3GNDA13D76S0000000", `${vinQuery}&vin=${vin}`]) {
    await assertError(await get(query), 400);
  }
  assert.equal(calls, 0);
});

test("empty or placeholder-only VIN results return 404 and remain retryable", async () => {
  for (const rows of [[], [null], [{}], [{ Make: "Not Applicable", Model: " ", ModelYear: null }]]) {
    let calls = 0;
    const get = loadRoute("lookup", async () => results(++calls === 1 ? rows : [vehicle]));
    await assertError(await get(vinQuery), 404);
    assert.equal((await get(vinQuery)).status, 200);
    assert.equal(calls, 2);
  }
});

test("VIN network errors, HTTP errors and malformed HTTP 200 data stay retryable and do not expose internals", async () => {
  const failures = [
    async () => { throw new Error("private upstream details"); },
    async () => new Response("private upstream details", { status: 429 }),
    async () => new Response("not JSON", { status: 200 }),
    async () => Response.json(null), async () => Response.json({ Results: "wrong" }),
    async () => results(["not a vehicle"]), async () => results([[]]),
  ];
  for (const failure of failures) {
    let calls = 0;
    const get = loadRoute("lookup", async (...args) => ++calls === 1 ? failure(...args) : results([vehicle]));
    await assertError(await get(vinQuery), 502);
    assert.equal((await get(vinQuery)).status, 200);
    assert.equal(calls, 2);
  }
});

test("valid partial VIN decoding keeps the existing editable-vehicle behavior", async () => {
  const get = loadRoute("lookup", async () => results([{ Make: "TOYOTA", ErrorCode: "6", ErrorText: "Incomplete VIN decode" }]));
  const response = await get(vinQuery);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.vehicle.make, "TOYOTA");
  assert.equal(data.vehicle.model, "");
  assert.equal(data.vehicle.year, "");
  assert.equal(data.warning, "Incomplete VIN decode");
});

test("successful VIN lookups deduplicate simultaneous work and expire after one day", async () => {
  let now = 1000;
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const get = loadRoute("lookup", async () => { calls++; await gate; return results([vehicle]); }, { now: () => now });
  const first = get(vinQuery);
  const second = get(vinQuery);
  release();
  assert((await Promise.all([first, second])).every((response) => response.status === 200));
  assert.equal(calls, 1);
  await get(vinQuery);
  assert.equal(calls, 1);
  now += 86400001;
  await get(vinQuery);
  assert.equal(calls, 2);
});

test("both routes bound provider requests at eight seconds and return recoverable errors on timeout", async () => {
  for (const [route, query] of [["options", "?year=2010&makeId=448"], ["lookup", vinQuery]]) {
    const deadlines = [];
    const get = loadRoute(route, async (_url, { signal }) => {
      signal.throwIfAborted();
      throw new Error("Expected a simulated timeout");
    }, { timeout: (ms) => {
      deadlines.push(ms);
      return AbortSignal.abort(new DOMException("private upstream details", "TimeoutError"));
    } });
    await assertError(await get(query), 502);
    assert.deepEqual(deadlines, [8000]);
  }
});

test("both success caches stay bounded and evict the oldest entry without flushing recent vehicles", async () => {
  for (const route of ["options", "lookup"]) {
    let calls = 0;
    const get = loadRoute(route, async () => { calls++; return results(route === "options" ? [toyotaModel] : [vehicle]); });
    const query = (index) => route === "options"
      ? `?year=2010&makeId=${index + 1}`
      : `?vin=3GNDA13D76S${String(index).padStart(6, "0")}`;
    for (let index = 0; index <= 400; index++) assert.equal((await get(query(index))).status, 200);
    assert.equal(calls, 401);
    assert.equal((await get(query(400))).status, 200);
    assert.equal(calls, 401);
    assert.equal((await get(query(0))).status, 200);
    assert.equal(calls, 402);
  }
});
