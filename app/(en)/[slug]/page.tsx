import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPageTemplate } from "../../components/internal-page-template";
import { getDictionary } from "../../dictionaries";
import {
  getInternalPageBySlug,
  getInternalPages,
  getInternalPath,
} from "../../internal-pages";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getInternalPages("en").map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getInternalPageBySlug("en", slug);

  if (!page) {
    return {};
  }

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: page.metaTitle,
      description: page.metaDescription,
    },
    alternates: {
      canonical: getInternalPath("en", page.key),
      languages: {
        en: getInternalPath("en", page.key),
        es: getInternalPath("es", page.key),
      },
    },
  };
}

export default async function EnglishInternalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getInternalPageBySlug("en", slug);

  if (!page) {
    notFound();
  }

  return (
    <InternalPageTemplate
      page={page}
      dictionary={getDictionary("en")}
      locale="en"
    />
  );
}
