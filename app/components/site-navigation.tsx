import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Globe2,
  Menu,
  Phone,
  X,
} from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getLocalePath } from "../dictionaries";

const phoneNumber = "619-830-7005";
const phoneHref = "tel:16198307005";

function Logo({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <Link
      href={getLocalePath(locale)}
      aria-label={dictionary.navigation.homeLabel}
      className="shrink-0"
    >
      <Image
        src="/logo.svg"
        alt="Cash For Cars"
        width={184}
        height={57}
        preload
        className="h-9 w-auto sm:h-10 lg:h-[42px]"
      />
    </Link>
  );
}

function NavLink({
  item,
  mobile = false,
}: {
  item: Dictionary["navigation"]["items"][number];
  mobile?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={
        mobile
          ? "inline-flex min-h-12 items-center justify-center gap-2 text-lg font-semibold text-slate-600 transition hover:text-slate-950"
          : "inline-flex h-14 items-center justify-center gap-1.5 px-5 text-sm font-semibold text-slate-800 transition hover:text-slate-950"
      }
    >
      <span>{item.label}</span>
      {item.hasMenu ? (
        <ChevronDown aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
      ) : null}
    </Link>
  );
}

function GetOfferLink({
  children = "GET OFFER",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href="#get-offer"
      className={`inline-flex h-11 items-center justify-center rounded-full bg-[#2fad50] px-7 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(47,173,80,0.22)] transition hover:bg-[#279746] ${className}`}
    >
      {children}
    </Link>
  );
}

function FlagMark({ locale }: { locale: Locale }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex w-5 items-center justify-center text-base leading-none"
    >
      {locale === "es" ? "🇪🇸" : "🇺🇸"}
    </span>
  );
}

function LanguageMenu({
  dictionary,
  locale,
  className = "",
}: {
  dictionary: Dictionary;
  locale: Locale;
  className?: string;
}) {
  const languageOptions: Array<{ locale: Locale; label: string }> = [
    { locale: "en", label: "English" },
    { locale: "es", label: "Español" },
  ];

  return (
    <details className={`language-menu relative ${className}`}>
      <summary
        aria-label={dictionary.navigation.chooseLanguage}
        className="language-menu-trigger inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Globe2 aria-hidden="true" className="h-[18px] w-[18px]" />
      </summary>

      <div className="absolute right-0 top-[calc(100%+10px)] z-[70] w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
        {languageOptions.map((option) => {
          const isActive = option.locale === locale;

          return (
            <Link
              key={option.locale}
              href={getLocalePath(option.locale)}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition hover:bg-slate-50 ${
                isActive ? "text-[#2fad50]" : "text-slate-600"
              }`}
            >
              <FlagMark locale={option.locale} />
              <span>{option.label}</span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}

export function SiteNavigation({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white/95 shadow-[0_1px_16px_rgba(15,23,42,0.04)] backdrop-blur lg:block">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6">
          <Logo dictionary={dictionary} locale={locale} />

          <div className="flex items-center gap-3">
            <LanguageMenu dictionary={dictionary} locale={locale} />
            <Link
              href={phoneHref}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
            >
              <Phone aria-hidden="true" className="h-4 w-4" />
              {phoneNumber}
            </Link>
            <GetOfferLink>{dictionary.navigation.getOffer}</GetOfferLink>
          </div>
        </div>

        <nav
          aria-label="Primary navigation"
          className="border-t border-slate-100"
        >
          <div className="mx-auto flex h-14 max-w-[920px] items-center justify-center">
            {dictionary.navigation.items.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </nav>
      </header>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white lg:hidden">
        <input
          id="mobile-menu-toggle"
          aria-label={dictionary.navigation.mobileMenu}
          className="mobile-menu-toggle sr-only"
          type="checkbox"
        />

        <div className="mobile-menu-shell flex h-[58px] items-center justify-between bg-white px-5">
          <Logo dictionary={dictionary} locale={locale} />

          <div className="flex items-center gap-3">
            <LanguageMenu
              dictionary={dictionary}
              locale={locale}
              className="[&_.language-menu-trigger]:h-9 [&_.language-menu-trigger]:w-9"
            />
            <label
              htmlFor="mobile-menu-toggle"
              aria-controls="mobile-navigation"
              aria-label={dictionary.navigation.toggleMenu}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-slate-950 transition hover:bg-slate-100"
            >
              <Menu
                aria-hidden="true"
                className="mobile-menu-icon-open h-8 w-8"
                strokeWidth={2.2}
              />
              <X
                aria-hidden="true"
                className="mobile-menu-icon-close h-8 w-8"
                strokeWidth={2.2}
              />
            </label>
          </div>
        </div>

        <div className="mobile-menu-actions grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-2.5">
          <Link
            href={phoneHref}
            className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-[#f8f8f8] px-3 text-sm font-extrabold text-slate-950"
          >
            <Phone aria-hidden="true" className="h-4 w-4" />
            <span>{dictionary.navigation.callUs}</span>
          </Link>
          <GetOfferLink className="h-11 rounded-lg px-4">
            {dictionary.navigation.getOffer}
          </GetOfferLink>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mobile-menu-panel fixed inset-x-0 bottom-0 top-[58px] z-50 flex-col justify-between border-t border-slate-100 bg-white px-5 pb-7 pt-5"
        >
          <div className="flex flex-col items-center gap-3 py-2">
            {dictionary.navigation.items.map((item) => (
              <NavLink key={item.label} item={item} mobile />
            ))}
          </div>

          <div className="grid gap-3">
            <Link
              href={phoneHref}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
            >
              {dictionary.navigation.callUs} {phoneNumber}
            </Link>
            <GetOfferLink className="h-12 rounded-xl text-base">
              {dictionary.navigation.getInstantOffer}
            </GetOfferLink>
          </div>
        </nav>
      </header>
    </>
  );
}
