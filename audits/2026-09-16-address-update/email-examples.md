# Offline email examples

These files contain fictional seller details and were generated locally from the exact production email formatters. No email or lead was sent. The example JSON omits the required Turnstile token because it is not a usable submission.

- Quick inquiry: quick-inquiry-example.html and quick-inquiry-example.txt. Subject: quick-inquiry-subject.txt.
- VIN inquiry with uncertain running status and no title: quick-vin-inquiry-example.html and quick-vin-inquiry-example.txt. Subject: quick-vin-inquiry-subject.txt.
- Detailed offer: detailed-offer-example.html and detailed-offer-example.txt. Subject: detailed-offer-subject.txt.

The short message explicitly identifies itself as a partial inquiry. Every quick inquiry includes the complete pickup street address, city, California state code, service-area ZIP, year, make, model, running status, and ownership/title answers. The unit/space line is optional and is included in the VIN example. VIN submissions also include the VIN separately. Screening answers are seller-reported and unverified; every allowed answer remains eligible for human review. The detailed message includes contact, pickup address, vehicle, title, and condition information. Both use the existing configured offer recipients. The quick path has no email-address field and therefore no reply-to address.

Regenerate with: node tests/generate-form-email-examples.mjs
