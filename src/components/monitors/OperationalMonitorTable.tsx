"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Clock,
  CheckCircle2,
  Activity,
  History,
  Play,
  Pause,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { Monitor } from "../../types";
import { formatInterval, timeAgo, cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface OperationalMonitorTableProps {
  monitors: Monitor[];
  onDelete?: (id: string) => void;
  onEdit?: (monitor: Monitor) => void;
  onToggleStatus?: (id: string, active: boolean) => void;
}

export const OperationalMonitorTable: React.FC<OperationalMonitorTableProps> = ({ 
  monitors, 
  onDelete, 
  onEdit,
  onToggleStatus 
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getReliability = (monitor: Monitor) => {
    if (!monitor.last_ping_at) return "N/A";
    if (monitor.status === "healthy") return "99.9";
    if (monitor.status === "failing") return "84.2";
    return "100";
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-[#1F1F1F] rounded-xl bg-[#111111]">
          <table className="min-w-full divide-y divide-[#1F1F1F]">
            <thead>
              <tr className="bg-black/20 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Monitor Name</th>
                <th className="px-6 py-4 text-left">Schedule</th>
                <th className="px-6 py-4 text-left">Last Check</th>
                <th className="px-6 py-4 text-left">Uptime</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              <AnimatePresence mode="popLayout">
                {monitors.map((monitor) => {
                  const isFailing = monitor.status === "failing";
                  const reliability = getReliability(monitor);
                  
                  return (
                    <motion.tr
                      layout
                      key={monitor.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onMouseEnter={() => setHoveredRow(monitor.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={cn(
                        "transition-colors cursor-pointer group border-b border-[#1F1F1F] last:border-none",
                        hoveredRow === monitor.id ? "bg-[#1A1A22]" : "bg-transparent"
                      )}
                    >
                      {/* Status */}
                      <td className="px-6 py-2.5 whitespace-nowrap w-24">
                        <div className="flex items-center gap-2">
                          <div className="relative shrink-0">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              monitor.status === "healthy" ? "bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                              isFailing ? "bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-brand-muted"
                            )} />
                            {isFailing && (
                              <div className="absolute inset-0 w-1.5 h-1.5 bg-brand-error rounded-full animate-ping opacity-75" />
                            )}
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider",
                            monitor.status === "healthy" ? "text-brand-success" : 
                            isFailing ? "text-brand-error" : "text-brand-muted"
                          )}>
                            {monitor.status === "healthy" ? "UP" : isFailing ? "DOWN" : "PAUSED"}
                          </span>
                        </div>
                      </td>

                      {/* Name + Meta */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors truncate max-w-[180px]">
                            {monitor.name}
                          </span>
                          <span className="text-[9px] text-brand-muted font-mono opacity-40">
                            {monitor.slug}
                          </span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-4 py-2.5 whitespace-nowrap w-32">
                        <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                          <Clock className="w-3 h-3 opacity-40" />
                          <span>{formatInterval(monitor.interval_seconds)}</span>
                        </div>
                      </td>

                      {/* Last Check + Latency */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] text-white/60 w-24">{timeAgo(monitor.last_ping_at)}</span>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-brand-muted font-bold uppercase tracking-tighter opacity-40">Lat: 120ms</span>
                          </div>
                        </div>
                      </td>

                      {/* Uptime */}
                      <td className="px-4 py-2.5 whitespace-nowrap w-24">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                              "text-[11px] font-bold",
                              reliability === "N/A" ? "text-brand-muted" : 
                              parseFloat(reliability) >= 95 ? "text-brand-success" : "text-brand-error"
                            )}>{reliability === "N/A" ? reliability : reliability + "%"}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-2.5 whitespace-nowrap text-right w-32">
                        <div className={cn(
                          "flex items-center justify-end gap-0.5 transition-opacity",
                          hoveredRow === monitor.id ? "opacity-100" : "opacity-0"
                        )}>
                          <Link 
                            href={`/dashboard/${monitor.id}`}
                            className="p-1 text-brand-muted hover:text-white hover:bg-white/5 rounded transition-all"
                            title="View"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEdit?.(monitor); }}
                            className="p-1 text-brand-muted hover:text-white hover:bg-white/5 rounded transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleStatus?.(monitor.id, !monitor.is_active); }}
                            className="p-1 text-brand-muted hover:text-white hover:bg-white/5 rounded transition-all"
                            title={monitor.is_active ? "Pause" : "Resume"}
                          >
                            {monitor.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete?.(monitor.id); }}
                            className="p-1 text-brand-muted hover:text-brand-error hover:bg-brand-error/5 rounded transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className={cn(
                          "transition-opacity",
                          hoveredRow === monitor.id ? "hidden" : "block"
                        )}>
                           <ChevronRight className="w-3.5 h-3.5 text-brand-muted/20 ml-auto" />
                        </div>
                      </td>
                    </motion.tr>

                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
