import RedeemPageInner from "./RedeemPageInner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Redeem Lifetime Deal | KDPage",
  description: "Activate your lifetime access to KDPage by entering your redemption license code.",
};

export default async function RedeemPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams.catch(() => ({})) : {};
  const partner =
    typeof resolvedParams?.partner === "string"
      ? resolvedParams.partner
      : typeof resolvedParams?.source === "string"
      ? resolvedParams.source
      : typeof resolvedParams?.ref === "string"
      ? resolvedParams.ref
      : "";
  const code =
    typeof resolvedParams?.code === "string"
      ? resolvedParams.code
      : typeof resolvedParams?.redemption_code === "string"
      ? resolvedParams.redemption_code
      : typeof resolvedParams?.key === "string"
      ? resolvedParams.key
      : typeof resolvedParams?.license_key === "string"
      ? resolvedParams.license_key
      : "";

  return <RedeemPageInner initialCode={code} initialPartner={partner} />;
}
