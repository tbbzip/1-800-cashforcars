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

  const content = getLocationPageContent(page, "es");

  return createPageMetadata({
    locale: "es",
    title: content.metaTitle,
    description: content.metaDescription,
    path: getLocationPath("es", page.name),
    alternates: {
      canonical: getLocationPath("es", page.name),
      languages: {
        en: getLocationPath("en", page.name),
        es: getLocationPath("es", page.name),
      },
    },
  });
}

export default async function SpanishLocationPage({ params }: PageProps) {
  const { location } = await params;
  const page = getLocationPageBySlug(location);

  if (!page) {
    notFound();
  }

  return (
    <LocationPageTemplate
      page={page}
      content={getLocationPageContent(page, "es")}
      dictionary={getDictionary("es")}
      locale="es"
    />
  );
}
