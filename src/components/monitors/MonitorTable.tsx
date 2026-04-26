import React, { useState } from "react";
import Link from "next/link";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { Monitor } from "../../types";
import { formatInterval, timeAgo, cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface MonitorTableProps {
  monitors: Monitor[];
  onDelete?: (id: string) => void;
  onEdit?: (monitor: Monitor) => void;
}

export const MonitorTable: React.FC<MonitorTableProps> = ({ monitors, onDelete, onEdit }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getReliability = (monitor: Monitor) => {
    if (monitor.status === "healthy") return 100;
    if (monitor.status === "failing") return 87.4; // Mock logic as in original
    return 0;
  };

  const getReliabilityColor = (percentage: number) => {
    if (percentage >= 95) return "bg-brand-success";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-brand-error";
  };

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Table Header - subtle Labels */}
      <div className="grid grid-cols-[auto_1fr_120px_140px_160px_48px] gap-4 px-6 py-2 text-xs font-semibold text-brand-muted uppercase tracking-wider">
        <div className="w-4"></div>
        <div>Monitor</div>
        <div>Schedule</div>
        <div>Last Ping</div>
        <div>Reliability</div>
        <div className="text-right"></div>
      </div>

      <div className="space-y-3">
        {monitors.map((monitor) => {
          const reliability = getReliability(monitor);
          const isFailing = monitor.status === "failing";
          
          return (
            <motion.div
              layout
              key={monitor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-[#111111] border border-[#1F1F1F] hover:border-brand-primary/30 rounded-xl transition-all duration-200"
            >
              <Link href={`/monitors/${monitor.id}`} className="grid grid-cols-[auto_1fr_120px_140px_160px_48px] gap-4 items-center p-4">
                {/* Status Dot */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      monitor.status === "healthy" ? "bg-brand-success" : 
                      isFailing ? "bg-brand-error" : "bg-brand-muted"
                    )} />
                    {isFailing && (
                      <div className="absolute inset-0 w-3 h-3 bg-brand-error rounded-full animate-ping opacity-75" />
                    )}
                  </div>
                </div>

                {/* Name & Slug */}
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#F5F5F5] truncate group-hover:text-brand-primary transition-colors">
                    {monitor.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-muted font-mono mt-0.5">
                    <span className="opacity-50">slug:</span>
                    <span className="truncate">{monitor.slug}</span>
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Clock className="w-3.5 h-3.5 opacity-50" />
                  <span className="truncate">{formatInterval(monitor.interval_seconds)}</span>
                </div>

                {/* Last Ping */}
                <div className="text-sm text-text-muted">
                  {timeAgo(monitor.last_ping_at)}
                </div>

                {/* Reliability Bar */}
                <div className="flex flex-col gap-1.5 px-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={cn(
                      "font-medium",
                      reliability >= 95 ? "text-brand-success" : reliability >= 80 ? "text-yellow-500" : "text-brand-error"
                    )}>{reliability}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${reliability}%` }}
                      className={cn("h-full rounded-full transition-all duration-1000", getReliabilityColor(reliability))}
                    />
                  </div>
                </div>

                {/* Placeholder for menu */}
                <div className="flex justify-end">
                </div>
              </Link>

              {/* Action Menu - Overlay */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveMenu(activeMenu === monitor.id ? null : monitor.id);
                    }}
                    className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === monitor.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenu(null)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-40 bg-[#1A1A1A] border border-[#2F2F2F] rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                        >
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              onEdit?.(monitor);
                              setActiveMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              onDelete?.(monitor.id);
                              setActiveMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-error hover:bg-brand-error/5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
