// Path helpers with no dictionary import, so client components can use them
// without bundling both language dictionaries into browser JavaScript.
export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export function getLocalePath(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}`;
}

export function getOfferPath(locale: Locale): string {
  return locale === "en" ? "/offer" : "/es/oferta";
}

export function getPrivacyPath(locale: Locale): string {
  return locale === "en" ? "/privacy" : "/es/privacidad";
}
