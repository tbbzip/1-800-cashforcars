const VPIC_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const LOOKUP_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 400;

type VpicDecodeResult = {
  BodyClass?: string;
  DisplacementL?: string;
  DriveType?: string;
  EngineCylinders?: string;
  ErrorCode?: string;
  ErrorText?: string;
  FuelTypePrimary?: string;
  Make?: string;
  Manufacturer?: string;
  Model?: string;
  ModelYear?: string;
  Trim?: string;
  VehicleType?: string;
};

type LookupData = ReturnType<typeof createLookupData>;
const cache = new Map<string, { data: LookupData; expiresAt: number }>();
const pendingRequests = new Map<string, Promise<LookupData | null>>();

function normalizeVin(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function cleanValue(value?: unknown) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  return cleaned !== "Not Applicable" ? cleaned : "";
}

function errorResponse(error: string, status: number) {
  return Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function createLookupData(vin: string, result: VpicDecodeResult) {
  return {
    vehicle: {
      vin,
      year: cleanValue(result.ModelYear),
      make: cleanValue(result.Make),
      model: cleanValue(result.Model),
      trim: cleanValue(result.Trim),
      bodyClass: cleanValue(result.BodyClass),
      vehicleType: cleanValue(result.VehicleType),
      engineCylinders: cleanValue(result.EngineCylinders),
      displacement: cleanValue(result.DisplacementL),
      fuelType: cleanValue(result.FuelTypePrimary),
      driveType: cleanValue(result.DriveType),
      manufacturer: cleanValue(result.Manufacturer),
    },
    warning:
      result.ErrorCode && result.ErrorCode !== "0"
        ? cleanValue(result.ErrorText)
        : "",
    source: "NHTSA vPIC",
  };
}

async function decodeVin(vin: string): Promise<LookupData | null> {
  const response = await fetch(
    `${VPIC_BASE_URL}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`,
    {
      // Store only validated decoded vehicles below. A malformed HTTP 200
      // from the provider must not poison the fetch cache for the next day.
      cache: "no-store",
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error("Vehicle lookup is unavailable.");
  }

  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("Results" in data) ||
    !Array.isArray(data.Results)
  ) {
    throw new Error("Vehicle lookup returned an invalid response.");
  }

  const result = data.Results[0] as VpicDecodeResult | undefined;
  if (result && (typeof result !== "object" || Array.isArray(result))) {
    throw new Error("Vehicle lookup returned an invalid vehicle.");
  }

  if (
    !result ||
    (!cleanValue(result.Make) &&
      !cleanValue(result.Model) &&
      !cleanValue(result.ModelYear))
  ) {
    return null;
  }

  return createLookupData(vin, result);
}

async function getCachedLookup(vin: string) {
  const entry = cache.get(vin);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  if (entry) cache.delete(vin);

  const pending = pendingRequests.get(vin);
  if (pending) return pending;

  const request = decodeVin(vin).then((data) => {
    if (data) {
      if (cache.size >= MAX_CACHE_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
      cache.set(vin, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return data;
  });
  pendingRequests.set(vin, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(vin);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vin = normalizeVin(searchParams.get("vin") ?? "");

  if (!vin) {
    return errorResponse("VIN is required.", 400);
  }

  if (searchParams.getAll("vin").length > 1 || !VIN_PATTERN.test(vin)) {
    return errorResponse(
      "Enter one valid 17-character VIN without I, O, or Q.",
      400,
    );
  }

  try {
    const data = await getCachedLookup(vin);
    if (!data) {
      return errorResponse(
        "We could not decode that VIN. Please check it and try again.",
        404,
      );
    }

    return Response.json(data);
  } catch {
    return errorResponse("Vehicle lookup is unavailable right now.", 502);
  }
}
