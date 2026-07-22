// src/components/monitors/PingHistoryTable.tsx
import React from "react";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Ping } from "../../types";
import { cn } from "../../lib/utils";

interface PingHistoryTableProps {
  pings: Ping[];
}

function statusPillClass(status: Ping["status"]) {
  return cn(
    "px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium flex items-center gap-1 w-fit",
    status === "recovery"
      ? "bg-brand-success/20 text-brand-success border border-brand-success/30"
      : status === "success"
        ? "bg-brand-success/10 text-brand-success"
        : "bg-brand-error/10 text-brand-error",
  );
}

function StatusPill({ status }: { status: Ping["status"] }) {
  return (
    <span className={statusPillClass(status)}>
      {status === "recovery" ? (
        <>
          <CheckCircle2 className="w-3 h-3" />
          Recovery
        </>
      ) : status === "success" ? (
        "Success"
      ) : (
        "Late"
      )}
    </span>
  );
}

export const PingHistoryTable: React.FC<PingHistoryTableProps> = ({ pings = [] }) => {
  const pingsList = Array.isArray(pings) ? pings : [];

  if (pingsList.length === 0) {
    return (
      <div className="text-center py-12 bg-bg-surface border border-border-card rounded-xl text-text-muted">
        No ping history yet.
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="sm:hidden space-y-2">
        {pingsList.map((ping) => (
          <div
            key={ping.id}
            className="bg-bg-surface border border-border-card rounded-xl p-4 flex items-center justify-between gap-3"
          >
            <span className="text-[11px] text-text-primary">
              {format(new Date(ping.received_at), "MMM d, HH:mm:ss")}
            </span>
            <StatusPill status={ping.status} />
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden sm:block bg-bg-surface border border-border-card rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left font-sans">
          <thead>
            <tr className="bg-bg-subtle text-[10px] md:text-xs font-bold text-brand-muted uppercase tracking-wider">
              <th className="px-4 md:px-6 py-4">Received Time</th>
              <th className="px-4 md:px-6 py-4">Status</th>
              <th className="px-4 md:px-6 py-4 hidden md:table-cell">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card">
            {pingsList.map((ping) => (
              <tr key={ping.id} className="text-[11px] md:text-sm text-text-primary hover:bg-bg-subtle transition-colors">
                <td className="px-4 md:px-6 py-4">
                  {format(new Date(ping.received_at), "MMM d, yyyy HH:mm:ss")}
                </td>
                <td className="px-4 md:px-6 py-4">
                  <StatusPill status={ping.status} />
                </td>
                <td className="px-4 md:px-6 py-4 text-text-muted italic hidden md:table-cell">HTTP Request</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
