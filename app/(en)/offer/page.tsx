import type { Metadata } from "next";
import { getDictionary } from "../../dictionaries";
import { OfferFlow } from "../../components/offer-flow";
import { createPageMetadata } from "../../seo";

const dictionary = getDictionary("en");

export const metadata: Metadata = createPageMetadata({
  locale: "en",
  title: dictionary.offerFlow.metaTitle,
  description: dictionary.meta.description,
  path: "/offer",
  alternates: {
    canonical: "/offer",
    languages: {
      en: "/offer",
      es: "/es/oferta",
    },
  },
});

export default async function OfferPage({
  searchParams,
}: {
  searchParams: Promise<{ vin?: string }>;
}) {
  const params = await searchParams;

  return (
    <OfferFlow
      dictionary={dictionary}
      initialVin={params.vin ?? ""}
      locale="en"
    />
  );
}
