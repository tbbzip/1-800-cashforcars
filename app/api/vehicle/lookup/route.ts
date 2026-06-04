const VPIC_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

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

function normalizeVin(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function cleanValue(value?: string) {
  return value && value !== "Not Applicable" ? value : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vin = normalizeVin(searchParams.get("vin") ?? "");

  if (!vin) {
    return Response.json({ error: "VIN is required." }, { status: 400 });
  }

  if (!VIN_PATTERN.test(vin)) {
    return Response.json(
      { error: "Enter a valid 17-character VIN without I, O, or Q." },
      { status: 400 },
    );
  }

  const response = await fetch(
    `${VPIC_BASE_URL}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`,
    { next: { revalidate: 86400 } },
  );

  if (!response.ok) {
    return Response.json(
      { error: "Vehicle lookup is unavailable right now." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as { Results?: VpicDecodeResult[] };
  const result = data.Results?.[0];

  if (!result?.Make && !result?.Model && !result?.ModelYear) {
    return Response.json(
      { error: "We could not decode that VIN. Please check it and try again." },
      { status: 404 },
    );
  }

  return Response.json({
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
  });
}
