import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import { locales, type Locale } from "./locale-paths";

export { locales, getLocalePath, getOfferPath, getPrivacyPath, type Locale } from "./locale-paths";
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
