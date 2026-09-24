import { auth } from "@clerk/nextjs/server";
import { getUserNotebookEntries } from "../actions";
import NotebookClient from "./NotebookClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Notebook — Permanent Account Storage | KDPage",
  description: "View and manage all your permanently saved puzzle books, covers, and interior designs synced to your account.",
};

export default async function NotebookPage() {
  let serverUserId: string | null = null;
  try {
    const authResult = await auth();
    serverUserId = authResult?.userId || null;
  } catch (e) {
    console.warn("Clerk server auth warning in NotebookPage:", e);
  }

  let initialItems: any[] = [];
  if (serverUserId) {
    try {
      const res = await getUserNotebookEntries(serverUserId);
      if (res?.success && Array.isArray(res.items)) {
        initialItems = res.items;
      }
    } catch (e) {
      console.warn("SSR notebook query error:", e);
    }
  }

  return (
    <NotebookClient 
      initialItems={initialItems} 
      serverUserId={serverUserId} 
    />
  );
}
