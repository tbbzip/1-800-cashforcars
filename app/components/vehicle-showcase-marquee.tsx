"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { BadgeCheck, Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Dictionary, Locale } from "../dictionaries";
import { vehicleShowcaseImages } from "../image-assets";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.55, ease: smoothEase },
};

function FiveStars({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 text-[#f3b33d]" aria-label={label}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className="h-4 w-4 fill-current"
        />
      ))}
    </div>
  );
}

export function VehicleShowcaseMarquee({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const section = dictionary.vehicleShowcase;
  const cardItems = vehicleShowcaseImages.map((asset, index) => ({
    asset,
    testimonial: section.testimonials[index % section.testimonials.length],
  }));
  const marqueeItems = [...cardItems, ...cardItems];

  return (
    <section
      id="vehicle-showcase"
      className="overflow-hidden border-b border-slate-200 bg-white py-12 sm:py-14 lg:py-16"
    >
      <motion.div
        {...sectionMotion}
        className="mx-auto flex max-w-[1160px] flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bde9c9] bg-[#ecfdf1] px-3 py-1.5 text-xs font-extrabold uppercase text-[#228b40]">
            <BadgeCheck aria-hidden="true" className="h-4 w-4" />
            {section.eyebrow}
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
            {section.title}
          </h2>
        </div>
        <p className="max-w-md text-base font-semibold leading-7 text-slate-600">
          {section.body}
        </p>
      </motion.div>

      <motion.div
        {...sectionMotion}
        className="vehicle-showcase-marquee mt-9"
        style={{ "--vehicle-showcase-duration": "72s" } as CSSProperties}
      >
        <div className="vehicle-showcase-marquee-track">
          {marqueeItems.map(({ asset, testimonial }, index) => (
            <article
              key={`${asset.src}-${index}`}
              aria-hidden={index >= cardItems.length}
              data-vehicle-src={asset.src}
              className="vehicle-showcase-card group flex shrink-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_46px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.13)]"
            >
              <div className="vehicle-showcase-card-media relative overflow-hidden bg-slate-100">
                <Image
                  src={asset.src}
                  alt={asset.alt[locale]}
                  fill
                  sizes="(max-width: 640px) 300px, 332px"
                  className="transition duration-500 group-hover:scale-105"
                  style={
                    {
                      objectFit: "cover",
                      objectPosition: asset.position ?? "center",
                    }
                  }
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <FiveStars label={section.ratingLabel} />
                    <Quote
                      aria-hidden="true"
                      className="h-5 w-5 text-[#2fad50]"
                    />
                  </div>
                  <h3 className="vehicle-showcase-card-title mt-4 text-lg font-black leading-tight text-slate-950">
                    {asset.title[locale]}
                  </h3>
                  <p className="vehicle-showcase-card-quote mt-3 text-sm font-semibold leading-6 text-slate-600">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-sm font-black text-slate-950">
                    {testimonial.name}
                  </p>
                  <p className="rounded-full bg-[#ecfdf1] px-3 py-1.5 text-xs font-black text-[#228b40]">
                    {testimonial.area}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
