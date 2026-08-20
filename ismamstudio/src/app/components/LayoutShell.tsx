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
  const isStudio = pathname === "/studio";

  if (isStudio) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC] dark:bg-slate-950">
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      {header}
      <div className="pt-[116px] min-h-[calc(100vh-116px)] flex flex-col justify-between">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
