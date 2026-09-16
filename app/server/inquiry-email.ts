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
  owner_with_title: "Seller reports they are the owner and have the title",
  owner_without_title: "Seller reports they are the owner without the title",
  authorized_seller: "Seller reports they are authorized to sell for the owner",
  not_sure: "Seller is not sure about ownership or title status",
};

/** Shared by delivery and local review fixtures; no recipient data or provider call lives here. */
export function formatInquiryEmail(submission: InquirySubmission): LeadEmail {
  const { lead, locale, selectionMethod, sourcePath, submissionId } = submission;
  const vehicle = [lead.year, lead.make, lead.model].join(" ");
  const rows = [
    ["First name", lead.firstName],
    ["Phone", lead.phone],
    ["Pickup street address", lead.streetAddress],
    ...(lead.addressLine2 ? [["Apt / unit / space", lead.addressLine2]] : []),
    ["Pickup city / state / ZIP", `${lead.city}, ${lead.state} ${lead.zip}`],
    ["Vehicle", vehicle],
    ["VIN", lead.vin || "Not provided"],
    ["Running status (seller-reported)", lead.runningStatus ? runningLabels[lead.runningStatus] : "Not provided"],
    ["Ownership / title (seller-reported)", lead.ownershipStatus ? ownershipLabels[lead.ownershipStatus] : "Not provided"],
    ["Selection method", selectionMethod],
    ["Page", sourcePath],
    ["Language", locale],
    ["Inquiry ID", submissionId],
  ];
  const description = "This is a quick vehicle inquiry, not a completed condition assessment. Running status, ownership, and title answers are seller-reported and have not been verified. All inquiries require human review; no offer or eligibility has been confirmed. Contact the seller to confirm the vehicle, condition, title, and exact pickup address.";
  return {
    subject: `Quick vehicle inquiry: ${vehicle} - ${lead.zip}`,
    text: ["Quick vehicle inquiry", "", description, "", ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:28px 16px;">
      <div style="border:1px solid #e2e8f0;background:#ffffff;border-radius:16px;overflow:hidden;">
        <div style="background:#0f172a;color:#ffffff;padding:22px 24px;">
          <p style="margin:0 0 6px;color:#6ee28d;font-size:13px;font-weight:800;text-transform:uppercase;">Cash For Cars San Diego</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;">Quick vehicle inquiry</h1>
        </div>
        <div style="padding:22px 24px;">
          <p style="margin:0 0 20px;color:#475569;line-height:1.6;">${description}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${rows.map(([label, value]) => `<tr><td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;color:#475569;font-weight:700;">${escapeHtml(label)}</td><td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(value)}</td></tr>`).join("\n            ")}
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`,
    source: "quick_inquiry",
    idempotencyKey: `quick-inquiry/${submissionId}`,
  };
}
