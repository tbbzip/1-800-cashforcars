"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { captureLeadAttribution } from "../lead-attribution-client";
import {
  getAdClickAttribution,
  getServerAdClickAttribution,
} from "../ad-click-attribution";

const subscribeNever = () => () => {};

/** Capture the entry source before internal navigation removes its campaign parameters. */
export function AdClickCapture() {
  const pathname = usePathname();
  useEffect(() => {
    captureLeadAttribution();
  }, [pathname]);
  return null;
}

/** Hidden fields that carry the Google Ads click IDs with the lead form. */
export function AdClickHiddenFields() {
  const attribution = useSyncExternalStore(subscribeNever, getAdClickAttribution, getServerAdClickAttribution);
  return (
    <>
      <input type="hidden" name="gclid" value={attribution.gclid ?? ""} />
      <input type="hidden" name="gbraid" value={attribution.gbraid ?? ""} />
      <input type="hidden" name="wbraid" value={attribution.wbraid ?? ""} />
    </>
  );
}
