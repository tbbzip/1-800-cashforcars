import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationPageTemplate } from "../../../components/location-page-template";
import { getDictionary } from "../../../dictionaries";
import {
  getLocationPageBySlug,
  getLocationPageContent,
  getLocationPages,
} from "../../../location-pages";
import { getLocationPath } from "../../../location-paths";
import { createPageMetadata } from "../../../seo";

type PageProps = {
  params: Promise<{
    location: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocationPages().map((page) => ({
    location: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { location } = await params;
  const page = getLocationPageBySlug(location);

  if (!page) {
    return {};
  }

  const content = getLocationPageContent(page, "en");

  return createPageMetadata({
    locale: "en",
    title: content.metaTitle,
    description: content.metaDescription,
    path: getLocationPath("en", page.name),
    alternates: {
      canonical: getLocationPath("en", page.name),
      languages: {
        en: getLocationPath("en", page.name),
        es: getLocationPath("es", page.name),
      },
    },
  });
}

export default async function EnglishLocationPage({ params }: PageProps) {
  const { location } = await params;
  const page = getLocationPageBySlug(location);

  if (!page) {
    notFound();
  }

  return (
    <LocationPageTemplate
      page={page}
      content={getLocationPageContent(page, "en")}
      dictionary={getDictionary("en")}
      locale="en"
    />
  );
}
