"use client";

import dynamic from "next/dynamic";

const TrustpilotWidget = dynamic(() => import("./TrustpilotWidget"), {
  ssr: false,
});

export default function HomeTrustpilotLazy() {
  return <TrustpilotWidget />;
}
