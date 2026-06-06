export const serviceAreaPhone = "619-830-7005";

export const serviceAreaPhoneHref = "tel:16198307005";

export const serviceAreaTextHref = "sms:+16198307005";

export const referralEmail = "referrals@1-800-cashforcars.com";

export const referralEmailHref = `mailto:${referralEmail}`;

export const allowedServiceAreaZips = [
  "91901",
  "91903",
  "91910",
  "91911",
  "91913",
  "91914",
  "91915",
  "91932",
  "91941",
  "91942",
  "91945",
  "91950",
  "92008",
  "92009",
  "92010",
  "92011",
  "92014",
  "92019",
  "92020",
  "92021",
  "92024",
  "92025",
  "92026",
  "92027",
  "92029",
  "92037",
  "92038",
  "92039",
  "92054",
  "92055",
  "92056",
  "92057",
  "92058",
  "92064",
  "92069",
  "92071",
  "92072",
  "92075",
  "92078",
  "92079",
  "92081",
  "92083",
  "92084",
  "92092",
  "92093",
  "92101",
  "92102",
  "92103",
  "92104",
  "92105",
  "92106",
  "92107",
  "92108",
  "92109",
  "92110",
  "92111",
  "92113",
  "92114",
  "92115",
  "92116",
  "92117",
  "92119",
  "92120",
  "92121",
  "92122",
  "92123",
  "92124",
  "92126",
  "92127",
  "92128",
  "92129",
  "92130",
  "92131",
  "92139",
  "92154",
] as const;

const serviceAreaZipSet = new Set<string>(allowedServiceAreaZips);

export function normalizeZip(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function isServiceAreaZip(value: string) {
  return serviceAreaZipSet.has(normalizeZip(value));
}
