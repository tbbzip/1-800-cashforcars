import type { Metadata } from "next";
import { getDictionary } from "../../dictionaries";
import { OfferFlow } from "../../components/offer-flow";

const dictionary = getDictionary("es");

export const metadata: Metadata = {
  title: dictionary.offerFlow.metaTitle,
  description: dictionary.meta.description,
  alternates: {
    canonical: "/es/oferta",
    languages: {
      en: "/offer",
      es: "/es/oferta",
    },
  },
};

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
