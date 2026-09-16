import { normalizeInquiry, validateInquiry } from "../../inquiry-validation";
import { formatInquiryEmail } from "../../server/inquiry-email";
import { getClientIp, sendLeadEmail, verifyTurnstile } from "../../server/lead-delivery";
import { referralEmail, serviceAreaPhone } from "../../service-area";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid inquiry submission." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !("lead" in payload) ||
    !payload.lead || typeof payload.lead !== "object" || Array.isArray(payload.lead)) {
    return Response.json({ error: "Invalid inquiry details." }, { status: 400 });
  }

  const submission = normalizeInquiry(payload);
  const { locale, turnstileToken } = submission;
  const missing = validateInquiry(submission);
  if (missing.length) {
    const error = missing.includes("zip")
      ? locale === "es"
        ? `Ingresa un ZIP válido de nuestra área de servicio. Para confirmar otro ZIP, manda un correo a ${referralEmail} o un mensaje al ${serviceAreaPhone}.`
        : `Enter a valid ZIP in our service area. To check another ZIP, email ${referralEmail} or text ${serviceAreaPhone}.`
      : locale === "es" ? "Revisa los datos requeridos antes de enviar tu solicitud." : "Please check the required inquiry details before sending.";
    return Response.json({ error, missing }, { status: 400 });
  }
  if (!turnstileToken) {
    return Response.json({ error: locale === "es" ? "Completa la verificación de seguridad." : "Security verification is required." }, { status: 400 });
  }

  const verification = await verifyTurnstile(turnstileToken, locale, getClientIp(request));
  if (!verification.ok) {
    return Response.json({ error: verification.error }, { status: verification.status });
  }
  const delivery = await sendLeadEmail(formatInquiryEmail(submission), locale);
  if (!delivery.ok) {
    return Response.json({ error: delivery.error }, { status: delivery.status });
  }
  return Response.json({ ok: true, id: delivery.id });
}
