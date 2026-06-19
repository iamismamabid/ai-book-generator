export default function DashboardLoading() {
  return (
    <main className="min-h-screen p-6 md:p-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Skeleton */}
        <div className="h-40 bg-white rounded-[3rem] animate-pulse mb-16 border border-slate-100"></div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 h-[380px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-6 animate-pulse"></div>
              <div className="h-8 bg-slate-100 rounded-lg w-3/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-slate-50 rounded-lg w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-50 rounded-lg w-5/6 mb-8 animate-pulse"></div>
              <div className="mt-auto flex justify-between">
                <div className="h-4 bg-slate-100 rounded-lg w-20 animate-pulse"></div>
                <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}