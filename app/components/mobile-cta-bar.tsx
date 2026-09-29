"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { serviceAreaPhone, serviceAreaPhoneHref } from "../service-area";

/**
 * Thumb-reach call and offer buttons on phones. Hidden while the on-page offer form is on
 * screen or a field has focus (the keyboard is open), so it never covers the form.
 * Taps on the call button are tracked by the global `phone_click` listener.
 */
export function MobileCtaBar({
  offerHref,
  offerLabel,
  callLabel,
}: {
  offerHref: string;
  offerLabel: string;
  callLabel: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    let typing = false;

    function update() {
      frame = 0;
      const form = document.getElementById("get-offer");
      const bounds = form?.getBoundingClientRect();
      const formOnScreen = !!bounds && bounds.top < window.innerHeight - 96 && bounds.bottom > 96;
      setVisible(!typing && !formOnScreen);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function onFocusIn(event: FocusEvent) {
      typing = event.target instanceof HTMLElement && event.target.matches("input, select, textarea");
      schedule();
    }
    function onFocusOut() {
      typing = false;
      schedule();
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <div
      data-mobile-cta
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur transition duration-200 lg:hidden ${
        visible ? "translate-y-0" : "invisible translate-y-full"
      }`}
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
        <a
          href={serviceAreaPhoneHref}
          aria-label={`${callLabel} ${serviceAreaPhone}`}
          className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-2 text-sm font-extrabold text-slate-950 min-[360px]:text-[15px]"
        >
          <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-[#187b36]" />
          {serviceAreaPhone}
        </a>
        <a
          href={offerHref}
          className="inline-flex h-12 min-w-0 items-center justify-center rounded-xl bg-[#187b36] px-2 text-center text-sm font-extrabold text-white min-[360px]:text-[15px]"
        >
          {offerLabel}
        </a>
      </div>
    </div>
  );
}
