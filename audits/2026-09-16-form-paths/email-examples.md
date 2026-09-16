# Offline email examples

These files contain fictional seller details and were generated locally from the exact production email formatters. No email or lead was sent. The example JSON omits the required Turnstile token because it is not a usable submission.

- Quick inquiry: quick-inquiry-example.html and quick-inquiry-example.txt. Subject: quick-inquiry-subject.txt.
- Detailed offer: detailed-offer-example.html and detailed-offer-example.txt. Subject: detailed-offer-subject.txt.

The short message explicitly identifies itself as a partial inquiry. The detailed message includes contact, pickup address, vehicle, title, and condition information. Both use the existing configured offer recipients. The quick path has no email-address field and therefore no reply-to address.

Regenerate with: node tests/generate-form-email-examples.mjs
