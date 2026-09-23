import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(fileURLToPath(new URL("../app/lead-submission-receipt.ts", import.meta.url)), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const start = Date.UTC(2026, 8, 22, 12);
const vehicle = { year: "2014", make: "Honda", model: "Civic" };

function browser(values = new Map()) {
  const handlers = new Map();
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
  return {
    localStorage: storage,
    values,
    handlers,
    addEventListener(type, handler) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type).add(handler);
    },
    removeEventListener(type, handler) { handlers.get(type)?.delete(handler); },
    dispatch(type, event = {}) {
      for (const handler of handlers.get(type) ?? []) handler(event);
    },
  };
}

function loadStore(window = browser()) {
  let now = start;
  let timerId = 0;
  const timers = new Map();
  class Clock extends Date { static now() { return now; } }
  const exports = {};
  new Function("exports", "window", "Date", "setTimeout", "clearTimeout", compiled)(
    exports, window, Clock,
    (callback, delay) => { timers.set(++timerId, { callback, at: now + delay }); return timerId; },
    (id) => timers.delete(id),
  );
  return {
    ...exports,
    window,
    timers,
    advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= now) { timers.delete(id); timer.callback(); }
      }
    },
  };
}

test("server rendering has a stable unready snapshot and cannot share browser receipts", () => {
  const exports = {};
  new Function("exports", "window", "Date", "setTimeout", "clearTimeout", compiled)(exports, undefined, Date, setTimeout, clearTimeout);
  assert.deepEqual(exports.getServerLeadSubmissionSnapshot(), { receipt: null, ready: false });
  assert.equal(exports.getLeadSubmissionSnapshot(), exports.getServerLeadSubmissionSnapshot());
  exports.saveLeadSubmissionReceipt({ vehicle, source: "quick" });
  assert.equal(exports.getLeadSubmissionReceipt(), null);
  assert.equal(exports.getServerLeadSubmissionSnapshot(), exports.getServerLeadSubmissionSnapshot());
});

test("successful quick and full receipts survive reload and persist only minimal vehicle data", () => {
  for (const source of ["quick", "full"]) {
    const store = loadStore();
    store.saveLeadSubmissionReceipt({
      vehicle: { ...vehicle, vin: "never-store-this" }, source,
      fullName: "Never Store", phone: "5555555555", streetAddress: "Never Store", notes: "Never Store",
    });
    const expected = { version: 1, submittedAt: start, vehicle, source };
    assert.deepEqual(JSON.parse(store.window.values.get(store.LEAD_SUBMISSION_STORAGE_KEY)), expected);
    assert.deepEqual(loadStore(store.window).getLeadSubmissionReceipt(), expected);
  }
});

test("corrupt, unsupported, future, expired, or incomplete receipts never suppress a form", () => {
  const valid = { version: 1, submittedAt: start, vehicle, source: "quick" };
  const invalid = [
    "{broken", "null", "[]", JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, submittedAt: start + 1 }),
    JSON.stringify({ ...valid, submittedAt: start - 24 * 60 * 60 * 1000 }),
    JSON.stringify({ ...valid, submittedAt: 0 }), JSON.stringify({ ...valid, submittedAt: start - 0.5 }),
    JSON.stringify({ ...valid, source: "unknown" }), JSON.stringify({ ...valid, vehicle: null }),
    JSON.stringify({ ...valid, vehicle: { ...vehicle, year: 2014 } }),
    JSON.stringify({ ...valid, vehicle: { ...vehicle, make: " " } }),
    JSON.stringify({ ...valid, vehicle: { ...vehicle, model: "x".repeat(101) } }),
  ];
  for (const raw of invalid) {
    const store = loadStore();
    store.window.values.set(store.LEAD_SUBMISSION_STORAGE_KEY, raw);
    assert.equal(store.getLeadSubmissionReceipt(), null, raw);
    assert.deepEqual(store.getLeadSubmissionSnapshot(), { receipt: null, ready: true });
  }
});

test("client snapshots are stable until the receipt changes and hydration begins unready", () => {
  const store = loadStore();
  const empty = store.getLeadSubmissionSnapshot();
  assert.equal(store.getLeadSubmissionSnapshot(), empty);
  assert.deepEqual(empty, { receipt: null, ready: true });
  store.saveLeadSubmissionReceipt({ vehicle, source: "quick" });
  const saved = store.getLeadSubmissionSnapshot();
  assert.notEqual(saved, empty);
  assert.equal(store.getLeadSubmissionSnapshot(), saved);
  assert.deepEqual(store.getServerLeadSubmissionSnapshot(), { receipt: null, ready: false });
});

