"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { getOfferPath, type Locale } from "../dictionaries";
import { isValidPhone, isValidVehicleYear } from "../offer-validation";
import { useVinVehicle } from "../hooks/use-vin-vehicle";
import { INQUIRY_NOTES_MAX_LENGTH, type InquiryOwnershipStatus, type InquiryRunningStatus } from "../inquiry-validation";
import { isServiceAreaZip, serviceAreaPhone, serviceAreaPhoneHref } from "../service-area";
import { TurnstileChallenge } from "./turnstile-challenge";
import { LeadRequestGate } from "./lead-request-gate";
import { getLeadSubmissionReceipt, saveLeadSubmissionReceipt } from "../lead-submission-receipt";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Make = { id: number; name: string };
type LoadState = "idle" | "loading" | "ready" | "error";

const commonMakes = new Set(["acura", "audi", "bmw", "buick", "cadillac", "chevrolet", "chrysler", "dodge", "ford", "gmc", "honda", "hyundai", "infiniti", "jeep", "kia", "lexus", "lincoln", "mazda", "mercedes-benz", "mitsubishi", "nissan", "ram", "subaru", "tesla", "toyota", "volkswagen", "volvo"]);

const copy = {
  en: {
    title: "Start your cash offer",
    intro: "No VIN handy? Choose your vehicle below.",
    method: "How would you like to enter your vehicle?",
    details: "Year / Make / Model", vin: "VIN", year: "Year", make: "Make", model: "Model",
    selectYear: "Year", selectMake: "Make", selectModel: "Select model",
    yearFirst: "Year first", makeFirst: "Choose make first", loading: "Loading…",
    vinLabel: "Vehicle identification number (VIN)", vinPlaceholder: "Enter 17-character VIN",
    vinHelp: "Find it on your registration or the driver's side dashboard.",
    vinLoading: "Finding your vehicle…", vinFound: "Review your vehicle details below, then continue.", vinFailed: "Enter your vehicle details below to continue.", vinRetry: "Look up VIN again", vinLimit: "You can update any of these details before continuing.",
    continue: "Continue", continuing: "Sending…", next: "Next: two quick questions, contact details and pickup address.",
    contactTitle: "A few quick details", contactIntro: "Send this form once and our local team will call you. You won’t need to complete the detailed Get Offer form afterward.",
    runningStatus: "Does the vehicle start and run?", ownershipStatus: "Ownership / title", choose: "Select an answer", runs: "Yes", doesNotRun: "No", notSure: "Not sure", ownerTitle: "I own it (title available)", ownerNoTitle: "I own it (title missing)", authorizedSeller: "Authorized by the owner", otherOwnership: "Other / not sure", answerError: "Choose an answer, including “not sure” if needed.",
    fullName: "Full name", phone: "Phone number", zip: "ZIP code", edit: "Edit vehicle", send: "Send my request",
    notes: "Notes (optional)", notesPlaceholder: "Anything else you’d like us to know about the vehicle or pickup?", notesError: "Keep your notes to 2,000 characters or fewer.",
    pickupAddress: "Where is the vehicle?", streetAddress: "Street address", addressLine2: "Apartment, suite or unit (optional)", city: "City", state: "State", streetError: "Enter the vehicle’s street address.", cityError: "Enter the pickup city.", stateError: "Pickup is available in California within our service area.",
    security: "Security check", securityError: "The security check could not connect. Please retry or call us.", securityExpired: "The security check expired. Please try it again.", securityRetry: "Retry security check",
    unavailableSecurity: "Online verification is unavailable. Please call us to request an offer.",
    contactNotice: "By sending, you’re asking our team to call you about this vehicle.",
    detailed: "Prefer the detailed Get Offer form?", sent: "Your request was sent", sentBody: "Our local team will review your vehicle information and call you at",
    phoneError: "Enter a 10-digit US phone number.", zipError: "Enter a 5-digit pickup ZIP code.", areaError: "We currently serve San Diego County. Call us to confirm pickup for this ZIP.",
    deliveryError: "We couldn’t confirm delivery. Your answers are still here. Please retry or call us.", nameError: "Enter your full name.",
    reassurance: "Local team. No obligation to accept an offer.",
    manual: "Can't find your car? Enter the details", dropdowns: "Back to vehicle dropdowns",
    unavailable: "The vehicle list is unavailable. You can enter the details instead.",
    noModels: "No models found for this year and make. Enter the details instead.",
    invalidVin: "Enter a 17-character VIN without I, O, or Q, or choose Year / Make / Model.",
    missing: "Please complete:", popular: "Popular makes", allMakes: "Other makes",
  },
  es: {
    title: "Empieza tu oferta",
    intro: "¿No tienes el VIN? Elige tu carro aquí.",
    method: "¿Cómo quieres ingresar tu carro?",
    details: "Año / Marca / Modelo", vin: "VIN", year: "Año", make: "Marca", model: "Modelo",
    selectYear: "Año", selectMake: "Marca", selectModel: "Elige el modelo",
    yearFirst: "Primero año", makeFirst: "Primero elige la marca", loading: "Cargando…",
    vinLabel: "Número de identificación del carro (VIN)", vinPlaceholder: "VIN de 17 caracteres",
    vinHelp: "Está en tu registro o en el tablero del lado del conductor.",
    vinLoading: "Buscando tu vehículo…", vinFound: "Revisa los datos de tu carro y continúa.", vinFailed: "Ingresa los datos de tu carro abajo para continuar.", vinRetry: "Buscar VIN de nuevo", vinLimit: "Puedes editar estos datos antes de continuar.",
    continue: "Continuar", continuing: "Enviando…", next: "Después: dos preguntas, contacto y dirección del carro.",
    contactTitle: "Unos datos rápidos", contactIntro: "Envía este formulario una sola vez y nuestro equipo local te llamará. No necesitas llenar el formulario de oferta detallado después.",
    runningStatus: "¿El carro enciende y funciona?", ownershipStatus: "Propiedad / título", choose: "Elige una respuesta", runs: "Sí", doesNotRun: "No", notSure: "No sé", ownerTitle: "Soy dueño y tengo título", ownerNoTitle: "Soy dueño, sin título", authorizedSeller: "Autorizado por el dueño", otherOwnership: "Otra situación / no sé", answerError: "Elige una respuesta; puedes seleccionar “no sé”.",
    fullName: "Nombre completo", phone: "Teléfono", zip: "Código ZIP", edit: "Editar vehículo", send: "Enviar mi solicitud",
    notes: "Notas (opcional)", notesPlaceholder: "¿Algo más que quieras contarnos sobre el carro o la recogida?", notesError: "Escribe un máximo de 2,000 caracteres.",
    pickupAddress: "¿Dónde está el carro?", streetAddress: "Calle y número", addressLine2: "Departamento, suite o unidad (opcional)", city: "Ciudad", state: "Estado", streetError: "Ingresa la calle y el número donde está el carro.", cityError: "Ingresa la ciudad donde está el carro.", stateError: "Recogemos carros en California dentro de nuestra área de servicio.",
    security: "Verificación de seguridad", securityError: "La verificación no pudo conectar. Reintenta o llámanos.", securityExpired: "La verificación venció. Vuelve a intentarla.", securityRetry: "Reintentar verificación",
    unavailableSecurity: "La verificación no está disponible. Llámanos para solicitar una oferta.",
    contactNotice: "Al enviar, solicitas que nuestro equipo te llame sobre este vehículo.",
    detailed: "¿Prefieres el formulario de oferta detallado?", sent: "Tu solicitud fue enviada", sentBody: "Nuestro equipo local revisará los datos de tu carro y te llamará al",
    phoneError: "Ingresa un teléfono de Estados Unidos de 10 dígitos.", zipError: "Ingresa un ZIP de 5 dígitos.", areaError: "Por ahora damos servicio en San Diego County. Llámanos para confirmar este ZIP.",
    deliveryError: "No pudimos confirmar el envío. Tus respuestas siguen aquí. Reintenta o llámanos.", nameError: "Ingresa tu nombre completo.",
    reassurance: "Equipo local. Sin obligación de aceptar la oferta.",
    manual: "¿No encuentras tu carro? Ingresa los datos", dropdowns: "Volver a las listas de vehículos",
    unavailable: "La lista no está disponible. Puedes ingresar los datos de tu carro.",
    noModels: "No encontramos modelos para ese año y marca. Puedes ingresar los datos.",
    invalidVin: "Ingresa un VIN de 17 caracteres sin I, O ni Q, o elige Año / Marca / Modelo.",
    missing: "Completa estos campos:", popular: "Marcas populares", allMakes: "Otras marcas",
  },
};

