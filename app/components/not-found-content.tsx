import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Home,
  MapPinned,
  Phone,
} from "lucide-react";
import type { Locale } from "../dictionaries";
import { serviceAreaPhone, serviceAreaPhoneHref } from "../service-area";

type NotFoundCopy = {
  eyebrow: string;
  title: string;
  body: string;
  secondary: string;
  offerCta: string;
  phoneCta: string;
  areaLabel: string;
  areaBody: string;
  mascotAlt: string;
  links: {
    home: {
      label: string;
      helper: string;
    };
    offer: {
      label: string;
      helper: string;
    };
    areas: {
      label: string;
      helper: string;
    };
  };
};

const copy: Record<Locale, NotFoundCopy> = {
  en: {
    eyebrow: "404 / Page not found",
    title: "Wrong turn. Your cash offer is still close.",
    body: "The page you opened is not available anymore, but you can still start a San Diego County cash offer, call us, or check the areas we serve.",
    secondary:
      "No encontramos esta página. Puedes empezar una oferta, llamarnos o ver las áreas donde compramos carros.",
    offerCta: "Get My Offer",
    phoneCta: "Call",
    areaLabel: "San Diego County",
    areaBody: "Cash offers. Local pickup. Fast help.",
    mascotAlt: "Cash For Cars raccoon mascot holding a service area sign",
    links: {
      home: {
        label: "Home",
        helper: "Back to the main page",
      },
      offer: {
        label: "Get Offer",
        helper: "Start your car offer",
      },
      areas: {
        label: "Service Areas",
        helper: "See where we buy cars",
      },
    },
  },
  es: {
    eyebrow: "404 / Página no encontrada",
    title: "Te fuiste por otra ruta. Tu oferta sigue cerca.",
    body: "Esta página ya no está disponible, pero puedes empezar una oferta en San Diego County, llamarnos o revisar las áreas donde compramos carros.",
    secondary:
      "Si necesitas ayuda inmediata, llámanos y revisamos tu carro contigo.",
    offerCta: "Empezar Mi Oferta",
    phoneCta: "Llamar",
    areaLabel: "San Diego County",
    areaBody: "Ofertas en efectivo. Retiro local. Ayuda rápida.",
    mascotAlt:
      "Mascota de Cash For Cars sosteniendo un letrero de área de servicio",
    links: {
      home: {
        label: "Inicio",
        helper: "Volver a la página principal",
      },
      offer: {
        label: "Oferta",
        helper: "Empieza tu oferta",
      },
      areas: {
        label: "Áreas de servicio",
        helper: "Mira dónde compramos carros",
      },
    },
  },
};

function getLocalizedPaths(locale: Locale) {
  return {
    home: locale === "es" ? "/es" : "/",
    offer: locale === "es" ? "/es/oferta" : "/offer",
    areas: locale === "es" ? "/es/san-diego-county" : "/san-diego-county",
  };
}

export function NotFoundContent({ locale }: { locale: Locale }) {
  const content = copy[locale];
  const paths = getLocalizedPaths(locale);
  const quickLinks = [
    {
      href: paths.home,
      label: content.links.home.label,
      helper: content.links.home.helper,
      icon: Home,
    },
    {
      href: paths.offer,
      label: content.links.offer.label,
      helper: content.links.offer.helper,
      icon: CarFront,
    },
    {
      href: paths.areas,
      label: content.links.areas.label,
      helper: content.links.areas.helper,
      icon: MapPinned,
    },
  ];

  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-[#07150d] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(47,173,80,0.16)_0,rgba(47,173,80,0)_36%),radial-gradient(circle_at_82%_12%,rgba(250,204,21,0.14),transparent_28%),linear-gradient(180deg,#0b1f13_0%,#06100b_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(180deg,#fff_1px,transparent_1px)] [background-size:42px_42px]"
      />

      <section className="relative mx-auto grid w-full max-w-7xl content-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:px-12">
        <div className="flex flex-col justify-center">
          <Link href={paths.home} aria-label={content.links.home.label} className="w-fit">
            <Image
              src="/logo.svg"
              alt="Cash For Cars"
              width={240}
              height={58}
              sizes="208px"
              className="h-auto w-52 rounded-sm bg-white px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
            />
          </Link>

          <div className="mt-12 max-w-3xl">
            <p className="w-fit rounded-full border border-[#6ee28d]/35 bg-[#6ee28d]/10 px-4 py-2 text-sm font-black uppercase tracking-normal text-[#6ee28d]">
              {content.eyebrow}
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-300">
              {content.body}
            </p>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-400">
              {content.secondary}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={paths.offer}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#2fad50] px-7 text-base font-black uppercase tracking-normal text-white shadow-[0_20px_45px_rgba(47,173,80,0.32)] transition hover:bg-[#279a47]"
            >
              {content.offerCta}
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
            <a
              href={serviceAreaPhoneHref}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/16 bg-white px-7 text-base font-black uppercase tracking-normal text-[#101827] shadow-[0_20px_45px_rgba(0,0,0,0.2)] transition hover:bg-slate-100"
            >
              <Phone aria-hidden="true" className="h-5 w-5" />
              {content.phoneCta} {serviceAreaPhone}
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-[#6ee28d]/40 hover:bg-white/[0.09]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#101827] transition group-hover:bg-[#6ee28d]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-white">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-slate-400">
                      {item.helper}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative flex min-h-[420px] items-end justify-center lg:min-h-[640px]">
          <div
            aria-hidden="true"
            className="absolute bottom-0 h-[66%] w-[86%] rounded-t-[48px] border border-[#6ee28d]/20 bg-[#10281a] shadow-[0_40px_100px_rgba(0,0,0,0.32)]"
          />
          <div className="absolute bottom-10 left-4 rounded-2xl border border-white/12 bg-black/35 px-4 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur sm:left-8">
            <p className="text-xs font-black uppercase tracking-normal text-[#facc15]">
              {content.areaLabel}
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {content.areaBody}
            </p>
          </div>
          <Image
            src="/mascot/raccoon-mascot-holding-raised-blank-sign.webp"
            alt={content.mascotAlt}
            width={2900}
            height={3606}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 42vw, 82vw"
            className="relative z-10 h-auto w-[min(92vw,420px)] drop-shadow-[0_30px_45px_rgba(0,0,0,0.38)] sm:w-[500px] lg:w-[560px]"
          />
        </div>
      </section>
    </main>
  );
}
