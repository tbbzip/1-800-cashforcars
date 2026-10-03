import { getAdClickAttribution, normalizeAdClickAttribution, saveAdClickFromUrl, type AdClickAttribution } from "./ad-click-attribution";
import {
  ATTRIBUTION_TTL_MS, ATTRIBUTION_VISIT_TTL_MS, LEAD_ATTRIBUTION_STORAGE_KEY, LEAD_VISIT_STORAGE_KEY,
  attributionUrl, normalizeAttributionTouch, normalizeLeadAttribution,
  type AttributionTouch, type LeadAttribution,
} from "./lead-attribution";

type History = Pick<LeadAttribution, "firstTouch" | "lastTouch">;
type Visit = { touch?: AttributionTouch; lastSeenAt: number };
let historyMemory: History = {};
let visitMemory: Visit = { lastSeenAt: 0 };
let clickMemory: AdClickAttribution = {};
let processedUrl = "";
let historyWriteFailed = false;
let visitWriteFailed = false;

function read(key: string, session = false): unknown {
  try {
    const raw = (session ? window.sessionStorage : window.localStorage).getItem(key);
    return raw && raw.length <= 16000 ? JSON.parse(raw) : undefined;
  } catch { return undefined; }
}

function write(key: string, value: unknown, session = false) {
  try {
    (session ? window.sessionStorage : window.localStorage).setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Keep memory authoritative if old stored data remains readable after a failed write.
    return false;
  }
}

function fresh(touch: AttributionTouch | undefined, now: number, ttl = ATTRIBUTION_TTL_MS) {
  const time = touch?.capturedAt ? Date.parse(touch.capturedAt) : NaN;
  return Number.isFinite(time) && now >= time && now - time < ttl ? touch : undefined;
}

function latestClick(now: number, ...values: unknown[]): AdClickAttribution {
  // Select one complete click snapshot; never combine IDs from different arrivals.
  return values.map(normalizeAdClickAttribution)
    .filter((touch) => (touch.gclid || touch.gbraid || touch.wbraid) && fresh(touch, now))
    .reduce((latest, touch) => Date.parse(touch.capturedAt!) >= Date.parse(latest.capturedAt ?? "1970-01-01") ? touch : latest, {} as AdClickAttribution);
}

function touchIdentity(touch: AttributionTouch | undefined) {
  if (!touch) return "";
  const identity = { ...touch };
  delete identity.capturedAt;
  delete identity.landingPage;
  delete identity.referrer;
  return JSON.stringify(identity);
}

function isInternalReferrer(referrer: string, url: URL) {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host === url.hostname.replace(/^www\./, "");
  } catch { return false; }
}

function landingTouch(url: URL, referrer: string, now: number) {
  const params = url.searchParams;
  const pick = (...names: string[]) => names.map((name) => params.get(name)).find((value) => value !== null && value !== "") ?? undefined;
  const click = normalizeAdClickAttribution({ gclid: pick("gclid"), gbraid: pick("gbraid"), wbraid: pick("wbraid"), capturedAt: new Date(now).toISOString() });
  const explicit = normalizeAttributionTouch({
    ...click,
    source: pick("utm_source"), medium: pick("utm_medium"), campaign: pick("utm_campaign"),
    campaignId: pick("campaignid", "campaign_id", "utm_id"), adGroupId: pick("adgroupid", "adgroup_id"),
    creativeId: pick("creative", "ad_id"), targetId: pick("targetid"), keyword: pick("keyword", "utm_term"),
    content: pick("utm_content"), matchType: pick("matchtype"), network: pick("network"), device: pick("device"),
    physicalLocationId: pick("loc_physical_ms"), interestLocationId: pick("loc_interest_ms"),
  });
  const externalReferrer = referrer && !isInternalReferrer(referrer, url) ? attributionUrl(referrer, true) : undefined;
  const hasGoogleClick = Boolean(click.gclid || click.gbraid || click.wbraid);
  let source = explicit?.source;
  let medium = explicit?.medium;
  if (hasGoogleClick) { source ??= "google"; medium ??= "cpc"; }
  if (!source && externalReferrer) {
    const host = new URL(externalReferrer).hostname;
    const isSearch = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(host);
    source = host; medium ??= isSearch ? "organic" : "referral";
  }
  source ??= explicit ? "tagged (source unavailable)" : "direct / unknown";
  medium ??= explicit ? "tagged (medium unavailable)" : "none";
  return {
    touch: normalizeAttributionTouch({ ...explicit, source, medium, capturedAt: new Date(now).toISOString(), landingPage: url.href, referrer: externalReferrer })!,
    explicit: Boolean(explicit),
    external: Boolean(externalReferrer),
  };
}

