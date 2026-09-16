const VPIC_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 400;
const REQUEST_TIMEOUT_MS = 8000;

type MakeOption = { id: number; name: string };
type Options = { makes: MakeOption[] } | { models: string[] };
type CacheEntry = { value: Options; expiresAt: number };

const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<Options>>();

const makeDisplayNames: Record<string, string> = {
  BMW: "BMW",
  GMC: "GMC",
  MINI: "MINI",
  RAM: "Ram",
  MCLAREN: "McLaren",
  "MERCEDES-BENZ": "Mercedes-Benz",
  "ROLLS-ROYCE": "Rolls-Royce",
};

function displayMake(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  return (
    makeDisplayNames[name.toUpperCase()] ??
    name.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
  );
}

async function fetchResults(path: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(`${VPIC_BASE_URL}/${path}?format=json`, {
    // Cache only validated successful options below, never provider errors.
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error("Vehicle catalog is unavailable.");
  }

  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("Results" in data) ||
    !Array.isArray(data.Results) ||
    data.Results.some(
      (row) => !row || typeof row !== "object" || Array.isArray(row),
    )
  ) {
    throw new Error("Vehicle catalog returned an invalid response.");
  }

  return data.Results as Record<string, unknown>[];
}

async function getMakes(): Promise<Options> {
  // Vehicle types exclude motorcycles and trailers. Documentation:
  // https://vpic.nhtsa.dot.gov/api/#GetMakesForVehicleType
  const results = await Promise.all([
    fetchResults("GetMakesForVehicleType/car"),
    fetchResults("GetMakesForVehicleType/truck"),
  ]);
  const makes = new Map<number, MakeOption>();

  for (const row of results.flat()) {
    if (
      typeof row.MakeId !== "number" ||
      !Number.isSafeInteger(row.MakeId) ||
      row.MakeId <= 0 ||
      typeof row.MakeName !== "string" ||
      !row.MakeName.trim()
    ) {
      throw new Error("Vehicle catalog returned an invalid make.");
    }
    makes.set(row.MakeId, { id: row.MakeId, name: displayMake(row.MakeName) });
  }

  if (makes.size === 0) {
    throw new Error("Vehicle catalog returned no makes.");
  }

  return {
    makes: [...makes.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

async function getModels(year: number, makeId: number): Promise<Options> {
  // vPIC documents year-filtered model coverage beginning in 1996. An empty
  // list lets the UI offer manual model entry for older or unlisted vehicles.
  if (year < 1996) return { models: [] };

  const results = await fetchResults(
    `GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}`,
  );
  const models = new Map<string, string>();

  for (const row of results) {
    if (typeof row.Model_Name !== "string" || !row.Model_Name.trim()) {
      throw new Error("Vehicle catalog returned an invalid model.");
    }
    const name = row.Model_Name.trim().replace(/\s+/g, " ");
    models.set(name.toLocaleLowerCase("en-US"), name);
  }

  return { models: [...models.values()].sort((a, b) => a.localeCompare(b)) };
}

async function getCachedOptions(key: string, load: () => Promise<Options>) {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value;
  if (entry) cache.delete(key);

  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const request = load().then((value) => {
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  });
  pendingRequests.set(key, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(key);
  }
}

function invalidRequest(message: string) {
  return Response.json(
    { error: message },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const makeIdParam = searchParams.get("makeId");

  if (
    [...searchParams.keys()].some((key) => key !== "year" && key !== "makeId") ||
    searchParams.getAll("year").length > 1 ||
    searchParams.getAll("makeId").length > 1
  ) {
    return invalidRequest("Use only one year and one makeId parameter.");
  }

  if (yearParam !== null || makeIdParam !== null) {
    if (
      !yearParam ||
      !/^\d{4}$/.test(yearParam) ||
      Number(yearParam) < 1900 ||
      Number(yearParam) > new Date().getFullYear() + 1 ||
      !makeIdParam ||
      !/^[1-9]\d{0,5}$/.test(makeIdParam)
    ) {
      return invalidRequest("Provide a valid model year and make ID.");
    }
  }

  try {
    const options =
      yearParam !== null && makeIdParam !== null
        ? await getCachedOptions(`models:${yearParam}:${makeIdParam}`, () =>
            getModels(Number(yearParam), Number(makeIdParam)),
          )
        : await getCachedOptions("makes", getMakes);

    return Response.json(options, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "Vehicle options are unavailable right now. You can enter your vehicle details manually.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
