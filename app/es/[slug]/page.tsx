import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPageTemplate } from "../../components/internal-page-template";
import { getDictionary } from "../../dictionaries";
import {
  getInternalPageBySlug,
  getInternalPages,
  getInternalPath,
} from "../../internal-pages";
import { createPageMetadata } from "../../seo";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getInternalPages("es").map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getInternalPageBySlug("es", slug);

  if (!page) {
    return {};
  }

  return createPageMetadata({
    locale: "es",
    title: page.metaTitle,
    description: page.metaDescription,
    path: getInternalPath("es", page.key),
    alternates: {
      canonical: getInternalPath("es", page.key),
      languages: {
        en: getInternalPath("en", page.key),
        es: getInternalPath("es", page.key),
      },
    },
  });
}

export default async function SpanishInternalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getInternalPageBySlug("es", slug);

  if (!page) {
    notFound();
  }

  return (
    <InternalPageTemplate
      page={page}
      dictionary={getDictionary("es")}
      locale="es"
    />
  );
}
