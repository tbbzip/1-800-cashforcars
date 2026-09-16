"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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

export function TurnstileChallenge({
  errorLabel,
  expiredLabel,
  retryLabel,
  loadingLabel = "Loading security check…",
  onError,
  onTokenChange,
  resetSignal,
  siteKey,
}: {
  errorLabel: string;
  expiredLabel: string;
  retryLabel: string;
  loadingLabel?: string;
  onError: (message: string) => void;
  onTokenChange: (token: string) => void;
  resetSignal: number;
  siteKey: string;
}) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptAttempt, setScriptAttempt] = useState(0);
  const [retrySignal, setRetrySignal] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [widgetSize, setWidgetSize] = useState<"compact" | "flexible" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = (width: number) => {
      if (width <= 0) return;
      // Cloudflare flexible widgets require 300px; compact widgets need 150px.
      const nextSize = width < 300 ? "compact" : "flexible";
      setWidgetSize((current) => current === nextSize ? current : nextSize);
    };
    const measure = () => updateSize(container.getBoundingClientRect().width);
    const initialMeasurement = window.requestAnimationFrame(measure);
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver((entries) => {
          if (entries[0]) updateSize(entries[0].contentRect.width);
        })
      : null;

    observer?.observe(container);
    if (!observer) window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(initialMeasurement);
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (scriptLoaded) return;

    // Some blocked or stalled third-party requests never dispatch a load/error event.
    // Keep the form protected, but expose a recoverable state instead of waiting forever.
    const timer = window.setTimeout(() => {
      setHasError(true);
      onTokenChange("");
      onError(errorLabel);
    }, 12_000);

    return () => window.clearTimeout(timer);
  }, [scriptLoaded, scriptAttempt, errorLabel, onError, onTokenChange]);

  useEffect(() => {
    if (!scriptLoaded || !widgetSize || !containerRef.current || !window.turnstile) return;
    let active = true;
    onTokenChange("");

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        size: widgetSize,
        callback: (token) => {
          if (!active) return;
          setHasError(false);
          onTokenChange(token);
        },
        "expired-callback": () => {
          if (!active) return;
          setHasError(true);
          onTokenChange("");
          onError(expiredLabel);
        },
        "error-callback": () => {
          if (!active) return;
          setHasError(true);
          onTokenChange("");
          onError(errorLabel);
        },
      });
    } catch {
      queueMicrotask(() => {
        if (!active) return;
        onError(errorLabel);
        setHasError(true);
      });
    }

    return () => {
      active = false;
      // A token belongs to this rendered challenge. Never reuse it after editing.
      onTokenChange("");
      if (widgetIdRef.current) {
        try { window.turnstile?.remove(widgetIdRef.current); } catch { /* Already removed by provider. */ }
        widgetIdRef.current = null;
      }
    };
  }, [errorLabel, expiredLabel, onError, onTokenChange, scriptLoaded, siteKey, resetSignal, retrySignal, widgetSize]);

  function retry() {
    setHasError(false);
    onError("");
    onTokenChange("");
    if (window.turnstile) {
      setScriptLoaded(true);
      setRetrySignal((current) => current + 1);
    } else {
      // A fresh URL lets Next retry a script whose first network request failed.
      setScriptLoaded(false);
      setScriptAttempt((current) => current + 1);
    }
  }

  return (
    <>
      <Script
        key={scriptAttempt}
        src={`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit${scriptAttempt ? `&retry=${scriptAttempt}` : ""}`}
        strategy="afterInteractive"
        onReady={() => {
          setHasError(false);
          onError("");
          setScriptLoaded(true);
        }}
        onError={() => {
          setHasError(true);
          onTokenChange("");
          onError(errorLabel);
        }}
      />
      {(!scriptLoaded || !widgetSize) && !hasError ? (
        <p role="status" className="mb-2 text-sm font-semibold text-slate-600">
          {loadingLabel}
        </p>
      ) : null}
      <div ref={containerRef} className={`${widgetSize === "compact" ? "min-h-[140px]" : "min-h-[65px]"} w-full min-w-0 rounded-xl bg-white`} />
      {hasError ? (
        <button type="button" onClick={retry} className="mt-3 min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800 underline underline-offset-4">
          {retryLabel}
        </button>
      ) : null}
    </>
  );
}
