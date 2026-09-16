# VIN and quick qualification review

Local implementation review, September 16, 2026. Open [the visual report](index.html).

## Confirmed behavior

- The shared English/Spanish quick form supports VIN lookup or Year / Make / Model selection. Built HTML includes it on 120 content pages plus the not-found view.
- A valid 17-character VIN triggers NHTSA lookup. Year, make, and model remain editable; provider warnings remain visible.
- Changing the VIN clears earlier vehicle data. Lookup failure provides manual entry.
- Quick inquiries require running status (yes / no / unsure), ownership/title status (owner with title / owner without title / authorized / unsure), name, phone, and pickup ZIP. Screening answers are seller-reported and require human review.
- The full Get Offer questionnaire remains available. Its retry handling now uses a stable UUID, a 30-second deadline, and an explicit successful-response check.
- Catalog makes are not year-filtered. Models depend on year and make; older or unlisted vehicles can be entered manually.

## Verification

| Check | Result / evidence |
| --- | --- |
| Automated tests | 49 passed, reported by the main implementation task |
| Production build | Passed, reported by the main implementation task |
| Lint | Passed, reported by the main implementation task |
| Automatic VIN fill and warning | Browser-verified; [desktop screenshot](vin-autofill-desktop.jpg) |
| Required screening questions | Browser-verified |
| Lookup failure → manual entry | Browser-verified |
| Changed VIN clears old vehicle | Browser-verified |
| VIN inquiry generated email | [Actual local browser capture](captured/ac110959-fec4-453a-a45e-89a0d6dd7a94.html) |
| Spanish dropdown inquiry | Browser-verified on `/es/san-diego-county/chula-vista`; [actual local email capture](captured/6c0cfa58-d71c-4683-83f3-262af1b06dd4.html) includes 2010 Toyota Corolla and unsure answers for running and ownership/title |
| Spanish VIN inquiry | Browser-verified on `/es`; formatted lowercase/hyphen VIN normalized to 17 uppercase characters, auto-filled 2006 Chevrolet HHR; [actual local email capture](captured/966d34e0-40d2-4536-aebe-2e71277fda89.html) includes running yes and authorized-seller answers |
| Mobile success screenshot | [Spanish success capture](spanish-success-mobile.jpg) |
| Basic questions screenshot | [Mobile screening questions](basic-questions-mobile.jpg) |
| 320px document overflow | Document width and scroll width both 320px |
| Narrow security-widget behavior and visual layout | Passed in a fresh 320px viewport: 150px compact widget fits the 246px container; success check and footer visible with no clipping. Test token accepted and local inquiry completed. [Compact widget screenshot](security-compact-mobile.jpg) |
| Real iOS/Android behavior | Not verified on actual devices |
| Actual inbox receipt | Not verified |
| Deployment | Not performed |

The captured emails contain fictional test contact data and were captured locally, not delivered to a real inbox. The [VIN formatter sample](quick-vin-inquiry-example.html), [dropdown formatter sample](quick-inquiry-example.html), and [detailed offer sample](detailed-offer-example.html) are generated examples, not browser captures. See [email example notes](email-examples.md).

## Production priorities

1. Verify production Turnstile keys/domains and actual inbox receipt for both forms; confirm sender and recipient configuration.
2. Add durable CRM/database lead storage, delivery retries, bounce/failure handling, and a follow-up owner.
3. Add a privacy link and clear data-handling information; keep contact details out of general analytics events.
4. Verify `quick_inquiry_submit_success` and `offer_form_submit_success` tags. Separate form paths and measure cost per qualified lead, then purchased vehicles.
5. Add submission-rate limits and request-size limits alongside the existing validation/security checks.
6. Verify real iPhone Safari and Android Chrome behavior in both languages, including security, slow connections, and retry.

No conversion uplift, production readiness, inbox delivery, or live deployment is implied by local test results. The static report loads no analytics, external scripts, or external fonts.
