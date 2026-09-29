import type { Metadata } from "next";
import { getDictionary, getPrivacyPath } from "../../dictionaries";
import { PrivacyPolicy } from "../../components/privacy-policy";
import { createPageMetadata } from "../../seo";

export const metadata: Metadata = createPageMetadata({
  locale: "en",
  title: "Privacy Policy | Cash For Cars San Diego",
  description: "How 1-800 Cash for Cars collects, uses, and shares information from offer requests and visits to our website.",
  path: getPrivacyPath("en"),
  alternates: {
    canonical: getPrivacyPath("en"),
    languages: {
      en: getPrivacyPath("en"),
      es: getPrivacyPath("es"),
    },
  },
});

export default function EnglishPrivacyPage() {
  return <PrivacyPolicy dictionary={getDictionary("en")} locale="en" />;
}
