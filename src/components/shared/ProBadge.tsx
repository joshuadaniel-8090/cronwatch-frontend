import React from "react";
import { Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";

export const ProBadge = ({ className }: { className?: string }) => {
  const { user } = useAuthStore();
  if (user?.plan === "pro") return null;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[9px] font-bold uppercase tracking-wider",
      className
    )}>
      <Lock className="w-2.5 h-2.5" />
      Pro
    </span>
  );
};

interface ProTooltipProps {
  children: React.ReactNode;
  isLocked: boolean;
  className?: string;
}

export const ProLock = ({ children, isLocked, className }: ProTooltipProps) => {
  const { user } = useAuthStore();
  const isActuallyLocked = isLocked && user?.plan !== "pro";

  if (!isActuallyLocked) return <>{children}</>;

  return (
    <div className={cn("relative group cursor-not-allowed", className)}>
      <div className="pointer-events-none opacity-50 grayscale">
        {children}
      </div>
      <div className="absolute inset-0 z-10" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-bg-elevated border border-border-card rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
        <p className="text-[10px] text-text-primary font-medium leading-relaxed">
          This feature requires a Pro plan. Upgrade for $9/mo to unlock.
        </p>
        <Link 
          href="/settings" 
          className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-brand-primary hover:underline"
        >
          Upgrade to Pro →
        </Link>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-border-card" />
      </div>
    </div>
  );
};
