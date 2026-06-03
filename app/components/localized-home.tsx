import Image from "next/image";
import {
  BadgeDollarSign,
  CarFront,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { SiteNavigation } from "./site-navigation";

const processIcons = [CarFront, BadgeDollarSign, Truck];
const proofIcons = [Clock3, CheckCircle2, MapPin, FileCheck2];

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
      width={420}
      height={420}
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
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <SiteNavigation dictionary={dictionary} locale={locale} />

      <section className="mx-auto grid min-h-[calc(100vh-120px)] max-w-[1160px] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:py-16">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bde9c9] bg-white px-3 py-2 text-xs font-extrabold uppercase text-[#228b40] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
            <MapPin aria-hidden="true" className="h-4 w-4" />
            {dictionary.hero.badge}
          </div>
          <h1 className="text-4xl font-black leading-[1.05] text-slate-950 sm:text-5xl lg:text-6xl">
            {dictionary.hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            {dictionary.hero.body}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#get-offer"
              className="inline-flex h-[52px] items-center justify-center rounded-xl bg-[#2fad50] px-7 text-base font-extrabold text-white shadow-[0_16px_28px_rgba(47,173,80,0.24)] transition hover:bg-[#279746]"
            >
              {dictionary.hero.primaryCta}
            </a>
            <a
              href="tel:16198307005"
              className="inline-flex h-[52px] items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-base font-extrabold text-slate-950 transition hover:bg-slate-50"
            >
              {dictionary.hero.callCta}
            </a>
          </div>

          <div className="mt-8 hidden gap-3 text-sm font-bold text-slate-700 sm:grid sm:grid-cols-2">
            {dictionary.hero.proofPoints.map((label, index) => {
              const Icon = proofIcons[index] ?? CheckCircle2;
              return (
                <div key={label} className="flex items-center gap-2">
                  <Icon aria-hidden="true" className="h-4 w-4 text-[#2fad50]" />
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.82fr_1fr] lg:items-end">
          <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,#2fad50_0%,#2fad50_42%,#f3b33d_42%,#f3b33d_58%,#0f172a_58%,#0f172a_100%)] opacity-95" />
            <div className="relative pt-12">
              <MascotImage
                alt={dictionary.mascot.alt}
                className="mx-auto max-w-[260px] drop-shadow-[0_18px_22px_rgba(15,23,42,0.18)]"
              />
              <div className="mt-3 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                <p className="text-sm font-black uppercase text-slate-950">
                  {dictionary.mascot.guideTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {dictionary.mascot.guideBody}
                </p>
              </div>
            </div>
          </div>

          <div
            id="get-offer"
            className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
          >
            <p className="text-sm font-bold text-[#6ee28d]">
              {dictionary.offerForm.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {dictionary.offerForm.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {dictionary.offerForm.body}
            </p>
            <div className="mt-6 grid gap-3">
              <div className="h-12 rounded-xl border border-white/10 bg-white/12" />
              <div className="h-12 rounded-xl border border-white/10 bg-white/12" />
              <div className="flex h-12 items-center justify-center rounded-xl bg-[#2fad50] text-sm font-extrabold">
                {dictionary.offerForm.button}
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm font-bold text-slate-700 sm:hidden">
            {dictionary.hero.proofPoints.map((label, index) => {
              const Icon = proofIcons[index] ?? CheckCircle2;
              return (
                <div key={label} className="flex items-center gap-2">
                  <Icon aria-hidden="true" className="h-4 w-4 text-[#2fad50]" />
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200 bg-white">
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
        id="locations"
        className="mx-auto max-w-[1160px] px-5 py-14 sm:px-8 lg:py-16"
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
                      key={area}
                      className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2 text-sm font-bold text-slate-700"
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
    </main>
  );
}
