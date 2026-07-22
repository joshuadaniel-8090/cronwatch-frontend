import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  pulse?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  pulse = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-surface p-5 rounded-2xl border border-border-card relative overflow-hidden group transition-all hover:border-border-card/80",
        className,
      )}
    >
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-1">
            {label}
          </p>
          <h3
            className={cn(
              "text-3xl font-bold tracking-tight",
              color,
              pulse && "animate-pulse",
            )}
          >
            {value}
          </h3>
        </div>
        <div className={cn("p-2.5 rounded-xl bg-bg-subtle", color)}>
          <Icon className="w-5 h-5 opacity-80" />
        </div>
      </div>
      <div
        className={cn(
          "absolute -bottom-10 -right-10 w-24 h-24 blur-[60px] opacity-10 rounded-full",
          color.replace("text", "bg"),
        )}
      />
    </div>
  );
}
