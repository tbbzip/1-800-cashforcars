import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getOfferPath } from "../dictionaries";
import {
  internalPageImages,
  mascotImages,
  type SiteImageAsset,
} from "../image-assets";
import {
  getInternalPage,
  getInternalPath,
  type ImagePlaceholder,
  type InternalPageContent,
} from "../internal-pages";
import { SiteFooter } from "./site-footer";
import { SiteNavigation } from "./site-navigation";

const PHONE_NUMBER = "619-830-7005";
const PHONE_HREF = "tel:16198307005";

function labelsFor(locale: Locale) {
  return locale === "es"
    ? {
        appliedImage: "Imagen aplicada",
        imageLabel: "Imagen recomendada",
        imageNotes: "Notas de imagen",
        altLabel: "Texto alt",
        quickFacts: "Puntos rápidos",
        onThisPage: "En esta página",
        faqs: "Preguntas frecuentes",
        related: "Páginas relacionadas",
        primaryCta: "Obtén tu oferta",
        phoneCta: `Llama al ${PHONE_NUMBER}`,
        ctaTitle: "¿Listo para revisar tu carro?",
        ctaBody:
          "Empieza con una oferta en línea o llámanos para revisar los detalles antes de avanzar.",
      }
    : {
        appliedImage: "Image in use",
        imageLabel: "Recommended image",
        imageNotes: "Image notes",
        altLabel: "Alt text",
        quickFacts: "Quick facts",
        onThisPage: "On this page",
        faqs: "Frequently asked questions",
        related: "Related pages",
        primaryCta: "Get my offer",
        phoneCta: `Call ${PHONE_NUMBER}`,
        ctaTitle: "Ready to review your car?",
        ctaBody:
          "Start with an online offer or call us to review the details before you move forward.",
      };
}

