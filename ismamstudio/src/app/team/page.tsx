import TeamClient from "./TeamClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Seats | KDPage",
  description: "Invite collaborators to your KDPage account and manage your team's shared workspace.",
};

export default async function TeamPage(props: { searchParams?: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams;
  const initialToken = searchParams?.token || "";

  return <TeamClient initialToken={initialToken} />;
}
