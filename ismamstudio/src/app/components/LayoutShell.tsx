"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { ReactNode } from "react";

export default function LayoutShell({
  children,
  header,
}: {
  children: ReactNode;
  header: ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname === "/studio" || pathname === "/artbook-studio";

  return (
    <div
      className={`min-h-screen w-full flex flex-col ${
        isStudio
          ? "bg-slate-950 text-slate-100 overflow-hidden"
          : "bg-[#F8FAFC] dark:bg-slate-950"
      }`}
    >
      {!isStudio && header}
      <div
        className={`flex flex-col flex-1 ${
          isStudio
            ? "h-screen w-full overflow-hidden"
            : "pt-[116px] min-h-[calc(100vh-116px)] justify-between"
        }`}
      >
        <main className={isStudio ? "flex-1 w-full h-full flex flex-col overflow-hidden" : "flex-grow"}>
          {children}
        </main>
        {!isStudio && <Footer />}
      </div>
    </div>
  );
}
