import { randomUUID } from "node:crypto";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_STRING_LENGTH = 240;
const MAX_TOKEN_LENGTH = 2048;

export const runtime = "nodejs";

type OfferLead = {
  access: string;
  airbagsDeployed: boolean | null;
  bodyDamage: string;
  catalyticConverter: boolean | null;
  drives: boolean | null;
  email: string;
  firstName: string;
  hasKeys: boolean | null;
  hasTitle: boolean | null;
  lastName: string;
  make: string;
  mileage: string;
  model: string;
  paperwork: string;
  phone: string;
  rolls: boolean | null;
  tiresInflated: boolean | null;
  trim: string;
  vin: string;
  wheelsAttached: boolean | null;
  year: string;
  zip: string;
};

type OfferPayload = {
  lead?: Partial<OfferLead>;
  locale?: string;
  turnstileToken?: string;
};

type TurnstileResponse = {
  success?: boolean;
  "error-codes"?: string[];
  hostname?: string;
};

function asString(value: unknown, maxLength = MAX_STRING_LENGTH) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function asBooleanOrNull(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function normalizeVin(value: unknown) {
  return asString(value, 17).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeLead(input: Partial<OfferLead> | undefined): OfferLead {
  return {
    access: asString(input?.access),
    airbagsDeployed: asBooleanOrNull(input?.airbagsDeployed),
    bodyDamage: asString(input?.bodyDamage),
    catalyticConverter: asBooleanOrNull(input?.catalyticConverter),
    drives: asBooleanOrNull(input?.drives),
    email: asString(input?.email, 320).toLowerCase(),
    firstName: asString(input?.firstName),
    hasKeys: asBooleanOrNull(input?.hasKeys),
    hasTitle: asBooleanOrNull(input?.hasTitle),
    lastName: asString(input?.lastName),
    make: asString(input?.make),
    mileage: asString(input?.mileage),
    model: asString(input?.model),
    paperwork: asString(input?.paperwork),
    phone: asString(input?.phone),
    rolls: asBooleanOrNull(input?.rolls),
    tiresInflated: asBooleanOrNull(input?.tiresInflated),
    trim: asString(input?.trim),
    vin: normalizeVin(input?.vin),
    wheelsAttached: asBooleanOrNull(input?.wheelsAttached),
    year: asString(input?.year),
    zip: asString(input?.zip, 20),
  };
}

function validateLead(lead: OfferLead) {
  const missing: string[] = [];

  for (const field of [
    "year",
    "make",
    "model",
    "zip",
    "phone",
    "firstName",
    "email",
    "mileage",
    "bodyDamage",
    "access",
  ] satisfies Array<keyof OfferLead>) {
    if (!lead[field]) {
      missing.push(field);
    }
  }

  for (const field of [
    "hasTitle",
    "drives",
    "catalyticConverter",
    "airbagsDeployed",
    "hasKeys",
  ] satisfies Array<keyof OfferLead>) {
    if (lead[field] === null) {
      missing.push(field);
    }
  }

  if (lead.hasTitle === false && !lead.paperwork) {
    missing.push("paperwork");
  }

  if (
    lead.drives === false &&
    (lead.tiresInflated === null ||
      lead.wheelsAttached === null ||
      lead.rolls === null)
  ) {
    missing.push("mobilityDetails");
  }

  if (!EMAIL_PATTERN.test(lead.email)) {
    missing.push("validEmail");
  }

  if (lead.phone.replace(/\D/g, "").length < 7) {
    missing.push("validPhone");
  }

  return missing;
}

function getClientIp(request: Request) {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

async function validateTurnstile(token: string, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { ok: false, status: 500, error: "Turnstile is not configured." };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("idempotency_key", randomUUID());

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as TurnstileResponse;

  if (!response.ok || !result.success) {
    return {
      ok: false,
      status: 400,
      error: "Security verification failed. Please refresh and try again.",
      codes: result["error-codes"] ?? [],
    };
  }

  return { ok: true, hostname: result.hostname };
}

function booleanLabel(value: boolean | null) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "Not answered";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;font-weight:700;width:190px;">${escapeHtml(
    label,
  )}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(
    value || "Not provided",
  )}</td></tr>`;
}

function buildSubject(lead: OfferLead) {
  const vehicle = [lead.year, lead.make, lead.model].filter(Boolean).join(" ");
  const location = lead.zip ? ` - ${lead.zip}` : "";

  return `New cash offer lead: ${vehicle || "Vehicle"}${location}`;
}

function buildTextEmail(lead: OfferLead, locale: string) {
  return [
    "New cash offer lead",
    "",
    `Name: ${[lead.firstName, lead.lastName].filter(Boolean).join(" ")}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `ZIP: ${lead.zip}`,
    `Locale: ${locale}`,
    "",
    `Vehicle: ${[lead.year, lead.make, lead.model, lead.trim]
      .filter(Boolean)
      .join(" ")}`,
    `VIN: ${lead.vin || "Not provided"}`,
    `Mileage: ${lead.mileage}`,
    `Title: ${booleanLabel(lead.hasTitle)}`,
    `Paperwork: ${lead.paperwork || "Not provided"}`,
    "",
    `Drives: ${booleanLabel(lead.drives)}`,
    `Tires inflated: ${booleanLabel(lead.tiresInflated)}`,
    `Wheels attached: ${booleanLabel(lead.wheelsAttached)}`,
    `Can roll: ${booleanLabel(lead.rolls)}`,
    `Catalytic converter installed: ${booleanLabel(lead.catalyticConverter)}`,
    `Body condition: ${lead.bodyDamage}`,
    `Airbags deployed: ${booleanLabel(lead.airbagsDeployed)}`,
    `Has keys: ${booleanLabel(lead.hasKeys)}`,
    `Vehicle location: ${lead.access}`,
  ].join("\n");
}

