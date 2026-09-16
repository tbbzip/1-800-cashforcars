import "server-only";
import { randomUUID } from "node:crypto";

type Locale = "en" | "es";
type Failure = { ok: false; status: number; error: string };

export type LeadEmail = {
  subject: string;
  html: string;
  text: string;
  source: "offer_form" | "quick_inquiry";
  idempotencyKey: string;
  replyTo?: string;
};

export function getClientIp(request: Request) {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
}

export async function verifyTurnstile(token: string, locale: Locale, remoteIp?: string): Promise<{ ok: true } | Failure> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false, status: 503, error: locale === "es" ? "La verificación no está disponible. Llama o vuelve a intentarlo." : "Security verification is unavailable. Please call or try again." };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("idempotency_key", randomUUID());
  if (remoteIp) formData.append("remoteip", remoteIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(10_000),
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok || !result || typeof result !== "object" || !("success" in result) || result.success !== true) {
      return { ok: false, status: 400, error: locale === "es" ? "No pudimos verificar la seguridad. Reintenta la verificación y envía de nuevo." : "Security verification failed. Retry the security check and send again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 502, error: locale === "es" ? "No pudimos conectar con la verificación. Reintenta la verificación de seguridad." : "We couldn’t reach security verification. Please retry the security check." };
  }
}

/** Provider acceptance is required for success. Provider bodies and seller data never enter errors or logs. */
export async function sendLeadEmail(message: LeadEmail, locale: Locale): Promise<{ ok: true; id: string } | Failure> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.OFFER_RECIPIENT_EMAIL ?? from;
  const bcc = process.env.OFFER_BCC_EMAIL?.split(",").map((email) => email.trim()).filter(Boolean) ?? [];
  if (!apiKey || !from || !to) {
    return { ok: false, status: 503, error: locale === "es" ? "El envío no está disponible por ahora. Llama o vuelve a intentarlo." : "Offer delivery is unavailable right now. Please call or try again." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(12_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey,
        "User-Agent": "1-800-cashforcars/1.0",
      },
      body: JSON.stringify({
        from,
        to: [to],
        ...(bcc.length ? { bcc } : {}),
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        subject: message.subject,
        html: message.html,
        text: message.text,
        tags: [{ name: "source", value: message.source }],
      }),
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok || !result || typeof result !== "object" || !("id" in result) || typeof result.id !== "string" || !result.id) {
      return { ok: false, status: 502, error: locale === "es" ? "No pudimos enviar tu solicitud. Tus respuestas siguen aquí; vuelve a intentarlo o llámanos." : "We couldn’t send your request. Your answers are still here; please try again or call us." };
    }
    return { ok: true, id: result.id };
  } catch {
    return { ok: false, status: 502, error: locale === "es" ? "No pudimos confirmar el envío. Tus respuestas siguen aquí; vuelve a intentarlo o llámanos." : "We couldn’t confirm delivery. Your answers are still here; please try again or call us." };
  }
}
