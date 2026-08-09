export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Loading
        </span>
      </div>
    </div>
  );
}
