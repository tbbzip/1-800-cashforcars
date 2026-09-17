# Private estimate prototype

The prototype is available only at `/estimate-preview`. It explores the vehicle-estimate experience using fictional estimates for internal review. It is not a live purchase offer, pricing engine, valuation-provider integration, or lead submission flow. Do not enter real seller information. It does not submit to the production inquiry/offer endpoints or send email.

The prototype has its own root layout and does not mount the public site's Google Tag Manager or phone/conversion event components. There are no public navigation links to it, and it is excluded from the site's static sitemap route list.

## Presenting the concept

1. Open **Seller experience** and choose **Running car** under Presentation shortcuts. The supplied vehicle and answers are fictional sample inputs; continue through the condition step to reveal the sample estimate.
2. Choose **Continue with this estimate**, then **Use sample details** and **Send demo request**. This only creates an in-memory demonstration record. No email, CRM entry, pickup, payment or conversion is generated.
3. Choose **See what the owner receives** to review that record, including the estimate, vehicle condition, title situation, address, contact details and notes. The status buttons demonstrate a local follow-up workflow.
4. Try **Non-running car** to show a lower illustrative range, or **Needs review** to demonstrate the human-review branch. A ZIP outside the existing service area receives no price.
5. **Use a VIN** and **Use sample VIN** demonstrate autofill using a deliberately fictional identifier. Real VIN lookup is not connected. Year changes clear make/model; make changes clear model.
6. **Restart** clears all presentation data. Reloading also clears it; the prototype does not use browser storage or a database.

The fictional sample catalog and pricing rules are in `app/(prototype)/estimate-preview/demo-data.ts`. They are deliberately small and are not a substitute for actual buying rules or market data. A production phase would need approved vehicle eligibility, purchase/resale data, towing costs, margins, quote terms, and a durable lead workflow.

The general vehicle-to-offer-to-pickup flow was informed by the public [Peddle experience](https://www.peddle.com/) and [Copart Direct individual seller flow](https://www.copart.com/sellForIndividuals). Their pricing systems and data were not copied or integrated.

## Local preview

Start the development server bound to the local machine:

```sh
npm run dev -- --hostname 127.0.0.1
```

Open `http://127.0.0.1:3000/estimate-preview`. With `NODE_ENV=development` and no `ESTIMATE_DEMO_PASSWORD` set, direct preview is allowed. This exception is for local development; do not expose this development server to a public network.

If a password is configured in development, the password gate is required. A configured password that is too short, blank after trimming, or too long disables the route instead of bypassing the gate.

## Protected preview configuration

Production is disabled by default and returns 404. To intentionally enable a protected preview, configure both of these server-only environment variables through the deployment environment's secret settings:

| Variable | Required value |
| --- | --- |
| `ESTIMATE_DEMO_ENABLED` | Exactly `true` |
| `ESTIMATE_DEMO_PASSWORD` | A unique, randomly generated password of 16–256 characters, with at least 16 non-padding characters |

Use a password manager to generate and share the preview password privately. Never use a `NEXT_PUBLIC_` prefix, commit a password, or put it in a URL. This implementation does not add or modify environment files. Restart the local server or redeploy after changing configuration.

The enable flag is required in every non-development environment. In development, a configured valid password requires authentication regardless of the enable flag. Missing or invalid production configuration returns 404 rather than displaying the unlock form.

## Access and indexing behavior

- The page rechecks configuration and session authorization on each server request. The unlock server action independently rechecks configuration and validates the supplied password.
- Password input is bounded at 256 characters. Server comparison hashes both values before a timing-safe comparison. Passwords are not logged or returned to the client.
- Successful unlock sets a randomized, HMAC-signed session token that expires after two hours. The cookie contains no password and is `HttpOnly`, `SameSite=Strict`, and scoped to `/estimate-preview`; it is also `Secure` in production.
- Changing the password invalidates existing sessions on the updated deployment. Setting `ESTIMATE_DEMO_ENABLED` to anything other than `true` disables production access, including existing sessions.
- The page is dynamically rendered. Production route and subpath responses carry `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` and `no-store` cache headers, including unavailable routes. GET responses are also marked `private`; Next.js supplies its own no-store header on unlock POST responses. The prototype layout also sets noindex/nofollow metadata. `robots.txt` disallows `/estimate-preview`.
- Access control is the privacy boundary. Indexing directives do not replace authentication. The shipped client UI and fictional example logic are not confidential data; never embed secrets or customer records in client bundles.

Only the unlock action writes server state, by setting the access cookie. Prototype controls must remain local demonstrations and must not call production lead, email, or pricing-provider APIs.

## Verification

Run the isolated access checks without reading real secrets or making network requests:

```sh
node --test tests/estimate-demo-access.test.mjs
```

Before any intentional protected release, verify `/estimate-preview` returns 404 with configuration absent, then verify the configured gate, invalid password, valid password, cookie flags, expired/forged cookies, response headers, and absence of tracking requests. Local checks and builds do not establish a deployed preview.
