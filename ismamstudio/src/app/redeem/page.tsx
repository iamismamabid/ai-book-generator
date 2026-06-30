import { auth } from "@clerk/nextjs/server";
import RedeemPageInner from "./RedeemPageInner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redeem AppSumo Code | Ismam Studio",
  description: "Activate your lifetime access to Ismam Studio by entering your AppSumo redemption code.",
};

export default async function RedeemPage() {
  const { userId } = await auth();

  return <RedeemPageInner userId={userId} />;
}
