"use client";

import Image from "next/image";
import Link from "next/link";
import { TurnstileChallenge } from "./turnstile-challenge";
import { LeadRequestGate } from "./lead-request-gate";
import { sendGTMEvent } from "@next/third-parties/google";
import {
  FormEvent,
  useCallback,
  useEffect,
  createContext,
  useContext,
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
import { getOfferSubmissionIdentity, validateOfferStep, type OfferLead, type OfferField, type OfferSubmissionIdentity } from "../offer-validation";
import { getLocalePath } from "../dictionaries";
import { getLeadSubmissionReceipt, saveLeadSubmissionReceipt } from "../lead-submission-receipt";
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

type FlowData = OfferLead;
type FieldErrors = Partial<Record<OfferField, string>>;
const FieldErrorsContext = createContext<FieldErrors>({});

function FieldError({ name }: { name?: OfferField }) {
  const errors = useContext(FieldErrorsContext);
  return name && errors[name] ? (
    <span id={`offer-${name}-error`} className="text-sm font-semibold text-red-700">
      {errors[name]}
    </span>
  ) : null;
}

const phoneNumber = serviceAreaPhone;
const phoneHref = serviceAreaPhoneHref;
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const stepMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

function normalizeVin(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
}

function emptyFlowData(initialVin = "", initialYear = "", initialMake = "", initialModel = ""): FlowData {
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
    make: initialMake,
    mileage: "",
    model: initialModel,
    paperwork: "",
    phone: "",
    rolls: null,
    state: "CA",
    streetAddress: "",
    tiresInflated: null,
    trim: "",
    vin: normalizeVin(initialVin),
    wheelsAttached: null,
    year: initialYear,
    zip: "",
  };
}

function successPreviewFlowData(initialVin = ""): FlowData {
  return {
    ...emptyFlowData(initialVin),
    access: "Home driveway",
    accessNotes: "Success preview only. No lead was submitted.",
    bodyDamage: "Minor cosmetic damage",
    catalyticConverter: true,
    city: "San Diego",
    drives: true,
    email: "seller@example.com",
    firstName: "Preview",
    hasKeys: true,
    hasTitle: true,
    make: "Honda",
    mileage: "Under 150,000",
    model: "Civic",
    phone: "619-830-7005",
    state: "CA",
    streetAddress: "552 Alta Rd #4",
    trim: "LX",
    year: "2014",
    zip: "92154",
  };
}

