/** Validation shared by the offer wizard and its server endpoint. */
export type OfferLead = {
  access: string;
  accessNotes: string;
  addressLine2: string;
  airbagsDeployed: boolean | null;
  bodyDamage: string;
  catalyticConverter: boolean | null;
  city: string;
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
  state: string;
  streetAddress: string;
  tiresInflated: boolean | null;
  trim: string;
  vin: string;
  wheelsAttached: boolean | null;
  year: string;
  zip: string;
};

export type OfferField = keyof OfferLead;

export type OfferSubmissionIdentity = { fingerprint: string; id: string };

export function normalizeOfferSubmissionId(value: unknown) {
  if (typeof value !== "string") return "";
  const id = value.trim().toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id) ? id : "";
}

/** Security tokens change on retry; only seller details and language identify the request. */
export function getOfferSubmissionIdentity(
  lead: OfferLead,
  locale: "en" | "es",
  previous: OfferSubmissionIdentity | null,
  createId: () => string,
): OfferSubmissionIdentity {
  const fingerprint = JSON.stringify({ lead, locale });
  return previous?.fingerprint === fingerprint ? previous : { fingerprint, id: createId() };
}

export function isValidVehicleYear(value: string) {
  return /^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= new Date().getFullYear() + 1;
}

export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^\d{10}$/.test(digits) || /^1\d{10}$/.test(digits);
}

export function validateOfferStep(lead: OfferLead, step: number): OfferField[] {
  const invalid: OfferField[] = [];
  const requireText = (fields: OfferField[]) => {
    for (const field of fields) {
      if (typeof lead[field] !== "string" || !String(lead[field]).trim()) invalid.push(field);
    }
  };
  const requireBoolean = (fields: OfferField[]) => {
    for (const field of fields) {
      if (typeof lead[field] !== "boolean") invalid.push(field);
    }
  };

  if (step === 0) {
    if (!isValidVehicleYear(lead.year)) invalid.push("year");
    requireText(["make", "model", "streetAddress", "city", "state"]);
    if (!/^\d{5}$/.test(lead.zip)) invalid.push("zip");
    if (!isValidPhone(lead.phone)) invalid.push("phone");
    requireText(["firstName"]);
    // The detailed questionnaire retains its original pickup and contact requirements.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) invalid.push("email");
    requireBoolean(["hasTitle"]);
    if (lead.hasTitle === false) requireText(["paperwork"]);
  } else if (step === 1) {
    requireText(["mileage"]);
    requireBoolean(["drives", "catalyticConverter"]);
    if (lead.drives === false) requireBoolean(["tiresInflated", "wheelsAttached", "rolls"]);
  } else if (step === 2) {
    requireText(["bodyDamage", "access"]);
    requireBoolean(["airbagsDeployed", "hasKeys"]);
  }

  return invalid;
}

export function validateOfferLead(lead: OfferLead) {
  return [0, 1, 2].flatMap((step) => validateOfferStep(lead, step));
}

type SearchValue = string | string[] | undefined;

/** Ignore duplicate or oversized query values; all values remain user-editable. */
export function offerPrefill(params: Record<string, SearchValue>) {
  const text = (value: SearchValue, maxLength: number) =>
    typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength) : "";
  const year = text(params.year, 4);
  return {
    initialVin: text(params.vin, 17).toUpperCase().replace(/[^A-Z0-9]/g, ""),
    initialYear: isValidVehicleYear(year) && params.year?.length === 4 ? year : "",
    initialMake: text(params.make, 100),
    initialModel: text(params.model, 100),
  };
}
