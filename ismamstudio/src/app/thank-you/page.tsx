import type { Metadata } from "next";
import ThankYouClient from "./ThankYouClient";

export const metadata: Metadata = {
  title: "Thank You for Your Order | KDPage",
  description: "Thank you for subscribing to KDPage! Your account is now being upgraded to your selected plan tier.",
};

export default function Page() {
  return <ThankYouClient />;
}
