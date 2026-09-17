import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

// Offline fixtures only: the loader supplies fake configuration and disables network requests.
const directory = new URL("../audits/2026-09-16-quick-form-update/", import.meta.url);
mkdirSync(directory, { recursive: true });
const { normalizeInquiry } = loadTypeScript(fileURLToPath(new URL("../app/inquiry-validation.ts", import.meta.url)));
const { formatInquiryEmail } = loadTypeScript(fileURLToPath(new URL("../app/server/inquiry-email.ts", import.meta.url)));
const { formatOfferEmail } = loadTypeScript(fileURLToPath(new URL("../app/server/offer-email.ts", import.meta.url)));
const quick = {
  lead: { year: "2014", make: "Honda", model: "Civic", fullName: "Alex Rivera Example", notes: "Please call after 5 pm.\nThe vehicle is parked in the driveway.", phone: "619-555-0142", streetAddress: "123 Example Street", city: "San Diego", state: "CA", zip: "92154", runningStatus: "runs", ownershipStatus: "owner_with_title" },
  locale: "en", sourcePath: "/junk-cars", selectionMethod: "dropdown",
  submissionId: "d0334bc8-8394-4fa3-9f6b-dc0e1c56c210",
};
const vinInquiry = {
  ...quick,
  lead: { ...quick.lead, addressLine2: "Unit 4B", vin: "1HGBH41JXMN109186", year: "1991", model: "Accord", notes: "The battery is flat.\nPlease call when you reach the gate.", runningStatus: "not_sure", ownershipStatus: "owner_without_title" },
  selectionMethod: "vin",
  submissionId: "8be8da73-43ac-475d-ae9d-d3d6aad7f872",
};
const detailed = {
  access: "Home driveway", accessNotes: "Fictional example. Vehicle in driveway.", addressLine2: "",
  airbagsDeployed: false, bodyDamage: "Minor dents or scratches", catalyticConverter: true,
  city: "San Diego", drives: true, email: "alex@example.invalid", firstName: "Alex", hasKeys: true,
  hasTitle: true, lastName: "Example", make: "Honda", mileage: "Under 150,000", model: "Civic",
  paperwork: "", phone: "619-555-0142", rolls: null, state: "CA", streetAddress: "123 Example Street",
  tiresInflated: null, trim: "LX", vin: "", wheelsAttached: null, year: "2014", zip: "92154",
};
for (const [name, message] of [
  ["quick-inquiry", formatInquiryEmail(normalizeInquiry(quick))],
  ["quick-vin-inquiry", formatInquiryEmail(normalizeInquiry(vinInquiry))],
  ["detailed-offer", formatOfferEmail(detailed, "en")],
]) {
  writeFileSync(new URL(`${name}-example.html`, directory), message.html);
  writeFileSync(new URL(`${name}-example.txt`, directory), message.text);
  writeFileSync(new URL(`${name}-subject.txt`, directory), `${message.subject}\n`);
}
writeFileSync(new URL("quick-inquiry-payload.example.json", directory), `${JSON.stringify(quick, null, 2)}\n`);
writeFileSync(new URL("quick-vin-inquiry-payload.example.json", directory), `${JSON.stringify(vinInquiry, null, 2)}\n`);
writeFileSync(new URL("email-examples.md", directory), `# Offline email examples

These files contain fictional seller details and were generated locally from the exact production email formatters. No email or lead was sent. The example JSON omits the required Turnstile token because it is not a usable submission.

- Quick inquiry: quick-inquiry-example.html and quick-inquiry-example.txt. Subject: quick-inquiry-subject.txt.
- VIN inquiry with uncertain running status and no title: quick-vin-inquiry-example.html and quick-vin-inquiry-example.txt. Subject: quick-vin-inquiry-subject.txt.
- Detailed offer: detailed-offer-example.html and detailed-offer-example.txt. Subject: detailed-offer-subject.txt.

The quick email subject shows the vehicle, running status, ownership/title answer, city, and ZIP at a glance. The HTML email has a compact vehicle heading and grouped Contact, Pickup, and Vehicle details sections, with a clickable phone number. Plain text starts directly with the full name and phone. Every quick inquiry includes the full name, phone, complete pickup street address, city, California state code, service-area ZIP, year, make, model, running status, and ownership/title answers. Optional notes preserve line breaks and appear in a dedicated section when supplied. The unit/space line is optional and is included in the VIN example. VIN submissions also include the VIN separately. Screening answers are seller-reported and unverified; every allowed answer remains eligible for human review. The detailed message includes contact, pickup address, vehicle, title, and condition information. Both use the existing configured offer recipients. The quick path has no email-address field and therefore no reply-to address.

Regenerate with: node tests/generate-form-email-examples.mjs
`);
