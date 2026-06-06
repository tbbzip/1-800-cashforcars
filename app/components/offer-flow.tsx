"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { sendGTMEvent } from "@next/third-parties/google";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Phone,
  Search,
} from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getLocalePath } from "../dictionaries";
import {
  isServiceAreaZip,
  normalizeZip,
  referralEmailHref,
  serviceAreaPhone,
  serviceAreaPhoneHref,
  serviceAreaTextHref,
} from "../service-area";

type LookupVehicle = {
  bodyClass?: string;
  make?: string;
  model?: string;
  source?: string;
  trim?: string;
  vehicleType?: string;
  vin: string;
  year?: string;
};

type VehicleLookupResponse = {
  error?: string;
  source?: string;
  vehicle?: LookupVehicle;
};

type FlowData = {
  access: string;
  airbagsDeployed: boolean | null;
  bodyDamage: string;
  catalyticConverter: boolean | null;
  city: string;
  drives: boolean | null;
  email: string;
  firstName: string;
  hasKeys: boolean | null;
  hasTitle: boolean | null;
  lastName: string;
  make: string;
  mileage: string;
  model: string;
  paperwork: string;
  phone: string;
  rolls: boolean | null;
  addressLine2: string;
  accessNotes: string;
  state: string;
  streetAddress: string;
  tiresInflated: boolean | null;
  trim: string;
  vin: string;
  wheelsAttached: boolean | null;
  year: string;
  zip: string;
};

const phoneNumber = serviceAreaPhone;
const phoneHref = serviceAreaPhoneHref;
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const stepMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