/** Called at landing and route transitions so navigating to a form never loses URL tags. */
export function captureLeadAttribution() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const url = new URL(window.location.href);
  const stored = normalizeLeadAttribution(historyWriteFailed ? undefined : read(LEAD_ATTRIBUTION_STORAGE_KEY));
  const previous = Object.keys(stored).length ? stored : historyMemory;
  historyMemory = { firstTouch: fresh(previous.firstTouch, now), lastTouch: fresh(previous.lastTouch, now) };
  const rawVisit = visitWriteFailed ? undefined : read(LEAD_VISIT_STORAGE_KEY, true);
  const candidate = rawVisit && typeof rawVisit === "object" ? rawVisit as Record<string, unknown> : {};
  const lastSeenAt = typeof candidate.lastSeenAt === "number" ? candidate.lastSeenAt : visitMemory.lastSeenAt;
  const oldVisit = normalizeAttributionTouch(candidate.touch) ?? visitMemory.touch;
  const activeVisit = now >= lastSeenAt && now - lastSeenAt < ATTRIBUTION_VISIT_TTL_MS ? fresh(oldVisit, now) : undefined;
  const arrival = landingTouch(url, document.referrer, now);
  const isInitialCapture = !processedUrl;
  const isNewTaggedArrival = processedUrl !== url.href && arrival.explicit && touchIdentity(arrival.touch) !== touchIdentity(historyMemory.lastTouch);
  const isNewVisit = !activeVisit;
  const isNewExternalArrival = isInitialCapture && arrival.external && (isNewVisit || touchIdentity(arrival.touch) !== touchIdentity(historyMemory.lastTouch));
  // The document referrer and unchanged URL tags are not new arrivals after SPA inactivity.
  const touch = isNewTaggedArrival || isNewExternalArrival || (isNewVisit && isInitialCapture)
    ? arrival.touch
    : isNewVisit
      ? normalizeAttributionTouch({ source: "direct / unknown", medium: "none", capturedAt: new Date(now).toISOString(), landingPage: url.href })!
      : activeVisit;
  if (!historyMemory.firstTouch) historyMemory.firstTouch = touch;
  // Direct/internal navigation does not erase the latest known acquisition source.
  if (!historyMemory.lastTouch || isNewTaggedArrival || isNewExternalArrival) historyMemory.lastTouch = touch;
  visitMemory = { touch, lastSeenAt: now };
  processedUrl = url.href;
  historyWriteFailed = !write(LEAD_ATTRIBUTION_STORAGE_KEY, historyMemory);
  visitWriteFailed = !write(LEAD_VISIT_STORAGE_KEY, visitMemory, true);
  if (isInitialCapture || isNewTaggedArrival) saveAdClickFromUrl();
  // Preserve the newest observed click even if storage writes fail and a later UTM-only
  // arrival replaces latest/current acquisition. Its own date stays separate from that source.
  clickMemory = latestClick(now, getAdClickAttribution(), clickMemory, historyMemory.firstTouch, historyMemory.lastTouch, visitMemory.touch);
}

/** Freeze this result with the submission ID so a retry sends an identical email body. */
export function getLeadAttribution(): LeadAttribution {
  if (typeof window === "undefined") return {};
  try {
    captureLeadAttribution();
    const now = Date.now();
    const agent = window.navigator.userAgent;
    const deviceType = /iPad|Tablet|Android(?!.*Mobile)/i.test(agent) ? "tablet" : /Mobi|iPhone|Android/i.test(agent) ? "mobile" : "desktop";
    return normalizeLeadAttribution({
      ...clickMemory, ...historyMemory, currentVisit: visitMemory.touch,
      submissionPage: window.location.href, submittedAt: new Date(now).toISOString(),
      deviceType, browserLanguage: window.navigator.language,
    });
  } catch {
    // Optional attribution must not block a lead even under unusual browser restrictions.
    return {};
  }
}
