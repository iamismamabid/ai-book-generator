import RedeemPageInner from "./RedeemPageInner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redeem AppSumo Code | KDPage",
  description: "Activate your lifetime access to KDPage by entering your AppSumo redemption code.",
};

export default async function RedeemPage(props: { searchParams?: Promise<{ code?: string }> }) {
  const searchParams = await props.searchParams;
  const initialCode = searchParams?.code || "";

  return <RedeemPageInner initialCode={initialCode} />;
}
