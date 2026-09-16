"use client";

import { useCallback, useEffect, useReducer } from "react";

export type VinVehicleFields = { year: string; make: string; model: string };
type VehicleField = keyof VinVehicleFields;
type LookupStatus = "idle" | "loading" | "success" | "error";

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const emptyFields = (): VinVehicleFields => ({ year: "", make: "", model: "" });

type LookupState = {
  vin: string;
  requestId: number;
  status: LookupStatus;
  fields: VinVehicleFields;
  edited: Partial<Record<VehicleField, boolean>>;
  warning: boolean;
};

type LookupAction =
  | { type: "change-vin"; vin: string }
  | { type: "retry" }
  | { type: "edit"; vin: string; field: VehicleField; value: string }
  | { type: "started"; vin: string; requestId: number }
  | { type: "failed"; vin: string; requestId: number }
  | { type: "resolved"; vin: string; requestId: number; fields: VinVehicleFields; warning: boolean };

export function initialVinVehicleState(vin: string): LookupState {
  return { vin, requestId: 0, status: "idle", fields: emptyFields(), edited: {}, warning: false };
}

/** Request identity and edited fields prevent late responses from overwriting a new selection. */
export function vinVehicleReducer(state: LookupState, action: LookupAction): LookupState {
  if (action.type === "change-vin") {
    return { ...initialVinVehicleState(action.vin), requestId: state.requestId + 1 };
  }
  if (action.type === "retry") {
    return { ...state, requestId: state.requestId + 1, status: "loading", warning: false };
  }
  if (action.vin !== state.vin) return state;
  if (action.type === "edit") {
    return {
      ...state,
      fields: { ...state.fields, [action.field]: action.value },
      edited: { ...state.edited, [action.field]: true },
    };
  }
  if (action.requestId !== state.requestId) return state;
  if (action.type === "started") return { ...state, status: "loading", warning: false };
  if (action.type === "failed") return { ...state, status: "error", warning: false };

  const fields = { ...action.fields };
  for (const field of ["year", "make", "model"] as const) {
    if (state.edited[field]) fields[field] = state.fields[field];
  }
  return { ...state, fields, status: "success", warning: action.warning };
}

export function readVinVehicleResult(value: unknown, vin: string) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !("vehicle" in value) ||
    !value.vehicle || typeof value.vehicle !== "object" || Array.isArray(value.vehicle)) {
    throw new Error("Vehicle lookup returned an invalid response.");
  }
  const vehicle = value.vehicle as Record<string, unknown>;
  if (typeof vehicle.vin === "string" && vehicle.vin.toUpperCase() !== vin) {
    throw new Error("Vehicle lookup returned a different VIN.");
  }
  const text = (field: VehicleField) => typeof vehicle[field] === "string" ? vehicle[field].trim().slice(0, 100) : "";
  const fields = { year: text("year"), make: text("make"), model: text("model") };
  if (!Object.values(fields).some(Boolean)) throw new Error("Vehicle lookup did not return vehicle details.");
  const warning = "warning" in value && (typeof value.warning === "string" ? Boolean(value.warning.trim()) : value.warning === true);
  return { fields, warning };
}

export function useVinVehicle(vin: string, enabled: boolean) {
  const normalizedVin = vin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const eligible = enabled && VIN_PATTERN.test(normalizedVin);
  const [state, dispatch] = useReducer(vinVehicleReducer, normalizedVin, initialVinVehicleState);

  // Reset before rendering children so a new VIN can never display the previous car.
  if (state.vin !== normalizedVin) dispatch({ type: "change-vin", vin: normalizedVin });

  useEffect(() => {
    if (!eligible || state.status === "success" || state.status === "error") return;
    const controller = new AbortController();
    const requestId = state.requestId;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const debounce = setTimeout(async () => {
      dispatch({ type: "started", vin: normalizedVin, requestId });
      timeout = setTimeout(() => {
        controller.abort();
        if (!cancelled) dispatch({ type: "failed", vin: normalizedVin, requestId });
      }, 12_000);

      try {
        const response = await fetch(`/api/vehicle/lookup?vin=${encodeURIComponent(normalizedVin)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Vehicle lookup is unavailable.");
        const result = readVinVehicleResult(await response.json(), normalizedVin);
        if (cancelled || controller.signal.aborted) return;
        dispatch({ type: "resolved", vin: normalizedVin, requestId, ...result });
      } catch {
        if (!cancelled) dispatch({ type: "failed", vin: normalizedVin, requestId });
      } finally {
        clearTimeout(timeout);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
    // Status/field changes must not restart the request or erase manual corrections.
    // A new VIN, re-enabled interrupted lookup, or explicit retry controls request lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, normalizedVin, state.requestId]);

  const updateField = useCallback((field: VehicleField, value: string) => {
    if (eligible) dispatch({ type: "edit", vin: normalizedVin, field, value });
  }, [eligible, normalizedVin]);
  const retry = useCallback(() => {
    if (eligible) dispatch({ type: "retry" });
  }, [eligible]);

  const status: LookupStatus = eligible ? (state.status === "idle" ? "loading" : state.status) : "idle";
  return {
    status,
    fields: eligible && state.vin === normalizedVin ? state.fields : emptyFields(),
    warning: eligible && state.warning,
    updateField,
    retry,
  };
}
