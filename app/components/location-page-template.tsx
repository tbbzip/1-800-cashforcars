import Image from "next/image";
import Link from "next/link";
import {
  BadgeDollarSign,
  CarFront,
  CheckCircle2,
  FileCheck2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getLocalePath, getOfferPath } from "../dictionaries";
import { mascotImages } from "../image-assets";
import type { LocationPageContent, LocationPageRecord } from "../location-pages";
import { getLocationPath, getSanDiegoCountyPath } from "../location-paths";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createLocalBusinessJsonLd,
  createSchemaGraph,
  jsonLdScriptProps,
} from "../structured-data";
import { SiteFooter } from "./site-footer";
import { SiteNavigation } from "./site-navigation";
import { VehicleLookupForm } from "./vehicle-lookup-form";
import { VehicleShowcaseMarquee } from "./vehicle-showcase-marquee";

const phoneHref = "tel:16198307005";
const detailIcons = [BadgeDollarSign, Truck, FileCheck2];

function localizedLabels(locale: Locale) {
  return locale === "es"
    ? {
        startTitle: "Empieza con tu VIN",
        startBody:
          "Busca el carro primero. Después revisamos condición, título, acceso y pickup para esta área.",
        detailsEyebrow: "Detalles locales",
        detailsTitle: "Una página específica para vender tu carro aquí.",
        detailsBody:
          "Cada área tiene detalles diferentes de acceso, estacionamiento, talleres y timing. Esta página mantiene la información enfocada en la ubicación.",
        faqEyebrow: "Preguntas locales",
        nearbyEyebrow: "Cerca de esta área",
        overviewLink: "Ver San Diego County",
        primaryCta: "Obtén tu oferta",
      }
    : {
        startTitle: "Start with your VIN",
        startBody:
          "Look up the vehicle first. Then we review condition, title, access, and pickup for this specific area.",
        detailsEyebrow: "Local details",
        detailsTitle: "A page built for selling your car here.",
        detailsBody:
          "Every area has different access, parking, shop, and timing details. This page keeps the information focused on the location.",
        faqEyebrow: "Local questions",
        nearbyEyebrow: "Nearby areas",
        overviewLink: "View San Diego County",
        primaryCta: "Get my offer",
      };
}

