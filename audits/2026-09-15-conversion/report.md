# Cash For Cars — conversion and UX audit

Reviewed September 15, 2026 (Pacific time). Goals: more completed requests, qualified calls, and leads that become vehicle purchases.

**Recommendation:** prioritize form reliability, a shorter initial request, clearer expectations, and measurement of lead quality before a broad visual redesign. The site already has useful foundations: prominent call and offer actions, local positioning, English/Spanish pages, and explanations of towing and paperwork. The largest opportunities are in the journey from interest to a successfully handled lead.

**Evidence and limits.** This audit inspected the live [English homepage](https://www.1-800-cashforcars.com/), [offer flow](https://www.1-800-cashforcars.com/offer), and [Spanish homepage](https://www.1-800-cashforcars.com/es), plus current repository code. Desktop capture was 1440 × 1000; mobile captures were 390 × 844 and a Spanish 320 × 760 check. Fictional details were entered to reach Review, but no lead was submitted, phone call made, or CAPTCHA manually completed. No application code or production settings changed. Google Ads, GTM configuration, GA4, Clarity recordings, external CRM workflows, and real device/network performance were not inspected. These findings do not establish actual abandonment rates, lost revenue, or expected conversion uplift. Some repository navigation copy differs from live; live observations take precedence.

**What to prioritize**

| Order | Change | Why it comes first | Evidence |
|---|---|---|---|
| 1 | Repair validation and security-check recovery | Removes reproducible friction in an existing lead path | Live behavior plus code |
| 2 | Validate conversion tracking and add funnel/quality measurement | Establishes where spend produces useful leads | Code gaps; external configuration needs verification |
| 3 | Test a shorter initial offer request and visible manual entry | Reduces effort before a visitor can engage | Live flow plus required-field rules; uplift is a hypothesis |
| 4 | Align offer wording, response expectations, and trust proof | Helps visitors understand what they will receive and from whom | Live copy plus code |
| 5 | Fix mobile clipping, contrast, and responsive image sizing | Improves readability and removes unnecessary image overhead | Live screenshots, DOM styles, image selection |
| 6 | Test focused landing pages by ad intent | Makes the page answer the specific reason for the click | Proposed experiment; campaign destinations not inspected |

**1. Fix errors before testing cosmetic changes**

Submitting an empty first step displays a message about highlighted questions, but none of the missing fields is highlighted. The client checks whether the phone field is nonempty, while meaningful phone validation happens only at final submission. The API returns missing-field information that the client does not use.

Add field-specific errors, clearly distinguish required and optional fields, validate contact details before advancing, and focus the first problem. Review cards need direct Edit links so someone can repair a phone number without going back through three screens. Announce errors and expose yes/no selection state to assistive technology. The current success state already has focus/live-region handling that can inform the other steps.

The security widget successfully appeared on Review. After Go Back → Next Step, its box became blank while the send button remained enabled. **The disappearance is reproduced; a failed submission was not tested.** Code shows the widget is initialized only by the script's initial load callback, which is unsuitable for this remount path. Reinitialize it when returning, clear stale tokens, and handle expiry, load failure, and retry without losing answers. Verify these scenarios in a test environment.

Sources: [widget lifecycle](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/offer-flow.tsx:342), [script callback](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/offer-flow.tsx:403), [client error handling](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/offer-flow.tsx:581), [server contact validation](/Users/aldold/Documents/dev/1-800-cashforcars/app/api/offer/route.ts:152), [installed Next Script guide](/Users/aldold/Documents/dev/1-800-cashforcars/node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md:297).

**2. Make the first request substantially easier**

The first form step requires 11 fields/answers, including state (prefilled), full pickup address, phone, email, and title status. The normal path requires 18 across the three input steps; non-driving/no-title answers can raise this to 22. These counts exclude optional fields and security verification. This is a considerable commitment before the seller gets a human response.

Test an initial request with vehicle year/make/model, ZIP, name, and preferred contact method. Keep the minimum condition/title questions the buying team actually needs to qualify a vehicle. Move street address and detailed pickup instructions to qualification or scheduling. Make email optional if a phone number is operationally sufficient. Compare qualification and purchase rates so a shorter form does not merely create more unworkable submissions.

The homepage's VIN panel provides no visible manual-entry alternative, although the offer page supports it. Add “Enter vehicle details instead” beside the lookup. VIN should help people who have it ready; it should not appear to be the only online starting point. Preserve manual entry after lookup failure.

Ask ZIP first. The code uses a specific ZIP allowlist, so discovering ineligibility after entering an address is avoidable work. Align paid geographic targeting and coverage claims with real service rules; retain a clear call route for locations needing confirmation.

Sources: [required-field logic](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/offer-flow.tsx:467), [lookup continuation](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/vehicle-lookup-form.tsx:141), [lookup error fallback](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/vehicle-lookup-form.tsx:195), [service ZIP list](/Users/aldold/Documents/dev/1-800-cashforcars/app/service-area.ts:11).

**3. Explain the actual offer process**

The homepage labels the VIN module “Instant offer form”; Spanish uses the equivalent promise. The implemented flow is an offer request reviewed by the team, with no immediate price calculation. Align the wording across ads, pages, buttons, and confirmation.

Suggested direction: **“Request your cash offer”** followed by **“Tell us about your vehicle. Our San Diego team will review the details and contact you with the next step.”** Add a specific response window only after confirming the team can meet it. Explain payment method, pickup timing, and any conditions with operationally accurate wording.

Add short, truthful contact/privacy reassurance near personal details and an accessible privacy link. The reviewed form does not explain nearby who will contact the seller or the expected channel. This is a trust recommendation, not a legal-compliance finding.

Source: [confirmation copy](/Users/aldold/Documents/dev/1-800-cashforcars/app/dictionaries/en.json:628), [contact fields](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/offer-flow.tsx:1024).

**4. Make confidence easy to earn**

Move a small amount of verifiable proof near the primary action: source-linked reviews, a current rating/count if substantiated, and authentic team/pickup photographs. Existing review cards display stars, names, and areas but offer no original-review links. Their authenticity was not determined in this audit. Verify any relationship between a pictured vehicle and the review shown beside it.

Keep the brand mascot if it is useful, while testing whether real local people and vehicles build more confidence near the request form. This is a creative hypothesis, not evidence that the mascot lowers conversions.

Simplify long service-area sections for paid visitors and remove copy that explains how the page was designed. Keep helpful location information available through the main site. Put seller questions first: eligibility, price process, towing, paperwork, and payment.

Sources: [review rendering](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/vehicle-showcase-marquee.tsx:101), [service-area copy](/Users/aldold/Documents/dev/1-800-cashforcars/app/dictionaries/en.json:401).

**5. Improve the call and follow-up path**

The visible call actions are already prominent; retain that strength. Add verified staffed hours and a realistic reply expectation. The footer offers call/text wording but its link opens the dialer. Provide a separate text action if that channel is reliably staffed.

Measure connected, missed, and qualified calls separately from taps. Establish ownership and follow-up for every request, and track time to first response. A confirmation should explain who responds, through which channel, and what happens next; it should not require an additional phone call for the original request to receive attention.

Sources: [footer contact actions](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/site-footer.tsx:74), [phone-click event](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/gtm-events.tsx:15).

**6. Make spend measurable through to purchase**

The application explicitly sends `phone_click` and `offer_form_submit_success`. No explicit step, validation, VIN-error, ZIP-rejection, or submission-failure events were found in the application. GTM may add events externally, so inspect its published configuration before adding duplicates. The same form handles intermediate Next actions; verify those are not accidentally counted as completed leads by generic form-submit triggers.

Add a small event set: form start, step viewed/completed, validation error, submit attempt, confirmed receipt, and call tap. Use non-personal dimensions such as step, error category, language, device, campaign, and landing page. Keep names, emails, addresses, phone numbers, and VINs out of general analytics event payloads.

The submission path sends a notification email and returns its provider ID; it does not itself save a durable CRM/database lead or campaign attribution. External workflows may exist. Create a stable lead ID, persist the request before notifications, retain permitted attribution, deduplicate retries, assign an owner, and record qualified → offer made → pickup scheduled → purchased/lost.

Verify website-call tracking separately from calls placed directly through ads. Connect qualified/purchased outcomes back to Google Ads using a suitable offline conversion or enhanced-conversion workflow. Google recommends qualified or converted lead goals for this setup: [Google guidance](https://business.google.com/us/accelerate/resources/articles/enhanced-conversions-leads/). Change bidding goals only after validating data quality and sufficient signal volume.

| Measure | Definition / use |
|---|---|
| Form completion | Confirmed unique requests ÷ unique form starters |
| Step completion | Visitors reaching the next step ÷ visitors entering the step |
| Cost per qualified lead | Ad spend ÷ unique qualified leads, with calls and forms deduplicated |
| Call answer rate | Connected website calls ÷ attempted website calls |
| Cost per purchased vehicle | Attributable ad spend ÷ purchased vehicles, allowing for purchase lag |
| Lead-to-purchase rate | Purchased vehicles ÷ qualified leads for a consistent cohort |

Segment by device, language, campaign, and actual landing page. Set qualification rules with the buying team. Use enough observation time for purchases to mature; do not declare a winning design from a few extra form completions.

Sources: [success event](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/offer-flow.tsx:591), [email-only route completion](/Users/aldold/Documents/dev/1-800-cashforcars/app/api/offer/route.ts:437), [new retry key](/Users/aldold/Documents/dev/1-800-cashforcars/app/api/offer/route.ts:366).

**7. Correct the measurable UI defects**

- At 320px on the Spanish homepage, the hero CTA extended to approximately x=333px and was clipped by the viewport. Page scroll width was still 320px, so an overflow-only check would miss it. Fix child minimum widths, wrapping, and shrink behavior; retest both languages and text zoom.
- The Spanish hero CTA uses white 14px bold text on `#2fad50`. The calculated contrast is **2.91:1**, below the **4.5:1** requirement for that text size. Darken the button or choose a higher-contrast text/background pairing and recheck all states. [W3C contrast criterion](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Live Spanish mobile DOM selected the mascot image URL with `w=3840` for a rendered width of 334px, with no responsive `sizes`. Add appropriate image sizing and verify bytes and load behavior. No live speed score or Core Web Vitals pass/fail is claimed. Measure real mobile LCP, INP, and CLS alongside a lab test; [PageSpeed guidance](https://developers.google.com/speed/docs/insights/v5/about).
- Add “Not sure” where the team can resolve uncertainty, particularly catalytic-converter status. Use mutually exclusive mileage ranges, label optional inputs, and make field labels understandable without truncated placeholder text.

Sources: current-run screenshots/DOM observations; [image component](/Users/aldold/Documents/dev/1-800-cashforcars/app/components/localized-home.tsx:58); [condition options](/Users/aldold/Documents/dev/1-800-cashforcars/app/dictionaries/en.json:544).

**Implementation and experiment sequence**

First repair validation, security remount/retry, clipping, and contrast. Verify both languages and recoverable errors in a test environment. In parallel, audit tag mappings and establish a reliable lead-quality baseline.

Then test the shorter request/manual-entry path against the current journey. Measure qualified leads per eligible paid visitor and cost per qualified lead, with purchase outcomes and spam/unreachable rates as guardrails. Keep traffic and campaign conditions comparable.

After that, test focused pages matching the actual ad intent—such as non-running vehicles, junk cars, or Spanish-language sellers—with a short request, relevant proof, and essential FAQs. Keep broader navigation and city directories available elsewhere. Confirm real campaign destinations before deciding which pages to replace. Test one major hypothesis at a time and choose sample size/duration from current traffic and conversion rates.

**Captured journey — observations and screenshots**

1. **Desktop landing — clear main actions; improvement needed at form entry.** Local positioning, call access, and primary action are easy to find. VIN appears to be the main embedded route; manual entry is not offered beside it.

![Desktop homepage](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/01-desktop-home.jpg)

2. **Mobile landing — usable at 390px.** Both call and offer actions are visible. Preserve this accessibility while shortening the path into the form. No claim that the CTA is below the fold.

![Mobile homepage](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/02-mobile-home.jpg)

3. **Vehicle/contact/pickup step — high effort.** Visible manual fields are helpful, but this first stage also requires address and contact details. The manual-entry instruction is truncated inside the VIN placeholder.

![First form step](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/03-mobile-offer-start.jpg)

4. **Validation — needs repair.** Error copy refers to highlighted questions, while fields remain visually unchanged. This screenshot shows the lower portion of the first step after an empty Next attempt.

![Validation error](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/04-mobile-step1-validation.jpg)

5. **Mechanical/mobility — straightforward layout, rigid answers.** Large controls help tapping. Required technical knowledge and overlapping mileage options add uncertainty. Non-driving answers introduce further questions according to code.

![Mechanical step](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/05-mobile-mechanical.jpg)

6. **Body/pickup condition — usable, with deferred-detail opportunity.** Body, airbags, keys, location type, and access notes are collected. Optional status should be explicit. Review should allow direct edits.

![Body condition step](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/06-mobile-body-condition.jpg)

7. **Review — initial security check worked automatically.** Review values need descriptive labels rather than bare Yes answers. Contact data below is fictional audit input. The Send button was never pressed.

![Review with successful security check](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/07-mobile-review.jpg)

8. **Return to Review — reproduced defect.** Go Back then Next removed the security widget; the send button remained enabled. Token-expiry/submission consequences were not exercised.

![Review after going back](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/08-mobile-review-return.jpg)

9. **Spanish mobile landing — broadly consistent at 390px.** Same offer-expectation issue, with room to simplify mixed English/Spanish operational terminology. The full Spanish form was not traversed separately.

![Spanish mobile homepage](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/09-spanish-home.jpg)

10. **Spanish narrow viewport — clipping confirmed at 320px.** Right edges of hero content and buttons extend beyond the viewport. This is a captured layout issue, not an image-capture crop error.

![Spanish 320px clipping](/Users/aldold/Documents/dev/1-800-cashforcars/audits/2026-09-15-conversion/10-spanish-320.jpg)

11. **Submission, confirmation, and operational follow-up — code reviewed only.** No screenshot: intentionally not submitted to avoid creating a false lead. End-to-end delivery, actual callback speed, call answering, CRM handling, and purchase attribution remain unverified. Full keyboard/screen-reader and real-phone testing remain outside this audit.
