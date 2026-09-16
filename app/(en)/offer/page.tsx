import type { Metadata } from "next";
import { offerPrefill } from "../../offer-validation";
import { getDictionary, getLocalePath } from "../../dictionaries";
import { OfferFlow } from "../../components/offer-flow";
import { createPageMetadata } from "../../seo";
import {
  createBreadcrumbJsonLd,
  createLocalBusinessJsonLd,
  createSchemaGraph,
  jsonLdScriptProps,
} from "../../structured-data";

const dictionary = getDictionary("en");
const offerPath = "/offer";
const structuredData = createSchemaGraph([
  createLocalBusinessJsonLd({
    description: dictionary.offerFlow.metaDescription,
    locale: "en",
    path: offerPath,
  }),
  createBreadcrumbJsonLd([
    {
      name: "Home",
      path: getLocalePath("en"),
    },
    {
      name: "Get a Cash Offer",
      path: offerPath,
    },
  ]),
]);

export const metadata: Metadata = createPageMetadata({
  locale: "en",
  title: dictionary.offerFlow.metaTitle,
  description: dictionary.offerFlow.metaDescription,
  path: offerPath,
  alternates: {
    canonical: offerPath,
    languages: {
      en: offerPath,
      es: "/es/oferta",
    },
  },
});

export default async function OfferPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = offerPrefill(params);
  const previewSuccess =
    process.env.NODE_ENV !== "production" && params.successPreview === "1";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScriptProps(structuredData)}
      />
      <OfferFlow
        key={JSON.stringify(initial)}
        dictionary={dictionary}
        {...initial}
        locale="en"
        previewSuccess={previewSuccess}
      />
    </>
  );
}
