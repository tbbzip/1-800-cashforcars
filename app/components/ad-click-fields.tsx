"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getAdClickAttribution,
  getServerAdClickAttribution,
  saveAdClickFromUrl,
} from "../ad-click-attribution";

const subscribeNever = () => () => {};

/** Saves gclid / gbraid / wbraid from the ad landing URL so later pages and visits keep them. */
export function AdClickCapture() {
  useEffect(() => {
    saveAdClickFromUrl();
  }, []);
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
