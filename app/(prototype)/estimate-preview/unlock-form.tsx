"use client";

import { useActionState } from "react";
import { unlockEstimateDemo } from "./actions";

export default function UnlockForm() {
  const [state, formAction, pending] = useActionState(unlockEstimateDemo, {
    error: "",
  });

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f5f4ef] px-5 py-16 text-[#17271f]">
      <div className="w-full max-w-md rounded-3xl border border-[#d6ded6] bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#486657]">
          Private preview
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Estimate prototype</h1>
        <p id="preview-access-description" className="mt-3 text-sm leading-6 text-[#56655b]">
          Enter the preview password to explore this fictional estimate experience.
        </p>
        <form action={formAction} className="mt-7 space-y-5" aria-busy={pending}>
          <div>
            <label htmlFor="preview-password" className="block text-sm font-semibold">
              Preview password
            </label>
            <input
              id="preview-password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={16}
              maxLength={256}
              required
              aria-describedby={`preview-access-description${state.error ? " preview-access-error" : ""}`}
              aria-invalid={Boolean(state.error)}
              className="mt-2 min-h-12 w-full rounded-xl border border-[#aebdb2] bg-white px-4 text-base outline-none focus:border-[#186343] focus:ring-2 focus:ring-[#186343]/25"
            />
          </div>
          {state.error && (
            <p id="preview-access-error" role="alert" className="text-sm text-[#a12d26]">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 w-full rounded-xl bg-[#175c40] px-5 py-3 font-semibold text-white outline-none hover:bg-[#124b34] focus-visible:ring-2 focus-visible:ring-[#175c40] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Opening preview…" : "Open preview"}
          </button>
        </form>
        <p className="mt-6 text-xs leading-5 text-[#56655b]">
          Internal review only. This preview does not make purchase offers or submit leads.
        </p>
      </div>
    </main>
  );
}
