import "server-only";
import { createHash } from "node:crypto";
import type { OfferLead } from "../offer-validation";
import type { LeadEmail } from "./lead-delivery";

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
    `Email: ${lead.email || "Not provided"}`,
    `Locale: ${locale}`,
    "",
    "Pickup address",
    `Street: ${lead.streetAddress || "To be confirmed with seller"}`,
    `Apt/unit/space: ${lead.addressLine2 || "Not provided"}`,
    `City/state/ZIP: ${[lead.city, lead.state, lead.zip]
      .filter(Boolean)
      .join(" ")}`,
    `Access type: ${lead.access}`,
    `Access notes: ${lead.accessNotes || "Not provided"}`,
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
            ${row("Locale", locale)}
          </table>

          <h2 style="margin:24px 0 12px;font-size:18px;color:#0f172a;">Pickup address</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${row("Street", lead.streetAddress)}
            ${row("Apt / unit / space", lead.addressLine2)}
            ${row(
              "City / state / ZIP",
              [lead.city, lead.state, lead.zip].filter(Boolean).join(" "),
            )}
            ${row("Access type", lead.access)}
            ${row("Access notes", lead.accessNotes)}
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
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function formatOfferEmail(lead: OfferLead, locale: "en" | "es", submissionId?: string): LeadEmail {
  // Older pages already open during a deployment do not send an ID. Deduplicate
  // their normalized payload too, without placing seller details in the key.
  const idempotencyKey = submissionId
    ? `offer-form/${submissionId}`
    : `offer-form/legacy/${createHash("sha256").update(JSON.stringify({ lead, locale })).digest("hex")}`;
  return {
    subject: buildSubject(lead),
    html: buildHtmlEmail(lead, locale),
    text: buildTextEmail(lead, locale),
    source: "offer_form",
    idempotencyKey,
    replyTo: lead.email,
  };
}
