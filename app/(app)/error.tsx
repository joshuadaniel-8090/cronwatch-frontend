"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-error/10">
        <AlertTriangle className="size-6 text-brand-error" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-text-primary">
          Something broke
        </h1>
        <p className="mt-1 max-w-sm text-sm text-text-muted">
          An unexpected error occurred while rendering this page.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-primary/90"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl border border-border-card px-5 py-2.5 text-sm font-bold text-text-primary transition-all hover:bg-bg-subtle"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
