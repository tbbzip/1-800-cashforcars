import { isServiceAreaZip } from "./service-area";
import { isValidVehicleYear, isValidPhone } from "./offer-validation";

export type InquirySelectionMethod = "vin" | "dropdown" | "manual";
export const inquiryRunningStatuses = ["runs", "does_not_run", "not_sure"] as const;
export const inquiryOwnershipStatuses = ["owner_with_title", "owner_without_title", "authorized_seller", "not_sure"] as const;
export type InquiryRunningStatus = typeof inquiryRunningStatuses[number];
export type InquiryOwnershipStatus = typeof inquiryOwnershipStatuses[number];

export type InquiryLead = {
  vin: string;
  year: string;
  make: string;
  model: string;
  firstName: string;
  phone: string;
  streetAddress: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  runningStatus: InquiryRunningStatus | "";
  ownershipStatus: InquiryOwnershipStatus | "";
};

export type InquirySubmission = {
  lead: InquiryLead;
  locale: "en" | "es";
  sourcePath: string;
  submissionId: string;
  selectionMethod: InquirySelectionMethod | "";
  turnstileToken: string;
};

export type InquiryField = keyof InquiryLead | "sourcePath" | "submissionId" | "selectionMethod";

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function isRunningStatus(value: unknown): value is InquiryRunningStatus {
  return inquiryRunningStatuses.some((status) => status === value);
}

function isOwnershipStatus(value: unknown): value is InquiryOwnershipStatus {
  return inquiryOwnershipStatuses.some((status) => status === value);
}

/** Store the internal pathname only; URLs, query strings and fragments may contain private data. */
export function normalizeSourcePath(value: unknown) {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "";
  try {
    const url = new URL(value, "https://inquiry.invalid");
    if (url.origin !== "https://inquiry.invalid") return "";
    return url.pathname;
  } catch {
    return "";
  }
}

export function isValidSubmissionId(value: string) {
  return UUID_PATTERN.test(value);
}

/** Normalize only supplied inquiry details; condition, ownership, and pickup details are never inferred. */
export function normalizeInquiry(input: unknown): InquirySubmission {
  const payload = record(input);
  const lead = record(payload.lead);
  const method = payload.selectionMethod;
  return {
    lead: {
      vin: text(lead.vin, 100).toUpperCase(),
      year: text(lead.year, 20),
      make: text(lead.make, 100),
      model: text(lead.model, 100),
      firstName: text(lead.firstName, 100),
      phone: text(lead.phone, 40),
      streetAddress: text(lead.streetAddress, 240),
      addressLine2: text(lead.addressLine2, 240),
      city: text(lead.city, 240),
      state: text(lead.state, 240).toUpperCase(),
      zip: text(lead.zip, 20),
      runningStatus: isRunningStatus(lead.runningStatus) ? lead.runningStatus : "",
      ownershipStatus: isOwnershipStatus(lead.ownershipStatus) ? lead.ownershipStatus : "",
    },
    locale: payload.locale === "es" ? "es" : "en",
    sourcePath: normalizeSourcePath(payload.sourcePath),
    submissionId: text(payload.submissionId, 100).toLowerCase(),
    selectionMethod: method === "vin" || method === "dropdown" || method === "manual" ? method : "",
    turnstileToken: typeof payload.turnstileToken === "string" && payload.turnstileToken.length <= 2048
      ? payload.turnstileToken.trim() : "",
  };
}

export function validateInquiry(submission: InquirySubmission): InquiryField[] {
  const { lead, selectionMethod } = submission;
  const invalid: InquiryField[] = [];
  if (!lead.firstName) invalid.push("firstName");
  if (!isValidPhone(lead.phone) || !/^[+\d\s().-]+$/.test(lead.phone)) invalid.push("phone");
  if (!lead.streetAddress) invalid.push("streetAddress");
  if (!lead.city) invalid.push("city");
  if (lead.state !== "CA") invalid.push("state");
  if (!/^\d{5}$/.test(lead.zip) || !isServiceAreaZip(lead.zip)) invalid.push("zip");
  if (!submission.sourcePath) invalid.push("sourcePath");
  if (!isValidSubmissionId(submission.submissionId)) invalid.push("submissionId");
  if (!selectionMethod) invalid.push("selectionMethod");
  if (!isRunningStatus(lead.runningStatus)) invalid.push("runningStatus");
  if (!isOwnershipStatus(lead.ownershipStatus)) invalid.push("ownershipStatus");

  // VIN decoding is a convenience, not a replacement for confirmed vehicle details.
  if (!isValidVehicleYear(lead.year)) invalid.push("year");
  if (!lead.make) invalid.push("make");
  if (!lead.model) invalid.push("model");

  if (selectionMethod === "vin") {
    if (!VIN_PATTERN.test(lead.vin)) invalid.push("vin");
  }
  return invalid;
}
