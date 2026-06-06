import type { Locale } from "./dictionaries";

export const incorporatedCityGroupIds = [
  "north-county-coastal",
  "north-county-inland",
  "central-metro",
  "east-south-county",
];

export function toLocationSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLocationPath(locale: Locale, name: string) {
  const slug = toLocationSlug(name);
  return locale === "es"
    ? `/es/san-diego-county/${slug}`
    : `/san-diego-county/${slug}`;
}

export function getIncorporatedCitiesPath(locale: Locale) {
  return locale === "es" ? "/es/ciudades-incorporadas" : "/incorporated-cities";
}

export function getSanDiegoCountyPath(locale: Locale) {
  return locale === "es" ? "/es/san-diego-county" : "/san-diego-county";
}
