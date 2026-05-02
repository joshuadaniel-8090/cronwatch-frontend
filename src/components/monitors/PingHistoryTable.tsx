// src/components/monitors/PingHistoryTable.tsx
import React from "react";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Ping } from "../../types";
import { cn } from "../../lib/utils";

interface PingHistoryTableProps {
  pings: Ping[];
}

export const PingHistoryTable: React.FC<PingHistoryTableProps> = ({ pings }) => {
  if (pings.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-gray-500">
        No ping history yet.
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#1F1F1F] text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <th className="px-4 md:px-6 py-4">Received Time</th>
            <th className="px-4 md:px-6 py-4">Status</th>
            <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2A2A2A]">
          {pings.map((ping) => (
            <tr key={ping.id} className="text-xs md:text-sm text-gray-300 hover:bg-[#252525] transition-colors">
              <td className="px-4 md:px-6 py-4">
                <span className="hidden md:inline">{format(new Date(ping.received_at), "MMM d, yyyy HH:mm:ss")}</span>
                <span className="md:hidden">{format(new Date(ping.received_at), "MMM d, HH:mm:ss")}</span>
              </td>
              <td className="px-4 md:px-6 py-4">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium flex items-center gap-1 w-fit",
                    ping.status === "recovery"
                      ? "bg-brand-success/20 text-brand-success border border-brand-success/30"
                      : ping.status === "success"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  )}
                >
                  {ping.status === "recovery" ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Recovery
                    </>
                  ) : ping.status === "success" ? "Success" : "Late"}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 text-gray-500 italic hidden sm:table-cell">HTTP Request</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