export function QuickOfferForm({ locale }: { locale: Locale }) {
  return <LeadRequestGate locale={locale}><QuickOfferFields locale={locale} /></LeadRequestGate>;
}

function QuickOfferFields({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const sourcePath = usePathname();
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"details" | "vin">("details");
  const [custom, setCustom] = useState(false);
  const [vin, setVin] = useState("");
  const vinVehicle = useVinVehicle(vin, mode === "vin");
  const [year, setYear] = useState("");
  const [makeId, setMakeId] = useState("");
  const [model, setModel] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [makesStatus, setMakesStatus] = useState<LoadState>("loading");
  const [modelsStatus, setModelsStatus] = useState<LoadState>("idle");
  const [invalid, setInvalid] = useState<string[]>([]);
  const [stage, setStage] = useState<"vehicle" | "contact" | "success">("vehicle");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [runningStatus, setRunningStatus] = useState<InquiryRunningStatus | "">("");
  const [ownershipStatus, setOwnershipStatus] = useState<InquiryOwnershipStatus | "">("");
  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [token, setToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const submissionRef = useRef<{ fingerprint: string; id: string } | null>(null);
  const sendingRef = useRef(false);
  const focusFieldRef = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const onTokenChange = useCallback((value: string) => {
    setToken(value);
    if (value) setSecurityError("");
  }, []);
  const onSecurityError = useCallback((message: string) => {
    setToken("");
    setSecurityError(message);
  }, []);

  useEffect(() => {
    if (stage === "contact") headingRef.current?.focus();
    if (stage === "success") headingRef.current?.focus();
  }, [stage]);
  useEffect(() => {
    if (isPending || !focusFieldRef.current) return;
    const field = formRef.current?.querySelector<HTMLElement>(`[name="${focusFieldRef.current}"]`);
    if (field) {
      field.focus();
      focusFieldRef.current = null;
    }
  }, [stage, isPending, invalid]);
  const currentYear = new Date().getFullYear() + 1;
  const years = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index));

  useEffect(() => {
    const controller = new AbortController();
    async function loadMakes() {
      try {
        const response = await fetch("/api/vehicle/options", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.makes) || !data.makes.length) throw new Error("makes");
        if (!controller.signal.aborted) {
          setMakes(data.makes);
          setMakesStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) setMakesStatus("error");
      }
    }
    void loadMakes();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!year || !makeId || custom) return;
    const controller = new AbortController();
    async function loadModels() {
      try {
        const params = new URLSearchParams({ year, makeId });
        const response = await fetch(`/api/vehicle/options?${params}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.models)) throw new Error("models");
        if (!controller.signal.aborted) {
          setModels(data.models);
          setModelsStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) setModelsStatus("error");
      }
    }
    void loadModels();
    return () => controller.abort();
  }, [year, makeId, custom]);

  function resetModels(nextYear: string, nextMake: string) {
    setModel("");
    setModels([]);
    setModelsStatus(nextYear && nextMake ? "loading" : "idle");
    setInvalid([]);
  }

  const selectedYear = mode === "vin" ? vinVehicle.fields.year.trim() : year;
  const selectedMake = mode === "vin" ? vinVehicle.fields.make.trim() : custom ? customMake.trim() : makes.find((item) => String(item.id) === makeId)?.name ?? "";
  const selectedModel = mode === "vin" ? vinVehicle.fields.model.trim() : custom ? customModel.trim() : model;
  const selectionMethod = mode === "vin" ? "vin" : custom ? "manual" : "dropdown";
  const vehicleSummary = [selectedYear, selectedMake, selectedModel].join(" ");

  function vehicleErrors() {
    if (mode === "vin" && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return ["vin"];
    return [!isValidVehicleYear(selectedYear) && "year", !selectedMake && "make", !selectedModel && "model"].filter(Boolean) as string[];
  }

  function showErrors(fields: string[]) {
    focusFieldRef.current = fields[0] ?? null;
    setInvalid(fields);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (getLeadSubmissionReceipt()) return;
    if (sendingRef.current || (mode === "vin" && vinVehicle.status === "loading")) return;
    const missingVehicle = vehicleErrors();
    if (missingVehicle.length) {
      setStage("vehicle");
      showErrors(missingVehicle);
      return;
    }
    if (stage === "vehicle") {
      setInvalid([]);
      setSubmitError("");
      setStage("contact");
      sendGTMEvent({ event: "quick_inquiry_start", selection_method: selectionMethod, language: locale });
      return;
    }
    const missing = [!runningStatus && "runningStatus", !ownershipStatus && "ownershipStatus", !fullName.trim() && "fullName", (!isValidPhone(phone) || !/^[+\d\s().-]+$/.test(phone)) && "phone", !streetAddress.trim() && "streetAddress", !city.trim() && "city", (!/^\d{5}$/.test(zip) || !isServiceAreaZip(zip)) && "zip", notes.length > INQUIRY_NOTES_MAX_LENGTH && "notes"].filter(Boolean) as string[];
    if (missing.length) { showErrors(missing); return; }
    if (!turnstileSiteKey || !token) { setSecurityError(text.securityError); return; }
    setInvalid([]);
    setSubmitError("");
    sendingRef.current = true;
    setIsPending(true);
    const lead = {
      ...(mode === "vin" ? { vin } : {}),
      year: selectedYear, make: selectedMake, model: selectedModel, runningStatus, ownershipStatus,
      fullName: fullName.trim(), phone: phone.trim(), zip, notes: notes.trim(),
      streetAddress: streetAddress.trim(), addressLine2: addressLine2.trim(), city: city.trim(), state: "CA",
    };
    const data = { lead, locale, sourcePath, selectionMethod };
    const fingerprint = JSON.stringify(data);
    try {
      if (submissionRef.current?.fingerprint !== fingerprint) submissionRef.current = { fingerprint, id: crypto.randomUUID() };
      const response = await fetch("/api/inquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, submissionId: submissionRef.current.id, turnstileToken: token }),
        signal: AbortSignal.timeout(30_000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        if (Array.isArray(result?.missing)) {
          const fields = result.missing.filter((field: unknown): field is string => typeof field === "string" && ["vin", "year", "make", "model", "fullName", "phone", "zip", "streetAddress", "city", "state", "runningStatus", "ownershipStatus", "notes"].includes(field));
          if (fields.some((field: string) => ["vin", "year", "make", "model"].includes(field))) setStage("vehicle");
          showErrors(fields);
        }
        setSubmitError(typeof result?.error === "string" ? result.error : text.deliveryError);
        setToken("");
        setResetSignal((current) => current + 1);
        return;
      }
      saveLeadSubmissionReceipt({ vehicle: { year: selectedYear, make: selectedMake, model: selectedModel }, source: "quick" });
      setStage("success");
      sendGTMEvent({ event: "quick_inquiry_submit_success", selection_method: selectionMethod, language: locale });
    } catch {
      setSubmitError(text.deliveryError);
      setToken("");
      setResetSignal((current) => current + 1);
    } finally {
      sendingRef.current = false;
      setIsPending(false);
    }
  }

  const fieldClass = (name: string, multiline = false) => `${multiline ? "min-h-28 resize-y py-3 font-normal" : "h-12 font-semibold"} w-full min-w-0 rounded-xl border bg-white px-3 text-base text-slate-950 outline-none transition focus:border-[#187b36] focus:ring-2 focus:ring-[#187b36]/20 disabled:bg-slate-100 disabled:text-slate-500 ${invalid.includes(name) ? "border-red-600 ring-1 ring-red-600" : "border-slate-300"}`;
  const fieldProps = (name: string) => ({ name, "aria-invalid": invalid.includes(name), "aria-describedby": invalid.includes(name) ? (["fullName", "phone", "zip", "streetAddress", "city", "state", "runningStatus", "ownershipStatus", "notes"].includes(name) ? `${id}-${name}-error` : `${id}-error`) : undefined });
  const popular = makes.filter((make) => commonMakes.has(make.name.toLowerCase()));
  const other = makes.filter((make) => !commonMakes.has(make.name.toLowerCase()));
  const unavailable = makesStatus === "error" || modelsStatus === "error";
  const noModels = modelsStatus === "ready" && !models.length && !!makeId;

  return (
    <section id="get-offer" aria-labelledby={`${id}-title`} className="w-full min-w-0 scroll-mt-36 rounded-3xl border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-7">
      <h2 ref={headingRef} tabIndex={-1} id={`${id}-title`} className="text-2xl font-black tracking-tight outline-none">{stage === "success" ? text.sent : stage === "contact" ? text.contactTitle : text.title}</h2>
      {stage === "success" ? (
        <div role="status" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 font-bold text-[#146c30]"><Check aria-hidden="true" className="h-5 w-5 shrink-0" />{vehicleSummary}</div>
          <p className="text-sm leading-6 text-slate-600">{text.sentBody} <strong className="text-slate-950">{phone}</strong>.</p>
          <a href={serviceAreaPhoneHref} className="inline-flex min-h-11 items-center font-bold text-[#146c30] underline">{serviceAreaPhone}</a>
        </div>
      ) : <>
      <p className="mt-1 text-sm leading-5 text-slate-600">{stage === "contact" ? text.contactIntro : text.intro}</p>
      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={isPending} className="mt-4 min-w-0">
        {stage === "vehicle" ? <>
        <div role="group" aria-label={text.method} className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] gap-1 rounded-xl bg-slate-100 p-1">
          {(["details", "vin"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={mode === item} onClick={() => { setMode(item); setInvalid([]); }} className={`min-h-11 rounded-lg px-2 text-sm font-extrabold outline-none transition focus-visible:ring-2 focus-visible:ring-[#187b36] ${mode === item ? "bg-white text-[#146c30] shadow-sm" : "text-slate-600 hover:text-slate-950"}`}>
              {item === "vin" ? text.vin : text.details}
            </button>
          ))}
        </div>

        {mode === "vin" ? (
          <div className="mt-4">
            <label htmlFor={`${id}-vin`} className="mb-1.5 block text-sm font-bold">{text.vinLabel}</label>
            <input id={`${id}-vin`} {...fieldProps("vin")} value={vin} onChange={(event) => { setVin(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17)); setInvalid([]); }} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder={text.vinPlaceholder} className={fieldClass("vin")} />
            <p className="mt-2 text-xs leading-5 text-slate-600">{text.vinHelp}</p>
            <div aria-live="polite" className="text-sm leading-5">
              {vinVehicle.status === "loading" ? <p className="mt-3 flex items-center gap-2 text-slate-600"><Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />{text.vinLoading}</p> : null}
              {vinVehicle.status === "success" ? <p className="mt-3 text-[#146c30]">{text.vinFound}</p> : null}
              {vinVehicle.status === "error" ? <p className="mt-3 text-slate-600">{text.vinFailed}</p> : null}
            </div>
            {vinVehicle.status === "success" || vinVehicle.status === "error" ? <>
              <div className="mt-3 grid min-w-0 grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] gap-3">
                <label className="grid min-w-0 gap-1.5 text-sm font-bold">{text.year}
                  <select {...fieldProps("year")} value={vinVehicle.fields.year} onChange={(event) => { vinVehicle.updateField("year", event.target.value); setInvalid([]); }} className={fieldClass("year")}>
                    <option value="">{text.selectYear}</option>
                    {years.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1.5 text-sm font-bold">{text.make}
                  <input {...fieldProps("make")} value={vinVehicle.fields.make} onChange={(event) => { vinVehicle.updateField("make", event.target.value); setInvalid([]); }} maxLength={100} autoComplete="off" className={fieldClass("make")} />
                </label>
                <label className="col-span-2 grid min-w-0 gap-1.5 text-sm font-bold">{text.model}
                  <input {...fieldProps("model")} value={vinVehicle.fields.model} onChange={(event) => { vinVehicle.updateField("model", event.target.value); setInvalid([]); }} maxLength={100} autoComplete="off" className={fieldClass("model")} />
                </label>
              </div>
              {vinVehicle.status === "error" ? <button type="button" onClick={() => { vinVehicle.retry(); setInvalid([]); }} className="mt-1 min-h-11 text-sm font-bold text-[#146c30] underline">{text.vinRetry}</button> : null}
              <p className="mt-2 text-xs leading-5 text-slate-600">{text.vinLimit}</p>
            </> : null}
          </div>
        ) : (
          <div className="mt-4">
            <div className="grid min-w-0 grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] gap-3">
              <label className="grid min-w-0 gap-1.5 text-sm font-bold">
                {text.year}
                <select {...fieldProps("year")} value={year} onChange={(event) => { setYear(event.target.value); resetModels(event.target.value, makeId); }} className={fieldClass("year")}>
                  <option value="">{text.selectYear}</option>
                  {years.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label className="grid min-w-0 gap-1.5 text-sm font-bold">
                {text.make}
                {custom ? (
                  <input {...fieldProps("make")} value={customMake} onChange={(event) => { setCustomMake(event.target.value); setInvalid([]); }} maxLength={100} autoComplete="off" className={fieldClass("make")} />
                ) : (
                  <select {...fieldProps("make")} value={makeId} disabled={!year || makesStatus !== "ready"} onChange={(event) => { setMakeId(event.target.value); resetModels(year, event.target.value); }} className={fieldClass("make")}>
                    <option value="">{!year ? text.yearFirst : makesStatus === "loading" ? text.loading : text.selectMake}</option>
                    <optgroup label={text.popular}>{popular.map((make) => <option key={make.id} value={make.id}>{make.name}</option>)}</optgroup>
                    <optgroup label={text.allMakes}>{other.map((make) => <option key={make.id} value={make.id}>{make.name}</option>)}</optgroup>
                  </select>
                )}
              </label>
              <label className="col-span-2 grid min-w-0 gap-1.5 text-sm font-bold">
                {text.model}
                {custom ? (
                  <input {...fieldProps("model")} value={customModel} onChange={(event) => { setCustomModel(event.target.value); setInvalid([]); }} maxLength={100} autoComplete="off" className={fieldClass("model")} />
                ) : (
                  <select {...fieldProps("model")} value={model} disabled={!makeId || modelsStatus !== "ready" || !models.length} onChange={(event) => { setModel(event.target.value); setInvalid([]); }} className={fieldClass("model")}>
                    <option value="">{!makeId ? text.makeFirst : modelsStatus === "loading" ? text.loading : text.selectModel}</option>
                    {models.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                )}
              </label>
            </div>
            <div aria-live="polite">
              {!custom && (unavailable || noModels) ? <p className="mt-2 text-sm leading-5 text-amber-900">{unavailable ? text.unavailable : text.noModels}</p> : null}
            </div>
            <button type="button" onClick={() => { setCustom(!custom); setInvalid([]); if (!custom) { setCustomMake(makes.find((make) => String(make.id) === makeId)?.name ?? ""); setCustomModel(model); } else resetModels(year, makeId); }} className="mt-1 min-h-9 text-left text-xs font-semibold text-[#146c30] underline decoration-[#146c30]/40 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#187b36]">
              {custom ? text.dropdowns : text.manual}
            </button>
          </div>
        )}

        </> : (
          <>
            <div className="mb-4 flex min-w-0 items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
              <div className="min-w-0 break-words text-sm font-bold"><p>{vehicleSummary}</p>{mode === "vin" ? <p className="mt-1 break-all text-xs font-normal text-slate-600">VIN: {vin}</p> : null}</div>
              <button type="button" disabled={isPending} onClick={() => { focusFieldRef.current = mode === "vin" ? "vin" : "year"; setStage("vehicle"); setInvalid([]); setToken(""); setSecurityError(""); }} className="shrink-0 text-xs font-bold text-[#146c30] underline">{text.edit}</button>
            </div>
            <fieldset disabled={isPending} className="grid gap-3">
              <label className="grid min-w-0 gap-1.5 text-sm font-bold">{text.runningStatus}
                <select aria-label={text.runningStatus} {...fieldProps("runningStatus")} value={runningStatus} onChange={(event) => { setRunningStatus(event.target.value as InquiryRunningStatus | ""); setInvalid((fields) => fields.filter((field) => field !== "runningStatus")); }} className={fieldClass("runningStatus")}>
                  <option value="">{text.choose}</option><option value="runs">{text.runs}</option><option value="does_not_run">{text.doesNotRun}</option><option value="not_sure">{text.notSure}</option>
                </select>
                {invalid.includes("runningStatus") ? <span id={`${id}-runningStatus-error`} className="text-xs text-red-700">{text.answerError}</span> : null}
              </label>
              <label className="grid min-w-0 gap-1.5 text-sm font-bold">{text.ownershipStatus}
                <select aria-label={text.ownershipStatus} {...fieldProps("ownershipStatus")} value={ownershipStatus} onChange={(event) => { setOwnershipStatus(event.target.value as InquiryOwnershipStatus | ""); setInvalid((fields) => fields.filter((field) => field !== "ownershipStatus")); }} className={fieldClass("ownershipStatus")}>
                  <option value="">{text.choose}</option><option value="owner_with_title">{text.ownerTitle}</option><option value="owner_without_title">{text.ownerNoTitle}</option><option value="authorized_seller">{text.authorizedSeller}</option><option value="not_sure">{text.otherOwnership}</option>
                </select>
                {invalid.includes("ownershipStatus") ? <span id={`${id}-ownershipStatus-error`} className="text-xs text-red-700">{text.answerError}</span> : null}
              </label>
              <label className="grid gap-1.5 text-sm font-bold">{text.fullName}
                <input aria-label={text.fullName} {...fieldProps("fullName")} value={fullName} onChange={(event) => { setFullName(event.target.value); setInvalid((fields) => fields.filter((field) => field !== "fullName")); }} autoComplete="name" maxLength={200} className={fieldClass("fullName")} />
                {invalid.includes("fullName") ? <span id={`${id}-fullName-error`} className="text-xs text-red-700">{text.nameError}</span> : null}
              </label>
              <label className="grid gap-1.5 text-sm font-bold">{text.phone}
                <input aria-label={text.phone} {...fieldProps("phone")} value={phone} onChange={(event) => { setPhone(event.target.value); setInvalid((fields) => fields.filter((field) => field !== "phone")); }} type="tel" autoComplete="tel" maxLength={30} className={fieldClass("phone")} />
                {invalid.includes("phone") ? <span id={`${id}-phone-error`} className="text-xs text-red-700">{text.phoneError}</span> : null}
              </label>
              <fieldset className="mt-2 grid min-w-0 gap-3 border-t border-slate-200 pt-3">
                <legend className="pr-2 text-sm font-extrabold">{text.pickupAddress}</legend>
                <label className="grid gap-1.5 text-sm font-bold">{text.streetAddress}
                  <input aria-label={text.streetAddress} {...fieldProps("streetAddress")} value={streetAddress} onChange={(event) => { setStreetAddress(event.target.value); setInvalid((fields) => fields.filter((field) => field !== "streetAddress")); }} autoComplete="section-pickup address-line1" maxLength={240} className={fieldClass("streetAddress")} />
                  {invalid.includes("streetAddress") ? <span id={`${id}-streetAddress-error`} className="text-xs text-red-700">{text.streetError}</span> : null}
                </label>
                <label className="grid gap-1.5 text-sm font-bold">{text.addressLine2}
                  <input aria-label={text.addressLine2} name="addressLine2" value={addressLine2} onChange={(event) => setAddressLine2(event.target.value)} autoComplete="section-pickup address-line2" maxLength={240} className={fieldClass("addressLine2")} />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">{text.city}
                  <input aria-label={text.city} {...fieldProps("city")} value={city} onChange={(event) => { setCity(event.target.value); setInvalid((fields) => fields.filter((field) => field !== "city")); }} autoComplete="section-pickup address-level2" maxLength={240} className={fieldClass("city")} />
                  {invalid.includes("city") ? <span id={`${id}-city-error`} className="text-xs text-red-700">{text.cityError}</span> : null}
                </label>
                <div className="grid min-w-0 grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] items-start gap-3">
                  <label className="grid gap-1.5 text-sm font-bold">{text.state}
                    <input aria-label={text.state} {...fieldProps("state")} value="CA" readOnly autoComplete="section-pickup address-level1" className={`${fieldClass("state")} bg-slate-50`} />
                    {invalid.includes("state") ? <span id={`${id}-state-error`} className="text-xs text-red-700">{text.stateError}</span> : null}
                  </label>
              <label className="grid gap-1.5 text-sm font-bold">{text.zip}
                <input aria-label={text.zip} {...fieldProps("zip")} value={zip} onChange={(event) => { setZip(event.target.value.replace(/\D/g, "").slice(0, 5)); setInvalid((fields) => fields.filter((field) => field !== "zip")); }} inputMode="numeric" autoComplete="section-pickup postal-code" maxLength={5} className={fieldClass("zip")} />
                {invalid.includes("zip") ? <span id={`${id}-zip-error`} className="text-xs leading-5 text-red-700">{/^\d{5}$/.test(zip) ? text.areaError : text.zipError}</span> : null}
              </label>
                </div>
              </fieldset>
              <label className="mt-1 grid gap-1.5 text-sm font-bold">{text.notes}
                <textarea aria-label={text.notes} {...fieldProps("notes")} value={notes} onChange={(event) => { setNotes(event.target.value); setInvalid((fields) => fields.filter((field) => field !== "notes")); }} placeholder={text.notesPlaceholder} maxLength={INQUIRY_NOTES_MAX_LENGTH} rows={3} className={fieldClass("notes", true)} />
                {invalid.includes("notes") ? <span id={`${id}-notes-error`} className="text-xs text-red-700">{text.notesError}</span> : null}
              </label>
            </fieldset>
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-slate-600">{text.security}</p>
              {turnstileSiteKey ? <TurnstileChallenge loadingLabel={locale === "es" ? "Cargando verificación de seguridad…" : "Loading security check…"} siteKey={turnstileSiteKey} onTokenChange={onTokenChange} onError={onSecurityError} errorLabel={text.securityError} expiredLabel={text.securityExpired} retryLabel={text.securityRetry} resetSignal={resetSignal} /> : <p role="alert" className="text-sm text-red-700">{text.unavailableSecurity}</p>}
            </div>
          </>
        )}
        {invalid.length ? <p id={`${id}-error`} role="alert" className="mt-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800">{invalid.includes("vin") ? text.invalidVin : `${text.missing} ${invalid.map((name) => text[name as "year" | "make" | "model" | "fullName" | "phone" | "zip" | "streetAddress" | "city" | "state" | "runningStatus" | "ownershipStatus" | "notes"]).join(", ")}.`}</p> : null}
        {submitError || securityError ? <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold leading-5 text-red-800">{submitError || securityError} <a className="underline" href={serviceAreaPhoneHref}>{serviceAreaPhone}</a></p> : null}
        <button type="submit" disabled={isPending || (mode === "vin" && vinVehicle.status === "loading") || (stage === "contact" && (!turnstileSiteKey || !token))} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#187b36] px-4 text-base font-extrabold text-white shadow-[0_6px_16px_rgba(24,123,54,0.18)] outline-none transition hover:bg-[#12612a] focus-visible:ring-2 focus-visible:ring-[#187b36] focus-visible:ring-offset-2 disabled:opacity-60">
          {isPending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
          {isPending ? text.continuing : stage === "contact" ? text.send : text.continue}
          {!isPending ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}
        </button>
        <p className="mt-2 text-center text-xs leading-5 text-slate-600">{stage === "contact" ? text.contactNotice : text.next}</p>
        <p className="mt-3 flex items-start justify-center gap-1.5 border-t border-slate-100 pt-3 text-center text-xs leading-5 text-slate-600"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#187b36]" />{text.reassurance}</p>
      </form>
      {stage === "vehicle" ? <Link href={getOfferPath(locale)} className="mt-3 block text-center text-xs font-semibold leading-5 text-[#146c30] underline">{text.detailed}</Link> : null}
      </>}
    </section>
  );
}
