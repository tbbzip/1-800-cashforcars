# Lead attribution in form emails

Both the quick inquiry and detailed offer send first recorded visit, latest known acquisition and current-visit metadata to the existing email recipients. No additional seller questions are required. Each email includes a stable inquiry/submission ID for matching a lead to a purchased vehicle.

**Activation requirements:** The website code is implemented and tested. The campaign URL suffix below must be configured separately; this repository does not confirm that it has been saved in Google Ads. Verify deployment and receipt of the new fields before calling production attribution operational. Offline email previews are available locally in `output/lead-attribution-2026-10-03/email-previews/`; they use fictional data, were not emailed, and are excluded from Git and deployment uploads.

## What is captured

- Google click IDs: `gclid`, `gbraid`, `wbraid` (including existing legacy fallback).
- UTM source, medium, campaign, campaign ID, term and content.
- Google Ads campaign ID, ad group ID, creative/ad ID, targeting ID, matched keyword, match type, network, ad-click device and geographic IDs when the landing URL supplies them.
- Entry and submission pages, referring site's origin, capture times, browser submission time, approximate browser device category and browser language.
- First/latest attribution retained up to 90 days; current visit expires after 30 minutes of inactivity. Direct returns do not overwrite the latest known acquisition, and are separately labeled in current-visit details.

When browser storage writes fail, the current document keeps the newest metadata in memory instead of restoring stale saved values. After inactivity within the same document, its original referrer and unchanged URL tags are not treated as a new acquisition. Click IDs retain their own observation dates even when a later non-Google source becomes the latest acquisition.

IDs stay strings to preserve 64-bit identifiers. Geographic IDs are Google reporting IDs, not the seller's pickup ZIP. Browser fields are observations, not verified identities or exact physical locations. Timestamps use the browser clock, so the email provider's receipt date is the operational delivery timestamp.

The matched keyword is advertiser targeting, **not the exact search typed by the seller**. Google can leave it empty for AI Max keywordless traffic. This implementation does not expose privacy-hidden search queries, reconstruct attribution for old leads, verify email inbox delivery, import purchased-car conversions or create a CRM.

## Google Ads setup needed for new clicks

Keep auto-tagging enabled for Google click IDs. Add this as the campaign's **Final URL suffix**, not as the final URL and not as a tracking template. Do not prefix it with `?` or `{lpurl}`. Preserve/merge any existing URL settings, and check ad/keyword/sitelink overrides before release.

```text
utm_source=google&utm_medium=cpc&utm_campaign=cash_for_cars_search&utm_id={campaignid}&campaignid={campaignid}&adgroupid={adgroupid}&creative={creative}&keyword={keyword}&matchtype={matchtype}&network={network}&device={device}&targetid={targetid}&loc_physical_ms={loc_physical_ms}&loc_interest_ms={loc_interest_ms}&utm_content={creative}
```

Campaign `23919195304` was the audited Search campaign. This document does not establish that the suffix has been saved in Google Ads. Campaign/ad group/ad IDs are stable join keys; the static `utm_campaign` is a readable label and should be adjusted for other campaigns.

Supported aliases: `campaign_id`, `adgroup_id`, `ad_id`; `utm_term` is used as the keyword label if `keyword` is absent. Raw arbitrary URL parameters are not retained. Invalid metadata and unexpanded `{tokens}` are discarded without rejecting the seller's form.

Google documents these parameters at [ValueTrack reference](https://support.google.com/google-ads/answer/6305348). `{keyword}` can be blank; `{matchtype}` can be `a` for AI Max keywordless. Geographic values can also be blank.

## Verification before release

1. Run `node --test tests/*.test.mjs`, `npm run lint` and `npm run build`.
2. Open a tagged local/preview landing page using fictional IDs; navigate internally to each form. Verify request capture and normalized HTML/plain-text email with fake delivery providers, never real customer data.
3. Retry a simulated delivery failure. The same submission ID, attribution and timestamp must be retained; a new request after changing seller details gets a fresh snapshot. Actual success remains gated on server delivery acceptance.
4. Check untagged/direct, returning, organic, mobile, Spanish and blocked-storage behavior. Direct/current traffic must not be falsely labeled as a fresh ad click. Full URL query strings/fragments/credentials and referrer paths must be absent from emails.
5. Publish the verified code and apply/test the suffix. Reopen Ads URL options to verify the saved value. Validate the first real attributed lead with the inbox owner before claiming production end-to-end attribution is verified.

Existing older open pages remain compatible. Missing metadata never blocks submission. First-party storage can be cleared/blocked and attribution does not cross browsers/devices; unknown remains unknown. Optional attribution is browser reported and is not an authorization or pricing input. No contact or vehicle details are added to analytics success events.

## Correlate to business outcomes

Record one row per submission ID in the existing lead spreadsheet/CRM: email received time, source/medium, matched keyword, campaign/ad group/ad IDs, click ID, vehicle and pickup ZIP, reached, qualified seller, offer made, pickup booked, acquired vehicle, lost reason and contribution after vehicle/towing/direct costs. Deduplicate people/vehicles before calculating purchase rate.

Use acquired vehicles and contribution to evaluate keywords. A high form count by itself does not show lead quality. Keep the original ID and click ID through follow-up so a later qualified/purchased outcome can be reconciled and, after validated setup, imported into Google Ads.
