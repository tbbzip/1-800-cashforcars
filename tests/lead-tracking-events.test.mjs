import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const submissionId = "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210";
const { getOfferSubmissionIdentity, isValidPhone } = loadTypeScript(
  fileURLToPath(new URL("../app/offer-validation.ts", import.meta.url)),
);

// Execute the real submission handlers with isolated state and fake fetch. This
// verifies the success boundary without rendering React or contacting providers.
function loadSubmitHandler(relativePath, name, bindings) {
  const path = fileURLToPath(new URL(relativePath, import.meta.url));
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const matches = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.equal(matches.length, 1, `one real ${name} handler exists`);
  const compiled = ts.transpileModule(matches[0].getText(source), {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return new Function(...Object.keys(bindings), `${compiled}\nreturn ${name};`)(...Object.values(bindings));
}

function harness(kind, responses = [Response.json({ ok: true })], overrides = {}) {
  const requests = [];
  const events = [];
  const receipts = [];
  const ignoredSetter = () => {};
  const common = {
    crypto: { randomUUID: () => submissionId },
    getLeadSubmissionReceipt: () => null,
    getLeadAttribution: () => ({ gclid: "test-ad-click" }),
    saveLeadSubmissionReceipt: (receipt) => receipts.push(receipt),
    sendGTMEvent: (event) => events.push(event),
    submissionRef: { current: null },
    locale: "en",
    setToken: ignoredSetter,
    setSubmitError: ignoredSetter,
    fetch: async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      const response = responses.shift();
      if (response instanceof Error) throw response;
      assert.ok(response instanceof Response, "tests supply every fake API response");
      return response;
    },
  };
  const bindings = kind === "quick" ? {
    ...common,
    sendingRef: { current: false },
    mode: "dropdown",
    vinVehicle: { status: "ready" },
    vehicleErrors: () => [],
    stage: "contact",
    selectionMethod: "dropdown",
    runningStatus: "runs",
    ownershipStatus: "owner_with_title",
    fullName: "Private Seller",
    phone: "619-555-0142",
    zip: "90210",
    streetAddress: "123 Private Street",
    addressLine2: "Unit 2",
    city: "San Diego",
    notes: "Private seller notes",
    selectedYear: "2014",
    selectedMake: "Honda",
    selectedModel: "Civic",
    isValidPhone,
    INQUIRY_NOTES_MAX_LENGTH: 2000,
    turnstileSiteKey: "test-only-site-key",
    token: "test-only-token",
    text: { securityError: "Security required", deliveryError: "Delivery failed" },
    sourcePath: "/",
    setStage: ignoredSetter,
    setInvalid: ignoredSetter,
    setIsPending: ignoredSetter,
    setShowOptional: ignoredSetter,
    setSecurityError: ignoredSetter,
    setResetSignal: ignoredSetter,
    showErrors: ignoredSetter,
  } : {
    ...common,
    submittingRef: { current: false },
    needsTurnstile: true,
    turnstileToken: "test-only-token",
    flow: { common: { turnstileRequired: "Security required", submitError: "Delivery failed" } },
    data: {
      firstName: "Private", lastName: "Seller", phone: "619-555-0142",
      email: "private@example.invalid", streetAddress: "123 Private Street", zip: "90210",
      year: "2014", make: "Honda", model: "Civic", vin: "1HGBH41JXMN109186",
    },
    getOfferSubmissionIdentity,
    submitAbortRef: { current: null },
    window: { setTimeout, clearTimeout },
    setValidationError: ignoredSetter,
    setSubmitStatus: ignoredSetter,
    setTurnstileToken: ignoredSetter,
    setTurnstileResetSignal: ignoredSetter,
  };
  const submit = loadSubmitHandler(
    kind === "quick" ? "../app/components/quick-offer-form.tsx" : "../app/components/offer-flow.tsx",
    kind === "quick" ? "handleSubmit" : "submitOffer",
    { ...bindings, ...overrides },
  );
  return { requests, events, receipts, submit: () => submit({ preventDefault() {} }) };
}

for (const kind of ["quick", "full"]) {
  test(`${kind}: confirmed submission tracks the request UUID without seller details`, async () => {
    const state = harness(kind);
    await state.submit();
    assert.equal(state.requests.length, 1);
    assert.equal(state.receipts.length, 1);
    assert.equal(state.events.length, 1);
    assert.equal(state.events[0].event_id, state.requests[0].body.submissionId);
    assert.equal(state.events[0].event_id, submissionId);
    assert.deepEqual(state.events[0], kind === "quick" ? {
      event: "quick_inquiry_submit_success", event_id: submissionId,
      form_name: "quick_inquiry", selection_method: "dropdown", language: "en",
    } : {
      event: "offer_form_submit_success", event_id: submissionId,
      form_name: "cash_offer", language: "en",
    });
    assert.doesNotMatch(JSON.stringify(state.events), /Private|619-555|123 Private|90210|example\.invalid|1HGB/);
  });

  test(`${kind}: failed or unconfirmed API results never emit a success event`, async () => {
    for (const response of [
      Response.json({ ok: false }, { status: 500 }),
      Response.json({ ok: false }),
      Response.json({}),
      new Response("not-json"),
      new Error("test-only network failure"),
    ]) {
      const state = harness(kind, [response]);
      await state.submit();
      assert.equal(state.requests.length, 1);
      assert.deepEqual(state.events, []);
      assert.deepEqual(state.receipts, []);
    }
  });

  test(`${kind}: retry preserves its UUID and tracks only the confirmed response`, async () => {
    let captures = 0;
    const state = harness(kind, [Response.json({ ok: false }, { status: 502 }), Response.json({ ok: true })], {
      getLeadAttribution: () => ({ gclid: `click-${++captures}`, submittedAt: `2026-10-03T20:00:0${captures}.000Z` }),
    });
    await state.submit();
    assert.deepEqual(state.events, []);
    await state.submit();
    assert.equal(state.requests.length, 2);
    assert.equal(state.requests[0].body.submissionId, state.requests[1].body.submissionId);
    assert.equal(captures, 1, "retry does not replace original attribution or submission time");
    assert.deepEqual(state.requests[0].body.attribution, state.requests[1].body.attribution);
    assert.equal(state.events.length, 1);
    assert.equal(state.events[0].event_id, state.requests[1].body.submissionId);
  });

  test(`${kind}: an existing confirmed receipt prevents another request and event`, async () => {
    const state = harness(kind, [], { getLeadSubmissionReceipt: () => ({ source: kind }) });
    await state.submit();
    assert.deepEqual(state.requests, []);
    assert.deepEqual(state.events, []);
  });
}
