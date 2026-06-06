import type { Metadata } from "next";
import type { Locale } from "./dictionaries";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

export const metadataBase = new URL(
  siteUrl
    ? siteUrl.startsWith("http")
      ? siteUrl
      : `https://${siteUrl}`
    : "http://localhost:3000",
);

export const siteName = "Cash For Cars San Diego";

export const socialImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 631,
  alt: "Cash For Cars San Diego County cash offer mascot",
};

export function absoluteUrl(path = "/") {
  return new URL(path, metadataBase).toString();
}

function normalizeLanguageAlternates(
  alternates: NonNullable<Metadata["alternates"]>,
) {
  const languages = alternates.languages;

  if (!languages) {
    return alternates;
  }

  const englishPath = languages.en ?? languages["en-US"];
  const spanishPath = languages.es ?? languages["es-US"];

  if (!englishPath || !spanishPath) {
    return alternates;
  }

  return {
    ...alternates,
    languages: {
      "en-US": englishPath,
      "es-US": spanishPath,
      "x-default": englishPath,
    },
  };
}

export function createPageMetadata({
  locale,
  title,
  description,
  path,
  alternates,
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  alternates: NonNullable<Metadata["alternates"]>;
}): Metadata {
  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      type: "website",
      locale: locale === "es" ? "es_US" : "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: "/twitter-image.jpg",
          alt: socialImage.alt,
        },
      ],
    },
    alternates: normalizeLanguageAlternates(alternates),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
