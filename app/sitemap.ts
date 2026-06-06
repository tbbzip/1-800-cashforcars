import type { MetadataRoute } from "next";
import { absoluteUrl } from "./seo";
import { getSiteRoutes } from "./site-routes";

const lastModified = new Date("2026-06-06T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return getSiteRoutes().map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        "en-US": absoluteUrl(route.alternates.en),
        "es-US": absoluteUrl(route.alternates.es),
        "x-default": absoluteUrl(route.alternates.en),
      },
    },
  }));
}
