"use server";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  createEstimateDemoSession,
  ESTIMATE_DEMO_COOKIE_NAME,
  ESTIMATE_DEMO_PATH,
  getEstimateDemoCookieOptions,
  getEstimateDemoMode,
  verifyEstimateDemoPassword,
} from "../../server/estimate-demo-access";

export type UnlockState = { error: string };

export async function unlockEstimateDemo(
  _previousState: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const mode = getEstimateDemoMode();
  if (mode === "disabled") notFound();
  if (mode === "local") redirect(ESTIMATE_DEMO_PATH);

  if (!verifyEstimateDemoPassword(formData.get("password"))) {
    return { error: "That password didn’t match. Please try again." };
  }

  const token = createEstimateDemoSession();
  if (!token) notFound();

  (await cookies()).set(
    ESTIMATE_DEMO_COOKIE_NAME,
    token,
    getEstimateDemoCookieOptions(),
  );
  redirect(ESTIMATE_DEMO_PATH);
}
