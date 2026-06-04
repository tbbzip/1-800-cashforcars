import Image from "next/image";
import Link from "next/link";
import {
  BadgeDollarSign,
  CarFront,
  CircleHelp,
  FileCheck2,
  FileText,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getOfferPath } from "../dictionaries";
import { SiteFooter } from "./site-footer";
import { SiteNavigation } from "./site-navigation";
import { VehicleLookupForm } from "./vehicle-lookup-form";

const processIcons = [CarFront, BadgeDollarSign, Truck];
const localSeoIcons = [BadgeDollarSign, Wrench, Truck];
const carsWeBuyIcons = [CarFront, Wrench, Truck, ShieldCheck];
const titleHelpIcons = [FileText, FileCheck2, BadgeDollarSign, ShieldCheck];
const serviceAreaIcons = [MapPin, ShieldCheck, CarFront];

function toAreaId(area: string) {
  return area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function MascotImage({
  alt,
  className = "",
}: {
  alt: string;
  className?: string;
}) {
  return (
    <Image
      src="/racoon/racoon.svg"
      alt={alt}
      width={520}
      height={520}
      className={`h-auto w-full ${className}`}
      priority
    />
  );
}

export function LocalizedHome({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const offerPath = getOfferPath(locale);
  const businessStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Cash For Cars",
    description: dictionary.meta.description,
    telephone: "+1-619-830-7005",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "552 Alta Rd #4",
      addressLocality: "San Diego",
      addressRegion: "CA",
      postalCode: "92154",
      addressCountry: "US",
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "San Diego County",
      },
      ...dictionary.locations.areas.map((area) => ({
        "@type": "City",
        name: area,
      })),
    ],
    availableLanguage:
      locale === "es" ? ["Spanish", "English"] : ["English", "Spanish"],
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessStructuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <SiteNavigation dictionary={dictionary} locale={locale} />

      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto min-h-[calc(100vh-120px)] max-w-[1160px] px-5 py-8 sm:px-8 lg:min-h-[calc(100vh-160px)] lg:py-7">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(430px,1.08fr)] lg:gap-x-12 lg:gap-y-4">
            <div className="order-1 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bde9c9] bg-white px-3 py-2 text-xs font-extrabold uppercase text-[#228b40] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {dictionary.hero.badge}
              </div>
              <h1 className="text-4xl font-black leading-[1.05] text-slate-950 sm:text-5xl lg:text-[58px]">
                {dictionary.hero.headline}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
                {dictionary.hero.body}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={offerPath}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2fad50] px-6 text-sm font-extrabold text-white shadow-[0_16px_28px_rgba(47,173,80,0.24)] transition hover:bg-[#279746]"
                >
                  {dictionary.hero.primaryCta}
                </Link>
                <a
                  href="tel:16198307005"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-950 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:bg-slate-50"
                >
                  <PhoneCall
                    aria-hidden="true"
                    className="h-4 w-4 text-[#2fad50]"
                  />
                  {dictionary.hero.callCta}
                </a>
              </div>

              <p className="mt-5 hidden max-w-lg text-sm font-bold leading-6 text-slate-500 lg:block">
                {dictionary.hero.proofPoints[0]} /{" "}
                {dictionary.hero.proofPoints[2]}
              </p>
            </div>

            <div className="order-3 relative mx-auto min-h-[360px] w-full max-w-[560px] lg:order-2 lg:min-h-[430px] lg:justify-self-end">
              <div className="absolute inset-x-7 bottom-6 top-8 rounded-[42px] border border-[#bde9c9] bg-[#ecfdf1] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
              <div className="absolute right-0 top-5 z-10 hidden max-w-[220px] rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_44px_rgba(15,23,42,0.12)] sm:block lg:right-2">
                <p className="text-sm font-black uppercase text-slate-950">
                  {dictionary.mascot.guideTitle}
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                  {dictionary.mascot.guideBody}
                </p>
              </div>
              <div className="relative mx-auto max-w-[380px] px-5 pt-12 sm:max-w-[440px] sm:px-10 lg:max-w-[470px] lg:pt-3">
                <MascotImage
                  alt={dictionary.mascot.alt}
                  className="drop-shadow-[0_28px_30px_rgba(15,23,42,0.18)]"
                />
              </div>
              <div className="absolute bottom-5 right-0 z-20 rounded-[20px] bg-slate-950 px-4 py-3 text-white shadow-[0_16px_36px_rgba(15,23,42,0.22)] sm:right-4 lg:-right-4">
                <p className="text-xs font-black uppercase text-[#6ee28d]">
                  {dictionary.locations.serviceAreaLabel}
                </p>
                <p className="mt-1 text-sm font-black">San Diego County</p>
              </div>
              <div className="absolute left-8 top-16 hidden h-14 w-14 items-center justify-center rounded-2xl bg-[#f3b33d] text-slate-950 shadow-[0_16px_30px_rgba(243,179,61,0.28)] lg:flex">
                <CarFront aria-hidden="true" className="h-7 w-7" />
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
                  {dictionary.offerForm.title}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                  {dictionary.offerForm.body}
                </p>
              </div>
              <VehicleLookupForm
                dictionary={dictionary}
                locale={locale}
                layout="wide"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-400">
              <p>{dictionary.hero.proofPoints[1]}</p>
              <span aria-hidden="true">/</span>
              <p>{dictionary.hero.proofPoints[3]}</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section
        id="local-cash-for-cars"
        className="scroll-mt-32 border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-[1160px] px-5 py-14 sm:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#2fad50]">
                {dictionary.localSeo.eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {dictionary.localSeo.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {dictionary.localSeo.body}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {dictionary.localSeo.highlights.map((item, index) => {
                const Icon = localSeoIcons[index] ?? BadgeDollarSign;

                return (
                  <article
                    key={item.title}
                    className="rounded-[18px] border border-slate-200 bg-[#f8fafc] p-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf1] text-[#228b40]">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-black text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-32 border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-[1160px] px-5 py-14 sm:px-8 lg:py-16">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#2fad50]">
                {dictionary.process.eyebrow}
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {dictionary.process.title}
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-600">
              {dictionary.process.body}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {dictionary.process.steps.map((step, index) => {
              const Icon = processIcons[index] ?? CarFront;
              return (
                <article
                  key={step.title}
                  className="rounded-[20px] border border-slate-200 bg-[#f8fafc] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-white p-1">
                      <MascotImage
                        alt={dictionary.mascot.alt}
                        className="scale-[1.35]"
                      />
                    </div>
                  </div>
                  <p className="mt-5 text-xs font-black uppercase text-[#2fad50]">
                    {dictionary.process.stepLabel} {index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="cars-we-buy"
        className="scroll-mt-32 bg-[#f6f8fb] px-5 py-14 sm:px-8 lg:py-16"
      >
        <div className="mx-auto max-w-[1160px]">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#2fad50]">
                {dictionary.carsWeBuy.eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {dictionary.carsWeBuy.title}
              </h2>
            </div>
            <p className="text-base leading-7 text-slate-600">
              {dictionary.carsWeBuy.body}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dictionary.carsWeBuy.items.map((item, index) => {
              const Icon = carsWeBuyIcons[index] ?? CarFront;

              return (
                <article
                  id={item.id}
                  key={item.id}
                  className="scroll-mt-32 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ecfdf1] text-[#228b40]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="locations"
        className="mx-auto max-w-[1160px] scroll-mt-32 px-5 py-14 sm:px-8 lg:py-16"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3b33d] text-slate-950">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {dictionary.locations.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {dictionary.locations.body}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="grid gap-4 sm:grid-cols-[170px_1fr] sm:items-center">
              <div className="rounded-[20px] bg-[#ecfdf1] p-4">
                <MascotImage
                  alt={dictionary.mascot.alt}
                  className="mx-auto max-w-[150px]"
                />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-[#2fad50]">
                  {dictionary.locations.serviceAreaLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dictionary.locations.areas.map((area) => (
                    <span
                      id={toAreaId(area)}
                      key={area}
                      className="scroll-mt-32 rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="san-diego-service-areas"
        className="scroll-mt-32 bg-slate-950 px-5 py-14 text-white sm:px-8 lg:py-16"
      >
        <div className="mx-auto max-w-[1160px]">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#6ee28d]">
                {dictionary.serviceAreas.eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                {dictionary.serviceAreas.title}
              </h2>
            </div>
            <p className="text-base leading-7 text-slate-300">
              {dictionary.serviceAreas.body}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {dictionary.serviceAreas.items.map((item, index) => {
              const Icon = serviceAreaIcons[index] ?? MapPin;

              return (
                <article
                  key={item.title}
                  className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.16)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3b33d] text-slate-950">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="title-help"
        className="scroll-mt-32 border-y border-slate-200 bg-white px-5 py-14 sm:px-8 lg:py-16"
      >
        <div className="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#2fad50]">
              {dictionary.titleHelp.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {dictionary.titleHelp.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {dictionary.titleHelp.body}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {dictionary.titleHelp.items.map((item, index) => {
              const Icon = titleHelpIcons[index] ?? FileText;

              return (
                <article
                  id={item.id}
                  key={item.id}
                  className="scroll-mt-32 rounded-[18px] border border-slate-200 bg-[#f8fafc] p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-black text-slate-950">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="questions"
        className="mx-auto max-w-[1160px] scroll-mt-32 px-5 py-14 sm:px-8 lg:py-16"
      >
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2fad50] text-white">
              <CircleHelp aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm font-extrabold uppercase text-[#2fad50]">
              {dictionary.questions.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {dictionary.questions.title}
            </h2>
          </div>

          <div className="grid gap-3">
            {dictionary.questions.items.map((item) => (
              <article
                id={item.id}
                key={item.id}
                className="scroll-mt-32 rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
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

      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
