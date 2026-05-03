// src/components/monitors/MonitorCard.tsx
import React from "react";
import Link from "next/link";
import { Clock, RefreshCcw, CheckCircle2 } from "lucide-react";
import { Monitor } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { formatInterval, timeAgo } from "../../lib/utils";

interface MonitorCardProps {
  monitor: Monitor;
}

export const MonitorCard: React.FC<MonitorCardProps> = ({ monitor }) => {
  return (
    <Link
      href={`/dashboard/${monitor.id}`}
      className="block p-5 bg-bg-surface border border-border-card rounded-xl hover:border-brand-primary/50 transition-all group shadow-sm hover:shadow-brand-primary/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-primary transition-colors">
            {monitor.name}
          </h3>
          <div className="flex items-center gap-2">
            <StatusBadge status={monitor.status} />
            {monitor.last_ping_status === "recovery" && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-success/10 border border-brand-success/20 text-brand-success text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                Recovered
              </span>
            )}
          </div>
        </div>
        <div className="text-brand-muted">
          <RefreshCcw className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock className="w-4 h-4 opacity-70" />
          <span>{formatInterval(monitor.interval_seconds)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock className="w-4 h-4 opacity-70" />
          <span className="truncate">{timeAgo(monitor.last_ping_at)}</span>
        </div>
      </div>
    </Link>
  );
};