function buildHtmlEmail(lead: OfferLead, locale: string) {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
  const vehicle = [lead.year, lead.make, lead.model, lead.trim]
    .filter(Boolean)
    .join(" ");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:28px 16px;">
      <div style="border:1px solid #e2e8f0;background:#ffffff;border-radius:16px;overflow:hidden;">
        <div style="background:#0f172a;color:#ffffff;padding:22px 24px;">
          <p style="margin:0 0 6px;color:#6ee28d;font-size:13px;font-weight:800;text-transform:uppercase;">Cash For Cars San Diego</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;">New cash offer lead</h1>
        </div>
        <div style="padding:22px 24px;">
          <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Contact</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${row("Name", name)}
            ${row("Phone", lead.phone)}
            ${row("Email", lead.email)}
            ${row("Pickup ZIP", lead.zip)}
            ${row("Locale", locale)}
          </table>

          <h2 style="margin:24px 0 12px;font-size:18px;color:#0f172a;">Vehicle</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${row("Vehicle", vehicle)}
            ${row("VIN", lead.vin)}
            ${row("Mileage", lead.mileage)}
            ${row("Has title", booleanLabel(lead.hasTitle))}
            ${row("Paperwork", lead.paperwork)}
          </table>

          <h2 style="margin:24px 0 12px;font-size:18px;color:#0f172a;">Condition and access</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${row("Drives", booleanLabel(lead.drives))}
            ${row("Tires inflated", booleanLabel(lead.tiresInflated))}
            ${row("Wheels attached", booleanLabel(lead.wheelsAttached))}
            ${row("Can roll", booleanLabel(lead.rolls))}
            ${row("Catalytic converter", booleanLabel(lead.catalyticConverter))}
            ${row("Body condition", lead.bodyDamage)}
            ${row("Airbags deployed", booleanLabel(lead.airbagsDeployed))}
            ${row("Has keys", booleanLabel(lead.hasKeys))}
            ${row("Vehicle location", lead.access)}
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

async function sendOfferEmail(lead: OfferLead, locale: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.OFFER_RECIPIENT_EMAIL ?? from;

  if (!apiKey || !from || !to) {
    return { ok: false, status: 500, error: "Email delivery is not configured." };
  }

  const response = await fetch(RESEND_EMAILS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": randomUUID(),
      "User-Agent": "1-800-cashforcars/1.0",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: buildSubject(lead),
      html: buildHtmlEmail(lead, locale),
      text: buildTextEmail(lead, locale),
      tags: [{ name: "source", value: "offer_form" }],
    }),
  });

  const result = (await response.json().catch(() => null)) as
    | { id?: string; message?: string }
    | null;

  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      error: result?.message ?? "Could not send the offer email right now.",
    };
  }

  return { ok: true, id: result?.id };
}

export async function POST(request: Request) {
  let payload: OfferPayload;

  try {
    payload = (await request.json()) as OfferPayload;
  } catch {
    return Response.json({ error: "Invalid offer submission." }, { status: 400 });
  }

  const token = asString(payload.turnstileToken, MAX_TOKEN_LENGTH);

  if (!token) {
    return Response.json(
      { error: "Security verification is required." },
      { status: 400 },
    );
  }

  const lead = normalizeLead(payload.lead);
  const missing = validateLead(lead);

  if (missing.length > 0) {
    return Response.json(
      { error: "Please complete the required offer details.", missing },
      { status: 400 },
    );
  }

  const turnstile = await validateTurnstile(token, getClientIp(request));

  if (!turnstile.ok) {
    return Response.json(
      { error: turnstile.error },
      { status: turnstile.status },
    );
  }

  const locale = payload.locale === "es" ? "es" : "en";
  const email = await sendOfferEmail(lead, locale);

  if (!email.ok) {
    return Response.json({ error: email.error }, { status: email.status });
  }

  return Response.json({ id: email.id, ok: true });
}