function PageImageCard({
  asset,
  image,
  compact = false,
  locale,
}: {
  asset?: SiteImageAsset;
  image: ImagePlaceholder;
  compact?: boolean;
  locale: Locale;
}) {
  const labels = labelsFor(locale);
  const imageTitle = asset ? asset.title[locale] : image.title;
  const imageDescription = asset ? asset.description[locale] : image.description;

  return (
    <aside
      className={`overflow-hidden rounded-[22px] border bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)] ${
        asset ? "border-slate-200" : "border-dashed border-[#bde9c9]"
      }`}
    >
      {asset ? (
        <div
          className={`relative ${
            compact ? "h-[230px]" : "h-[320px] sm:h-[360px]"
          } ${asset.kind === "mascot" ? "bg-[#ecfdf1]" : "bg-slate-100"}`}
        >
          <Image
            src={asset.src}
            alt={image.alt || asset.alt[locale]}
            fill
            sizes={
              compact
                ? "(max-width: 1024px) 100vw, 320px"
                : "(max-width: 1024px) 100vw, 580px"
            }
            className={
              asset.fit === "contain"
                ? "object-contain p-5 drop-shadow-[0_18px_24px_rgba(15,23,42,0.14)]"
                : "object-cover"
            }
            style={asset.position ? { objectPosition: asset.position } : undefined}
          />
        </div>
      ) : (
        <div className="bg-[#ecfdf1] p-5">
          <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-[#bde9c9] bg-white text-center text-sm font-black text-[#228b40]">
            {labels.imageLabel}
          </div>
        </div>
      )}

      <div className={compact ? "p-4" : "p-5"}>
        <p className="text-xs font-black uppercase text-[#228b40]">
          {asset ? labels.appliedImage : labels.imageLabel}
        </p>
        <h3 className="mt-1 text-base font-black text-slate-950">
          {imageTitle}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {imageDescription}
        </p>
        <div className="mt-4 rounded-2xl border border-[#bde9c9] bg-[#ecfdf1] p-3">
          <p className="text-xs font-black uppercase text-slate-500">
            {asset ? labels.imageNotes : labels.altLabel}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
            {image.alt}
          </p>
        </div>
      </div>
    </aside>
  );
}

function CtaRow({
  locale,
  dictionary,
  dark = false,
}: {
  locale: Locale;
  dictionary: Dictionary;
  dark?: boolean;
}) {
  const labels = labelsFor(locale);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={getOfferPath(locale)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2fad50] px-6 text-sm font-extrabold text-white shadow-[0_16px_28px_rgba(47,173,80,0.24)] transition hover:bg-[#279746]"
      >
        {labels.primaryCta}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
      <a
        href={PHONE_HREF}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition ${
          dark
            ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
            : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
        }`}
      >
        <PhoneCall aria-hidden="true" className="h-4 w-4 text-[#2fad50]" />
        {dictionary.hero.callCta || labels.phoneCta}
      </a>
    </div>
  );
}

export function InternalPageTemplate({
  page,
  dictionary,
  locale,
}: {
  page: InternalPageContent;
  dictionary: Dictionary;
  locale: Locale;
}) {
  const labels = labelsFor(locale);
  const imageSet = internalPageImages[page.key];

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <SiteNavigation dictionary={dictionary} locale={locale} />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bde9c9] bg-[#ecfdf1] px-3 py-2 text-xs font-extrabold uppercase text-[#228b40]">
              <BadgeDollarSign aria-hidden="true" className="h-4 w-4" />
              {page.eyebrow}
            </div>
            <h1 className="text-4xl font-black leading-[1.05] text-slate-950 sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              {page.intro}
            </p>
            <div className="mt-7">
              <CtaRow dictionary={dictionary} locale={locale} />
            </div>
          </div>

          <PageImageCard
            asset={imageSet.hero}
            image={page.heroImage}
            locale={locale}
          />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto grid max-w-[1160px] gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <p className="text-sm font-black uppercase text-[#2fad50]">
              {labels.onThisPage}
            </p>
            <div className="mt-4 grid gap-2">
              {page.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-[#bde9c9] hover:text-[#228b40]"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <p className="text-sm font-black uppercase text-[#2fad50]">
              {labels.quickFacts}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {page.quickFacts.map((fact) => (
                <div key={fact} className="flex gap-3">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#2fad50]"
                  />
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-6">
          {page.sections.map((section, index) => {
            const sectionAsset = imageSet.sections[section.id];
            const sectionImage = section.image ?? {
              alt: sectionAsset?.alt[locale] ?? page.heroImage.alt,
              description:
                sectionAsset?.description[locale] ?? page.heroImage.description,
              title: sectionAsset?.title[locale] ?? page.heroImage.title,
            };

            return (
              <article
                id={section.id}
                key={section.id}
                className="scroll-mt-32 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-7"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
                  <div>
                    {section.eyebrow ? (
                      <p className="text-sm font-black uppercase text-[#2fad50]">
                        {section.eyebrow}
                      </p>
                    ) : null}
                    <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-4 grid gap-4">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-base leading-8 text-slate-600"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets ? (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {section.bullets.map((bullet) => (
                          <div key={bullet} className="flex gap-3">
                            <CheckCircle2
                              aria-hidden="true"
                              className="mt-0.5 h-5 w-5 shrink-0 text-[#2fad50]"
                            />
                            <p className="text-sm font-bold leading-6 text-slate-700">
                              {bullet}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {sectionAsset || section.image ? (
                    <PageImageCard
                      asset={sectionAsset}
                      image={sectionImage}
                      locale={locale}
                      compact
                    />
                  ) : (
                    <div className="hidden rounded-[22px] border border-slate-200 bg-[#f8fafc] p-5 lg:block">
                      <p className="text-xs font-black uppercase text-slate-500">
                        {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {page.title}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-12 text-white sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-[1160px] gap-6 lg:grid-cols-[0.78fr_0.42fr_0.8fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black leading-tight">
              {labels.ctaTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              {labels.ctaBody}
            </p>
          </div>
          <div className="hidden lg:block">
            <Image
              src={mascotImages.pointingCash.src}
              alt={mascotImages.pointingCash.alt[locale]}
              width={mascotImages.pointingCash.width}
              height={mascotImages.pointingCash.height}
              className="mx-auto max-h-[210px] w-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.3)]"
            />
          </div>
          <div className="lg:justify-self-end">
            <CtaRow dictionary={dictionary} locale={locale} dark />
          </div>
        </div>
      </section>

      <section
        id="faqs"
        className="mx-auto max-w-[1160px] scroll-mt-32 px-5 py-12 sm:px-8 lg:py-16"
      >
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#2fad50]">
              {labels.faqs}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">
              {page.title}
            </h2>
          </div>
          <div className="grid gap-3">
            {page.faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-[18px] border border-slate-200 bg-white p-5"
              >
                <h3 className="text-base font-black text-slate-950">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[1160px]">
          <p className="text-sm font-extrabold uppercase text-[#2fad50]">
            {labels.related}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {page.related.map((key) => {
              const related = getInternalPage(locale, key);
              return (
                <Link
                  key={key}
                  href={getInternalPath(locale, key)}
                  className="rounded-[18px] border border-slate-200 bg-[#f8fafc] p-5 transition hover:border-[#bde9c9] hover:bg-[#ecfdf1]"
                >
                  <h3 className="text-lg font-black text-slate-950">
                    {related.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {related.metaDescription}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
