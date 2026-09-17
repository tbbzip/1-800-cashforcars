import { isServiceAreaZip } from "../../service-area";

/**
 * Fictional prototype data only. These prices, adjustments, ranges, and catalog
 * coverage are invented to demonstrate interaction states. They are not market
 * data, an appraisal, a purchase offer, or a production pricing model.
 * This module performs no requests, storage, tracking, or lead submission.
 */
export type DemoMileage = "under100k" | "100to150k" | "over150k";
export type DemoRunning = "runs" | "does_not_run" | "not_sure";
export type DemoCondition = "good" | "minor_damage" | "major_damage";
export type DemoOwnership = "owner_with_title" | "owner_without_title" | "authorized_seller" | "not_sure";

export interface DemoVehicle {
  year: string;
  make: string;
  model: string;
}

export interface DemoInput extends DemoVehicle {
  zip: string;
  mileage: DemoMileage | "";
  running: DemoRunning | "";
  condition: DemoCondition | "";
  ownership: DemoOwnership | "";
}

export type DemoValidationErrors = Partial<Record<keyof DemoInput, string>>;

export type DemoEstimate =
  | { status: "range"; lower: number; upper: number; factors: string[] }
  | { status: "manual-review"; reasons: string[]; factors: string[] }
  | { status: "out-of-area"; zip: string; factors: string[] }
  | { status: "invalid"; errors: DemoValidationErrors };

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  input: DemoInput;
}

interface DemoCatalogEntry {
  make: string;
  model: string;
  firstYear: number;
  lastYear: number;
  fictionalBase: number;
}

// Availability is intentionally a small sample, not a vehicle-production claim.
export const DEMO_CATALOG: readonly DemoCatalogEntry[] = [
  { make: "Honda", model: "Civic", firstYear: 2008, lastYear: 2022, fictionalBase: 2000 },
  { make: "Honda", model: "Accord", firstYear: 2008, lastYear: 2020, fictionalBase: 2300 },
  { make: "Toyota", model: "Corolla", firstYear: 2008, lastYear: 2022, fictionalBase: 1900 },
  { make: "Toyota", model: "Camry", firstYear: 2010, lastYear: 2022, fictionalBase: 2350 },
  { make: "Ford", model: "F-150", firstYear: 2008, lastYear: 2022, fictionalBase: 3200 },
  { make: "Ford", model: "Escape", firstYear: 2012, lastYear: 2020, fictionalBase: 2450 },
  { make: "Nissan", model: "Altima", firstYear: 2010, lastYear: 2020, fictionalBase: 2050 },
  { make: "Chevrolet", model: "Silverado", firstYear: 2008, lastYear: 2022, fictionalBase: 3300 },
  { make: "Chevrolet", model: "Malibu", firstYear: 2010, lastYear: 2018, fictionalBase: 2100 },
];

export const DEMO_YEARS = Array.from({ length: 15 }, (_, index) => String(2022 - index));

export const INITIAL_DEMO_INPUT: DemoInput = {
  year: "", make: "", model: "", zip: "", mileage: "", running: "", condition: "", ownership: "",
};

// Includes letters disallowed in real VINs. Only this explicit demo ID is decoded.
export const DEMO_VIN = "DEMOHONDA20140001";
export const DEMO_VEHICLE: DemoVehicle = { year: "2014", make: "Honda", model: "Civic" };
export const DEMO_VIN_VEHICLES: Readonly<Record<string, DemoVehicle>> = {
  [DEMO_VIN]: DEMO_VEHICLE,
};

export function lookupDemoVin(value: string): DemoVehicle | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toUpperCase();
  return Object.hasOwn(DEMO_VIN_VEHICLES, key) ? { ...DEMO_VIN_VEHICLES[key] } : null;
}

function numericYear(year: unknown): number | null {
  return typeof year === "string" && DEMO_YEARS.includes(year) ? Number(year) : null;
}

function available(entry: DemoCatalogEntry, year: number) {
  return year >= entry.firstYear && year <= entry.lastYear;
}

export function getMakesForYear(year: string): string[] {
  const value = numericYear(year);
  if (value === null) return [];
  return [...new Set(DEMO_CATALOG.filter((entry) => available(entry, value)).map((entry) => entry.make))].sort();
}

export function getModelsForYearMake(year: string, make: string): string[] {
  const value = numericYear(year);
  if (value === null || typeof make !== "string") return [];
  return DEMO_CATALOG.filter((entry) => entry.make === make && available(entry, value)).map((entry) => entry.model).sort();
}

function inputRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function validateDemoInput(value: unknown): DemoValidationErrors {
  const input = inputRecord(value);
  const errors: DemoValidationErrors = {};
  const year = typeof input.year === "string" ? input.year : "";
  const make = typeof input.make === "string" ? input.make : "";
  const model = typeof input.model === "string" ? input.model : "";
  if (numericYear(year) === null) errors.year = "Select a year in the demo catalog.";
  if (!getMakesForYear(year).includes(make)) errors.make = "Select a make available for this year.";
  if (!getModelsForYearMake(year, make).includes(model)) errors.model = "Select a model available for this year and make.";
  // Validate strictly before calling the production helper, which normalizes ZIPs.
  if (typeof input.zip !== "string" || !/^\d{5}$/.test(input.zip)) errors.zip = "Enter a five-digit ZIP code.";
  if (!["under100k", "100to150k", "over150k"].includes(input.mileage as string)) errors.mileage = "Select a mileage range.";
  if (!["runs", "does_not_run", "not_sure"].includes(input.running as string)) errors.running = "Select whether the vehicle runs.";
  if (!["good", "minor_damage", "major_damage"].includes(input.condition as string)) errors.condition = "Select the vehicle condition.";
  if (!["owner_with_title", "owner_without_title", "authorized_seller", "not_sure"].includes(input.ownership as string)) errors.ownership = "Select the ownership and title status.";
  return errors;
}

const mileageAdjustment: Record<DemoMileage, number> = { under100k: 1.12, "100to150k": 1, over150k: 0.78 };
const conditionAdjustment: Record<DemoCondition, number> = { good: 1, minor_damage: 0.82, major_damage: 0.54 };

const mileageFactors: Record<DemoMileage, string> = {
  under100k: "Under 100,000 miles increases the fictional range.",
  "100to150k": "100,000–150,000 miles uses the standard demo mileage adjustment.",
  over150k: "Over 150,000 miles lowers the fictional range.",
};
const conditionFactors: Record<DemoCondition, string> = {
  good: "Good condition uses the standard demo condition adjustment.",
  minor_damage: "Minor damage lowers the fictional range.",
  major_damage: "Major damage lowers the fictional range further.",
};

export function getDemoEstimate(value: unknown): DemoEstimate {
  const errors = validateDemoInput(value);
  if (Object.keys(errors).length) return { status: "invalid", errors };
  const input = value as DemoInput;
  const vehicle = `${input.year} ${input.make} ${input.model}`;
  const factors = [`Sample vehicle: ${vehicle}. All dollar values are fictional.`];
  if (!isServiceAreaZip(input.zip)) {
    return { status: "out-of-area", zip: input.zip, factors: [...factors, "This ZIP is outside the current pickup service area."] };
  }
  const reasons: string[] = [];
  if (input.running === "not_sure") reasons.push("Whether the vehicle runs needs clarification.");
  if (input.ownership === "not_sure") reasons.push("Ownership and title details need clarification.");
  if (reasons.length) return { status: "manual-review", reasons, factors };

  const entry = DEMO_CATALOG.find((item) => item.make === input.make && item.model === input.model)!;
  const mileage = input.mileage as DemoMileage;
  const condition = input.condition as DemoCondition;
  // Invented demo rules: 4% per model year around 2014, 42% off for non-running,
  // and 12% off for missing title. Known ownership without title still gets a
  // fictional range; only uncertain ownership/running takes the review branch.
  const yearAdjustment = 1 + (Number(input.year) - 2014) * 0.04;
  const runningAdjustment = input.running === "does_not_run" ? 0.58 : 1;
  const titleAdjustment = input.ownership === "owner_without_title" ? 0.88 : 1;
  const midpoint = entry.fictionalBase * yearAdjustment * mileageAdjustment[mileage]
    * conditionAdjustment[condition] * runningAdjustment * titleAdjustment;
  const lower = Math.max(50, Math.round(midpoint * 0.88 / 50) * 50);
  const upper = Math.max(lower + 50, Math.round(midpoint * 1.12 / 50) * 50);
  factors.push(
    mileageFactors[mileage],
    input.running === "does_not_run" ? "A non-running vehicle gets a lower fictional range." : "The running selection uses the standard demo adjustment.",
    conditionFactors[condition],
    input.ownership === "owner_without_title"
      ? "A missing title lowers this fictional range and needs paperwork follow-up."
      : input.ownership === "authorized_seller"
        ? "You selected permission from the owner; authorization would need confirmation."
        : "You selected ownership with a title available.",
  );
  return { status: "range", lower, upper, factors };
}

const sedanInput: DemoInput = {
  ...DEMO_VEHICLE, zip: "92154", mileage: "100to150k", running: "runs", condition: "good", ownership: "owner_with_title",
};

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  {
    id: "running-sedan", title: "Running sedan", description: "A running sedan with a title, using fictional values.",
    input: { ...sedanInput },
  },
  {
    id: "non-running", title: "Non-running with damage", description: "The same sample vehicle with higher mileage and major damage gives a lower fictional range.",
    input: { ...sedanInput, mileage: "over150k", running: "does_not_run", condition: "major_damage" },
  },
  {
    id: "title-review", title: "Ownership needs review", description: "Uncertain ownership or running status leads to review instead of a dollar range.",
    input: { ...sedanInput, running: "not_sure", ownership: "not_sure" },
  },
];