declare global {
  interface Window {
    turnstile?: {
      ready?: (callback: () => void) => void;
      remove: (widgetId: string) => void;
      render: (
        container: HTMLElement,
        options: {
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          callback?: (token: string) => void;
          sitekey: string;
          size?: "normal" | "compact" | "flexible";
          theme?: "auto" | "light" | "dark";
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

function normalizeVin(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
}

function emptyFlowData(initialVin = ""): FlowData {
  return {
    access: "",
    accessNotes: "",
    addressLine2: "",
    airbagsDeployed: null,
    bodyDamage: "",
    catalyticConverter: null,
    city: "",
    drives: null,
    email: "",
    firstName: "",
    hasKeys: null,
    hasTitle: null,
    lastName: "",
    make: "",
    mileage: "",
    model: "",
    paperwork: "",
    phone: "",
    rolls: null,
    state: "CA",
    streetAddress: "",
    tiresInflated: null,
    trim: "",
    vin: normalizeVin(initialVin),
    wheelsAttached: null,
    year: "",
    zip: "",
  };
}

function TextField({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
  autoComplete,
  className = "",
  inputMode,
  maxLength,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
  autoComplete?: string;
  className?: string;
  inputMode?: "email" | "numeric" | "search" | "tel" | "text" | "url";
  maxLength?: number;
}) {
  return (
    <label className={`grid min-w-0 gap-2 ${className}`}>
      <span className="break-words text-sm font-black leading-tight text-slate-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className="h-14 min-w-0 rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-[#2fad50] focus:ring-4 focus:ring-[#2fad50]/12"
      />
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        rows={4}
        className="min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-[#2fad50] focus:ring-4 focus:ring-[#2fad50]/12"
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-[#2fad50] focus:ring-4 focus:ring-[#2fad50]/12"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function YesNoQuestion({
  label,
  noLabel,
  onChange,
  value,
  yesLabel,
}: {
  label: string;
  noLabel: string;
  onChange: (value: boolean) => void;
  value: boolean | null;
  yesLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-base font-black text-slate-800">{label}</p>
      <div className="inline-flex w-fit max-w-full self-start rounded-full bg-slate-100 p-1">
        {[
          { label: yesLabel, value: true },
          { label: noLabel, value: false },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-10 rounded-full px-6 text-sm font-black transition ${
              value === option.value
                ? "bg-[#2fad50] text-white shadow-sm"
                : "text-slate-700 hover:bg-white hover:text-[#228b40]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <h3 className="text-sm font-black uppercase text-[#2fad50]">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
        {children}
      </div>
    </section>
  );
}

function TurnstileChallenge({
  errorLabel,
  expiredLabel,
  onError,
  onTokenChange,
  resetSignal,
  siteKey,
}: {
  errorLabel: string;
  expiredLabel: string;
  onError: (message: string) => void;
  onTokenChange: (token: string) => void;
  resetSignal: number;
  siteKey: string;
}) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !scriptLoaded ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current
    ) {
      return;
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        size: "flexible",
        callback: (token) => onTokenChange(token),
        "expired-callback": () => {
          onTokenChange("");
          onError(expiredLabel);
        },
        "error-callback": () => {
          onTokenChange("");
          onError(errorLabel);
        },
      });
    };

    renderWidget();

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [
    errorLabel,
    expiredLabel,
    onError,
    onTokenChange,
    scriptLoaded,
    siteKey,
  ]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
      onTokenChange("");
    }
  }, [onTokenChange, resetSignal]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        ref={containerRef}
        className="min-h-[65px] w-full overflow-hidden rounded-xl bg-white"
      />
    </>
  );
}

export function OfferFlow({
  dictionary,
  initialVin = "",
  locale,
}: {
  dictionary: Dictionary;
  initialVin?: string;
  locale: Locale;
}) {
  const flow = dictionary.offerFlow;
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<FlowData>(() => emptyFlowData(initialVin));
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [lookupError, setLookupError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const lookedUpInitialVin = useRef(false);

  const currentStep = flow.steps[stepIndex];
  const submitted = submitStatus === "success";
  const isFinalStep = stepIndex === flow.steps.length - 1;
  const needsTurnstile = Boolean(turnstileSiteKey);

  const setField = <K extends keyof FlowData>(key: K, value: FlowData[K]) => {
    setValidationError("");
    setSubmitError("");
    setData((current) => ({ ...current, [key]: value }));
  };

  const handleTurnstileTokenChange = useCallback((token: string) => {
    setTurnstileToken(token);
    setSubmitError("");
    setValidationError("");
  }, []);

  const handleTurnstileError = useCallback((message: string) => {
    setTurnstileToken("");
    setSubmitError(message);
  }, []);

  const canContinue = useMemo(() => {
    if (stepIndex === 0) {
      return Boolean(
        data.year &&
          data.make &&
          data.model &&
          data.streetAddress &&
          data.city &&
          data.state &&
          data.zip &&
          isServiceAreaZip(data.zip) &&
          data.phone &&
          data.firstName &&
          data.email &&
          data.hasTitle !== null &&
          (data.hasTitle || data.paperwork),
      );
    }

    if (stepIndex === 1) {
      return Boolean(
        data.mileage &&
          data.drives !== null &&
          data.catalyticConverter !== null &&
          (data.drives ||
            (data.tiresInflated !== null &&
              data.wheelsAttached !== null &&
              data.rolls !== null)),
      );
    }

    if (stepIndex === 2) {
      return Boolean(
        data.bodyDamage &&
          data.airbagsDeployed !== null &&
          data.hasKeys !== null &&
          data.access,
      );
    }

    return true;
  }, [data, stepIndex]);

  async function lookupVin(vinToLookup = data.vin) {
    const vin = normalizeVin(vinToLookup);

    if (vin.length !== 17) {
      setLookupStatus("error");
      setLookupError(dictionary.offerForm.lookupVinError);
      return;
    }

    setLookupStatus("loading");
    setLookupError("");

    try {
      const response = await fetch(
        `/api/vehicle/lookup?vin=${encodeURIComponent(vin)}`,
      );
      const result = (await response.json()) as VehicleLookupResponse;

      if (!response.ok || !result.vehicle) {
        throw new Error(result.error ?? dictionary.offerForm.lookupGenericError);
      }

      setData((current) => ({
        ...current,
        bodyDamage: current.bodyDamage,
        make: result.vehicle?.make ?? current.make,
        model: result.vehicle?.model ?? current.model,
        trim: result.vehicle?.trim ?? current.trim,
        vin,
        year: result.vehicle?.year ?? current.year,
      }));
      setLookupStatus("success");
    } catch (error) {
      setLookupStatus("error");
      setLookupError(
        error instanceof Error ? error.message : dictionary.offerForm.lookupGenericError,
      );
    }
  }

  useEffect(() => {
    if (lookedUpInitialVin.current || data.vin.length !== 17) {
      return;
    }

    lookedUpInitialVin.current = true;
    void lookupVin(data.vin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.vin]);

  async function submitOffer() {
    if (needsTurnstile && !turnstileToken) {
      setValidationError(flow.common.turnstileRequired);
      return;
    }

    setSubmitStatus("loading");
    setSubmitError("");

    try {
      const response = await fetch("/api/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead: data,
          locale,
          turnstileToken,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? flow.common.submitError);
      }

      setSubmitStatus("success");
      setTurnstileToken("");
      sendGTMEvent({
        event: "offer_form_submit_success",
        form_name: "cash_offer",
        language: locale,
      });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitError(
        error instanceof Error ? error.message : flow.common.submitError,
      );
      setTurnstileResetSignal((current) => current + 1);
    }
  }

  async function handleNext() {
    if (!canContinue) {
      if (
        stepIndex === 0 &&
        data.zip.length === 5 &&
        !isServiceAreaZip(data.zip)
      ) {
        setValidationError(flow.common.outsideServiceArea);
        return;
      }

      setValidationError(flow.common.required);
      return;
    }

    setValidationError("");

    if (!isFinalStep) {
      setStepIndex((current) => current + 1);
      return;
    }

    await submitOffer();
  }

  function handleBack() {
    setValidationError("");
    setSubmitError("");
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleNext();
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-[68px] text-slate-950">
      <header className="fixed inset-x-0 top-0 z-[80] flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-5 text-slate-950 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-8">
        <Link href={getLocalePath(locale)} className="inline-flex items-center">
          <Image
            src="/logo.svg"
            alt="Cash For Cars"
            width={184}
            height={57}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-3 text-sm font-black sm:text-base">
          <span className="hidden text-slate-600 sm:inline">{flow.helpLabel}</span>
          <Link
            href={phoneHref}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition hover:border-[#bde9c9] hover:bg-[#ecfdf1] hover:text-[#228b40]"
          >
            <Phone aria-hidden="true" className="h-4 w-4 text-[#2fad50]" />
            {phoneNumber}
          </Link>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1800px] overflow-hidden bg-[#f6f8fb] lg:grid-cols-[320px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white px-8 py-12 text-center text-slate-950 lg:flex lg:flex-col lg:justify-between">
          <div>
            <h1 className="text-2xl font-black">{flow.introTitle}</h1>
            <p className="mx-auto mt-4 max-w-[220px] text-sm font-bold leading-5 text-slate-600">
              {flow.introBody}
            </p>

            <ol className="mt-12 grid gap-4">
              {flow.steps.map((step, index) => (
                <li
                  key={step.id}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    index === stepIndex
                      ? "bg-[#ecfdf1] text-[#228b40] shadow-[inset_0_0_0_1px_#bde9c9]"
                      : index < stepIndex
                        ? "text-slate-500"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 text-sm font-black text-slate-600">
            {flow.proof.map((item) => (
              <p key={item} className="py-1">
                {item}
              </p>
            ))}
          </div>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="px-5 py-8 sm:px-8 lg:px-20 lg:py-14"
        >
          <Link
            href={getLocalePath(locale)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-slate-950 lg:hidden"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            {flow.backHome}
          </Link>

          <div className="mb-8 flex flex-wrap gap-2 lg:hidden">
            {flow.steps.map((step, index) => (
              <span
                key={step.id}
                className={`rounded-full px-3 py-1.5 text-xs font-black ${
                  index === stepIndex
                    ? "bg-[#2fad50] text-white"
                    : "border border-slate-200 bg-white text-slate-500"
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.section key={currentStep.id} {...stepMotion}>
              {stepIndex === 0 ? (
                <VehicleStep
                  data={data}
                  dictionary={dictionary}
                  flow={flow}
                  lookupError={lookupError}
                  lookupStatus={lookupStatus}
                  lookupVin={lookupVin}
                  setField={setField}
                />
              ) : null}

              {stepIndex === 1 ? (
                <MechanicalStep data={data} flow={flow} setField={setField} />
              ) : null}

              {stepIndex === 2 ? (
                <BodyStep data={data} flow={flow} setField={setField} />
              ) : null}

              {stepIndex === 3 ? (
                <ReviewStep data={data} flow={flow} submitted={submitted} />
              ) : null}
            </motion.section>
          </AnimatePresence>

          {isFinalStep && !submitted ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <p className="mb-3 text-sm font-black text-slate-700">
                {flow.review.securityTitle}
              </p>
              {turnstileSiteKey ? (
                <TurnstileChallenge
                  errorLabel={flow.common.turnstileError}
                  expiredLabel={flow.common.turnstileExpired}
                  onError={handleTurnstileError}
                  onTokenChange={handleTurnstileTokenChange}
                  resetSignal={turnstileResetSignal}
                  siteKey={turnstileSiteKey}
                />
              ) : (
                <p className="text-sm font-bold text-red-700">
                  {flow.common.turnstileMissing}
                </p>
              )}
            </div>
          ) : null}

          {validationError || submitError ? (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>{validationError || submitError}</p>
            </div>
          ) : null}

          {!submitted ? (
            <div className="mt-8 flex justify-end gap-4">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-slate-50"
                >
                  {flow.common.back}
                </button>
              ) : null}
              <button
                type="submit"
                disabled={
                  submitStatus === "loading" ||
                  (isFinalStep && (!turnstileSiteKey || !turnstileToken))
                }
                className="h-11 rounded-lg bg-[#2fad50] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(47,173,80,0.22)] transition hover:bg-[#279746] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {submitStatus === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                    {flow.common.submitting}
                  </span>
                ) : isFinalStep ? (
                  flow.common.submit
                ) : (
                  flow.common.next
                )}
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </main>
  );
}

function VehicleStep({
  data,
  dictionary,
  flow,
  lookupError,
  lookupStatus,
  lookupVin,
  setField,
}: {
  data: FlowData;
  dictionary: Dictionary;
  flow: Dictionary["offerFlow"];
  lookupError: string;
  lookupStatus: "idle" | "loading" | "success" | "error";
  lookupVin: () => void;
  setField: <K extends keyof FlowData>(key: K, value: FlowData[K]) => void;
}) {
  const vehicleTitle = [data.year, data.make, data.model].filter(Boolean).join(" ");
  const zipHasFiveDigits = data.zip.length === 5;
  const zipIsAllowed = isServiceAreaZip(data.zip);

  return (
    <div>
      <h2 className="text-3xl font-black text-slate-950">{flow.vehicle.title}</h2>

      <div className="mt-8 grid gap-5">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">
              {flow.vehicle.vinLabel}
            </span>
            <div className="flex h-14 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#2fad50] focus-within:ring-4 focus-within:ring-[#2fad50]/12">
              <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
              <input
                value={data.vin}
                onChange={(event) => setField("vin", normalizeVin(event.target.value))}
                placeholder={flow.vehicle.vinPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-base font-bold uppercase outline-none"
                maxLength={17}
              />
              <span className="text-xs font-bold text-slate-400">
                {data.vin.length}/17
              </span>
            </div>
          </label>
          <button
            type="button"
            onClick={() => lookupVin()}
            disabled={lookupStatus === "loading" || data.vin.length !== 17}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2fad50] px-4 text-sm font-black text-white transition hover:bg-[#279746] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-fit"
          >
            {lookupStatus === "loading" ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : null}
            {lookupStatus === "loading"
              ? flow.vehicle.lookupLoading
              : flow.vehicle.lookupButton}
          </button>

          {lookupStatus === "success" ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#bde9c9] bg-[#ecfdf1] p-3 text-sm font-bold text-[#1f7a38]">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>
                {flow.vehicle.lookupFound}
                {vehicleTitle ? `: ${vehicleTitle}` : ""}
              </p>
            </div>
          ) : null}

          {lookupStatus === "error" ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>{lookupError}</p>
            </div>
          ) : null}

          <p className="text-xs font-bold text-slate-500">
            {flow.vehicle.manualHint}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <TextField
            label={flow.vehicle.year}
            onChange={(value) => setField("year", value)}
            value={data.year}
          />
          <TextField
            label={flow.vehicle.make}
            onChange={(value) => setField("make", value)}
            value={data.make}
          />
          <TextField
            label={flow.vehicle.model}
            onChange={(value) => setField("model", value)}
            value={data.model}
          />
          <TextField
            label={flow.vehicle.trim}
            onChange={(value) => setField("trim", value)}
            value={data.trim}
          />
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] lg:col-span-2">
            <div>
              <h3 className="text-base font-black text-slate-950">
                {flow.vehicle.pickupAddressTitle}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                {flow.vehicle.pickupAddressBody}
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <TextField
                label={flow.vehicle.streetAddress}
                onChange={(value) => setField("streetAddress", value)}
                value={data.streetAddress}
                autoComplete="street-address"
                className="xl:col-span-2"
              />
              <TextField
                label={flow.vehicle.addressLine2}
                onChange={(value) => setField("addressLine2", value)}
                value={data.addressLine2}
                autoComplete="address-line2"
                className="xl:col-span-2"
              />
              <TextField
                label={flow.vehicle.city}
                onChange={(value) => setField("city", value)}
                value={data.city}
                autoComplete="address-level2"
                className="md:col-span-2 xl:col-span-2"
              />
              <TextField
                label={flow.vehicle.state}
                onChange={(value) =>
                  setField("state", value.toUpperCase().slice(0, 2))
                }
                value={data.state}
                autoComplete="address-level1"
                maxLength={2}
              />
              <TextField
                label={flow.vehicle.zip}
                onChange={(value) => setField("zip", normalizeZip(value))}
                value={data.zip}
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={5}
              />
            </div>

            {zipHasFiveDigits ? (
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 text-sm font-bold ${
                  zipIsAllowed
                    ? "border-[#bde9c9] bg-[#ecfdf1] text-[#1f7a38]"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {zipIsAllowed ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                ) : (
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                )}
                <p>
                  {zipIsAllowed ? (
                    flow.vehicle.zipAccepted
                  ) : (
                    <>
                      {flow.vehicle.zipRejected}{" "}
                      <a
                        href={referralEmailHref}
                        className="underline decoration-current underline-offset-4"
                      >
                        {flow.vehicle.zipRejectedEmail}
                      </a>
                      {" "}
                      {flow.vehicle.zipRejectedOr}{" "}
                      <a
                        href={serviceAreaTextHref}
                        className="underline decoration-current underline-offset-4"
                      >
                        {flow.vehicle.zipRejectedText}
                      </a>
                      .
                    </>
                  )}
                </p>
              </div>
            ) : null}
          </section>
          <TextField
            label={flow.vehicle.phone}
            onChange={(value) => setField("phone", value)}
            value={data.phone}
            autoComplete="tel"
            inputMode="tel"
          />
          <TextField
            label={flow.vehicle.firstName}
            onChange={(value) => setField("firstName", value)}
            value={data.firstName}
            autoComplete="given-name"
          />
          <TextField
            label={flow.vehicle.lastName}
            onChange={(value) => setField("lastName", value)}
            value={data.lastName}
            autoComplete="family-name"
          />
          <div className="lg:col-span-2">
            <TextField
              label={flow.vehicle.email}
              onChange={(value) => setField("email", value)}
              type="email"
              value={data.email}
              autoComplete="email"
              inputMode="email"
            />
          </div>
        </div>

        <YesNoQuestion
          label={flow.vehicle.titleQuestion}
          noLabel={flow.common.no}
          onChange={(value) => {
            setField("hasTitle", value);
            if (value) {
              setField("paperwork", "");
            }
          }}
          value={data.hasTitle}
          yesLabel={flow.common.yes}
        />

        <AnimatePresence>
          {data.hasTitle === false ? (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -8 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -8 }}
              className="overflow-hidden"
            >
              <SelectField
                label={flow.vehicle.paperworkQuestion}
                onChange={(value) => setField("paperwork", value)}
                options={flow.vehicle.paperworkOptions}
                placeholder={flow.vehicle.paperworkPlaceholder}
                value={data.paperwork}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <p className="text-xs font-bold text-slate-500">
          {dictionary.offerForm.lookupNote}
        </p>
      </div>
    </div>
  );
}

function MechanicalStep({
  data,
  flow,
  setField,
}: {
  data: FlowData;
  flow: Dictionary["offerFlow"];
  setField: <K extends keyof FlowData>(key: K, value: FlowData[K]) => void;
}) {
  return (
    <div>
      <h2 className="text-3xl font-black text-slate-950">
        {flow.mechanical.title}
      </h2>

      <div className="mt-8 grid gap-5">
        <SelectField
          label={flow.mechanical.mileageQuestion}
          onChange={(value) => setField("mileage", value)}
          options={flow.mechanical.mileageOptions}
          placeholder={flow.mechanical.mileagePlaceholder}
          value={data.mileage}
        />
        <YesNoQuestion
          label={flow.mechanical.drivesQuestion}
          noLabel={flow.common.no}
          onChange={(value) => {
            setField("drives", value);
            if (value) {
              setField("tiresInflated", null);
              setField("wheelsAttached", null);
              setField("rolls", null);
            }
          }}
          value={data.drives}
          yesLabel={flow.common.yes}
        />

        <AnimatePresence>
          {data.drives === false ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid gap-5 overflow-hidden"
            >
              <YesNoQuestion
                label={flow.mechanical.tiresQuestion}
                noLabel={flow.common.no}
                onChange={(value) => setField("tiresInflated", value)}
                value={data.tiresInflated}
                yesLabel={flow.common.yes}
              />
              <YesNoQuestion
                label={flow.mechanical.wheelsQuestion}
                noLabel={flow.common.no}
                onChange={(value) => setField("wheelsAttached", value)}
                value={data.wheelsAttached}
                yesLabel={flow.common.yes}
              />
              <YesNoQuestion
                label={flow.mechanical.rollsQuestion}
                noLabel={flow.common.no}
                onChange={(value) => setField("rolls", value)}
                value={data.rolls}
                yesLabel={flow.common.yes}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <YesNoQuestion
          label={flow.mechanical.catalyticQuestion}
          noLabel={flow.common.no}
          onChange={(value) => setField("catalyticConverter", value)}
          value={data.catalyticConverter}
          yesLabel={flow.common.yes}
        />
      </div>
    </div>
  );
}

function BodyStep({
  data,
  flow,
  setField,
}: {
  data: FlowData;
  flow: Dictionary["offerFlow"];
  setField: <K extends keyof FlowData>(key: K, value: FlowData[K]) => void;
}) {
  return (
    <div>
      <h2 className="text-3xl font-black text-slate-950">{flow.body.title}</h2>

      <div className="mt-8 grid gap-5">
        <SelectField
          label={flow.body.damageQuestion}
          onChange={(value) => setField("bodyDamage", value)}
          options={flow.body.damageOptions}
          placeholder={flow.body.damageQuestion}
          value={data.bodyDamage}
        />
        <YesNoQuestion
          label={flow.body.airbagsQuestion}
          noLabel={flow.common.no}
          onChange={(value) => setField("airbagsDeployed", value)}
          value={data.airbagsDeployed}
          yesLabel={flow.common.yes}
        />
        <YesNoQuestion
          label={flow.body.keysQuestion}
          noLabel={flow.common.no}
          onChange={(value) => setField("hasKeys", value)}
          value={data.hasKeys}
          yesLabel={flow.common.yes}
        />
        <SelectField
          label={flow.body.accessQuestion}
          onChange={(value) => setField("access", value)}
          options={flow.body.accessOptions}
          placeholder={flow.body.accessQuestion}
          value={data.access}
        />
        <TextAreaField
          label={flow.body.accessNotes}
          onChange={(value) => setField("accessNotes", value)}
          placeholder={flow.body.accessNotesPlaceholder}
          value={data.accessNotes}
        />
      </div>
    </div>
  );
}

function ReviewStep({
  data,
  flow,
  submitted,
}: {
  data: FlowData;
  flow: Dictionary["offerFlow"];
  submitted: boolean;
}) {
  return (
    <div>
      {submitted ? (
        <div className="mb-6 rounded-2xl border border-[#bde9c9] bg-[#ecfdf1] p-5">
          <h2 className="text-2xl font-black text-[#1f7a38]">
            {flow.review.submittedTitle}
          </h2>
          <p className="mt-2 text-sm font-bold text-[#1f7a38]">
            {flow.review.submittedBody}
          </p>
        </div>
      ) : null}

      <h2 className="text-3xl font-black text-slate-950">{flow.review.title}</h2>
      <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
        {flow.review.body}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        <SummaryCard title={flow.review.vehicleSummary}>
          <p>
            {[data.year, data.make, data.model, data.trim].filter(Boolean).join(" ") ||
              data.vin}
          </p>
          <p>{data.zip}</p>
          <p>{data.hasTitle ? flow.common.yes : data.paperwork}</p>
        </SummaryCard>
        <SummaryCard title={flow.review.pickupSummary}>
          <p>{data.streetAddress}</p>
          {data.addressLine2 ? <p>{data.addressLine2}</p> : null}
          <p>
            {[data.city, data.state, data.zip].filter(Boolean).join(" ")}
          </p>
          {data.accessNotes ? <p>{data.accessNotes}</p> : null}
        </SummaryCard>
        <SummaryCard title={flow.review.contactSummary}>
          <p>{[data.firstName, data.lastName].filter(Boolean).join(" ")}</p>
          <p>{data.phone}</p>
          <p>{data.email}</p>
        </SummaryCard>
        <SummaryCard title={flow.review.conditionSummary}>
          <p>{data.mileage}</p>
          <p>{data.drives ? flow.common.yes : flow.common.no}</p>
          <p>{data.bodyDamage}</p>
        </SummaryCard>
      </div>
    </div>
  );
}
