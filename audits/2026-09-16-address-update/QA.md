# Quick form: VIN guidance and pickup address

[Open the local review](index.html).

Changes in this revision:

- Removed customer-facing VIN decoder-warning messaging and amber warning styling. The normal message asks visitors to review their vehicle details; the fallback asks them to enter those details to continue.
- Kept automatic VIN lookup and editable year, make, and model.
- Added required pickup street address, city, California state, and service-area ZIP; apartment/unit/space remains optional.
- Added address autofill attributes. Pickup address information is included in the quick inquiry email.
- Applied the shared behavior in English and Spanish. The detailed Get Offer questionnaire remains available.

## Evidence

The [VIN inquiry preview](quick-vin-inquiry-example.html) includes an optional unit number. The [dropdown inquiry preview](quick-inquiry-example.html) includes the complete pickup location. Both are generated formatter examples containing fictional seller data; neither is an inbox receipt or browser capture. See [example notes](email-examples.md).

Verification for this revision, confirmed by the main implementation task:

- 51 automated tests passed.
- Production build, lint, and diff check passed.
- English VIN browser check passed: the public sample VIN shows only the neutral review instruction. [Current screenshot](vin-neutral.jpg).
- Missing required street/city fields trigger errors and focus.
- Street address and optional unit remain filled after Edit vehicle → Continue.
- English inquiry completed locally; [actual browser-captured email](captured/a31618ed-da30-4767-92db-b47fe23c26ec.html) includes 123 Example Street, Unit 4, San Diego, CA 92101. This fictional test message was not sent to a real inbox.
- Spanish mobile document width equals viewport width at 390px and 320px; no horizontal document overflow.
- Optional unit can remain blank. [Spanish address-fields screenshot at 390px](address-mobile-390.jpg).
- Spanish inquiry completed at 320px with manual 1990 Toyota Corolla details, an empty optional unit, and 456 Example Avenue, Chula Vista, CA 91910. The [actual browser-captured email](captured/7fb5a971-3f55-41b8-81e3-d44d7884192a.html) includes the full address and omits the unit row.
- [Final 320px address screenshot](address-mobile-320.jpg) shows the aligned “Código ZIP” label. Compact security-widget fit passed.
- The final build, lint, and diff check passed after the mobile label adjustment.

Historical report counts and screenshots have not been reused as verification of the new address fields.

## Delivery boundary

Local implementation only. No deployment or actual inbox receipt has been verified. Production Turnstile configuration, real iOS/Android behavior, and actual delivery remain production checks.
