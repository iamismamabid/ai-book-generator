"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Users, UserPlus, Copy, Check, Trash2, X, Loader2, AlertCircle,
  CheckCircle2, Crown, LogOut, Lock,
} from "lucide-react";
import {
  getTeamData, inviteTeamMember, revokeTeamInvite, removeTeamMember,
  leaveTeam, acceptTeamInvite,
} from "../actions";

type Member = { userId: string; email: string; joinedAt: string | Date };
type PendingInvite = { id: string; email: string; createdAt: string | Date; expiresAt: string | Date; token: string };

type TeamData =
  | { success: true; role: "owner"; seatLimit: number; seatsUsed: number; members: Member[]; pendingInvites: PendingInvite[] }
  | { success: true; role: "member"; ownerEmail: string }
  | { success: true; role: "solo"; seatLimit: number; plan: string }
  | { success: false; error: string };

export default function TeamClient({ initialToken }: { initialToken: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [acceptBanner, setAcceptBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const refresh = useCallback(() => {
    getTeamData().then((res) => setData(res as TeamData)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }

    if (initialToken) {
      acceptTeamInvite(initialToken).then((res) => {
        setAcceptBanner(
          res.success
            ? { type: "success", message: "You've joined the team! You now share this account's plan and saved projects." }
            : { type: "error", message: res.error || "Failed to accept invite." }
        );
        refresh();
      });
    } else {
      refresh();
    }
  }, [isLoaded, isSignedIn, initialToken, refresh]);

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/team?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    const res = await inviteTeamMember(inviteEmail);
    setInviting(false);
    if (!res.success) {
      setInviteError(res.error || "Failed to send invite.");
      return;
    }
    setInviteEmail("");
    if (res.token) copyInviteLink(res.token);
    refresh();
  };

  const handleRevoke = async (id: string) => {
    setBusyAction(id);
    await revokeTeamInvite(id);
    setBusyAction(null);
    refresh();
  };

  const handleRemoveMember = async (userId: string) => {
    setBusyAction(userId);
    await removeTeamMember(userId);
    setBusyAction(null);
    refresh();
  };

  const handleLeave = async () => {
    setBusyAction("leave");
    await leaveTeam();
    setBusyAction(null);
    refresh();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-36 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
          <Users className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Sign in to manage your team</h1>
        <Link
          href={initialToken ? `/sign-in?redirect_url=/team?token=${initialToken}` : "/sign-in"}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 text-sm transition-all"
        >
          Sign In to Your Account
        </Link>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="min-h-screen pt-36 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <p className="text-slate-500 font-bold">{!data ? "" : data.error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 pt-32 pb-24">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">
          <Users className="w-3.5 h-3.5" /> Team Workspace
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Team Seats</h1>
      </div>

      {acceptBanner && (
        <div
          className={`mb-8 p-4 rounded-2xl border flex items-start gap-3 ${
            acceptBanner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
          }`}
        >
          {acceptBanner.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-sm font-semibold">{acceptBanner.message}</p>
        </div>
      )}

      {data.role === "member" ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              You're part of {data.ownerEmail}'s team
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              You share this account's plan and My Notebook projects. Anything you save is visible to the rest of the team.
            </p>
          </div>
          <button
            onClick={handleLeave}
            disabled={busyAction === "leave"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
          >
            {busyAction === "leave" ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Leave Team
          </button>
        </div>
      ) : data.role === "solo" && data.seatLimit <= 1 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Team seats aren't on your plan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              Upgrade to Publisher Agency to invite up to 3 collaborators into a shared workspace.
            </p>
          </div>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
          >
            View Plans
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Seat usage */}
          {(() => {
            const seatLimit = data.role === "owner" ? data.seatLimit : (data as any).seatLimit;
            const seatsUsed = data.role === "owner" ? data.seatsUsed : 1;
            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Seats Used</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{seatsUsed} / {seatLimit}</span>
              </div>
            );
          })()}

          {/* Members */}
          {data.role === "owner" && data.members.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Members</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">You (Owner)</span>
                  </div>
                </div>
                {data.members.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{m.email}</span>
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      disabled={busyAction === m.userId}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all disabled:opacity-50"
                      title="Remove from team"
                    >
                      {busyAction === m.userId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending invites */}
          {data.role === "owner" && data.pendingInvites.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Pending Invites</h2>
              <div className="space-y-2">
                {data.pendingInvites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{inv.email}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyInviteLink(inv.token)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-xl transition-all"
                      >
                        {copiedToken === inv.token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedToken === inv.token ? "Copied" : "Copy Link"}
                      </button>
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        disabled={busyAction === inv.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all disabled:opacity-50"
                        title="Revoke invite"
                      >
                        {busyAction === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite form */}
          {(() => {
            const seatLimit = data.role === "owner" ? data.seatLimit : (data as any).seatLimit;
            const seatsUsed = data.role === "owner" ? data.seatsUsed : 1;
            if (seatsUsed >= seatLimit) {
              return (
                <p className="text-xs font-bold text-slate-400 text-center py-4">
                  You've used all {seatLimit} seats on your plan.
                </p>
              );
            }
            return (
              <form onSubmit={handleInvite} className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Invite a Collaborator</h2>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={inviting}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50 shrink-0"
                  >
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Invite
                  </button>
                </div>
                {inviteError && <p className="text-xs font-bold text-rose-500">{inviteError}</p>}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  We'll generate an invite link for you to copy and send — the invited person must sign in with this exact email to accept.
                </p>
              </form>
            );
          })()}
        </div>
      )}
    </main>
  );
}
