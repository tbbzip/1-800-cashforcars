import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const purePath = fileURLToPath(new URL("../app/lead-attribution.ts", import.meta.url));
const clientPath = fileURLToPath(new URL("../app/lead-attribution-client.ts", import.meta.url));
const {
  LEAD_ATTRIBUTION_STORAGE_KEY,
  LEAD_VISIT_STORAGE_KEY,
  attributionUrl,
  normalizeAttributionTouch,
  normalizeLeadAttribution,
  leadAttributionRows,
} = loadTypeScript(purePath);

const ORIGIN = "https://www.1-800-cashforcars.com";
const NOW = Date.parse("2026-10-03T18:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;
const VISIT_TIMEOUT = 30 * 60 * 1000;
const LEGACY_CLICK_KEY = "cashforcars:ad-click:v1";
const iso = (time) => new Date(time).toISOString();

function storage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key),
    clear: () => entries.clear(),
  };
}

// The real modules run against a fresh browser and module cache for each case.
// Global browser and clock overrides are always restored, including on failure.
function withBrowser(run, options = {}) {
  const saved = new Map(["window", "document"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const originalNow = Date.now;
  let now = options.now ?? NOW;
  const localStorage = storage(options.local);
  const sessionStorage = storage(options.session);
  const document = { referrer: options.referrer ?? "", cookie: "" };
  const window = {
    localStorage,
    sessionStorage,
    navigator: { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile", language: "en-US" },
    location: undefined,
  };
  const navigate = (href, referrer = document.referrer) => {
    const url = new URL(href, ORIGIN);
    window.location = { href: url.href, search: url.search };
    document.referrer = referrer;
  };
  navigate(options.href ?? "/offer");
  try {
    Object.defineProperty(globalThis, "window", { value: window, configurable: true, writable: true });
    Object.defineProperty(globalThis, "document", { value: document, configurable: true, writable: true });
    Date.now = () => now;
    return run({
      window, document, localStorage, sessionStorage, navigate,
      advance: (milliseconds) => { now += milliseconds; },
      loadClient: () => loadTypeScript(clientPath),
    });
  } finally {
    Date.now = originalNow;
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

function acquisition(capturedAt = iso(NOW - DAY)) {
  return {
    source: "google", medium: "cpc", campaign: "old-campaign", gclid: "old-paid-click",
    capturedAt, landingPage: `${ORIGIN}/junk-cars`,
  };
}

function history(touch) {
  return { [LEAD_ATTRIBUTION_STORAGE_KEY]: JSON.stringify({ firstTouch: touch, lastTouch: touch }) };
}

test("URL normalization excludes credentials, query strings, fragments and referrer paths", () => {
  const url = "https://user:secret@example.invalid/private/offer?email=private%40example.invalid&token=secret#contact";
  assert.equal(attributionUrl(url), "https://example.invalid/private/offer");
  assert.equal(attributionUrl(url, true), "https://example.invalid");
  for (const unsafe of ["javascript:alert(1)", "data:text/plain,secret", "file:///private/file", "/relative", "not a URL", "x".repeat(4097), null]) {
    assert.equal(attributionUrl(unsafe), undefined);
  }
});

test("normalization allowlists campaign fields and rejects invalid values or unexpanded tokens", () => {
  const actual = normalizeLeadAttribution({
    firstTouch: {
      gclid: "valid-click", capturedAt: "2026-10-03T17:00:00Z",
      landingPage: `${ORIGIN}/offer?email=private&token=secret#contact`,
      referrer: "https://search.example.invalid/private/search?q=private-query#secret",
      source: "google", medium: "cpc", campaign: "October Sellers", keyword: "sell my car", content: "copy-b",
      campaignId: "23919195304", adGroupId: "456", creativeId: "789", targetId: "aud-123:kwd-456",
      matchType: "e", network: "g", device: "m", physicalLocationId: "9031339", interestLocationId: "9031340",
      searchTerm: "private actual query", email: "private@example.invalid", token: "private-secret",
    },
    lastTouch: {
      source: "<script>", medium: "bad\nmedium", campaign: "x".repeat(201), keyword: "{keyword}",
      campaignId: "{campaignid}", adGroupId: "12bad", creativeId: 123, targetId: "unapproved-123",
      matchType: "exact", network: "unknown", device: "phone", gclid: "<bad>",
    },
    submissionPage: `${ORIGIN}/offer?phone=6195550100#secret`, submittedAt: "2026-10-03T18:00:00Z",
    deviceType: "mobile", browserLanguage: "es-MX", arbitraryPrivateField: "secret",
  });
  assert.deepEqual(actual.firstTouch, {
    gclid: "valid-click", capturedAt: "2026-10-03T17:00:00.000Z",
    landingPage: `${ORIGIN}/offer`, referrer: "https://search.example.invalid",
    source: "google", medium: "cpc", campaign: "October Sellers", keyword: "sell my car", content: "copy-b",
    campaignId: "23919195304", adGroupId: "456", creativeId: "789", targetId: "aud-123:kwd-456",
    matchType: "e", network: "g", device: "m", physicalLocationId: "9031339", interestLocationId: "9031340",
  });
  assert.equal(actual.lastTouch, undefined);
  assert.equal(actual.submissionPage, `${ORIGIN}/offer`);
  assert.equal(actual.submittedAt, iso(NOW));
  assert.doesNotMatch(JSON.stringify(actual), /private-query|private@example|private-secret|6195550100|\?|#|\{keyword\}/);
  for (const malformed of [null, [], "private", 42]) assert.equal(normalizeAttributionTouch(malformed), undefined);
});

test("human-readable rows distinguish matched keywords and geographic IDs from private search terms and pickup ZIPs", () => {
  const rows = leadAttributionRows({ lastTouch: { keyword: "cash for cars", matchType: "b", physicalLocationId: "9031339" } });
  assert.ok(rows.some(([label, value]) => label === "Latest acquisition: matched keyword (not search term)" && value === "cash for cars"));
  assert.ok(rows.some(([label, value]) => label === "Latest acquisition: keyword match type" && value === "Broad"));
  assert.ok(rows.some(([label, value]) => label === "Latest acquisition: Google geographic ID (not pickup ZIP)" && value === "9031339"));
});

test("tagged landing capture persists only allowlisted URL values and referring origin", () => withBrowser(({ loadClient, localStorage, sessionStorage }) => {
  const result = loadClient().getLeadAttribution();
  assert.equal(result.lastTouch.gclid, "click-one");
  assert.equal(result.lastTouch.source, "google");
  assert.equal(result.lastTouch.medium, "cpc");
  assert.equal(result.lastTouch.keyword, "sell my car");
  assert.equal(result.lastTouch.campaignId, "23919195304");
  assert.equal(result.lastTouch.landingPage, `${ORIGIN}/offer`);
  assert.equal(result.lastTouch.referrer, "https://www.google.com");
  assert.equal(result.submissionPage, `${ORIGIN}/offer`);
  assert.equal(result.deviceType, "mobile");
  assert.equal(result.browserLanguage, "en-US");
  const retained = JSON.stringify([result, [...localStorage.entries.values()], [...sessionStorage.entries.values()]]);
  assert.doesNotMatch(retained, /private-query|private-email|private-token|query_secret|#private|password/);
}, {
  href: "/offer?gclid=click-one&keyword=sell+my+car&campaignid=23919195304&utm_content=copy-a&email=private-email&token=private-token&query=query_secret#private",
  referrer: "https://username:password@www.google.com/search?q=private-query",
}));

test("UTM-only traffic retains campaign attribution without fabricating Google click IDs", () => withBrowser(({ loadClient }) => {
  const result = loadClient().getLeadAttribution();
  assert.equal(result.lastTouch.source, "newsletter");
  assert.equal(result.lastTouch.medium, "email");
  assert.equal(result.lastTouch.campaign, "fall-offers");
  assert.equal(result.lastTouch.keyword, "used cars");
  assert.equal(result.lastTouch.content, "button-b");
  assert.equal(result.lastTouch.campaignId, "5678");
  for (const key of ["gclid", "gbraid", "wbraid"]) {
    assert.equal(result[key], undefined);
    assert.equal(result.lastTouch[key], undefined);
  }
}, { href: "/?utm_source=newsletter&utm_medium=email&utm_campaign=fall-offers&utm_term=used+cars&utm_content=button-b&utm_id=5678" }));

test("unexpanded URL tokens and invalid metadata do not create a false paid acquisition", () => withBrowser(({ loadClient }) => {
  const result = loadClient().getLeadAttribution();
  assert.equal(result.lastTouch.source, "direct / unknown");
  assert.equal(result.lastTouch.medium, "none");
  for (const key of ["gclid", "campaignId", "keyword", "network", "device"]) assert.equal(result.lastTouch[key], undefined);
}, { href: "/?gclid=%7Bgclid%7D&campaignid=%7Bcampaignid%7D&keyword=%7Bkeyword%7D&network=invalid&device=invalid" }));

test("first/latest/current attribution survives internal navigation and a full document reload", () => withBrowser(({ loadClient, navigate, advance, localStorage, sessionStorage }) => {
  let client = loadClient();
  const landing = client.getLeadAttribution();
  advance(2 * 60 * 1000);
  navigate("/offer?unrelated=private", `${ORIGIN}/junk-cars`);
  client = loadClient();
  const onForm = client.getLeadAttribution();
  assert.deepEqual(onForm.firstTouch, landing.firstTouch);
  assert.deepEqual(onForm.lastTouch, landing.lastTouch);
  assert.deepEqual(onForm.currentVisit, landing.currentVisit);
  assert.equal(onForm.submissionPage, `${ORIGIN}/offer`);
  assert.equal(onForm.submittedAt, iso(NOW + 2 * 60 * 1000));
  assert.ok(localStorage.getItem(LEAD_ATTRIBUTION_STORAGE_KEY));
  assert.ok(sessionStorage.getItem(LEAD_VISIT_STORAGE_KEY));
}, { href: "/junk-cars?gclid=first-click&utm_campaign=first-campaign" }));

test("a new paid click replaces latest/current touch without changing the first recorded touch", () => withBrowser(({ loadClient, navigate, advance }) => {
  const client = loadClient();
  const first = client.getLeadAttribution();
  advance(60 * 1000);
  navigate("/offer?gbraid=second-click&utm_campaign=second-campaign&keyword=sell+my+car", "");
  const second = client.getLeadAttribution();
  assert.deepEqual(second.firstTouch, first.firstTouch);
  assert.equal(second.lastTouch.gbraid, "second-click");
  assert.equal(second.lastTouch.campaign, "second-campaign");
  assert.equal(second.lastTouch.gclid, undefined);
  assert.equal(second.lastTouch.wbraid, undefined);
  assert.deepEqual(second.currentVisit, second.lastTouch);
}, { href: "/?gclid=first-click&wbraid=first-braid&utm_campaign=first-campaign" }));

test("a newer UTM-only touch does not inherit the prior acquisition's click IDs or keyword", () => withBrowser(({ loadClient, navigate, advance }) => {
  const client = loadClient();
  const first = client.getLeadAttribution();
  advance(60 * 1000);
  navigate("/offer?utm_source=newsletter&utm_medium=email&utm_campaign=return-offer", "");
  const second = client.getLeadAttribution();
  assert.deepEqual(second.firstTouch, first.firstTouch);
  assert.equal(second.lastTouch.source, "newsletter");
  assert.equal(second.lastTouch.medium, "email");
  assert.equal(second.lastTouch.campaign, "return-offer");
  for (const key of ["gclid", "gbraid", "wbraid", "keyword", "campaignId"]) assert.equal(second.lastTouch[key], undefined);
  // Independently dated legacy IDs may remain, but must not be merged into the new acquisition.
  assert.equal(second.gclid, "first-click");
  assert.equal(second.capturedAt, first.capturedAt);
}, { href: "/?gclid=first-click&keyword=old-keyword&campaignid=123" }));

test("a direct return starts a direct current visit while retaining the last acquisition and first touch", () => withBrowser(({ loadClient, navigate, advance, sessionStorage }) => {
  const first = loadClient().getLeadAttribution();
  advance(DAY);
  sessionStorage.clear();
  navigate("/offer", "");
  const returned = loadClient().getLeadAttribution();
  assert.deepEqual(returned.firstTouch, first.firstTouch);
  assert.deepEqual(returned.lastTouch, first.lastTouch);
  assert.equal(returned.currentVisit.source, "direct / unknown");
  assert.equal(returned.currentVisit.medium, "none");
  assert.equal(returned.currentVisit.gclid, undefined);
  assert.equal(returned.currentVisit.capturedAt, iso(NOW + DAY));
}, { href: "/?gclid=first-click&utm_campaign=first-campaign" }));

test("an organic return updates latest acquisition without reassigning an older ad click to organic", () => withBrowser(({ loadClient, navigate, advance, sessionStorage }) => {
  const first = loadClient().getLeadAttribution();
  advance(DAY);
  sessionStorage.clear();
  navigate("/cars-we-buy", "https://www.bing.com/search?q=private-query");
  const returned = loadClient().getLeadAttribution();
  assert.deepEqual(returned.firstTouch, first.firstTouch);
  assert.equal(returned.lastTouch.source, "www.bing.com");
  assert.equal(returned.lastTouch.medium, "organic");
  assert.equal(returned.lastTouch.referrer, "https://www.bing.com");
  assert.equal(returned.lastTouch.gclid, undefined);
  assert.equal(returned.gclid, "first-click");
}, { href: "/?gclid=first-click" }));

test("www and bare-host internal referrers are not counted as new referral acquisitions", () => withBrowser(({ loadClient }) => {
  const result = loadClient().getLeadAttribution();
  assert.equal(result.currentVisit.source, "direct / unknown");
  assert.equal(result.currentVisit.referrer, undefined);
}, { referrer: "https://1-800-cashforcars.com/junk-cars?private=secret" }));

for (const idle of [VISIT_TIMEOUT - 1, VISIT_TIMEOUT]) {
  test(`the visit expires at 30 minutes of inactivity (idle ${idle}ms)`, () => {
    const paid = acquisition();
    withBrowser(({ loadClient }) => {
      const result = loadClient().getLeadAttribution();
      assert.equal(result.lastTouch.gclid, "old-paid-click");
      if (idle < VISIT_TIMEOUT) assert.deepEqual(result.currentVisit, paid);
      else {
        assert.equal(result.currentVisit.source, "direct / unknown");
        assert.equal(result.currentVisit.gclid, undefined);
      }
    }, {
      local: history(paid),
      session: { [LEAD_VISIT_STORAGE_KEY]: JSON.stringify({ touch: paid, lastSeenAt: NOW - idle }) },
    });
  });
}

for (const age of [90 * DAY - 1, 90 * DAY]) {
  test(`stored acquisition expires at 90 days (age ${age}ms)`, () => withBrowser(({ loadClient }) => {
    const result = loadClient().getLeadAttribution();
    if (age < 90 * DAY) {
      assert.equal(result.firstTouch.gclid, "old-paid-click");
      assert.equal(result.lastTouch.gclid, "old-paid-click");
    } else {
      assert.equal(result.firstTouch.source, "direct / unknown");
      assert.equal(result.lastTouch.source, "direct / unknown");
      assert.equal(result.firstTouch.gclid, undefined);
      assert.equal(result.lastTouch.gclid, undefined);
    }
  }, { local: history(acquisition(iso(NOW - age))) }));
}

test("future and invalid timestamps never revive stored acquisition, visit or legacy click IDs", () => {
  for (const capturedAt of [iso(NOW + 1), "not-a-date", undefined]) {
    const invalid = acquisition(capturedAt);
    // acquisition's default is useful elsewhere; explicitly test a missing timestamp here.
    if (capturedAt === undefined) delete invalid.capturedAt;
    withBrowser(({ loadClient }) => {
      const result = loadClient().getLeadAttribution();
      assert.equal(result.firstTouch.source, "direct / unknown");
      assert.equal(result.lastTouch.source, "direct / unknown");
      assert.equal(result.currentVisit.source, "direct / unknown");
      assert.equal(result.gclid, undefined);
    }, {
      local: { ...history(invalid), [LEGACY_CLICK_KEY]: JSON.stringify(invalid) },
      session: { [LEAD_VISIT_STORAGE_KEY]: JSON.stringify({ touch: invalid, lastSeenAt: NOW }) },
    });
  }
});

test("future visit activity cannot suppress a new direct visit", () => {
  const paid = acquisition();
  withBrowser(({ loadClient }) => {
    const result = loadClient().getLeadAttribution();
    assert.equal(result.lastTouch.gclid, "old-paid-click");
    assert.equal(result.currentVisit.source, "direct / unknown");
    assert.equal(result.currentVisit.gclid, undefined);
  }, {
    local: history(paid),
    session: { [LEAD_VISIT_STORAGE_KEY]: JSON.stringify({ touch: paid, lastSeenAt: NOW + 1 }) },
  });
});

test("malformed, non-object and oversized storage fall back to valid current attribution", () => {
  for (const raw of ["{not-json", "null", "[]", '"wrong-type"', "x".repeat(16001)]) {
    withBrowser(({ loadClient }) => {
      const result = loadClient().getLeadAttribution();
      assert.equal(result.firstTouch.source, "newsletter");
      assert.equal(result.lastTouch.source, "newsletter");
      assert.equal(result.currentVisit.source, "newsletter");
    }, {
      href: "/offer?utm_source=newsletter&utm_medium=email",
      local: { [LEAD_ATTRIBUTION_STORAGE_KEY]: raw },
      session: { [LEAD_VISIT_STORAGE_KEY]: raw },
    });
  }
});

test("blocked browser storage does not lose in-document attribution or prevent submission metadata", () => withBrowser(({ window, loadClient, navigate, advance }) => {
  for (const key of ["localStorage", "sessionStorage"]) {
    Object.defineProperty(window, key, { configurable: true, get() { throw new Error("Browser storage blocked"); } });
  }
  const client = loadClient();
  const first = client.getLeadAttribution();
  assert.equal(first.lastTouch.gclid, "first-click");
  advance(60 * 1000);
  navigate("/offer", `${ORIGIN}/`);
  const next = client.getLeadAttribution();
  assert.deepEqual(next.firstTouch, first.firstTouch);
  assert.deepEqual(next.lastTouch, first.lastTouch);
  assert.deepEqual(next.currentVisit, first.currentVisit);
  assert.equal(next.submissionPage, `${ORIGIN}/offer`);
}, { href: "/?gclid=first-click" }));

for (const blockedStores of [["localStorage"], ["sessionStorage"], ["localStorage", "sessionStorage"]]) {
  test(`failed ${blockedStores.join(" and ")} writes cannot restore readable stale attribution`, () => {
    const old = { ...acquisition(), wbraid: "old-braid" };
    withBrowser(({ window, loadClient, navigate, advance, localStorage, sessionStorage }) => {
      const client = loadClient();
      const first = client.getLeadAttribution();
      assert.equal(first.lastTouch.gclid, "old-paid-click");
      const oldHistory = localStorage.getItem(LEAD_ATTRIBUTION_STORAGE_KEY);
      const oldVisit = sessionStorage.getItem(LEAD_VISIT_STORAGE_KEY);
      const oldClick = localStorage.getItem(LEGACY_CLICK_KEY);

      // Quota/policy failures can reject writes while reads keep returning the
      // previous acquisition. This differs from storage that is wholly absent.
      for (const key of blockedStores) {
        window[key].setItem = () => { throw new Error("Storage writes rejected"); };
      }
      advance(60 * 1000);
      navigate("/offer?gbraid=new-paid-braid&utm_campaign=new-campaign", "");
      const arrived = client.getLeadAttribution();
      assert.equal(arrived.lastTouch.gbraid, "new-paid-braid");
      advance(60 * 1000);
      navigate("/cars-we-buy", `${ORIGIN}/offer`);
      const onNextPage = client.getLeadAttribution();

      assert.deepEqual(onNextPage.firstTouch, first.firstTouch);
      assert.deepEqual(onNextPage.lastTouch, arrived.lastTouch);
      assert.deepEqual(onNextPage.currentVisit, arrived.currentVisit);
      assert.equal(onNextPage.lastTouch.campaign, "new-campaign");
      assert.equal(onNextPage.gbraid, "new-paid-braid");
      assert.equal(onNextPage.capturedAt, iso(NOW + 60 * 1000));
      for (const value of [onNextPage, onNextPage.lastTouch, onNextPage.currentVisit]) {
        assert.equal(value.gclid, undefined);
        assert.equal(value.wbraid, undefined);
      }
      if (blockedStores.includes("localStorage")) {
        assert.equal(localStorage.getItem(LEAD_ATTRIBUTION_STORAGE_KEY), oldHistory);
        assert.equal(localStorage.getItem(LEGACY_CLICK_KEY), oldClick);
      }
      if (blockedStores.includes("sessionStorage")) {
        assert.equal(sessionStorage.getItem(LEAD_VISIT_STORAGE_KEY), oldVisit);
      }
    }, {
      local: { ...history(old), [LEGACY_CLICK_KEY]: JSON.stringify(old) },
      session: { [LEAD_VISIT_STORAGE_KEY]: JSON.stringify({ touch: old, lastSeenAt: NOW - 60 * 1000 }) },
    });
  });
}

test("a newer UTM visit cannot restore an older Google click after paid-click storage writes fail", () => {
  const old = acquisition();
  withBrowser(({ loadClient, navigate, advance, localStorage, sessionStorage }) => {
    const client = loadClient();
    const first = client.getLeadAttribution();
    for (const store of [localStorage, sessionStorage]) {
      store.setItem = () => { throw new Error("Storage writes rejected"); };
    }
    advance(60 * 1000);
    navigate("/offer?gbraid=new-paid-braid&utm_campaign=new-paid-campaign", "");
    const paid = client.getLeadAttribution();
    assert.equal(paid.gbraid, "new-paid-braid");
    advance(60 * 1000);
    navigate("/cars-we-buy", `${ORIGIN}/offer`);
    assert.equal(client.getLeadAttribution().gbraid, "new-paid-braid");
    advance(60 * 1000);
    navigate("/offer?utm_source=newsletter&utm_medium=email&utm_campaign=follow-up", "");
    const newsletter = client.getLeadAttribution();
    assert.deepEqual(newsletter.firstTouch, first.firstTouch);
    assert.equal(newsletter.lastTouch.source, "newsletter");
    assert.equal(newsletter.currentVisit.source, "newsletter");
    for (const touch of [newsletter.lastTouch, newsletter.currentVisit]) {
      for (const key of ["gclid", "gbraid", "wbraid"]) assert.equal(touch[key], undefined);
    }
    assert.equal(newsletter.gbraid, "new-paid-braid");
    assert.equal(newsletter.gclid, undefined);
    assert.equal(newsletter.capturedAt, paid.capturedAt);
    assert.equal(JSON.parse(localStorage.getItem(LEGACY_CLICK_KEY)).gclid, "old-paid-click");
  }, {
    local: { ...history(old), [LEGACY_CLICK_KEY]: JSON.stringify(old) },
    session: { [LEAD_VISIT_STORAGE_KEY]: JSON.stringify({ touch: old, lastSeenAt: NOW - 60 * 1000 }) },
  });
});

test("same-document idle does not replay its original external referrer or tagged landing as a new acquisition", () => {
  for (const nextPage of ["/offer", null]) {
    withBrowser(({ loadClient, navigate, advance, localStorage }) => {
      const client = loadClient();
      const first = client.getLeadAttribution();
      assert.equal(first.lastTouch.medium, "cpc");
      const firstStoredClick = JSON.parse(localStorage.getItem(LEGACY_CLICK_KEY));
      advance(VISIT_TIMEOUT);
      // SPA navigation retains document.referrer; the null case leaves the
      // original tagged URL in place while the user resumes an idle document.
      if (nextPage) navigate(nextPage);
      const resumed = client.getLeadAttribution();
      assert.deepEqual(resumed.firstTouch, first.firstTouch);
      assert.deepEqual(resumed.lastTouch, first.lastTouch);
      assert.equal(resumed.currentVisit.source, "direct / unknown");
      assert.equal(resumed.currentVisit.medium, "none");
      assert.equal(resumed.currentVisit.referrer, undefined);
      assert.equal(resumed.currentVisit.gclid, undefined);
      assert.equal(resumed.currentVisit.capturedAt, iso(NOW + VISIT_TIMEOUT));
      assert.equal(resumed.gclid, "paid-before-idle");
      assert.equal(resumed.capturedAt, first.capturedAt);
      assert.equal(JSON.parse(localStorage.getItem(LEGACY_CLICK_KEY)).capturedAt, firstStoredClick.capturedAt);
    }, {
      href: "/junk-cars?gclid=paid-before-idle&utm_campaign=first-campaign",
      referrer: "https://www.google.com/search?q=private-query",
    });
  }
});

test("a frozen submission snapshot remains unchanged after another capture", () => withBrowser(({ loadClient, navigate, advance }) => {
  const client = loadClient();
  const submitted = client.getLeadAttribution();
  for (const touch of [submitted.firstTouch, submitted.lastTouch, submitted.currentVisit]) Object.freeze(touch);
  Object.freeze(submitted);
  const originalBody = JSON.stringify(submitted);
  advance(60 * 1000);
  navigate("/offer?gclid=second-click&utm_campaign=second-campaign", "");
  assert.doesNotThrow(() => client.captureLeadAttribution());
  const next = client.getLeadAttribution();
  assert.equal(JSON.stringify(submitted), originalBody);
  assert.equal(next.lastTouch.gclid, "second-click");
  assert.equal(submitted.lastTouch.gclid, "first-click");
  assert.notEqual(next.firstTouch, submitted.firstTouch);
  assert.notEqual(next.lastTouch, submitted.lastTouch);
}, { href: "/?gclid=first-click&utm_campaign=first-campaign" }));

test("server execution and unexpected browser restrictions cannot throw from the submission getter", () => withBrowser(({ window, loadClient }) => {
  const client = loadClient();
  Object.defineProperty(window, "navigator", { get() { throw new Error("Restricted browser context"); } });
  assert.deepEqual(client.getLeadAttribution(), {});
  delete globalThis.window;
  assert.doesNotThrow(() => client.captureLeadAttribution());
  assert.deepEqual(client.getLeadAttribution(), {});
}));
