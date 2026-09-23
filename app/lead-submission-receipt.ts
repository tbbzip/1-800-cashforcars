export type LeadSubmissionReceipt = {
  version: 1;
  submittedAt: number;
  vehicle: { year: string; make: string; model: string };
  source: "quick" | "full";
};

type ReceiptInput = Pick<LeadSubmissionReceipt, "vehicle" | "source">;
export type LeadSubmissionSnapshot = {
  receipt: LeadSubmissionReceipt | null;
  ready: boolean;
};

export const LEAD_SUBMISSION_STORAGE_KEY = "cashforcars:lead-submission:v1";
export const LEAD_SUBMISSION_TTL_MS = 24 * 60 * 60 * 1000;

const serverSnapshot: LeadSubmissionSnapshot = { receipt: null, ready: false };
let clientSnapshot: LeadSubmissionSnapshot = { receipt: null, ready: true };
let cachedRaw: string | null | undefined;
let cachedReceipt: LeadSubmissionReceipt | null = null;
let memoryOnly = false;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function parseReceipt(raw: string | null, now: number): LeadSubmissionReceipt | null {
  if (!raw || raw.length > 2000) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    if (value.version !== 1 || (value.source !== "quick" && value.source !== "full")) return null;
    if (!Number.isSafeInteger(value.submittedAt) || value.submittedAt <= 0 || value.submittedAt > now) return null;
    if (now - value.submittedAt >= LEAD_SUBMISSION_TTL_MS) return null;
    const vehicle = value.vehicle;
    if (!vehicle || typeof vehicle !== "object" || Array.isArray(vehicle)) return null;
    if (typeof vehicle.year !== "string" || !/^\d{4}$/.test(vehicle.year)) return null;
    if (typeof vehicle.make !== "string" || !vehicle.make.trim() || vehicle.make.length > 100) return null;
    if (typeof vehicle.model !== "string" || !vehicle.model.trim() || vehicle.model.length > 100) return null;
    // Reconstruct the allowed fields so a receipt never exposes other saved form data.
    return {
      version: 1,
      submittedAt: value.submittedAt,
      vehicle: { year: vehicle.year, make: vehicle.make.trim(), model: vehicle.model.trim() },
      source: value.source,
    };
  } catch {
    return null;
  }
}

function isCurrent(receipt: LeadSubmissionReceipt | null): receipt is LeadSubmissionReceipt {
  const now = Date.now();
  return receipt !== null && receipt.submittedAt <= now && now - receipt.submittedAt < LEAD_SUBMISSION_TTL_MS;
}

/** Read again at submit time, including when another tab has just submitted. */
export function getLeadSubmissionReceipt(): LeadSubmissionReceipt | null {
  if (typeof window === "undefined") return null;
  if (!memoryOnly) {
    try {
      const raw = window.localStorage.getItem(LEAD_SUBMISSION_STORAGE_KEY);
      if (raw !== cachedRaw) {
        cachedRaw = raw;
        cachedReceipt = parseReceipt(raw, Date.now());
      }
    } catch {
      // Privacy settings can block storage. Keep the current tab's confirmed receipt.
    }
  }
  if (!isCurrent(cachedReceipt)) cachedReceipt = null;
  return cachedReceipt;
}

export function getLeadSubmissionSnapshot(): LeadSubmissionSnapshot {
  if (typeof window === "undefined") return serverSnapshot;
  const receipt = getLeadSubmissionReceipt();
  if (clientSnapshot.receipt !== receipt) clientSnapshot = { receipt, ready: true };
  return clientSnapshot;
}

export function getServerLeadSubmissionSnapshot(): LeadSubmissionSnapshot {
  return serverSnapshot;
}

function notify() {
  for (const listener of listeners) listener();
}

function scheduleExpiry() {
  if (expiryTimer !== undefined) clearTimeout(expiryTimer);
  expiryTimer = undefined;
  const receipt = getLeadSubmissionReceipt();
  if (listeners.size === 0 || !receipt) return;
  expiryTimer = setTimeout(() => {
    expiryTimer = undefined;
    refresh();
  }, Math.max(1, receipt.submittedAt + LEAD_SUBMISSION_TTL_MS - Date.now()));
}

function refresh() {
  const previous = clientSnapshot;
  const current = getLeadSubmissionSnapshot();
  scheduleExpiry();
  if (previous !== current) notify();
}

function onStorage(event: StorageEvent) {
  if (event.key !== LEAD_SUBMISSION_STORAGE_KEY && event.key !== null) return;
  try {
    if (event.storageArea && event.storageArea !== window.localStorage) return;
  } catch {
    return;
  }
  // A real storage event supersedes any temporary in-memory fallback.
  memoryOnly = false;
  refresh();
}

export function subscribeToLeadSubmissionReceipt(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
  }
  scheduleExpiry();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      if (expiryTimer !== undefined) clearTimeout(expiryTimer);
      expiryTimer = undefined;
    }
  };
}

/** Call only after the server has confirmed a successful lead submission. */
export function saveLeadSubmissionReceipt(input: ReceiptInput): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const receipt = parseReceipt(JSON.stringify({
    version: 1,
    submittedAt: now,
    vehicle: {
      year: input.vehicle.year.trim(),
      make: input.vehicle.make.trim().slice(0, 100),
      model: input.vehicle.model.trim().slice(0, 100),
    },
    source: input.source,
  }), now);
  if (!receipt) return;
  cachedReceipt = receipt;
  cachedRaw = JSON.stringify(receipt);
  try {
    window.localStorage.setItem(LEAD_SUBMISSION_STORAGE_KEY, cachedRaw);
    memoryOnly = false;
  } catch {
    memoryOnly = true;
  }
  getLeadSubmissionSnapshot();
  scheduleExpiry();
  notify();
}

/** A deliberate “another vehicle” action starts a fresh request across forms. */
export function clearLeadSubmissionReceipt(): void {
  if (typeof window === "undefined") return;
  cachedReceipt = null;
  cachedRaw = null;
  try {
    window.localStorage.removeItem(LEAD_SUBMISSION_STORAGE_KEY);
    memoryOnly = false;
  } catch {
    memoryOnly = true;
  }
  getLeadSubmissionSnapshot();
  scheduleExpiry();
  notify();
}
