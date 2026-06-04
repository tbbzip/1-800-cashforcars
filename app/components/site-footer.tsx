import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, PhoneCall } from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getLocalePath, getOfferPath } from "../dictionaries";

const phoneNumber = "619-830-7005";
const phoneHref = "tel:16198307005";
const streetAddress = "552 Alta Rd #4, San Diego, CA 92154";

function localizeHref(href: string, locale: Locale) {
  if (href === "/offer") {
    return getOfferPath(locale);
  }

  if (href.startsWith("#")) {
    return `${getLocalePath(locale)}${href}`;
  }

  return href;
}

export function SiteFooter({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-[1160px] px-5 py-12 sm:px-8 lg:py-16">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#6ee28d]">
              {dictionary.footer.eyebrow}
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-[0.98] tracking-normal text-white sm:text-5xl lg:text-6xl">
              {dictionary.footer.headline}
            </h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-slate-300">
              {dictionary.footer.body}
            </p>
          </div>

          <Link
            href={getOfferPath(locale)}
            className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-[#f3b33d] px-6 text-sm font-black text-slate-950 shadow-[0_16px_34px_rgba(243,179,61,0.24)] transition hover:bg-[#ffd66d]"
          >
            {dictionary.footer.cta}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 border-b border-white/10 py-10 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <div className="inline-flex rounded-2xl bg-white px-4 py-3">
              <Image
                src="/logo.svg"
                alt="Cash For Cars"
                width={184}
                height={57}
                className="h-10 w-auto"
              />
            </div>

            <div className="mt-6 grid gap-4 text-sm font-bold text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#6ee28d]"
                />
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">
                    {dictionary.footer.addressLabel}
                  </p>
                  <p className="mt-1 leading-6">{streetAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneCall
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#6ee28d]"
                />
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">
                    {dictionary.footer.phoneLabel}
                  </p>
                  <a
                    href={phoneHref}
                    className="mt-1 inline-flex leading-6 text-white transition hover:text-[#6ee28d]"
                  >
                    {phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <nav
            aria-label={dictionary.footer.navigationLabel}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {dictionary.footer.columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-black uppercase text-white">
                  {column.title}
                </h3>
                <ul className="mt-4 grid gap-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={localizeHref(link.href, locale)}
                        className="text-sm font-bold text-slate-400 transition hover:text-[#6ee28d]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Cash For Cars. {dictionary.footer.rights}
          </p>
          <Link
            href={getLocalePath(locale)}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:border-[#6ee28d]/50 hover:text-white"
          >
            {dictionary.footer.backToTop}
            <span aria-hidden="true">↑</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
