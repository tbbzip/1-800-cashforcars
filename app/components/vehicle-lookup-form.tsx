"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Search } from "lucide-react";
import type { Dictionary, Locale } from "../dictionaries";
import { getOfferPath } from "../dictionaries";

type VehicleLookupResponse = {
  error?: string;
  source?: string;
  warning?: string;
  vehicle?: {
    bodyClass?: string;
    displacement?: string;
    driveType?: string;
    engineCylinders?: string;
    fuelType?: string;
    make?: string;
    model?: string;
    modelYear?: string;
    manufacturer?: string;
    trim?: string;
    vehicleType?: string;
    vin: string;
    year?: string;
  };
};

function normalizeVin(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
}

export function VehicleLookupForm({
  dictionary,
  layout = "stacked",
  locale,
}: {
  dictionary: Dictionary;
  layout?: "stacked" | "wide";
  locale: Locale;
}) {
  const [vin, setVin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [lookup, setLookup] = useState<VehicleLookupResponse | null>(null);

  const normalizedVin = useMemo(() => normalizeVin(vin), [vin]);
  const canSubmit = normalizedVin.length === 17 && status !== "loading";
  const vehicle = lookup?.vehicle;
  const vehicleTitle = [vehicle?.year, vehicle?.make, vehicle?.model]
    .filter(Boolean)
    .join(" ");
  const offerHref = `${getOfferPath(locale)}?vin=${encodeURIComponent(
    normalizedVin,
  )}`;
  const showCallFallback = status === "error" && normalizedVin.length === 17;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (normalizedVin.length !== 17) {
      setStatus("error");
      setError(dictionary.offerForm.lookupVinError);
      setLookup(null);
      return;
    }

    setStatus("loading");
    setError("");
    setLookup(null);

    try {
      const response = await fetch(
        `/api/vehicle/lookup?vin=${encodeURIComponent(normalizedVin)}`,
      );
      const data = (await response.json()) as VehicleLookupResponse;

      if (!response.ok) {
        throw new Error(data.error ?? dictionary.offerForm.lookupGenericError);
      }

      setLookup(data);
      setStatus("success");
    } catch (lookupError) {
      setStatus("error");
      setLookup(null);
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : dictionary.offerForm.lookupGenericError,
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-3 ${
        layout === "wide"
          ? "mt-0 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end"
          : "mt-6"
      }`}
    >
      <label className="grid gap-2">
        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-300">
          {dictionary.offerForm.vinLabel}
        </span>
        <div className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/12 px-3 transition focus-within:border-[#6ee28d] focus-within:bg-white/16">
          <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
          <input
            value={vin}
            onChange={(event) => setVin(normalizeVin(event.target.value))}
            placeholder={dictionary.offerForm.vinPlaceholder}
            autoComplete="off"
            inputMode="text"
            maxLength={17}
            className="min-w-0 flex-1 bg-transparent text-sm font-bold uppercase text-white outline-none placeholder:text-slate-500"
          />
          <span className="text-xs font-bold text-slate-500">
            {normalizedVin.length}/17
          </span>
        </div>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2fad50] text-sm font-extrabold text-white transition hover:bg-[#279746] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {status === "loading" ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : null}
        {status === "loading"
          ? dictionary.offerForm.lookupLoading
          : dictionary.offerForm.lookupButton}
      </button>

      {status === "success" && vehicle ? (
        <div className="rounded-xl border border-[#6ee28d]/40 bg-[#071b10] p-4 lg:col-span-2">
          <div className="flex items-start gap-3">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#6ee28d]"
            />
            <div>
              <p className="text-sm font-black text-white">
                {dictionary.offerForm.lookupFound}
              </p>
              <p className="mt-1 text-lg font-black text-[#6ee28d]">
                {vehicleTitle || vehicle.vin}
              </p>
              <div className="mt-3 grid gap-2 text-sm text-slate-300">
                {vehicle.trim ? (
                  <p>
                    <span className="font-bold text-slate-400">
                      {dictionary.offerForm.trimLabel}:
                    </span>{" "}
                    {vehicle.trim}
                  </p>
                ) : null}
                {vehicle.bodyClass ? (
                  <p>
                    <span className="font-bold text-slate-400">
                      {dictionary.offerForm.bodyLabel}:
                    </span>{" "}
                    {vehicle.bodyClass}
                  </p>
                ) : null}
                {vehicle.vehicleType ? (
                  <p>
                    <span className="font-bold text-slate-400">
                      {dictionary.offerForm.typeLabel}:
                    </span>{" "}
                    {vehicle.vehicleType}
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">
                {dictionary.offerForm.sourceLabel}: {lookup.source}
              </p>
              <Link
                href={offerHref}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#2fad50] px-4 text-xs font-black text-white transition hover:bg-[#279746]"
              >
                {dictionary.offerForm.continueOffer}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm font-bold text-red-100 lg:col-span-2">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {error}
            {showCallFallback ? (
              <span className="mt-2 block text-red-50">
                {dictionary.offerForm.lookupCallPrompt}{" "}
                <a
                  href="tel:16198307005"
                  className="font-black text-white underline decoration-red-200/60 underline-offset-4"
                >
                  {dictionary.hero.callCta}
                </a>
              </span>
            ) : null}
          </p>
        </div>
      ) : null}

      <p className="text-xs leading-5 text-slate-500 lg:col-span-2">
        {dictionary.offerForm.lookupNote}
      </p>
    </form>
  );
}