function TextField({
  name,
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
  name?: OfferField;
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
  const errors = useContext(FieldErrorsContext);
  const invalid = name ? Boolean(errors[name]) : false;
  return (
    <label className={`grid min-w-0 gap-2 ${className}`}>
      <span className="break-words text-sm font-black leading-tight text-slate-700">
        {label}
      </span>
      <input
        id={name ? `offer-${name}` : undefined}
        name={name}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `offer-${name}-error` : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className="aria-invalid:border-red-500 aria-invalid:bg-red-50 h-14 min-w-0 rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-[#2fad50] focus:ring-4 focus:ring-[#2fad50]/12"
      />
      <FieldError name={name} />
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
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        rows={4}
        className="min-h-28 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-[#2fad50] focus:ring-4 focus:ring-[#2fad50]/12"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  name: OfferField;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  const errors = useContext(FieldErrorsContext);
  const invalid = Boolean(errors[name]);
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select
        id={`offer-${name}`}
        name={name}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `offer-${name}-error` : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="aria-invalid:border-red-500 aria-invalid:bg-red-50 h-14 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-[#2fad50] focus:ring-4 focus:ring-[#2fad50]/12"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError name={name} />
    </label>
  );
}

function YesNoQuestion({
  name,
  label,
  noLabel,
  onChange,
  value,
  yesLabel,
}: {
  name: OfferField;
  label: string;
  noLabel: string;
  onChange: (value: boolean) => void;
  value: boolean | null;
  yesLabel: string;
}) {
  const errors = useContext(FieldErrorsContext);
  const invalid = Boolean(errors[name]);
  return (
    <fieldset
      aria-describedby={invalid ? `offer-${name}-error` : undefined}
      className={`min-w-0 rounded-2xl border p-4 ${invalid ? "border-red-500 bg-red-50" : "border-slate-200 bg-white"}`}
    >
      <legend className="px-1 text-base font-black text-slate-800">{label}</legend>
      <div className="inline-flex w-fit max-w-full rounded-full bg-slate-100 p-1">
        {[
          { label: yesLabel, value: true },
          { label: noLabel, value: false },
        ].map((option, index) => (
          <button
            key={option.label}
            id={index === 0 ? `offer-${name}` : undefined}
            type="button"
            aria-pressed={value === option.value}
            aria-describedby={invalid ? `offer-${name}-error` : undefined}
            onClick={() => onChange(option.value)}
            className={`h-11 rounded-full px-6 text-sm font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c33] ${
              value === option.value
                ? "bg-[#1f7a38] text-white shadow-sm"
                : "text-slate-700 hover:bg-white hover:text-[#176c33]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-2"><FieldError name={name} /></div>
    </fieldset>
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
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <h3 className="text-sm font-black uppercase text-[#2fad50]">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
        {children}
      </div>
    </section>
  );
}

type OfferFlowProps = {
  dictionary: Dictionary;
  initialVin?: string;
  initialYear?: string;
  initialMake?: string;
  initialModel?: string;
  locale: Locale;
  previewSuccess?: boolean;
};

export function OfferFlow(props: OfferFlowProps) {
  const [freshVehicle, setFreshVehicle] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function startAnotherVehicle() {
    setFreshVehicle(true);
    setFormKey((current) => current + 1);
  }

  return (
    <LeadRequestGate locale={props.locale} bypass={props.previewSuccess} fullPage onStartAnother={startAnotherVehicle}>
      <OfferFlowBody
        key={formKey}
        {...props}
        initialVin={freshVehicle ? "" : props.initialVin}
        initialYear={freshVehicle ? "" : props.initialYear}
        initialMake={freshVehicle ? "" : props.initialMake}
        initialModel={freshVehicle ? "" : props.initialModel}
      />
    </LeadRequestGate>
  );
}

function OfferFlowBody({
  dictionary,
  initialVin = "",
  initialYear = "",
  initialMake = "",
  initialModel = "",
  locale,
  previewSuccess = false,
}: OfferFlowProps) {
  const flow = dictionary.offerFlow;
  const [stepIndex, setStepIndex] = useState(previewSuccess ? 3 : 0);
  const [data, setData] = useState<FlowData>(() =>
    previewSuccess ? successPreviewFlowData(initialVin) : emptyFlowData(initialVin, initialYear, initialMake, initialModel),
  );
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [lookupError, setLookupError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const shouldFocusStep = useRef(false);
  const [submitError, setSubmitError] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(previewSuccess ? "success" : "idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const lookupAbortRef = useRef<AbortController | null>(null);
  const submitAbortRef = useRef<AbortController | null>(null);
  const submissionRef = useRef<OfferSubmissionIdentity | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => () => {
    lookupAbortRef.current?.abort();
    submitAbortRef.current?.abort();
  }, []);

  const currentStep = flow.steps[stepIndex];
  const submitted = submitStatus === "success";
  const isFinalStep = stepIndex === flow.steps.length - 1;
  const needsTurnstile = Boolean(turnstileSiteKey);

  const setField = <K extends keyof FlowData>(key: K, value: FlowData[K]) => {
    if (["vin", "year", "make", "model"].includes(key)) {
      lookupAbortRef.current?.abort();
      setLookupStatus("idle");
      setLookupError("");
    }
    setValidationError("");
    setSubmitError("");
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setData((current) => ({ ...current, [key]: value }));
  };

  const handleTurnstileTokenChange = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) {
      setSecurityError("");
      setValidationError("");
    }
  }, []);

  const handleTurnstileError = useCallback((message: string) => {
    setTurnstileToken("");
    setSecurityError(message);
  }, []);

  function errorsForStep(step: number) {
    const fields = validateOfferStep(data, step);
    if (step === 0 && !isServiceAreaZip(data.zip) && !fields.includes("zip")) fields.push("zip");
    const labels: Partial<Record<OfferField, string>> = {
      year: flow.vehicle.year, make: flow.vehicle.make, model: flow.vehicle.model,
      firstName: flow.vehicle.firstName, zip: flow.vehicle.zip, phone: flow.vehicle.phone,
      streetAddress: flow.vehicle.streetAddress, city: flow.vehicle.city, state: flow.vehicle.state,
      email: flow.vehicle.email, hasTitle: flow.vehicle.titleQuestion, paperwork: flow.vehicle.paperworkQuestion,
      mileage: flow.mechanical.mileageQuestion, drives: flow.mechanical.drivesQuestion,
      catalyticConverter: flow.mechanical.catalyticQuestion, tiresInflated: flow.mechanical.tiresQuestion,
      wheelsAttached: flow.mechanical.wheelsQuestion, rolls: flow.mechanical.rollsQuestion,
      bodyDamage: flow.body.damageQuestion, access: flow.body.accessQuestion,
      airbagsDeployed: flow.body.airbagsQuestion, hasKeys: flow.body.keysQuestion,
    };
    const errors: FieldErrors = {};
    for (const field of fields) {
      if (field === "phone") errors[field] = locale === "es" ? "Ingresa un teléfono de 10 dígitos." : "Enter a 10-digit phone number.";
      else if (field === "email") errors[field] = locale === "es" ? "Ingresa un correo válido." : "Enter a valid email address.";
      else if (field === "year") errors[field] = locale === "es" ? "Ingresa un año válido de 4 dígitos." : "Enter a valid 4-digit vehicle year.";
      else if (field === "zip") errors[field] = data.zip.length === 5 ? flow.common.outsideServiceArea : (locale === "es" ? "Ingresa el código postal de 5 dígitos del vehículo." : "Enter the vehicle’s 5-digit ZIP code.");
      else errors[field] = `${labels[field]}: ${locale === "es" ? "completa esta respuesta." : "please complete this answer."}`;
    }
    return errors;
  }

  function focusField(field: string) {
    const control = formRef.current?.querySelector<HTMLElement>(`#offer-${field}`);
    // Optional details must open before an invalid optional field can receive focus.
    const disclosure = control?.closest("details");
    if (disclosure) disclosure.open = true;
    control?.focus();
    control?.scrollIntoView({ block: "center", behavior: "auto" });
  }

  function goToStep(step: number) {
    setValidationError("");
    setFieldErrors({});
    setSubmitError("");
    setSecurityError("");
    setTurnstileToken("");
    shouldFocusStep.current = true;
    setStepIndex(step);
  }

  async function lookupVin(vinToLookup = data.vin) {
    const vin = normalizeVin(vinToLookup);

    if (vin.length !== 17) {
      setLookupStatus("error");
      setLookupError(dictionary.offerForm.lookupVinError);
      return;
    }

    lookupAbortRef.current?.abort();
    const controller = new AbortController();
    lookupAbortRef.current = controller;
    setLookupStatus("loading");
    setLookupError("");

    try {
      const response = await fetch(
        `/api/vehicle/lookup?vin=${encodeURIComponent(vin)}`,
        { signal: controller.signal },
      );
      const result = (await response.json()) as VehicleLookupResponse;

      if (controller.signal.aborted) return;
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
      if (controller.signal.aborted) return;
      setLookupStatus("error");
      setLookupError(
        error instanceof Error ? error.message : dictionary.offerForm.lookupGenericError,
      );
    }
  }

  useEffect(() => {
    const vin = normalizeVin(initialVin);
    if (previewSuccess || vin.length !== 17) return;
    const timer = window.setTimeout(() => { void lookupVin(vin); }, 0);
    return () => {
      window.clearTimeout(timer);
      lookupAbortRef.current?.abort();
    };
    // Only a new incoming VIN should trigger auto-decoding; manual edits stay editable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVin, previewSuccess]);

  async function submitOffer() {
    // Recheck synchronously in case another form/tab completed before this click.
    if (submittingRef.current || getLeadSubmissionReceipt()) return;
    if (needsTurnstile && !turnstileToken) {
      setValidationError(flow.common.turnstileRequired);
      return;
    }

    submittingRef.current = true;
    setSubmitStatus("loading");
    setSubmitError("");
    const controller = new AbortController();
    submitAbortRef.current = controller;
    const deadline = window.setTimeout(() => controller.abort(), 30_000);
    const deliveryUnconfirmed = locale === "es"
      ? "No pudimos confirmar el envío. Tus respuestas siguen aquí; vuelve a intentarlo o llámanos."
      : "We couldn’t confirm delivery. Your answers are still here; please try again or call us.";
    let responseError = "";

    try {
      submissionRef.current = getOfferSubmissionIdentity(data, locale, submissionRef.current, () => crypto.randomUUID());
      const response = await fetch("/api/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead: data,
          locale,
          submissionId: submissionRef.current.id,
          turnstileToken,
        }),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
        ok?: boolean;
      } | null;

      if (controller.signal.aborted) {
        throw new Error(deliveryUnconfirmed);
      }
      if (!response.ok || result?.ok !== true) {
        responseError = typeof result?.error === "string" ? result.error : flow.common.submitError;
        throw new Error(responseError);
      }

      saveLeadSubmissionReceipt({
        vehicle: { year: data.year, make: data.make, model: data.model },
        source: "full",
      });
      setSubmitStatus("success");
      setTurnstileToken("");
      sendGTMEvent({
        event: "offer_form_submit_success",
        form_name: "cash_offer",
        language: locale,
      });
    } catch {
      setSubmitStatus("error");
      setSubmitError(controller.signal.aborted ? deliveryUnconfirmed : responseError || flow.common.submitError);
      setTurnstileToken("");
      setTurnstileResetSignal((current) => current + 1);
    } finally {
      window.clearTimeout(deadline);
      if (submitAbortRef.current === controller) submitAbortRef.current = null;
      submittingRef.current = false;
    }
  }

  async function handleNext() {
    if (submitStatus === "loading") return;
    const errors = errorsForStep(stepIndex);
    const invalidFields = Object.keys(errors);
    if (invalidFields.length > 0) {
      setFieldErrors(errors);
      setValidationError(flow.common.required);
      focusField(invalidFields[0]);
      return;
    }

    setValidationError("");
    setFieldErrors({});
    if (!isFinalStep) {
      goToStep(stepIndex + 1);
      return;
    }
    await submitOffer();
  }

  function handleBack() {
    if (submitStatus !== "loading") goToStep(Math.max(0, stepIndex - 1));
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

      <div className="mx-auto grid min-h-[calc(100vh-68px)] w-full min-w-0 max-w-[1800px] overflow-x-hidden bg-[#f6f8fb] lg:grid-cols-[320px_minmax(0,1fr)]">
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
          ref={formRef}
          noValidate
          onSubmit={handleSubmit}
          className="min-w-0 px-5 py-8 sm:px-8 lg:px-20 lg:py-14"
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
                    ? "bg-[#1f7a38] text-white"
                    : "border border-slate-200 bg-white text-slate-500"
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.section
              key={currentStep.id}
              className="min-w-0"
              {...stepMotion}
              onAnimationComplete={() => {
                if (!shouldFocusStep.current) return;
                shouldFocusStep.current = false;
                const heading = formRef.current?.querySelector<HTMLElement>("section h2");
                heading?.focus({ preventScroll: true });
                heading?.scrollIntoView({ behavior: "auto", block: "start" });
              }}
            >
              <FieldErrorsContext.Provider value={fieldErrors}>
              {stepIndex === 0 ? (
                <VehicleStep
                  data={data}
                  dictionary={dictionary}
                  locale={locale}
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
                <BodyStep data={data} flow={flow} locale={locale} setField={setField} />
              ) : null}

              {stepIndex === 3 ? (
                <ReviewStep data={data} flow={flow} locale={locale} onEdit={goToStep} editingDisabled={submitStatus === "loading"} submitted={submitted} />
              ) : null}
              </FieldErrorsContext.Provider>
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
                  retryLabel={locale === "es" ? "Reintentar verificación" : "Try security check again"}
                  loadingLabel={locale === "es" ? "Cargando verificación de seguridad…" : "Loading security check…"}
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

          {validationError || submitError || securityError ? (
            <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>{validationError || submitError || securityError}</p>
            </div>
          ) : null}

          {!submitted ? (
            <div className="mt-8 flex justify-end gap-4">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitStatus === "loading"}
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
                className="h-11 rounded-lg bg-[#1f7a38] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(47,173,80,0.22)] transition hover:bg-[#176c33] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
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
  locale,
  flow,
  lookupError,
  lookupStatus,
  lookupVin,
  setField,
}: {
  data: FlowData;
  dictionary: Dictionary;
  locale: Locale;
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
    <div className="min-w-0">
      <h2 tabIndex={-1} className="scroll-mt-24 outline-none text-3xl font-black text-slate-950">{flow.vehicle.title}</h2>

      <div className="mt-8 grid min-w-0 gap-5">
        <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-black text-slate-700">
              {flow.vehicle.vinLabel} ({locale === "es" ? "opcional" : "optional"})
            </span>
            <div className="flex h-14 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#2fad50] focus-within:ring-4 focus-within:ring-[#2fad50]/12">
              <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
              <input
                name="vin"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f7a38] px-4 text-sm font-black text-white transition hover:bg-[#176c33] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-fit"
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

        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <TextField
            name="year"
            label={flow.vehicle.year}
            onChange={(value) => setField("year", value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            maxLength={4}
            value={data.year}
          />
          <TextField
            name="make"
            label={flow.vehicle.make}
            onChange={(value) => setField("make", value)}
            value={data.make}
          />
          <TextField
            name="model"
            label={flow.vehicle.model}
            onChange={(value) => setField("model", value)}
            value={data.model}
          />
          <TextField
            name="trim"
            label={`${flow.vehicle.trim} (${locale === "es" ? "opcional" : "optional"})`}
            onChange={(value) => setField("trim", value)}
            value={data.trim}
          />
          <section className="grid min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] lg:col-span-2">
            <div>
              <h3 className="text-base font-black text-slate-950">
                {flow.vehicle.pickupAddressTitle}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                {flow.vehicle.pickupAddressBody}
              </p>
            </div>
            <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <TextField
                name="streetAddress"
                label={flow.vehicle.streetAddress}
                onChange={(value) => setField("streetAddress", value)}
                value={data.streetAddress}
                autoComplete="street-address"
                className="xl:col-span-2"
              />
              <TextField
                name="addressLine2"
                label={`${flow.vehicle.addressLine2} (${locale === "es" ? "opcional" : "optional"})`}
                onChange={(value) => setField("addressLine2", value)}
                value={data.addressLine2}
                autoComplete="address-line2"
                className="xl:col-span-2"
              />
              <TextField
                name="city"
                label={flow.vehicle.city}
                onChange={(value) => setField("city", value)}
                value={data.city}
                autoComplete="address-level2"
                className="md:col-span-2 xl:col-span-2"
              />
              <TextField
                name="state"
                label={flow.vehicle.state}
                onChange={(value) =>
                  setField("state", value.toUpperCase().slice(0, 2))
                }
                value={data.state}
                autoComplete="address-level1"
                maxLength={2}
              />
              <TextField
                name="zip"
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
            name="phone"
            label={flow.vehicle.phone}
            onChange={(value) => setField("phone", value)}
            value={data.phone}
            autoComplete="tel"
            inputMode="tel"
            type="tel"
          />
          <TextField
            name="firstName"
            label={flow.vehicle.firstName}
            onChange={(value) => setField("firstName", value)}
            value={data.firstName}
            autoComplete="given-name"
          />
          <TextField
            name="lastName"
            label={`${flow.vehicle.lastName} (${locale === "es" ? "opcional" : "optional"})`}
            onChange={(value) => setField("lastName", value)}
            value={data.lastName}
            autoComplete="family-name"
          />
          <div className="lg:col-span-2">
            <TextField
              name="email"
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
          name="hasTitle"
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
                name="paperwork"
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
    <div className="min-w-0">
      <h2 tabIndex={-1} className="scroll-mt-24 outline-none text-3xl font-black text-slate-950">
        {flow.mechanical.title}
      </h2>

      <div className="mt-8 grid min-w-0 gap-5">
        <SelectField
          name="mileage"
            label={flow.mechanical.mileageQuestion}
          onChange={(value) => setField("mileage", value)}
          options={flow.mechanical.mileageOptions}
          placeholder={flow.mechanical.mileagePlaceholder}
          value={data.mileage}
        />
        <YesNoQuestion
          name="drives"
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
                name="tiresInflated"
            label={flow.mechanical.tiresQuestion}
                noLabel={flow.common.no}
                onChange={(value) => setField("tiresInflated", value)}
                value={data.tiresInflated}
                yesLabel={flow.common.yes}
              />
              <YesNoQuestion
                name="wheelsAttached"
            label={flow.mechanical.wheelsQuestion}
                noLabel={flow.common.no}
                onChange={(value) => setField("wheelsAttached", value)}
                value={data.wheelsAttached}
                yesLabel={flow.common.yes}
              />
              <YesNoQuestion
                name="rolls"
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
          name="catalyticConverter"
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
  locale,
  setField,
}: {
  data: FlowData;
  flow: Dictionary["offerFlow"];
  locale: Locale;
  setField: <K extends keyof FlowData>(key: K, value: FlowData[K]) => void;
}) {
  return (
    <div className="min-w-0">
      <h2 tabIndex={-1} className="scroll-mt-24 outline-none text-3xl font-black text-slate-950">{flow.body.title}</h2>

      <div className="mt-8 grid min-w-0 gap-5">
        <SelectField
          name="bodyDamage"
            label={flow.body.damageQuestion}
          onChange={(value) => setField("bodyDamage", value)}
          options={flow.body.damageOptions}
          placeholder={flow.body.damageQuestion}
          value={data.bodyDamage}
        />
        <YesNoQuestion
          name="airbagsDeployed"
            label={flow.body.airbagsQuestion}
          noLabel={flow.common.no}
          onChange={(value) => setField("airbagsDeployed", value)}
          value={data.airbagsDeployed}
          yesLabel={flow.common.yes}
        />
        <YesNoQuestion
          name="hasKeys"
            label={flow.body.keysQuestion}
          noLabel={flow.common.no}
          onChange={(value) => setField("hasKeys", value)}
          value={data.hasKeys}
          yesLabel={flow.common.yes}
        />
        <SelectField
          name="access"
            label={flow.body.accessQuestion}
          onChange={(value) => setField("access", value)}
          options={flow.body.accessOptions}
          placeholder={flow.body.accessQuestion}
          value={data.access}
        />
        <TextAreaField
          label={`${flow.body.accessNotes} (${locale === "es" ? "opcional" : "optional"})`}
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
  locale,
  onEdit,
  editingDisabled,
  submitted,
}: {
  data: FlowData;
  flow: Dictionary["offerFlow"];
  locale: Locale;
  onEdit: (step: number) => void;
  editingDisabled: boolean;
  submitted: boolean;
}) {
  const editButton = (step: number, label: string) => !submitted ? (
    <button type="button" disabled={editingDisabled} onClick={() => onEdit(step)} className="mt-2 min-h-11 w-fit text-left text-sm font-bold text-[#1f7a38] underline underline-offset-4 disabled:opacity-50">
      {locale === "es" ? "Editar" : "Edit"} {label.toLowerCase()}
    </button>
  ) : null;
  const successMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!submitted) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      successMessageRef.current?.focus({ preventScroll: true });
      successMessageRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 50);

    return () => window.clearTimeout(scrollTimer);
  }, [submitted]);

  return (
    <div className="min-w-0">
      {submitted ? (
        <div
          ref={successMessageRef}
          role="status"
          aria-live="polite"
          tabIndex={-1}
          className="mb-6 scroll-mt-24 rounded-2xl border border-[#bde9c9] bg-[#ecfdf1] p-5 shadow-[0_18px_36px_rgba(47,173,80,0.14)] outline-none"
        >
          <h2 className="text-2xl font-black text-[#1f7a38]">
            {flow.review.submittedTitle}
          </h2>
          <p className="mt-2 text-sm font-bold text-[#1f7a38]">
            {flow.review.submittedBody}
          </p>
          <a
            href={phoneHref}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f7a38] px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(31,122,56,0.22)] transition hover:bg-[#16652d] sm:w-auto"
          >
            <Phone aria-hidden="true" className="h-4 w-4" />
            <span>
              {flow.review.submittedUrgentPrefix} {phoneNumber}
            </span>
          </a>
        </div>
      ) : null}

      <h2 tabIndex={-1} className="scroll-mt-24 outline-none text-3xl font-black text-slate-950">{flow.review.title}</h2>
      <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
        {flow.review.body}
      </p>

      <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2">
        <SummaryCard title={flow.review.vehicleSummary}>
          <p>
            {[data.year, data.make, data.model, data.trim].filter(Boolean).join(" ") ||
              data.vin}
          </p>
          <p>{data.zip}</p>
          <p>{flow.vehicle.titleQuestion} {data.hasTitle ? flow.common.yes : data.paperwork}</p>
          {editButton(0, flow.review.vehicleSummary)}
        </SummaryCard>
        <SummaryCard title={flow.review.pickupSummary}>
          <p>{data.streetAddress || (locale === "es" ? "Confirmaremos la dirección contigo." : "We’ll confirm the address with you.")}</p>
          {data.addressLine2 ? <p>{data.addressLine2}</p> : null}
          <p>
            {[data.city, data.state, data.zip].filter(Boolean).join(" ")}
          </p>
          <p>{data.access}</p>
          {data.accessNotes ? <p>{data.accessNotes}</p> : null}
          {editButton(0, flow.review.pickupSummary)}
        </SummaryCard>
        <SummaryCard title={flow.review.contactSummary}>
          <p>{[data.firstName, data.lastName].filter(Boolean).join(" ")}</p>
          <p>{data.phone}</p>
          {data.email ? <p>{data.email}</p> : null}
          {editButton(0, flow.review.contactSummary)}
        </SummaryCard>
        <SummaryCard title={flow.review.conditionSummary}>
          <p>{data.mileage}</p>
          <p>{flow.mechanical.drivesQuestion} {data.drives ? flow.common.yes : flow.common.no}</p>
          <p>{data.bodyDamage}</p>
          {editButton(1, flow.steps[1].label)}
          {editButton(2, flow.steps[2].label)}
        </SummaryCard>
      </div>
    </div>
  );
}
