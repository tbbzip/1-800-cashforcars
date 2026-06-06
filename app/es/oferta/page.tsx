import type { Metadata } from "next";
import { getDictionary, getLocalePath } from "../../dictionaries";
import { OfferFlow } from "../../components/offer-flow";
import { createPageMetadata } from "../../seo";
import {
  createBreadcrumbJsonLd,
  createLocalBusinessJsonLd,
  createSchemaGraph,
  jsonLdScriptProps,
} from "../../structured-data";

const dictionary = getDictionary("es");
const offerPath = "/es/oferta";
const structuredData = createSchemaGraph([
  createLocalBusinessJsonLd({
    description: dictionary.offerFlow.metaDescription,
    locale: "es",
    path: offerPath,
  }),
  createBreadcrumbJsonLd([
    {
      name: "Inicio",
      path: getLocalePath("es"),
    },
    {
      name: "Obtén una oferta",
      path: offerPath,
    },
  ]),
]);

export const metadata: Metadata = createPageMetadata({
  locale: "es",
  title: dictionary.offerFlow.metaTitle,
  description: dictionary.offerFlow.metaDescription,
  path: offerPath,
  alternates: {
    canonical: offerPath,
    languages: {
      en: "/offer",
      es: offerPath,
    },
  },
});

export default async function SpanishOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ vin?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScriptProps(structuredData)}
      />
      <OfferFlow
        dictionary={dictionary}
        initialVin={params.vin ?? ""}
        locale="es"
      />
    </>
  );
}
