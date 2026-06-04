import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];
export type Dictionary = typeof en;

const dictionaries = {
  en,
  es,
} satisfies Record<Locale, Dictionary>;

export function hasLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "es" ? "en" : "es";
}

export function getLocalePath(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}`;
}

export function getOfferPath(locale: Locale): string {
  return locale === "en" ? "/offer" : "/es/oferta";
}
