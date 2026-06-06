"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ChevronDown, Globe2, Menu, Phone, X } from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getLocalePath, getOfferPath } from "../dictionaries";
import { getIncorporatedCitiesPath, getLocationPath } from "../location-paths";

const phoneNumber = "619-830-7005";
const phoneHref = "tel:16198307005";

type NavigationItem = Dictionary["navigation"]["items"][number];
type AreaGroup = Dictionary["serviceAreas"]["items"][number];

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const popoverMotion = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: { duration: 0.18, ease: smoothEase },
};

const dropdownMotion = {
  initial: { opacity: 0, y: 12, x: "-50%", scale: 0.98 },
  animate: { opacity: 1, y: 0, x: "-50%", scale: 1 },
  exit: { opacity: 0, y: 10, x: "-50%", scale: 0.98 },
  transition: { duration: 0.2, ease: smoothEase },
};

const listMotion = {
  animate: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.035,
    },
  },
};

const listItemMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.16, ease: smoothEase },
};

function isAreasMenu(item: NavigationItem) {
  return "areasMenu" in item && item.areasMenu === true;
}

function CompactAreaGroup({
  group,
  getHref,
  onNavigate,
}: {
  group: AreaGroup;
  getHref: (area: string) => string;
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-normal text-slate-500">
        {group.title}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {group.areas.map((area) => (
          <Link
            key={`${group.title}-${area}`}
            href={getHref(area)}
            onClick={onNavigate}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#bde9c9] hover:bg-[#ecfdf1] hover:text-slate-950"
          >
            {area}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AreasDesktopMenu({
  dictionary,
  item,
  locale,
  onNavigate,
}: {
  dictionary: Dictionary;
  item: NavigationItem;
  locale: Locale;
  onNavigate: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {item.menuItems.map((menuItem) => (
          <Link
            key={`${item.label}-${menuItem.label}`}
            href={menuItem.href}
            onClick={onNavigate}
            className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2 text-xs font-black text-slate-700 transition hover:border-[#bde9c9] hover:bg-[#ecfdf1] hover:text-slate-950"
          >
            {menuItem.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.12fr]">
        <section className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#2fad50]">
                {dictionary.serviceAreas.eyebrow}
              </p>
              <h3 className="mt-1 text-base font-black text-slate-950">
                {dictionary.locations.cityPageCta}
              </h3>
            </div>
            <Link
              href={getIncorporatedCitiesPath(locale)}
              onClick={onNavigate}
              className="shrink-0 rounded-full bg-[#2fad50] px-3 py-2 text-[11px] font-black text-white transition hover:bg-[#279746]"
            >
              {locale === "es" ? "Ver" : "View"}
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {dictionary.serviceAreas.items.map((group) => (
              <CompactAreaGroup
                key={group.title}
                group={group}
                getHref={(area) => getLocationPath(locale, area)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs font-black uppercase text-[#2fad50]">
              {dictionary.sanDiegoAreas.eyebrow}
            </p>
            <h3 className="mt-1 text-base font-black text-slate-950">
              {dictionary.sanDiegoAreas.title}
            </h3>
          </div>

          <div className="mt-4 grid gap-3">
            {dictionary.sanDiegoAreas.groups.map((group) => (
              <CompactAreaGroup
                key={group.title}
                group={group}
                getHref={(area) => getLocationPath(locale, area)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AreasMobileMenu({
  dictionary,
  item,
  locale,
  onNavigate,
}: {
  dictionary: Dictionary;
  item: NavigationItem;
  locale: Locale;
  onNavigate: () => void;
}) {
  return (
    <div className="grid gap-4 px-1 pb-3 pt-1 text-left">
      <div className="grid gap-2">
        {item.menuItems.map((menuItem) => (
          <Link
            key={`${item.label}-${menuItem.label}`}
            href={menuItem.href}
            onClick={onNavigate}
            className="rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:border-[#bde9c9] hover:bg-[#ecfdf1] hover:text-slate-950"
          >
            {menuItem.label}
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
        <p className="text-xs font-black uppercase text-[#2fad50]">
          {dictionary.locations.cityPageCta}
        </p>
        <div className="mt-4 grid gap-4">
          {dictionary.serviceAreas.items.map((group) => (
            <CompactAreaGroup
              key={group.title}
              group={group}
              getHref={(area) => getLocationPath(locale, area)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-black uppercase text-[#2fad50]">
          {dictionary.sanDiegoAreas.eyebrow}
        </p>
        <div className="mt-4 grid gap-4">
          {dictionary.sanDiegoAreas.groups.map((group) => (
            <CompactAreaGroup
              key={group.title}
              group={group}
              getHref={(area) => getLocationPath(locale, area)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

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

function GetOfferLink({
  children = "GET OFFER",
  className = "",
  locale,
  onClick,
}: {
  children?: ReactNode;
  className?: string;
  locale: Locale;
  onClick?: () => void;
}) {
  return (
    <Link
      href={getOfferPath(locale)}
      onClick={onClick}
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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const languageOptions: Array<{ locale: Locale; label: string }> = [
    { locale: "en", label: "English" },
    { locale: "es", label: "Español" },
  ];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className={`language-menu relative ${className}`}>
      <button
        type="button"
        aria-label={dictionary.navigation.chooseLanguage}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`language-menu-trigger inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50 ${
          isOpen ? "language-menu-trigger-open" : ""
        }`}
      >
        <Globe2 aria-hidden="true" className="h-[18px] w-[18px]" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            {...popoverMotion}
            className="absolute right-0 top-[calc(100%+10px)] z-[70] w-40 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          >
            {languageOptions.map((option) => {
              const isActive = option.locale === locale;

              return (
                <Link
                  key={option.locale}
                  href={getLocalePath(option.locale)}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition hover:bg-slate-50 ${
                    isActive ? "text-[#2fad50]" : "text-slate-600"
                  }`}
                >
                  <FlagMark locale={option.locale} />
                  <span>{option.label}</span>
                </Link>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DesktopNavItem({
  dictionary,
  item,
  index,
  isOpen,
  locale,
  onOpen,
  onClose,
  onNavigate,
}: {
  dictionary: Dictionary;
  item: NavigationItem;
  index: number;
  isOpen: boolean;
  locale: Locale;
  onOpen: () => void;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const hasDropdown = item.hasMenu && item.menuItems.length > 0;
  const menuId = `desktop-nav-menu-${index}`;
  const hasAreasMegaMenu = isAreasMenu(item);

  if (!hasDropdown) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="inline-flex h-14 items-center justify-center gap-1.5 px-5 text-sm font-semibold text-slate-800 transition hover:text-slate-950"
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div
      className="nav-dropdown relative flex h-14 items-center"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={onOpen}
        onFocus={onOpen}
        className={`inline-flex h-14 items-center justify-center gap-1.5 px-5 text-sm font-semibold transition ${
          isOpen ? "text-slate-950" : "text-slate-800 hover:text-slate-950"
        }`}
      >
        <span>{item.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition duration-200 ${
            isOpen ? "rotate-180 text-[#2fad50]" : ""
          }`}
          strokeWidth={2.2}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={menuId}
            {...dropdownMotion}
            className={`absolute left-1/2 top-full z-[60] origin-top rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] ${
              hasAreasMegaMenu
                ? "max-h-[calc(100vh-150px)] w-[min(1040px,calc(100vw-32px))] overflow-y-auto p-4"
                : "w-72 p-2"
            }`}
          >
            {hasAreasMegaMenu ? (
              <AreasDesktopMenu
                dictionary={dictionary}
                item={item}
                locale={locale}
                onNavigate={onNavigate}
              />
            ) : (
              <motion.div
                variants={listMotion}
                initial="initial"
                animate="animate"
              >
                {item.menuItems.map((menuItem) => (
                  <motion.div
                    key={`${item.label}-${menuItem.label}`}
                    variants={listItemMotion}
                  >
                    <Link
                      href={menuItem.href}
                      onClick={onNavigate}
                      className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#ecfdf1] hover:text-slate-950"
                    >
                      {menuItem.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MobileNavItem({
  dictionary,
  item,
  index,
  isOpen,
  locale,
  onToggle,
  onNavigate,
}: {
  dictionary: Dictionary;
  item: NavigationItem;
  index: number;
  isOpen: boolean;
  locale: Locale;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const hasDropdown = item.hasMenu && item.menuItems.length > 0;
  const menuId = `mobile-nav-menu-${index}`;
  const hasAreasMegaMenu = isAreasMenu(item);

  if (!hasDropdown) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="inline-flex min-h-12 items-center justify-center text-lg font-semibold text-slate-600 transition hover:text-slate-950"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="w-full max-w-[340px]">
      <button
        type="button"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={onToggle}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 text-lg font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <span>{item.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition duration-200 ${
            isOpen ? "rotate-180 text-[#2fad50]" : ""
          }`}
          strokeWidth={2.2}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={menuId}
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: smoothEase }}
            className="overflow-hidden"
          >
            <motion.div
              variants={listMotion}
              initial="initial"
              animate="animate"
              className="grid gap-2 px-3 pb-2 pt-1"
            >
              {hasAreasMegaMenu ? (
                <motion.div variants={listItemMotion}>
                  <AreasMobileMenu
                    dictionary={dictionary}
                    item={item}
                    locale={locale}
                    onNavigate={onNavigate}
                  />
                </motion.div>
              ) : (
                item.menuItems.map((menuItem) => (
                  <motion.div
                    key={`${item.label}-${menuItem.label}`}
                    variants={listItemMotion}
                  >
                    <Link
                      href={menuItem.href}
                      onClick={onNavigate}
                      className="block rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-[#bde9c9] hover:bg-[#ecfdf1] hover:text-slate-950"
                    >
                      {menuItem.label}
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SiteNavigation({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openDesktopMenu) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDesktopMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  function closeNavigation() {
    setIsMobileMenuOpen(false);
    setOpenMobileMenu(null);
    setOpenDesktopMenu(null);
  }

  function toggleMobileMenu() {
    if (isMobileMenuOpen) {
      setOpenMobileMenu(null);
    }

    setIsMobileMenuOpen((current) => !current);
  }

  return (
    <MotionConfig reducedMotion="user">
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
            <GetOfferLink locale={locale}>
              {dictionary.navigation.getOffer}
            </GetOfferLink>
          </div>
        </div>

        <nav
          aria-label="Primary navigation"
          className="border-t border-slate-100"
        >
          <div
            ref={desktopNavRef}
            className="mx-auto flex h-14 max-w-[920px] items-center justify-center"
          >
            {dictionary.navigation.items.map((item, index) => {
              const isOpen = openDesktopMenu === item.label;

              return (
                <DesktopNavItem
                  dictionary={dictionary}
                  key={item.label}
                  item={item}
                  index={index}
                  isOpen={isOpen}
                  locale={locale}
                  onOpen={() => setOpenDesktopMenu(item.label)}
                  onClose={() => setOpenDesktopMenu(null)}
                  onNavigate={closeNavigation}
                />
              );
            })}
          </div>
        </nav>
      </header>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white lg:hidden">
        <div className="mobile-menu-shell flex h-[58px] items-center justify-between bg-white px-5">
          <Logo dictionary={dictionary} locale={locale} />

          <div className="flex items-center gap-3">
            <LanguageMenu
              dictionary={dictionary}
              locale={locale}
              className="[&_.language-menu-trigger]:h-9 [&_.language-menu-trigger]:w-9"
            />
            <button
              type="button"
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={dictionary.navigation.toggleMenu}
              onClick={toggleMobileMenu}
              className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-slate-950 transition hover:bg-slate-100"
            >
              <motion.span
                aria-hidden="true"
                animate={
                  isMobileMenuOpen
                    ? { opacity: 0, rotate: 90, scale: 0.72 }
                    : { opacity: 1, rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.2, ease: smoothEase }}
                className="absolute"
              >
                <Menu className="h-8 w-8" strokeWidth={2.2} />
              </motion.span>
              <motion.span
                aria-hidden="true"
                animate={
                  isMobileMenuOpen
                    ? { opacity: 1, rotate: 0, scale: 1 }
                    : { opacity: 0, rotate: -90, scale: 0.72 }
                }
                transition={{ duration: 0.2, ease: smoothEase }}
                className="absolute"
              >
                <X className="h-8 w-8" strokeWidth={2.2} />
              </motion.span>
            </button>
          </div>
        </div>

        <motion.div
          animate={
            isMobileMenuOpen
              ? {
                  borderColor: "rgba(241,245,249,0)",
                  height: 0,
                  opacity: 0,
                  paddingBottom: 0,
                  paddingTop: 0,
                  y: -8,
                }
              : {
                  borderColor: "rgb(241,245,249)",
                  height: "auto",
                  opacity: 1,
                  paddingBottom: 10,
                  paddingTop: 10,
                  y: 0,
                }
          }
          transition={{ duration: 0.22, ease: smoothEase }}
          className="grid grid-cols-2 gap-2 overflow-hidden border-t border-slate-100 px-4"
        >
          <Link
            href={phoneHref}
            className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-[#f8f8f8] px-3 text-sm font-extrabold text-slate-950"
          >
            <Phone aria-hidden="true" className="h-4 w-4" />
            <span>{dictionary.navigation.callUs}</span>
          </Link>
          <GetOfferLink locale={locale} className="h-11 rounded-lg px-4">
            {dictionary.navigation.getOffer}
          </GetOfferLink>
        </motion.div>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: smoothEase }}
              className="fixed inset-x-0 bottom-0 top-[58px] z-50 flex flex-col justify-between overflow-y-auto border-t border-slate-100 bg-white px-5 pb-7 pt-5"
            >
              <motion.div
                variants={listMotion}
                initial="initial"
                animate="animate"
                className="flex flex-col items-center gap-2 py-2"
              >
                {dictionary.navigation.items.map((item, index) => (
                  <motion.div
                    key={item.label}
                    variants={listItemMotion}
                    className="flex w-full justify-center"
                  >
                    <MobileNavItem
                      dictionary={dictionary}
                      item={item}
                      index={index}
                      isOpen={openMobileMenu === item.label}
                      locale={locale}
                      onToggle={() =>
                        setOpenMobileMenu((current) =>
                          current === item.label ? null : item.label,
                        )
                      }
                      onNavigate={closeNavigation}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: smoothEase }}
                className="grid gap-3"
              >
                <Link
                  href={phoneHref}
                  onClick={closeNavigation}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                >
                  {dictionary.navigation.callUs} {phoneNumber}
                </Link>
                <GetOfferLink
                  locale={locale}
                  onClick={closeNavigation}
                  className="h-12 rounded-xl text-base"
                >
                  {dictionary.navigation.getInstantOffer}
                </GetOfferLink>
              </motion.div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}
