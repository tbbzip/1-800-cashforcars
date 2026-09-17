import "server-only";
import type { InquirySubmission, InquiryRunningStatus, InquiryOwnershipStatus } from "../inquiry-validation";
import type { LeadEmail } from "./lead-delivery";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const runningLabels: Record<InquiryRunningStatus, string> = {
  runs: "Runs",
  does_not_run: "Does not run",
  not_sure: "Not sure",
};

const ownershipLabels: Record<InquiryOwnershipStatus, string> = {
  owner_with_title: "Owner with title",
  owner_without_title: "Owner without title",
  authorized_seller: "Authorized by the owner",
  not_sure: "Other / not sure",
};

/** Shared by delivery and local review fixtures; no recipient data or provider call lives here. */
export function formatInquiryEmail(submission: InquirySubmission): LeadEmail {
  const { lead, locale, selectionMethod, sourcePath, submissionId } = submission;
  const vehicle = [lead.year, lead.make, lead.model].join(" ");
  const running = lead.runningStatus ? runningLabels[lead.runningStatus] : "Not provided";
  const ownership = lead.ownershipStatus ? ownershipLabels[lead.ownershipStatus] : "Not provided";
  const phoneDigits = lead.phone.replace(/\D/g, "");
  const phoneHref = `tel:+${phoneDigits.length === 10 ? "1" : ""}${phoneDigits}`;
  const contactRows = [
    ["Full name", lead.fullName],
    ["Phone", lead.phone],
  ];
  const pickupRows = [
    ["Pickup street address", lead.streetAddress],
    ...(lead.addressLine2 ? [["Apt / unit / space", lead.addressLine2]] : []),
    ["Pickup city / state / ZIP", `${lead.city}, ${lead.state} ${lead.zip}`],
  ];
  const vehicleRows = [
    ["Vehicle", vehicle],
    ...(lead.vin ? [["VIN", lead.vin]] : []),
    ["Running status", running],
    ["Ownership / title", ownership],
  ];
  const rows = [...contactRows, ...pickupRows, ...vehicleRows, ...(lead.notes ? [["Notes", lead.notes]] : [])];
  const metadata = [
    ["Selection method", selectionMethod],
    ["Page", sourcePath],
    ["Language", locale],
    ["Inquiry ID", submissionId],
  ];
  const section = (title: string, entries: string[][]) => `
        <h2 style="margin:22px 0 8px;color:#166534;font-size:12px;line-height:1.5;letter-spacing:0.08em;text-transform:uppercase;">${title}</h2>
        <table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:14px;line-height:1.6;">
          ${entries.map(([label, value]) => `<tr><th scope="row" style="width:38%;padding:8px 12px 8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:400;text-align:left;vertical-align:top;overflow-wrap:anywhere;">${escapeHtml(label)}</th><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;vertical-align:top;overflow-wrap:anywhere;word-break:break-word;">${label === "Phone" ? `<a href="${phoneHref}" style="color:#166534;text-decoration:underline;">${escapeHtml(value)}</a>` : escapeHtml(value)}</td></tr>`).join("\n          ")}
        </table>`;
  return {
    subject: `New lead: ${vehicle} | ${running} | ${ownership} | ${lead.city} ${lead.zip}`,
    text: [...rows.map(([label, value]) => `${label}: ${value}`), "", metadata.map(([label, value]) => `${label}: ${value}`).join(" · ")].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(`${lead.fullName} · ${lead.phone} · ${lead.streetAddress}`)}</div>
    <div style="max-width:600px;margin:0 auto;padding:20px 12px;">
      <div style="border:1px solid #e2e8f0;border-top:4px solid #187b36;background:#ffffff;border-radius:12px;padding:20px;">
        <p style="margin:0 0 5px;color:#166534;font-size:11px;line-height:1.5;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">New vehicle lead</p>
        <h1 style="margin:0;color:#0f172a;font-size:22px;line-height:1.3;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(vehicle)}</h1>
        <p style="margin:6px 0 0;color:#64748b;font-size:13px;line-height:1.5;overflow-wrap:anywhere;">${escapeHtml(`${lead.city}, ${lead.state} ${lead.zip}`)} &middot; Quick form</p>
        ${section("Contact", contactRows)}
        ${section("Pickup", pickupRows)}
        ${section("Vehicle details", vehicleRows)}
        ${lead.notes ? `<div style="margin-top:22px;padding:14px;background:#f0fdf4;border:1px solid #dcfce7;border-radius:8px;"><h2 style="margin:0 0 6px;color:#166534;font-size:12px;line-height:1.5;letter-spacing:0.08em;text-transform:uppercase;">Notes</h2><p style="margin:0;color:#0f172a;font-size:14px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(lead.notes).replace(/\n/g, "<br />")}</p></div>` : ""}
      </div>
      <p style="margin:14px 8px 0;font-size:11px;line-height:1.7;color:#64748b;overflow-wrap:anywhere;word-break:break-word;">${metadata.map(([label, value]) => `${escapeHtml(label)}: ${escapeHtml(value)}`).join("<br />")}</p>
    </div>
  </body>
</html>`,
    source: "quick_inquiry",
    idempotencyKey: `quick-inquiry/${submissionId}`,
  };
}
