import React from "react";
import { cn } from "../../lib/utils";

interface UptimeHistoryBarProps {
  days: number;
  data?: { date: string; uptime: number; status: "up" | "down" | "no_data" }[];
}

export const UptimeHistoryBar = ({ days = 30, data }: UptimeHistoryBarProps) => {
  // Mock data if not provided
  const items = data || Array.from({ length: days }).map((_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0],
    uptime: Math.random() > 0.1 ? 100 : 0,
    status: Math.random() > 0.1 ? "up" : Math.random() > 0.5 ? "down" : "no_data" as any
  }));

  return (
    <div className="flex items-center gap-1 h-8 w-full">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 h-full rounded-[2px] transition-all relative group",
            item.status === "up" ? "bg-brand-success/80 hover:bg-brand-success" :
            item.status === "down" ? "bg-brand-error/80 hover:bg-brand-error" :
            "bg-bg-subtle hover:bg-bg-elevated"
          )}
        >
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bg-elevated border border-border-card rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
            <p className="text-[10px] font-bold text-text-primary">{item.date}</p>
            <p className="text-[9px] text-brand-muted mt-1 uppercase tracking-widest">
              Uptime: <span className={cn(item.status === "up" ? "text-brand-success" : "text-brand-error")}>{item.uptime}%</span>
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-card" />
          </div>
        </div>
      ))}
    </div>
  );
};
