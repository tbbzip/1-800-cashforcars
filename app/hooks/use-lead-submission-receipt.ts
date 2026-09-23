"use client";

import { useSyncExternalStore } from "react";
import {
  getLeadSubmissionSnapshot,
  getServerLeadSubmissionSnapshot,
  subscribeToLeadSubmissionReceipt,
} from "../lead-submission-receipt";

export function useLeadSubmissionReceipt() {
  return useSyncExternalStore(
    subscribeToLeadSubmissionReceipt,
    getLeadSubmissionSnapshot,
    getServerLeadSubmissionSnapshot,
  );
}
