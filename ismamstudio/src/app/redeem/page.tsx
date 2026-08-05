import RedeemPageInner from "./RedeemPageInner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redeem AppSumo Code | KDPage",
  description: "Activate your lifetime access to KDPage by entering your AppSumo redemption code.",
};

export default async function RedeemPage(props: { searchParams?: Promise<{ code?: string; redemption_code?: string; key?: string; license_key?: string }> }) {
  const searchParams = await props.searchParams;
  const initialCode = searchParams?.code || searchParams?.redemption_code || searchParams?.key || searchParams?.license_key || "";

  return <RedeemPageInner initialCode={initialCode} />;
}
