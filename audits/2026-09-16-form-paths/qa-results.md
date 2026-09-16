# Form paths — current implementation and test results

Local implementation only; not deployed. This supersedes the earlier simplified-flow notes.

- Embedded short form: VIN OR year/make/model, then first name, phone, service-area ZIP; submits directly on the same page to /api/inquiry.
- Get Offer: original detailed questionnaire, including required email and full pickup address, condition/title/mobility questions and Review, submits to /api/offer.
- Quick email includes vehicle or VIN, first name, phone, ZIP, source page, language, method, inquiry ID. Detailed email includes all original contact/address/condition answers.
- Catalog makes are not year-filtered; models use both year and make. Pre-1996 and missing data use explicit manual entry.

## Verification

36 mocked-provider/validation/catalog tests passed; build, TypeScript, lint and diff checks passed. All120 generated content pages contain the common form.

Browser submissions used isolated app files, no .env file, Cloudflare's official public test keys and a Resend capture hook with fake credentials. No real email was sent. Four submissions were captured: homepage dropdown; Spanish Chula Vista VIN; service-page manual1990Toyota; detailed Spanish2012Honda with no title and non-driving condition. A forced email-provider rejection preserved answers and successfully retried. Screenshots and exact outgoing HTML/TXT are in this folder.

## Remaining operational work

Production keys/inbox delivery need a controlled live check. Provider acceptance does not prove inbox arrival. Leads are not stored in a database/CRM, and drafts are not persisted across reloads. Stable email retry keys protect unchanged quick-inquiry retries; the detailed form retains its prior per-request key behavior. Conversion uplift has not been measured.

Next: durable lead storage and delivery retries; distinct short/detailed conversion tracking linked to qualification/purchase outcomes; follow-up speed and contact-rate tracking.
