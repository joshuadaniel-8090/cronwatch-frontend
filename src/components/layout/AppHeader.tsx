import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

function AppHeader({
  title,
  description,
  actions,
  backHref,
  backLabel = "Back",
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-border-card bg-bg-base/80 px-4 backdrop-blur-md md:h-24 md:px-8",
        className,
      )}
    >
      <div className="flex items-center gap-4 md:gap-6 min-w-0">
        {backHref && (
          <>
            <Link
              href={backHref}
              className="flex items-center gap-2 text-xs md:text-sm text-brand-muted hover:text-text-primary transition-colors group shrink-0"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
            <div className="h-8 w-px bg-border-card shrink-0" />
          </>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-text-primary md:text-2xl truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs text-brand-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-4 shrink-0">{actions}</div>
      )}
    </header>
  );
}

export { AppHeader };
