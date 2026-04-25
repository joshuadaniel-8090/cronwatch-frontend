// src/components/monitors/MonitorTable.tsx
import React from "react";
import Link from "next/link";
import { Monitor } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { formatInterval, timeAgo, cn } from "../../lib/utils";

interface MonitorTableProps {
  monitors: Monitor[];
}

export const MonitorTable: React.FC<MonitorTableProps> = ({ monitors }) => {
  return (
    <div className="flex-1 bg-bg-surface rounded-lg border border-border-card flex flex-col overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-bg-header border-b border-border-card">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Monitor Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Schedule</th>
              <th className="px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Last Ping</th>
              <th className="px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider text-right">Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card">
            {monitors.map((monitor) => (
              <tr
                key={monitor.id}
                className={cn(
                  "hover:bg-[#252525] transition-colors group",
                  monitor.status === "failing" && "bg-brand-error/5"
                )}
              >
                <td className="px-6 py-4">
                  <Link href={`/monitors/${monitor.id}`} className="block">
                    <div className="font-medium text-white group-hover:text-brand-primary transition-colors">{monitor.name}</div>
                    <div className="text-[11px] text-brand-muted font-mono">slug: {monitor.slug}</div>
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={monitor.status} />
                </td>
                <td className="px-6 py-4 text-sm text-text-muted">{formatInterval(monitor.interval_seconds)}</td>
                <td className="px-6 py-4 text-sm text-text-muted">{timeAgo(monitor.last_ping_at)}</td>
                <td className="px-6 py-4 text-right">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    monitor.status === "healthy" ? "bg-brand-success/10 text-brand-success" : 
                    monitor.status === "failing" ? "bg-brand-error/10 text-brand-error" : "bg-border-card text-brand-muted"
                  )}>
                    {monitor.status === "healthy" ? "100%" : monitor.status === "failing" ? "87.4%" : "0%"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-auto p-4 border-t border-border-card flex items-center justify-between bg-bg-header">
        <div className="text-xs text-brand-muted">
          Showing <span className="text-white">{monitors.length}</span> monitors
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-border-card text-xs text-text-muted rounded border border-[#3A3A3A] cursor-not-allowed">Previous</button>
          <button className="px-3 py-1 bg-border-card text-xs text-white rounded border border-[#3A3A3A] hover:bg-[#3A3A3A]">Next</button>
        </div>
      </div>
    </div>
  );
};