export function LocationPageTemplate({
  content,
  dictionary,
  locale,
  page,
}: {
  content: LocationPageContent;
  dictionary: Dictionary;
  locale: Locale;
  page: LocationPageRecord;
}) {
  const labels = localizedLabels(locale);
  const offerPath = getOfferPath(locale);
  const pagePath = getLocationPath(locale, page.name);
  const structuredData = createSchemaGraph([
    createLocalBusinessJsonLd({
      description: content.metaDescription,
      locale,
      path: pagePath,
      areaServed: {
        "@type": page.kind === "city" ? "City" : "Place",
        name: page.kind === "city" ? page.name : `${page.name}, San Diego`,
      },
    }),
    createBreadcrumbJsonLd([
      {
        name: locale === "es" ? "Inicio" : "Home",
        path: getLocalePath(locale),
      },
      {
        name: "San Diego County",
        path: getSanDiegoCountyPath(locale),
      },
      {
        name: page.name,
        path: pagePath,
      },
    ]),
    createFaqJsonLd(content.faq),
  ]);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScriptProps(structuredData)}
      />
      <SiteNavigation dictionary={dictionary} locale={locale} />

      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto min-h-[calc(100vh-120px)] max-w-[1160px] px-5 py-8 sm:px-8 lg:min-h-[calc(100vh-160px)] lg:py-7">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(430px,1.08fr)] lg:gap-x-12 lg:gap-y-4">
            <div className="order-1 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bde9c9] bg-white px-3 py-2 text-xs font-extrabold uppercase text-[#228b40] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {content.badge}
              </div>
              <h1 className="text-4xl font-black leading-[1.05] text-slate-950 sm:text-5xl lg:text-[58px]">
                {content.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
                {content.intro}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={offerPath}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2fad50] px-6 text-sm font-extrabold text-white shadow-[0_16px_28px_rgba(47,173,80,0.24)] transition hover:bg-[#279746]"
                >
                  {labels.primaryCta}
                </Link>
                <a
                  href={phoneHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-950 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:bg-slate-50"
                >
                  <PhoneCall
                    aria-hidden="true"
                    className="h-4 w-4 text-[#2fad50]"
                  />
                  {dictionary.hero.callCta}
                </a>
              </div>

              <div className="mt-5 grid gap-2 text-sm font-bold leading-6 text-slate-500 sm:grid-cols-2">
                {content.proofPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#2fad50]"
                    />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-3 relative mx-auto min-h-[360px] w-full max-w-[560px] lg:order-2 lg:min-h-[430px] lg:justify-self-end">
              <div className="absolute inset-x-7 bottom-6 top-8 rounded-[42px] border border-[#bde9c9] bg-[#ecfdf1] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
              <div className="absolute right-0 top-5 z-10 hidden max-w-[220px] rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_44px_rgba(15,23,42,0.12)] sm:block lg:right-2">
                <p className="text-sm font-black uppercase text-slate-950">
                  {dictionary.mascot.guideTitle}
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                  {content.routeNote}
                </p>
              </div>
              <div className="relative mx-auto max-w-[460px] px-2 pt-12 sm:max-w-[520px] sm:px-4 lg:max-w-[540px] lg:pt-8">
                <Image
                  src={mascotImages.homeHero.src}
                  alt={mascotImages.homeHero.alt[locale]}
                  width={mascotImages.homeHero.width}
                  height={mascotImages.homeHero.height}
                  priority
                  className="h-auto w-full drop-shadow-[0_28px_30px_rgba(15,23,42,0.18)]"
                />
              </div>
              <div className="absolute bottom-5 right-0 z-20 rounded-[20px] bg-slate-950 px-4 py-3 text-white shadow-[0_16px_36px_rgba(15,23,42,0.22)] sm:right-4 lg:-right-4">
                <p className="text-xs font-black uppercase text-[#6ee28d]">
                  {dictionary.locations.serviceAreaLabel}
                </p>
                <p className="mt-1 text-sm font-black">{page.name}</p>
              </div>
            </div>

            <div
              id="get-offer"
              className="order-2 self-start rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-6 lg:order-3 lg:col-span-2"
            >
              <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                <div>
                  <p className="text-sm font-bold text-[#6ee28d]">
                    {dictionary.offerForm.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {labels.startTitle}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                    {labels.startBody}
                  </p>
                </div>
                <VehicleLookupForm
                  dictionary={dictionary}
                  locale={locale}
                  layout="wide"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <VehicleShowcaseMarquee dictionary={dictionary} locale={locale} />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1160px] px-5 py-14 sm:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#2fad50]">
                {labels.detailsEyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {labels.detailsTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {labels.detailsBody}
              </p>
            </div>

            <div className="grid gap-4">
              {content.sections.map((section, index) => {
                const Icon = detailIcons[index] ?? CarFront;

                return (
                  <article
                    key={section.title}
                    className="rounded-[22px] border border-slate-200 bg-[#f8fafc] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf1] text-[#228b40]">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950">
                          {section.title}
                        </h3>
                        <div className="mt-3 grid gap-3">
                          {section.body.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="text-sm font-semibold leading-7 text-slate-600"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {section.bullets ? (
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        {section.bullets.map((bullet) => (
                          <div key={bullet} className="flex gap-2">
                            <CheckCircle2
                              aria-hidden="true"
                              className="mt-0.5 h-4 w-4 shrink-0 text-[#2fad50]"
                            />
                            <p className="text-sm font-bold leading-6 text-slate-700">
                              {bullet}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-14 text-white sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#6ee28d]">
              {labels.faqEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              {content.title}
            </h2>
            <Link
              href={getSanDiegoCountyPath(locale)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-black text-slate-200 transition hover:border-[#6ee28d]/50 hover:text-white"
            >
              {labels.overviewLink}
            </Link>
          </div>
          <div className="grid gap-3">
            {content.faq.map((item) => (
              <article
                key={item.question}
                className="rounded-[18px] border border-white/10 bg-white/[0.06] p-5"
              >
                <h3 className="text-base font-black text-white">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {content.nearbyLinks.length > 0 ? (
        <section className="bg-white px-5 py-14 sm:px-8 lg:py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-sm font-extrabold uppercase text-[#2fad50]">
              {labels.nearbyEyebrow}
            </p>
            <div className="mt-2 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                  {content.nearbyTitle}
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {content.nearbyBody}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {content.nearbyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-slate-200 bg-[#f8fafc] px-4 py-2 text-sm font-black text-slate-700 transition hover:border-[#bde9c9] hover:bg-[#ecfdf1] hover:text-[#228b40]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-slate-200 bg-[#f6f8fb] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf1] text-[#228b40]">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-black text-slate-950">
                {content.routeNote}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {dictionary.hero.proofPoints[0]}.
              </p>
            </div>
          </div>
          <Link
            href={offerPath}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2fad50] px-6 text-sm font-extrabold text-white shadow-[0_16px_28px_rgba(47,173,80,0.24)] transition hover:bg-[#279746]"
          >
            {labels.primaryCta}
          </Link>
        </div>
      </section>

      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
