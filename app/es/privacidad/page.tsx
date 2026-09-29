import type { Metadata } from "next";
import { getDictionary, getPrivacyPath } from "../../dictionaries";
import { PrivacyPolicy } from "../../components/privacy-policy";
import { createPageMetadata } from "../../seo";

export const metadata: Metadata = createPageMetadata({
  locale: "es",
  title: "Política de privacidad | Cash For Cars San Diego",
  description: "Cómo 1-800 Cash for Cars recopila, usa y comparte la información de las solicitudes de oferta y las visitas a nuestro sitio.",
  path: getPrivacyPath("es"),
  alternates: {
    canonical: getPrivacyPath("es"),
    languages: {
      en: getPrivacyPath("en"),
      es: getPrivacyPath("es"),
    },
  },
});

export default function SpanishPrivacyPage() {
  return <PrivacyPolicy dictionary={getDictionary("es")} locale="es" />;
}