test("all mounted forms are notified on save and explicit clear, with listeners cleaned up", () => {
  const store = loadStore();
  let first = 0;
  let second = 0;
  const unsubscribeFirst = store.subscribeToLeadSubmissionReceipt(() => first++);
  const unsubscribeSecond = store.subscribeToLeadSubmissionReceipt(() => second++);
  assert.equal(store.window.handlers.get("storage").size, 1);
  store.saveLeadSubmissionReceipt({ vehicle, source: "quick" });
  assert.deepEqual([first, second], [1, 1]);
  assert.equal(store.timers.size, 1);
  unsubscribeFirst();
  store.clearLeadSubmissionReceipt();
  assert.deepEqual([first, second], [1, 2]);
  assert.equal(store.getLeadSubmissionReceipt(), null);
  assert.equal(store.window.values.has(store.LEAD_SUBMISSION_STORAGE_KEY), false);
  unsubscribeSecond();
  assert.equal(store.window.handlers.get("storage").size, 0);
  assert.equal(store.window.handlers.get("focus").size, 0);
  assert.equal(store.window.handlers.get("pageshow").size, 0);
  assert.equal(store.timers.size, 0);
});

test("another tab's confirmed receipt updates a mounted form and the synchronous submit guard", () => {
  const shared = new Map();
  const first = loadStore(browser(shared));
  const second = loadStore(browser(shared));
  let updates = 0;
  const unsubscribe = second.subscribeToLeadSubmissionReceipt(() => updates++);
  second.getLeadSubmissionSnapshot();
  first.saveLeadSubmissionReceipt({ vehicle, source: "full" });
  // A final submit guard must catch the receipt even before the storage event arrives.
  assert.equal(second.getLeadSubmissionReceipt().source, "full");
  second.window.dispatch("storage", { key: first.LEAD_SUBMISSION_STORAGE_KEY, storageArea: second.window.localStorage });
  assert.equal(updates, 1);
  assert.deepEqual(second.getLeadSubmissionSnapshot().receipt.vehicle, vehicle);
  first.clearLeadSubmissionReceipt();
  second.window.dispatch("storage", { key: null, storageArea: second.window.localStorage });
  assert.equal(updates, 2);
  assert.equal(second.getLeadSubmissionSnapshot().receipt, null);
  unsubscribe();
});

test("unrelated storage and session-storage events do not change the receipt", () => {
  const store = loadStore();
  let updates = 0;
  const unsubscribe = store.subscribeToLeadSubmissionReceipt(() => updates++);
  store.window.dispatch("storage", { key: "unrelated", storageArea: store.window.localStorage });
  store.window.dispatch("storage", { key: store.LEAD_SUBMISSION_STORAGE_KEY, storageArea: {} });
  assert.equal(updates, 0);
  unsubscribe();
});

test("blocked storage still prevents repeated submissions in the current tab and allows reset", () => {
  const blocked = browser();
  Object.defineProperty(blocked, "localStorage", { get() { throw new Error("Storage blocked"); } });
  const store = loadStore(blocked);
  let updates = 0;
  const unsubscribe = store.subscribeToLeadSubmissionReceipt(() => updates++);
  assert.equal(store.getLeadSubmissionReceipt(), null);
  assert.doesNotThrow(() => store.saveLeadSubmissionReceipt({ vehicle, source: "quick" }));
  assert.deepEqual(store.getLeadSubmissionReceipt().vehicle, vehicle);
  assert.equal(updates, 1);
  store.clearLeadSubmissionReceipt();
  assert.equal(store.getLeadSubmissionReceipt(), null);
  assert.equal(updates, 2);
  unsubscribe();
});

test("a failed storage write cannot replace a newly confirmed receipt with old saved data", () => {
  const store = loadStore();
  store.saveLeadSubmissionReceipt({ vehicle, source: "quick" });
  store.window.localStorage.setItem = () => { throw new Error("Quota exceeded"); };
  const anotherVehicle = { year: "2018", make: "Toyota", model: "Camry" };
  store.saveLeadSubmissionReceipt({ vehicle: anotherVehicle, source: "full" });
  assert.deepEqual(store.getLeadSubmissionReceipt().vehicle, anotherVehicle);
  assert.equal(store.getLeadSubmissionReceipt().source, "full");
});

test("long accepted vehicle names still create a bounded display receipt", () => {
  const store = loadStore();
  store.saveLeadSubmissionReceipt({
    vehicle: { year: " 2014 ", make: `  ${"M".repeat(200)}  `, model: `  ${"X".repeat(200)}  ` },
    source: "full",
  });
  assert.deepEqual(store.getLeadSubmissionReceipt().vehicle, {
    year: "2014", make: "M".repeat(100), model: "X".repeat(100),
  });
});

test("a live receipt expires at 24 hours and notifies mounted forms without navigation", () => {
  const store = loadStore();
  let updates = 0;
  const unsubscribe = store.subscribeToLeadSubmissionReceipt(() => updates++);
  store.saveLeadSubmissionReceipt({ vehicle, source: "quick" });
  store.advance(store.LEAD_SUBMISSION_TTL_MS - 1);
  assert.notEqual(store.getLeadSubmissionReceipt(), null);
  assert.equal(updates, 1);
  store.advance(1);
  assert.equal(store.getLeadSubmissionReceipt(), null);
  assert.deepEqual(store.getLeadSubmissionSnapshot(), { receipt: null, ready: true });
  assert.equal(updates, 2);
  assert.equal(store.timers.size, 0);
  unsubscribe();
});
