import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ESTIMATE_DEMO_PATH = "/estimate-preview";
export const ESTIMATE_DEMO_COOKIE_NAME = "estimate_demo_access";
export const ESTIMATE_DEMO_SESSION_SECONDS = 2 * 60 * 60;
const MIN_PASSWORD_LENGTH = 16;
const MAX_PASSWORD_LENGTH = 256;
const MAX_TOKEN_LENGTH = 200;

export type EstimateDemoMode = "disabled" | "local" | "protected";

export function getEstimateDemoMode(): EstimateDemoMode {
  const password = process.env.ESTIMATE_DEMO_PASSWORD;
  const development = process.env.NODE_ENV === "development";

  if (development && (password === undefined || password === "")) {
    return "local";
  }

  if (!development && process.env.ESTIMATE_DEMO_ENABLED !== "true") {
    return "disabled";
  }

  if (
    !password ||
    password.trim().length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return "disabled";
  }

  return "protected";
}

export function verifyEstimateDemoPassword(candidate: unknown): boolean {
  if (
    getEstimateDemoMode() !== "protected" ||
    typeof candidate !== "string" ||
    candidate.length < MIN_PASSWORD_LENGTH ||
    candidate.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  const expected = createHash("sha256")
    .update(process.env.ESTIMATE_DEMO_PASSWORD!)
    .digest();
  const received = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(expected, received);
}

function sign(payload: string): string {
  // A purpose-specific key also invalidates every session when the password changes.
  const key = createHmac("sha256", process.env.ESTIMATE_DEMO_PASSWORD!)
    .update("cash-for-cars:estimate-demo-session:v1")
    .digest();
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createEstimateDemoSession(now = Date.now()): string | null {
  if (getEstimateDemoMode() !== "protected") return null;

  const issuedAt = Math.floor(now / 1000);
  if (!Number.isSafeInteger(issuedAt) || issuedAt < 0) return null;
  const expiresAt = issuedAt + ESTIMATE_DEMO_SESSION_SECONDS;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `v1.${issuedAt}.${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function hasEstimateDemoAccess(
  token: unknown,
  now = Date.now(),
): boolean {
  const mode = getEstimateDemoMode();
  if (mode === "local") return true;
  if (mode !== "protected" || typeof token !== "string") return false;
  if (token.length > MAX_TOKEN_LENGTH) return false;

  const match = /^v1\.(\d{1,13})\.(\d{1,13})\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;

  const issuedAt = Number(match[1]);
  const expiresAt = Number(match[2]);
  const currentTime = Math.floor(now / 1000);
  if (
    !Number.isSafeInteger(currentTime) ||
    currentTime < 0 ||
    expiresAt - issuedAt !== ESTIMATE_DEMO_SESSION_SECONDS ||
    issuedAt > currentTime ||
    expiresAt <= currentTime
  ) {
    return false;
  }

  const payload = token.slice(0, token.lastIndexOf("."));
  return timingSafeEqual(Buffer.from(match[4]), Buffer.from(sign(payload)));
}

export function getEstimateDemoCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: ESTIMATE_DEMO_PATH,
    maxAge: ESTIMATE_DEMO_SESSION_SECONDS,
  };
}
