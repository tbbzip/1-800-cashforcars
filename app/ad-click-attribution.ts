/**
 * Google Ads click identifiers carried with every lead, so a later "car purchased" outcome can be
 * uploaded to Google Ads as an offline conversion. gclid is the standard click ID; iOS traffic
 * often arrives with gbraid (app) or wbraid (web) instead.
 */
export type AdClickAttribution = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  /** ISO time the click ID was first seen on this site. */
  capturedAt?: string;
};

export const AD_CLICK_STORAGE_KEY = "cashforcars:ad-click:v1";
/** Google Ads accepts offline click conversions up to 90 days after the click. */
export const AD_CLICK_TTL_MS = 90 * 24 * 60 * 60 * 1000;

const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid"] as const;
const CLICK_ID_PATTERN = /^[A-Za-z0-9._~-]{1,512}$/;
const EMPTY: AdClickAttribution = {};

function clickId(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return CLICK_ID_PATTERN.test(trimmed) ? trimmed : undefined;
}

function isoTime(value: unknown) {
  if (typeof value !== "string" || value.length > 40) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
}

/** Keep only well-formed IDs; anything else is dropped rather than failing the lead. */
export function normalizeAdClickAttribution(input: unknown): AdClickAttribution {
  if (!input || typeof input !== "object" || Array.isArray(input)) return EMPTY;
  const record = input as Record<string, unknown>;
  const result: AdClickAttribution = {};
  for (const key of CLICK_ID_KEYS) {
    const value = clickId(record[key]);
    if (value) result[key] = value;
  }
  if (!result.gclid && !result.gbraid && !result.wbraid) return EMPTY;
  const capturedAt = isoTime(record.capturedAt);
  if (capturedAt) result.capturedAt = capturedAt;
  return result;
}

function fromUrl(search: string, now: number): AdClickAttribution {
  const params = new URLSearchParams(search);
  return normalizeAdClickAttribution({
    gclid: params.get("gclid") ?? undefined,
    gbraid: params.get("gbraid") ?? undefined,
    wbraid: params.get("wbraid") ?? undefined,
    capturedAt: new Date(now).toISOString(),
  });
}

function fromStorage(now: number): AdClickAttribution {
  try {
    const raw = window.localStorage.getItem(AD_CLICK_STORAGE_KEY);
    if (!raw || raw.length > 4000) return EMPTY;
    const stored = normalizeAdClickAttribution(JSON.parse(raw));
    const capturedAt = stored.capturedAt ? Date.parse(stored.capturedAt) : NaN;
    return Number.isFinite(capturedAt) && now - capturedAt < AD_CLICK_TTL_MS ? stored : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Fallback to the cookies Google's Conversion Linker writes: `GCL.<seconds>.<id>`. */
function fromConversionLinker(): AdClickAttribution {
  const cookies = new Map(document.cookie.split(";").map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())] as const;
  }));
  const parse = (name: string) => {
    const match = /^GCL\.(\d+)\.(.+)$/.exec(cookies.get(name) ?? "");
    return match ? { id: match[2], seconds: Number(match[1]) } : null;
  };
  const aw = parse("_gcl_aw");
  const gb = parse("_gcl_gb");
  const seconds = aw?.seconds ?? gb?.seconds;
  return normalizeAdClickAttribution({
    gclid: aw?.id,
    gbraid: gb?.id,
    capturedAt: seconds ? new Date(seconds * 1000).toISOString() : undefined,
  });
}

let cachedKey = "";
let cachedValue: AdClickAttribution = EMPTY;

/** Current page URL first (the ad landing), then the saved click, then Conversion Linker cookies. */
export function getAdClickAttribution(): AdClickAttribution {
  if (typeof window === "undefined") return EMPTY;
  const now = Date.now();
  let value = fromUrl(window.location.search, now);
  if (value === EMPTY) value = fromStorage(now);
  if (value === EMPTY) {
    try {
      value = fromConversionLinker();
    } catch {
      value = EMPTY;
    }
  }
  // Stable identity for useSyncExternalStore; capturedAt from the URL changes every call.
  const key = JSON.stringify({ ...value, capturedAt: undefined });
  if (key !== cachedKey) {
    cachedKey = key;
    cachedValue = value;
  }
  return cachedValue;
}

export function getServerAdClickAttribution(): AdClickAttribution {
  return EMPTY;
}

/** Remember a landing click for later pages and visits. The newest ad click wins. */
export function saveAdClickFromUrl() {
  if (typeof window === "undefined") return;
  const value = fromUrl(window.location.search, Date.now());
  if (value === EMPTY) return;
  try {
    window.localStorage.setItem(AD_CLICK_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be blocked; the Conversion Linker cookie remains as a fallback.
  }
}

/** Rows for lead emails, in a stable order. */
export function adClickRows(attribution: AdClickAttribution): [string, string][] {
  const rows: [string, string][] = [];
  if (attribution.gclid) rows.push(["Google Ads click ID (gclid)", attribution.gclid]);
  if (attribution.gbraid) rows.push(["Google Ads click ID (gbraid)", attribution.gbraid]);
  if (attribution.wbraid) rows.push(["Google Ads click ID (wbraid)", attribution.wbraid]);
  if (rows.length && attribution.capturedAt) rows.push(["Ad click seen (UTC)", attribution.capturedAt]);
  return rows;
}
