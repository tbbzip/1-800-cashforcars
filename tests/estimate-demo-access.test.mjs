import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const helperPath = resolve("app/server/estimate-demo-access.ts");
const password = "fictional-test-password-2026";
const now = Date.UTC(2026, 8, 16, 12);

function access(env = {}) {
  return loadTypeScript(helperPath, undefined, {
    NODE_ENV: "production",
    ESTIMATE_DEMO_ENABLED: "true",
    ESTIMATE_DEMO_PASSWORD: password,
    ...env,
  });
}

test("production is disabled unless explicitly enabled with a valid server password", () => {
  const disabledConfigurations = [
    { ESTIMATE_DEMO_ENABLED: undefined },
    { ESTIMATE_DEMO_ENABLED: "false" },
    { ESTIMATE_DEMO_ENABLED: "TRUE" },
    { ESTIMATE_DEMO_PASSWORD: undefined },
    { ESTIMATE_DEMO_PASSWORD: "" },
    { ESTIMATE_DEMO_PASSWORD: "short-password" },
    { ESTIMATE_DEMO_PASSWORD: " ".repeat(20) },
    { ESTIMATE_DEMO_PASSWORD: "a".repeat(257) },
  ];

  for (const config of disabledConfigurations) {
    const gate = access(config);
    assert.equal(gate.getEstimateDemoMode(), "disabled");
    assert.equal(gate.hasEstimateDemoAccess(undefined, now), false);
    assert.equal(gate.verifyEstimateDemoPassword(password), false);
    assert.equal(gate.createEstimateDemoSession(now), null);
  }
});

test("only development without a password allows direct local access", () => {
  const local = access({
    NODE_ENV: "development",
    ESTIMATE_DEMO_ENABLED: undefined,
    ESTIMATE_DEMO_PASSWORD: undefined,
  });
  assert.equal(local.getEstimateDemoMode(), "local");
  assert.equal(local.hasEstimateDemoAccess(undefined, now), true);
  assert.equal(local.createEstimateDemoSession(now), null);

  for (const nodeEnv of ["production", "test", undefined]) {
    const gate = access({
      NODE_ENV: nodeEnv,
      ESTIMATE_DEMO_ENABLED: undefined,
      ESTIMATE_DEMO_PASSWORD: undefined,
    });
    assert.equal(gate.getEstimateDemoMode(), "disabled");
    assert.equal(gate.hasEstimateDemoAccess(undefined, now), false);
  }
});

test("a configured development password still requires authentication", () => {
  const gate = access({ NODE_ENV: "development", ESTIMATE_DEMO_ENABLED: undefined });
  assert.equal(gate.getEstimateDemoMode(), "protected");
  assert.equal(gate.hasEstimateDemoAccess(undefined, now), false);
  assert.equal(gate.verifyEstimateDemoPassword(password), true);
  assert.equal(gate.hasEstimateDemoAccess(gate.createEstimateDemoSession(now), now), true);

  const weak = access({ NODE_ENV: "development", ESTIMATE_DEMO_PASSWORD: "weak" });
  assert.equal(weak.getEstimateDemoMode(), "disabled");
  assert.equal(weak.hasEstimateDemoAccess(undefined, now), false);
});

test("password comparison accepts the exact password and rejects malformed or bounded inputs", () => {
  const gate = access();
  assert.equal(gate.verifyEstimateDemoPassword(password), true);
  for (const candidate of [
    undefined, null, {}, 123, new Blob([password]), "", "incorrect-password-here",
    password.toUpperCase(), `${password} `, "a".repeat(257),
  ]) {
    assert.equal(gate.verifyEstimateDemoPassword(candidate), false);
  }
  const minimum = access({ ESTIMATE_DEMO_PASSWORD: "a".repeat(16) });
  assert.equal(minimum.verifyEstimateDemoPassword("a".repeat(16)), true);
  const maximum = access({ ESTIMATE_DEMO_PASSWORD: "a".repeat(256) });
  assert.equal(maximum.verifyEstimateDemoPassword("a".repeat(256)), true);
});

test("session cookies are unique signed tokens without the password and expire exactly at the deadline", () => {
  const gate = access();
  const token = gate.createEstimateDemoSession(now);
  const anotherToken = gate.createEstimateDemoSession(now);
  assert.equal(typeof token, "string");
  assert.notEqual(token, anotherToken);
  assert.equal(token.includes(password), false);
  assert.equal(token.includes(Buffer.from(password).toString("base64url")), false);
  assert.equal(gate.hasEstimateDemoAccess(token, now), true);
  assert.equal(gate.hasEstimateDemoAccess(token, now + gate.ESTIMATE_DEMO_SESSION_SECONDS * 1000 - 1), true);
  assert.equal(gate.hasEstimateDemoAccess(token, now + gate.ESTIMATE_DEMO_SESSION_SECONDS * 1000), false);
  assert.equal(gate.hasEstimateDemoAccess(token, now - 1000), false);
});

test("forged, malformed, and altered tokens never authorize", () => {
  const gate = access();
  const token = gate.createEstimateDemoSession(now);
  const pieces = token.split(".");
  const alteredExpiry = [...pieces];
  alteredExpiry[2] = String(Number(alteredExpiry[2]) + 60);
  const alteredNonce = [...pieces];
  alteredNonce[3] = "a".repeat(22);
  const alteredSignature = [...pieces];
  alteredSignature[4] = "a".repeat(43);

  for (const candidate of [
    undefined, null, {}, true, "", password, "a".repeat(1000),
    token.replace("v1.", "v2."), `${token}.extra`, token.slice(0, -1),
    alteredExpiry.join("."), alteredNonce.join("."), alteredSignature.join("."),
  ]) {
    assert.equal(gate.hasEstimateDemoAccess(candidate, now), false);
  }
});

test("password rotation and disabling the route invalidate existing sessions", () => {
  const token = access().createEstimateDemoSession(now);
  const rotated = access({ ESTIMATE_DEMO_PASSWORD: "different-fictional-password" });
  assert.equal(rotated.hasEstimateDemoAccess(token, now), false);
  const disabled = access({ ESTIMATE_DEMO_ENABLED: "false" });
  assert.equal(disabled.hasEstimateDemoAccess(token, now), false);
});

test("invalid clock values fail closed", () => {
  const gate = access();
  const token = gate.createEstimateDemoSession(now);
  for (const time of [NaN, Infinity, -1]) {
    assert.equal(gate.createEstimateDemoSession(time), null);
    assert.equal(gate.hasEstimateDemoAccess(token, time), false);
  }
});

test("cookies are HttpOnly, narrowly scoped, SameSite strict, and secure in production", () => {
  const production = access();
  assert.deepEqual(production.getEstimateDemoCookieOptions(), {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/estimate-preview",
    maxAge: 7200,
  });
  assert.equal(access({ NODE_ENV: "development" }).getEstimateDemoCookieOptions().secure, false);
});

test("prototype HTTP headers cover the route and all subpaths even when unavailable", async () => {
  const { default: config } = loadTypeScript(resolve("next.config.ts"));
  const rules = await config.headers();
  const rule = rules.find((entry) => entry.source === "/estimate-preview/:path*");
  assert.ok(rule);
  const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
  assert.match(headers["X-Robots-Tag"], /noindex/);
  assert.match(headers["X-Robots-Tag"], /nofollow/);
  assert.match(headers["Cache-Control"], /private/);
  assert.match(headers["Cache-Control"], /no-store/);
});
