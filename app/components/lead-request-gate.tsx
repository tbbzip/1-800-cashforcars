"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { CheckCircle2, Phone } from "lucide-react";
import { getLocalePath, type Locale } from "../dictionaries";
import { useLeadSubmissionReceipt } from "../hooks/use-lead-submission-receipt";
import { clearLeadSubmissionReceipt } from "../lead-submission-receipt";
import { serviceAreaPhone, serviceAreaPhoneHref } from "../service-area";

const copy = {
  en: {
    loading: "Getting your request ready…",
    received: "Request received",
    title: "You’re all set. We have your request.",
    noRepeat: "No need to fill out another form.",
    body: "Our team will review your vehicle details and call you at the number you provided. Your request is already with us, even if you visit another page.",
    help: "Prefer to talk now or need to update your details? Call us and mention your existing request.",
    call: "Call",
    optional: "Calling is optional. You don’t need to do anything else to submit your request.",
    another: "Selling a different vehicle?",
    newRequest: "Start a request for another vehicle",
    home: "Back to home",
  },
  es: {
    loading: "Preparando tu solicitud…",
    received: "Solicitud recibida",
    title: "Listo. Ya recibimos tu solicitud.",
    noRepeat: "No necesitas llenar otro formulario.",
    body: "Nuestro equipo revisará los datos de tu carro y te llamará al número que proporcionaste. Ya tenemos tu solicitud, aunque visites otra página.",
    help: "¿Prefieres hablar ahora o necesitas corregir algún dato? Llámanos y menciona tu solicitud existente.",
    call: "Llama al",
    optional: "Llamar es opcional. No necesitas hacer nada más para enviar tu solicitud.",
    another: "¿Quieres vender otro carro?",
    newRequest: "Iniciar una solicitud para otro carro",
    home: "Volver al inicio",
  },
};

/** Both forms use the same confirmed receipt across pages, languages and tabs. */
export function LeadRequestGate({
  locale,
  children,
  onStartAnother,
  bypass = false,
  fullPage = false,
}: {
  locale: Locale;
  children: ReactNode;
  onStartAnother?: () => void;
  bypass?: boolean;
  fullPage?: boolean;
}) {
  const { receipt, ready } = useLeadSubmissionReceipt();
  const text = copy[locale];
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const focusNewRequest = useRef(false);
  const Heading = fullPage ? "h1" : "h2";

  useEffect(() => {
    if (!ready || receipt || !focusNewRequest.current) return;
    focusNewRequest.current = false;
    formContainerRef.current?.querySelector<HTMLElement>('h2[tabindex="-1"], input:not([type="hidden"]), select')?.focus();
  }, [ready, receipt]);

  useEffect(() => {
    if (!receipt || bypass) return;
    headingRef.current?.focus({ preventScroll: true });
    const bounds = headingRef.current?.getBoundingClientRect();
    if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
      headingRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [receipt, bypass]);

  if (bypass || (ready && !receipt)) return <div ref={formContainerRef} className="contents">{children}</div>;

  const confirmation = (
    <section id="get-offer" aria-labelledby={`${id}-title`} aria-busy={!ready} className="w-full min-w-0 scroll-mt-36 rounded-3xl border border-[#bde9c9] bg-white p-5 text-slate-950 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-7">
      {!receipt ? (
        <h2 id={`${id}-title`} role="status" className="py-8 text-lg font-bold text-slate-600">{text.loading}</h2>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#146c30]">
            <CheckCircle2 aria-hidden="true" className="h-6 w-6 shrink-0" />
            {text.received}
          </div>
          <Heading ref={headingRef} id={`${id}-title`} tabIndex={-1} className="mt-3 scroll-mt-28 text-2xl font-black leading-tight tracking-tight outline-none">{text.title}</Heading>
          <p className="mt-3 break-words text-sm font-bold text-slate-600">{[receipt.vehicle.year, receipt.vehicle.make, receipt.vehicle.model].join(" ")}</p>
          <div className="mt-5 rounded-2xl border border-[#bde9c9] bg-[#ecfdf1] p-4">
            <p className="text-base font-extrabold text-[#146c30]">{text.noRepeat}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{text.body}</p>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">{text.help}</p>
          <a href={serviceAreaPhoneHref} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#187b36] px-4 py-3 text-base font-extrabold text-white outline-none transition hover:bg-[#12612a] focus-visible:ring-2 focus-visible:ring-[#187b36] focus-visible:ring-offset-2">
            <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
            {text.call} {serviceAreaPhone}
          </a>
          <p className="mt-2 text-xs leading-5 text-slate-600">{text.optional}</p>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-600">{text.another}</p>
            <button type="button" onClick={() => { focusNewRequest.current = true; onStartAnother?.(); clearLeadSubmissionReceipt(); }} className="min-h-11 text-left text-sm font-bold text-[#146c30] underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#187b36] focus-visible:ring-offset-2">{text.newRequest}</button>
          </div>
        </>
      )}
    </section>
  );

  if (!fullPage) return confirmation;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="flex min-h-[68px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3 sm:px-8">
        <Link href={getLocalePath(locale)} aria-label={text.home}>
          <Image src="/logo.svg" alt="Cash For Cars" width={184} height={57} className="h-8 w-auto" priority />
        </Link>
        <Link href={getLocalePath(locale)} className="text-sm font-bold text-[#146c30] underline underline-offset-4">{text.home}</Link>
      </header>
      <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:py-14">{confirmation}</div>
    </main>
  );
}
