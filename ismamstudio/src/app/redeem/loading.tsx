import { Loader2, ArrowLeft, Gift } from "lucide-react";

export default function RedeemLoading() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-md w-full relative z-10">
        <div className="mb-8 opacity-50">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl animate-pulse">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-4">
              <Gift className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Redeem AppSumo Code</h1>
            <p className="text-slate-400 text-sm mt-2">Activate your lifetime access to Ismam Studio</p>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-8" />

          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-xs mt-3 font-semibold uppercase tracking-wider">Loading Redemption Panel...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
