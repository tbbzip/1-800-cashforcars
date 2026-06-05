import type { Metadata } from "next";
import { getDictionary } from "../../dictionaries";
import { OfferFlow } from "../../components/offer-flow";
import { createPageMetadata } from "../../seo";

const dictionary = getDictionary("es");

export const metadata: Metadata = createPageMetadata({
  locale: "es",
  title: dictionary.offerFlow.metaTitle,
  description: dictionary.meta.description,
  path: "/es/oferta",
  alternates: {
    canonical: "/es/oferta",
    languages: {
      en: "/offer",
      es: "/es/oferta",
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
    <OfferFlow
      dictionary={dictionary}
      initialVin={params.vin ?? ""}
      locale="es"
    />
  );
}
