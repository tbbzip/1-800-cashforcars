"use client";

import { useEffect } from "react";
import { sendGTMEvent } from "@next/third-parties/google";

export function GtmPhoneClickEvents() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest<HTMLAnchorElement>('a[href^="tel:"]');

      if (!link) {
        return;
      }

      sendGTMEvent({
        event: "phone_click",
        link_text: link.textContent?.trim() ?? "",
        phone_number: link.href.replace(/^tel:/, ""),
      });
    }

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
