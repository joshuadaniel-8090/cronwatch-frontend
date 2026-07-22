import { Skeleton } from "./Skeleton";
import { Sidebar } from "../layout/Sidebar";

export function DashboardSkeleton() {
  return (
    <>
      <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48 rounded-lg hidden lg:block" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </header>

      <div className="p-4 md:p-8 flex-1 overflow-y-auto">
        <div className="max-w-350 mx-auto w-full">
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
    </>
  );
}

export function MonitorsSkeleton() {
  return (
    <>
      <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-60 hidden sm:block" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </header>

      <div className="p-4 md:p-8 flex-1 overflow-y-auto">
        <div className="max-w-350 mx-auto w-full">
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
    </>
  );
}

export function UrlMonitorsSkeleton() {
  return (
    <>
      <header className="h-24 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80 border-b border-border-card">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3 w-72 hidden sm:block" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-64 rounded-xl hidden md:block" />
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
      </header>

      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-300 mx-auto w-full space-y-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>

          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function UrlMonitorWizardSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden selection:bg-brand-primary/30 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-bg-subtle z-50">
          <div className="h-full w-1/3 bg-brand-primary" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar pt-20 pb-32">
          <div className="w-full max-w-xl space-y-6">
            <Skeleton className="h-4 w-32 rounded-full" />
            <div className="bg-bg-surface border border-border-card rounded-3xl p-8 space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80 max-w-full" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function UrlMonitorDetailSkeleton() {
  return (
    <>
      <header className="h-24 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80 border-b border-border-card">
        <div className="flex items-center gap-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </header>

      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-300 mx-auto space-y-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-3xl" />
          <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="h-72 rounded-3xl lg:col-span-2" />
            <div className="space-y-6">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function SettingsSkeleton() {
  return (
    <>
      <header className="h-20 md:h-24 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80 border-b border-border-card">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3 w-80 hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-xl hidden sm:block" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-12">
          <section>
            <Skeleton className="h-9 w-48 mb-3" />
            <Skeleton className="h-32 rounded-xl" />
          </section>
          <section>
            <Skeleton className="h-9 w-56 mb-3" />
            <div className="space-y-5">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </section>
          <section>
            <Skeleton className="h-9 w-44 mb-3" />
            <Skeleton className="h-40 rounded-xl" />
          </section>
          <section>
            <Skeleton className="h-9 w-36 mb-3" />
            <Skeleton className="h-24 rounded-xl" />
          </section>
        </div>
      </div>
    </>
  );
}

export function MonitorDetailSkeleton() {
  return (
    <>
      <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center shrink-0">
        <Skeleton className="h-4 w-40" />
        <div className="h-8 w-px bg-border-card mx-6" />
        <Skeleton className="h-6 w-32" />
      </header>

      <div className="p-4 md:p-8 flex-1 overflow-y-auto">
        <div className="max-w-300 mx-auto w-full">
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
    </>
  );
}

export function PublicStatusSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <header className="flex items-center justify-between mb-12 py-4 border-b border-border-card">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
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

        <div className="mt-16 flex flex-wrap gap-1 sm:gap-2">
          {[...Array(30)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-12 flex-1 min-w-0 basis-[calc(100%/15-0.125rem)] rounded-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
