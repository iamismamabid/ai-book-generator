import RedeemPageInner from "./RedeemPageInner";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Redeem Lifetime Deal | KDPage",
  description: "Activate your lifetime access to KDPage by entering your redemption license code.",
};

export default async function RedeemPage(props: { searchParams?: Promise<{ code?: string; redemption_code?: string; key?: string; license_key?: string; partner?: string; source?: string; ref?: string }> }) {
  const searchParams = await props.searchParams;
  const initialCode = searchParams?.code || searchParams?.redemption_code || searchParams?.key || searchParams?.license_key || "";
  const partner = searchParams?.partner || searchParams?.source || searchParams?.ref || "";

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400">Loading redemption portal...</div>}>
      <RedeemPageInner initialCode={initialCode} initialPartner={partner} />
    </Suspense>
  );
}
