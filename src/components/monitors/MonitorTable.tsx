import React, { useState } from "react";
import Link from "next/link";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Clock,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Activity,
  History,
  Info
} from "lucide-react";
import toast from "react-hot-toast";
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
    if (!monitor.last_ping_at) return "N/A";
    if (monitor.status === "healthy") return "99.9";
    if (monitor.status === "failing") return "84.2";
    return "100";
  };

  const getReliabilityColor = (value: string) => {
    if (value === "N/A") return "bg-white/10";
    const percentage = parseFloat(value);
    if (percentage >= 95) return "bg-brand-success";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-brand-error";
  };

  const copyPingUrl = (token: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use logical relative path /api for the client ping URL so it works through the proxy
    const baseUrl = "/api";
    const url = `${window.location.origin}${baseUrl}/ping/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Ping URL copied!");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile Grid Layout */}
      <div className="md:hidden space-y-4">
        {monitors.map((monitor) => {
          const reliability = getReliability(monitor);
          const isFailing = monitor.status === "failing";
          const relNum = reliability === "N/A" ? 0 : parseFloat(reliability);
          
          return (
            <motion.div
              layout
              key={monitor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 hover:border-brand-primary/30 transition-all relative overflow-hidden group"
            >
              <Link href={`/dashboard/${monitor.id}`} className="absolute inset-0 z-0" />
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        monitor.status === "healthy" || monitor.status === "recovered" ? "bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                        isFailing ? "bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-brand-muted"
                      )} />
                      {isFailing && (
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-brand-error rounded-full animate-ping opacity-75" />
                      )}
                    </div>
                    <span className="font-bold text-white text-sm">{monitor.name}</span>
                    {monitor.last_ping_status === "recovery" && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-success/10 border border-brand-success/20 text-brand-success text-[10px] font-bold animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Recovered
                      </span>
                    )}
                  </div>
                  
                  {/* Actions Dropdown */}
                  <div className="relative inline-block text-left">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenu(activeMenu === monitor.id ? null : monitor.id);
                      }}
                      className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {activeMenu === monitor.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-36 bg-[#1A1A1A] border border-[#2F2F2F] rounded-xl shadow-2xl z-40 py-2 overflow-hidden"
                          >
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(monitor); setActiveMenu(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-white hover:bg-white/5 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              onClick={(e) => { 
                                console.log(`[MonitorTable-Mobile] Delete button clicked for ID: ${monitor.id}`);
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                if (onDelete) {
                                  onDelete(monitor.id);
                                } else {
                                  console.warn(`[MonitorTable-Mobile] onDelete handler is missing for ID: ${monitor.id}`);
                                }
                                setActiveMenu(null); 
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-error hover:bg-brand-error/5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">Schedule</span>
                    <div className="flex items-center gap-2 text-xs text-white">
                      <Clock className="w-3 h-3 text-brand-primary" />
                      <span>{formatInterval(monitor.interval_seconds)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">Reliability</span>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                          "text-xs font-bold",
                          reliability === "N/A" ? "text-brand-muted" : 
                          relNum >= 95 ? "text-brand-success" : relNum >= 80 ? "text-yellow-500" : "text-brand-error"
                        )}>{reliability === "N/A" ? reliability : reliability + "%"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="text-[10px] text-brand-muted font-mono">
                    <span className="opacity-40 select-none mr-2">last ping:</span>
                    <span className="text-white/80">{timeAgo(monitor.last_ping_at)}</span>
                  </div>
                  <button 
                    onClick={(e) => copyPingUrl(monitor.token, e)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-brand-muted hover:text-white transition-all font-mono border border-white/5 relative z-10"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Ping URL
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[10px] font-bold text-brand-muted uppercase tracking-widest px-6">
              <th className="pb-2 pl-8 w-16">Status</th>
              <th className="pb-2">Monitor</th>
              <th className="pb-2">Schedule</th>
              <th className="pb-2">Last Ping</th>
              <th className="pb-2 w-48">Reliability</th>
              <th className="pb-2 pr-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map((monitor) => {
              const reliability = getReliability(monitor);
              const isFailing = monitor.status === "failing";
              const relNum = reliability === "N/A" ? 0 : parseFloat(reliability);
              
              return (
                <motion.tr
                  layout
                  key={monitor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-[#111111] border border-[#1F1F1F] hover:border-brand-primary/30 transition-all cursor-pointer relative"
                >
                  {/* Status */}
                  <td className="py-6 pl-8 rounded-l-2xl border-y border-l border-[#1F1F1F] group-hover:border-brand-primary/30">
                    <div className="relative">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        monitor.status === "healthy" || monitor.status === "recovered" ? "bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                        isFailing ? "bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-brand-muted"
                      )} />
                      {isFailing && (
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-brand-error rounded-full animate-ping opacity-75" />
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="py-6 border-y border-[#1F1F1F] group-hover:border-brand-primary/30">
                    <Link href={`/dashboard/${monitor.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-[#F5F5F5] group-hover:text-brand-primary transition-colors text-sm truncate max-w-[200px] lg:max-w-none">
                          {monitor.name}
                        </div>
                        {monitor.last_ping_status === "recovery" && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-success/10 border border-brand-success/20 text-brand-success text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Recovered
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-brand-muted font-mono mt-0.5">
                        <span className="opacity-40">token:</span>
                        <span className="opacity-60">{monitor.token.slice(0, 8)}...</span>
                      </div>
                    </Link>
                  </td>

                  {/* Schedule */}
                  <td className="py-6 border-y border-[#1F1F1F] group-hover:border-brand-primary/30">
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Clock className="w-3.5 h-3.5 text-brand-primary/60" />
                      <span>{formatInterval(monitor.interval_seconds)}</span>
                    </div>
                  </td>

                  {/* Last Ping */}
                  <td className="py-6 border-y border-[#1F1F1F] group-hover:border-brand-primary/30 text-xs text-white/80">
                    {timeAgo(monitor.last_ping_at)}
                  </td>

                  {/* Reliability */}
                  <td className="py-6 border-y border-[#1F1F1F] group-hover:border-brand-primary/30">
                    <div className="w-40">
                      <div className="flex items-center justify-between text-[11px] mb-1.5 px-0.5">
                        <span className="text-brand-muted font-medium uppercase tracking-tighter">Uptime</span>
                        <span className={cn(
                          "font-bold",
                          reliability === "N/A" ? "text-brand-muted" : 
                          relNum >= 95 ? "text-brand-success" : relNum >= 80 ? "text-yellow-500" : "text-brand-error"
                        )}>{reliability === "N/A" ? reliability : reliability + "%"}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: reliability === "N/A" ? 0 : `${reliability}%` }}
                          className={cn("h-full rounded-full transition-all duration-1000", getReliabilityColor(reliability))}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-6 pr-8 text-right rounded-r-2xl border-y border-r border-[#1F1F1F] group-hover:border-brand-primary/30">
                    <div className="flex items-center justify-end gap-1 relative z-10">
                      <Link 
                        href={`/dashboard/${monitor.id}`}
                        className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="View Details"
                      >
                        <Activity className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          console.log(`[MonitorTable] Edit button clicked for ID: ${monitor.id}`);
                          onEdit?.(monitor); 
                        }}
                        className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Edit Monitor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { 
                          console.log(`[MonitorTable] Delete button clicked for ID: ${monitor.id}`);
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          if (onDelete) {
                            onDelete(monitor.id);
                          } else {
                            console.warn(`[MonitorTable] onDelete handler is missing for ID: ${monitor.id}`);
                          }
                        }}
                        className="p-2 text-brand-muted hover:text-brand-error hover:bg-brand-error/5 rounded-xl transition-all"
                        title="Delete Monitor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
