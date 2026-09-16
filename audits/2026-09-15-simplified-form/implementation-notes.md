# Simplified offer entry — implementation and QA

Status: implemented locally; not deployed. Preview: http://localhost:3000/

## Changes

- Shared VIN or Year / Make / Model form near the top of both homepages, all service/content and location pages, direct offer pages, and the not-found page.
- Verified the production HTML for all 120 generated content pages contains the shared form.
- NHTSA vPIC car/truck make list and year-specific models, with server caching, timeouts, and manual entry when the catalog is unavailable or incomplete. Model filtering is available from 1996; older vehicles can use manual entry.
- Vehicle choices carry into the request as a compact, editable summary. VIN entry decodes vehicle information, not an offer amount.
- First name, phone, pickup ZIP and title status remain required. Email, last name, trim and the exact pickup address are optional. Relevant vehicle-condition questions remain required.
- Field-specific errors, focus recovery, review editing and security-check remount/retry handling. Provider errors preserve the seller's answers in the current page.
- Generic `offer_start` event records language and entry method without vehicle/contact values. Existing final-success tracking remains tied to server success; advertising configuration was not changed.
- Decorative hero images no longer receive unnecessary eager-loading priority. Homepage image sizing matches its smaller container.

## Checks passed

- `npm run lint`
- `npm run build`: compiled, TypeScript passed, 130 generated build entries.
- `node --test tests/*.test.mjs`: 10 tests passed, including optional fields, conditional validation, query normalization, malformed requests, security failures and delivery-provider errors. API tests use mocked providers and fake credentials.
- `git diff --check`
- Browser: year/make/model handoff; changing year clears model; required-field and phone errors; navigation to Review without email or an exact address; preserved answers after returning from Review; VIN normalization and public sample decoding; Spanish manual-entry handoff.
- Layout: English mobile at 390px; Spanish homepage, service and location pages at 320px; desktop homepage at 1440px. No horizontal overflow in those checks. The form and action appear in the initial mobile view; supporting reassurance may extend below the fold on short/narrow screens.

## Release checks still needed

- Cloudflare's widget rendered initially and after Review → Back → Review, but displayed “Unable to connect to website” in this local browser. The page shows an actionable retry error and keeps submission disabled. Successful provider verification needs a check in the intended release environment.
- No real lead or email was sent. Final email acceptance and inbox arrival need a controlled production check; the mocked tests do not prove live delivery.
- Existing LiveChat script logged “License expired.” This is an account/integration issue outside these form changes and was not altered.
- Request data remains in component state while editing. It is not saved across a page reload. A delivery timeout remains ambiguous; no persistent queue or database was added.

## Visual evidence

- [Desktop homepage](homepage-desktop.jpg)
- [Mobile homepage](homepage-mobile.jpg)
- [Prefilled mobile request](prefilled-request-mobile.jpg)
- [Field validation](field-validation-mobile.jpg)
- [Spanish homepage at 320px](spanish-home-320.jpg)
- [Spanish service page at 320px](spanish-service-320.jpg)
- [Spanish location page at 320px](spanish-location-320.jpg)
