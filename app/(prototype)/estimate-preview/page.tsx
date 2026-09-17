import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  ESTIMATE_DEMO_COOKIE_NAME,
  getEstimateDemoMode,
  hasEstimateDemoAccess,
} from "../../server/estimate-demo-access";
import EstimatePrototype from "./estimate-prototype";
import UnlockForm from "./unlock-form";

export const dynamic = "force-dynamic";

export default async function EstimatePreviewPage() {
  if (getEstimateDemoMode() === "disabled") notFound();

  const token = (await cookies()).get(ESTIMATE_DEMO_COOKIE_NAME)?.value;
  if (!hasEstimateDemoAccess(token)) return <UnlockForm />;

  return <EstimatePrototype />;
}
