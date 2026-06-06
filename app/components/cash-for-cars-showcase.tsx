"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeDollarSign,
  CarFront,
  ClipboardCheck,
  FileCheck2,
  MapPin,
  PhoneCall,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import type { Dictionary, Locale } from "../dictionaries";
import { mascotImages, sceneImages, type SiteImageAsset } from "../image-assets";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: smoothEase },
};

const gridMotion = {
  whileInView: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.12,
    },
  },
  viewport: { once: true, amount: 0.18 },
};

const cardMotion = {
  initial: { opacity: 0, y: 22, scale: 0.985 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.5, ease: smoothEase },
};

const cardAssets: Array<{
  asset: SiteImageAsset;
  imageClassName: string;
  visualClassName: string;
}> = [
  {
    asset: mascotImages.clipboardCar,
    imageClassName: "object-contain object-bottom p-4",
    visualClassName: "bg-[#ecfdf1]",
  },
  {
    asset: sceneImages.damagedYard,
    imageClassName: "object-cover",
    visualClassName: "bg-slate-900",
  },
  {
    asset: mascotImages.cashStack,
    imageClassName: "object-contain object-bottom p-4",
    visualClassName: "bg-[#f7ead2]",
  },
  {
    asset: mascotImages.wavingTool,
    imageClassName: "object-contain object-bottom p-4",
    visualClassName: "bg-[#ecfdf1]",
  },
  {
    asset: mascotImages.locationGuide,
    imageClassName: "object-contain object-bottom p-5",
    visualClassName: "bg-[#e8f2ff]",
  },
  {
    asset: mascotImages.thinking,
    imageClassName: "object-contain object-bottom p-5",
    visualClassName: "bg-slate-950",
  },
];

const cardIcons = [
  ClipboardCheck,
  CarFront,
  BadgeDollarSign,
  Truck,
  MapPin,
  FileCheck2,
];

export function CashForCarsShowcase({
  dictionary,
  locale,
  offerPath,
}: {
  dictionary: Dictionary;
  locale: Locale;
  offerPath: string;
}) {
  const section = dictionary.cashForCarsProof;

  return (
    <section
      id="cash-for-cars-proof"
      className="scroll-mt-32 overflow-hidden border-y border-slate-200 bg-[#f6f8fb] px-5 py-14 sm:px-8 lg:py-16"
    >
      <motion.div
        {...sectionMotion}
        className="mx-auto max-w-[1160px] text-center"
      >
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-[#228b40] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
          {section.eyebrow}
        </div>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-[44px]">
          {section.title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {section.body}
        </p>
      </motion.div>

      <motion.div
        {...gridMotion}
        className="mx-auto mt-10 grid max-w-[1160px] gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {section.cards.map((card, index) => {
          const Icon = cardIcons[index] ?? BadgeDollarSign;
          const visual = cardAssets[index] ?? cardAssets[0];
          const isDark = index === 1 || index === 5;
          const isScene = visual.asset.kind === "scene";

          return (
            <motion.article
              key={card.title}
              {...cardMotion}
              className={`group relative flex min-h-[300px] overflow-hidden rounded-[22px] border p-5 text-left shadow-[0_18px_46px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.1)] ${
                isDark
                  ? "border-slate-800 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-950"
              }`}
            >
              <div className="relative z-10 flex w-full flex-col justify-between gap-5">
                <div>
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
                      isDark
                        ? "bg-[#6ee28d] text-slate-950"
                        : "bg-[#ecfdf1] text-[#228b40]"
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <p
                    className={`text-xs font-black uppercase tracking-[0.12em] ${
                      isDark ? "text-[#6ee28d]" : "text-[#2fad50]"
                    }`}
                  >
                    {card.kicker}
                  </p>
                  <h3 className="mt-2 max-w-[13.75rem] text-2xl font-black leading-tight sm:max-w-[15rem]">
                    {card.title}
                  </h3>
                  <p
                    className={`mt-3 max-w-[13.5rem] text-sm font-semibold leading-6 sm:max-w-[16rem] ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {card.body}
                  </p>
                </div>

                <div
                  className={`inline-flex w-fit items-center rounded-full px-3 py-2 text-xs font-black ${
                    isDark
                      ? "bg-white/10 text-white"
                      : "bg-slate-950 text-white"
                  }`}
                >
                  {card.stat}
                </div>
              </div>

              <div
                className={`absolute bottom-4 right-4 h-28 w-28 overflow-hidden rounded-[28px] sm:h-36 sm:w-36 ${visual.visualClassName}`}
              >
                <Image
                  src={visual.asset.src}
                  alt={visual.asset.alt[locale]}
                  fill
                  sizes="144px"
                  className={`${visual.imageClassName} transition duration-500 group-hover:scale-105 ${
                    isScene ? "opacity-70" : ""
                  }`}
                />
              </div>

            </motion.article>
          );
        })}
      </motion.div>

      <motion.div
        {...sectionMotion}
        className="mx-auto mt-8 flex max-w-[1160px] flex-col items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:flex-row sm:p-5"
      >
        <p className="max-w-2xl text-center text-sm font-bold leading-6 text-slate-600 sm:text-left">
          {section.ctaBody}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={offerPath}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2fad50] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(47,173,80,0.24)] transition hover:bg-[#279746]"
          >
            {section.cta}
          </Link>
          <a
            href="tel:16198307005"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-slate-50"
          >
            <PhoneCall aria-hidden="true" className="h-4 w-4 text-[#2fad50]" />
            {section.callCta}
          </a>
        </div>
      </motion.div>
    </section>
  );
}
