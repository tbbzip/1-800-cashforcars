import { formatOfferEmail } from "../../server/offer-email";
import { getClientIp, sendLeadEmail, verifyTurnstile } from "../../server/lead-delivery";
import { normalizeOfferSubmissionId, validateOfferLead, type OfferLead } from "../../offer-validation";
import { normalizeZip } from "../../service-area";

const MAX_STRING_LENGTH = 240;
const MAX_TOKEN_LENGTH = 2048;

export const runtime = "nodejs";

type OfferPayload = {
  lead?: Partial<OfferLead>;
  locale?: string;
  turnstileToken?: string;
  submissionId?: unknown;
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
    accessNotes: asString(input?.accessNotes, 500),
    addressLine2: asString(input?.addressLine2),
    airbagsDeployed: asBooleanOrNull(input?.airbagsDeployed),
    bodyDamage: asString(input?.bodyDamage),
    catalyticConverter: asBooleanOrNull(input?.catalyticConverter),
    city: asString(input?.city),
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
    state: asString(input?.state, 2).toUpperCase(),
    streetAddress: asString(input?.streetAddress),
    tiresInflated: asBooleanOrNull(input?.tiresInflated),
    trim: asString(input?.trim),
    vin: normalizeVin(input?.vin),
    wheelsAttached: asBooleanOrNull(input?.wheelsAttached),
    year: asString(input?.year),
    zip: normalizeZip(asString(input?.zip, 20)),
  };
}


export async function POST(request: Request) {
  let payload: OfferPayload;

  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Invalid offer submission." }, { status: 400 });
    }
    payload = parsed as OfferPayload;
    if (payload.lead !== undefined && (!payload.lead || typeof payload.lead !== "object" || Array.isArray(payload.lead))) {
      return Response.json({ error: "Invalid offer details." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid offer submission." }, { status: 400 });
  }

  const token = asString(payload.turnstileToken, MAX_TOKEN_LENGTH);
  const locale = payload.locale === "es" ? "es" : "en";
  const submissionId = payload.submissionId === undefined ? undefined : normalizeOfferSubmissionId(payload.submissionId);

  if (payload.submissionId !== undefined && !submissionId) {
    return Response.json(
      {
        error: locale === "es" ? "No pudimos identificar la solicitud. Vuelve a intentarlo." : "We couldn’t identify this request. Please try again.",
        missing: ["submissionId"],
      },
      { status: 400 },
    );
  }

  if (!token) {
    return Response.json(
      { error: "Security verification is required." },
      { status: 400 },
    );
  }

  const lead = normalizeLead(payload.lead);
  const missing: string[] = validateOfferLead(lead);

  if (missing.length > 0) {
    return Response.json(
      { error: "Please complete the required offer details.", missing },
      { status: 400 },
    );
  }

  const turnstile = await verifyTurnstile(token, locale, getClientIp(request));

  if (!turnstile.ok) {
    return Response.json(
      { error: turnstile.error },
      { status: turnstile.status },
    );
  }

  const email = await sendLeadEmail(formatOfferEmail(lead, locale, submissionId), locale);

  if (!email.ok) {
    return Response.json({ error: email.error }, { status: email.status });
  }

  return Response.json({ id: email.id, ok: true });
}
