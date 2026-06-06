import type { Locale } from "./dictionaries";
import { getLocalePath } from "./dictionaries";
import { absoluteUrl, siteName } from "./seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const businessAddress = {
  "@type": "PostalAddress",
  streetAddress: "552 Alta Rd #4",
  addressLocality: "San Diego",
  addressRegion: "CA",
  postalCode: "92154",
  addressCountry: "US",
};

const defaultAreaServed = [
  {
    "@type": "AdministrativeArea",
    name: "San Diego County",
  },
];

export function jsonLdScriptProps(data: unknown) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function createSchemaGraph(items: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": items,
  };
}

export function createLocalBusinessJsonLd({
  areaServed = defaultAreaServed,
  description,
  locale,
  path,
}: {
  areaServed?: unknown;
  description: string;
  locale: Locale;
  path: string;
}) {
  return {
    "@type": "LocalBusiness",
    "@id": absoluteUrl("/#localbusiness"),
    name: siteName,
    alternateName: "Cash For Cars",
    description,
    url: absoluteUrl(path),
    telephone: "+1-619-830-7005",
    priceRange: "$$",
    logo: absoluteUrl("/logo.svg"),
    address: businessAddress,
    areaServed,
    availableLanguage:
      locale === "es" ? ["Spanish", "English"] : ["English", "Spanish"],
  };
}

export function createWebSiteJsonLd({
  description,
  locale,
}: {
  description: string;
  locale: Locale;
}) {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteName,
    description,
    url: absoluteUrl(getLocalePath(locale)),
    inLanguage: locale === "es" ? "es-US" : "en-US",
    publisher: {
      "@id": absoluteUrl("/#localbusiness"),
    },
  };
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createFaqJsonLd(items: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
