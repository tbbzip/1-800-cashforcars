import type { MetadataRoute } from "next";
import { getOfferPath } from "./dictionaries";
import { getInternalPages, getInternalPath } from "./internal-pages";
import { getLocationPages } from "./location-pages";
import { getLocationPath } from "./location-paths";

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

export type SiteRoute = {
  path: string;
  alternates: {
    en: string;
    es: string;
  };
  changeFrequency: ChangeFrequency;
  priority: number;
};

function localizedRoute({
  changeFrequency,
  en,
  es,
  priority,
}: {
  changeFrequency: ChangeFrequency;
  en: string;
  es: string;
  priority: number;
}) {
  return [
    {
      path: en,
      alternates: { en, es },
      changeFrequency,
      priority,
    },
    {
      path: es,
      alternates: { en, es },
      changeFrequency,
      priority: Math.max(priority - 0.02, 0.1),
    },
  ] satisfies SiteRoute[];
}

function internalRoutes() {
  return getInternalPages("en").flatMap((page) =>
    localizedRoute({
      en: getInternalPath("en", page.key),
      es: getInternalPath("es", page.key),
      changeFrequency: "monthly",
      priority: page.key === "sanDiegoCounty" ? 0.88 : 0.82,
    }),
  );
}

function locationRoutes() {
  return getLocationPages().flatMap((page) =>
    localizedRoute({
      en: getLocationPath("en", page.name),
      es: getLocationPath("es", page.name),
      changeFrequency: "monthly",
      priority: page.kind === "city" ? 0.78 : 0.74,
    }),
  );
}

export function getSiteRoutes(): SiteRoute[] {
  return [
    ...localizedRoute({
      en: "/",
      es: "/es",
      changeFrequency: "weekly",
      priority: 1,
    }),
    ...localizedRoute({
      en: getOfferPath("en"),
      es: getOfferPath("es"),
      changeFrequency: "weekly",
      priority: 0.92,
    }),
    ...internalRoutes(),
    ...locationRoutes(),
  ];
}
