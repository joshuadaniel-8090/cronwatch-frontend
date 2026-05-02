import { Skeleton } from "./Skeleton";
import { Sidebar } from "../layout/Sidebar";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-opacity-80 mt-16 md:mt-0">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-3">
             <Skeleton className="h-10 w-48 rounded-lg hidden lg:block" />
             <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="space-y-4">
                   {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function MonitorsSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-opacity-80 mt-16 md:mt-0">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-60 hidden sm:block" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Skeleton className="flex-1 h-12 rounded-2xl" />
              <Skeleton className="w-24 h-12 rounded-2xl" />
            </div>

            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 border-b border-border-card bg-bg-surface px-8 flex items-center shrink-0">
          <Skeleton className="h-6 w-48" />
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-4xl space-y-8">
            <section className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </section>
            <section className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
              <Skeleton className="h-6 w-40 mb-6" />
               <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export function MonitorDetailSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center shrink-0">
          <Skeleton className="h-4 w-40" />
          <div className="h-8 w-px bg-border-card mx-6" />
          <Skeleton className="h-6 w-32" />
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
              <div className="space-y-3">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-64 w-full rounded-xl" />
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function PublicStatusSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base text-white flex flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <header className="flex items-center justify-between mb-12 py-4 border-b border-border-card">
          <Skeleton className="h-8 w-40" />
        </header>

        <main className="bg-bg-surface border border-border-card rounded-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="space-y-3">
              <Skeleton className="h-12 w-80" />
              <div className="flex gap-4">
                 <Skeleton className="h-4 w-32" />
                 <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-48" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
             <Skeleton className="h-6 w-48" />
             <Skeleton className="h-12 w-full rounded-sm" />
             <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
