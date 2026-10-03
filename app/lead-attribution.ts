import { adClickRows, normalizeAdClickAttribution, type AdClickAttribution } from "./ad-click-attribution";

/** Campaign metadata supplied by landing URLs, not the visitor's private search query. */
export type AttributionTouch = AdClickAttribution & {
  capturedAt?: string;
  landingPage?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  campaignId?: string;
  adGroupId?: string;
  creativeId?: string;
  targetId?: string;
  keyword?: string;
  content?: string;
  matchType?: string;
  network?: string;
  device?: string;
  physicalLocationId?: string;
  interestLocationId?: string;
};

export type LeadAttribution = AdClickAttribution & {
  firstTouch?: AttributionTouch;
  lastTouch?: AttributionTouch;
  currentVisit?: AttributionTouch;
  submissionPage?: string;
  submittedAt?: string;
  deviceType?: "mobile" | "tablet" | "desktop";
  browserLanguage?: string;
};

export const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
export const ATTRIBUTION_VISIT_TTL_MS = 30 * 60 * 1000;
export const LEAD_ATTRIBUTION_STORAGE_KEY = "cashforcars:lead-attribution:v1";
export const LEAD_VISIT_STORAGE_KEY = "cashforcars:visit-attribution:v1";

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function text(value: unknown, limit = 200) {
  if (typeof value !== "string" || value.length > limit || /[\u0000-\u001f\u007f<>]/.test(value)) return undefined;
  const result = value.trim();
  // Unexpanded ValueTrack tokens are configuration errors, not attribution values.
  return result && !/[{}]/.test(result) ? result : undefined;
}

export function attributionTime(value: unknown) {
  if (typeof value !== "string" || value.length > 40) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
}

/** Never retain URL credentials, arbitrary query parameters, fragments or referrer paths. */
export function attributionUrl(value: unknown, originOnly = false) {
  if (typeof value !== "string" || value.length > 4096) return undefined;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    return originOnly ? url.origin : `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

export function normalizeAttributionTouch(value: unknown): AttributionTouch | undefined {
  const input = record(value);
  const result: AttributionTouch = { ...normalizeAdClickAttribution(input) };
  const capturedAt = attributionTime(input.capturedAt);
  if (capturedAt) result.capturedAt = capturedAt;
  const landingPage = attributionUrl(input.landingPage);
  if (landingPage) result.landingPage = landingPage;
  const referrer = attributionUrl(input.referrer, true);
  if (referrer) result.referrer = referrer;
  for (const key of ["source", "medium", "campaign", "keyword", "content"] as const) {
    const normalized = text(input[key]);
    if (normalized) result[key] = normalized;
  }
  for (const key of ["campaignId", "adGroupId", "creativeId", "physicalLocationId", "interestLocationId"] as const) {
    if (typeof input[key] === "string" && /^\d{1,20}$/.test(input[key])) result[key] = input[key];
  }
  const targetId = text(input.targetId, 180);
  if (targetId && /^(?:(?:kwd|kwl|dsa|aud|pla|hpi)-\d+)(?::(?:kwd|kwl|dsa|aud|pla|hpi)-\d+)*$/.test(targetId)) result.targetId = targetId;
  if (typeof input.matchType === "string" && ["e", "p", "b", "a"].includes(input.matchType)) result.matchType = input.matchType;
  if (typeof input.network === "string" && ["g", "s", "d", "ytv", "vp", "gtv", "x", "e"].includes(input.network)) result.network = input.network;
  if (typeof input.device === "string" && ["m", "t", "c"].includes(input.device)) result.device = input.device;
  return Object.keys(result).some((key) => key !== "capturedAt") ? result : undefined;
}

/** Optional attribution can never invalidate a real vehicle inquiry. */
export function normalizeLeadAttribution(value: unknown): LeadAttribution {
  const input = record(value);
  const result: LeadAttribution = { ...normalizeAdClickAttribution(input) };
  for (const key of ["firstTouch", "lastTouch", "currentVisit"] as const) {
    const touch = normalizeAttributionTouch(input[key]);
    if (touch) result[key] = touch;
  }
  const submissionPage = attributionUrl(input.submissionPage);
  if (submissionPage) result.submissionPage = submissionPage;
  const submittedAt = attributionTime(input.submittedAt);
  if (submittedAt) result.submittedAt = submittedAt;
  if (typeof input.deviceType === "string" && ["mobile", "tablet", "desktop"].includes(input.deviceType)) result.deviceType = input.deviceType as LeadAttribution["deviceType"];
  if (typeof input.browserLanguage === "string" && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(input.browserLanguage) && input.browserLanguage.length <= 40) result.browserLanguage = input.browserLanguage;
  return result;
}

const matchLabels: Record<string, string> = { e: "Exact", p: "Phrase", b: "Broad", a: "AI Max keywordless" };
const networkLabels: Record<string, string> = { g: "Google Search", s: "Search partners", d: "Display", ytv: "YouTube", vp: "Google video partners", gtv: "Google TV", x: "Performance Max", e: "App engagement" };
const deviceLabels: Record<string, string> = { m: "Mobile", t: "Tablet", c: "Computer" };

/** Safe, consistently labeled rows shared by plain-text and HTML emails. */
export function leadAttributionRows(value: LeadAttribution): [string, string][] {
  const attribution = normalizeLeadAttribution(value);
  const rows: [string, string][] = [];
  const add = (label: string, content: string | undefined) => { if (content) rows.push([label, content]); };
  add("Submission page", attribution.submissionPage);
  add("Browser submission time (UTC)", attribution.submittedAt);
  add("Browser device category (estimated)", attribution.deviceType);
  add("Browser language", attribution.browserLanguage);
  for (const [key, prefix] of [["lastTouch", "Latest acquisition"], ["firstTouch", "First recorded visit"], ["currentVisit", "Current visit"]] as const) {
    const touch = attribution[key];
    if (!touch) continue;
    add(`${prefix}: source / medium`, [touch.source, touch.medium].filter(Boolean).join(" / "));
    add(`${prefix}: campaign`, touch.campaign);
    add(`${prefix}: matched keyword (not search term)`, touch.keyword);
    add(`${prefix}: keyword match type`, touch.matchType ? matchLabels[touch.matchType] : undefined);
    add(`${prefix}: campaign ID`, touch.campaignId);
    add(`${prefix}: ad group ID`, touch.adGroupId);
    add(`${prefix}: ad / creative ID`, touch.creativeId);
    add(`${prefix}: targeting ID`, touch.targetId);
    add(`${prefix}: content / variation`, touch.content);
    add(`${prefix}: network`, touch.network ? networkLabels[touch.network] : undefined);
    add(`${prefix}: ad-click device`, touch.device ? deviceLabels[touch.device] : undefined);
    add(`${prefix}: Google geographic ID (not pickup ZIP)`, touch.physicalLocationId);
    add(`${prefix}: Google interest-location ID`, touch.interestLocationId);
    add(`${prefix}: landing page`, touch.landingPage);
    add(`${prefix}: referring site`, touch.referrer);
    add(`${prefix}: observed at (UTC)`, touch.capturedAt);
    for (const [label, content] of adClickRows(touch)) {
      if (label !== "Ad click seen (UTC)") add(`${prefix}: ${label}`, content);
    }
  }
  // Legacy IDs are independently dated; never imply they belong to a newer organic source.
  for (const [label, content] of adClickRows(attribution)) add(label, content);
  return rows;
}
