"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Layout, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  Search,
  PlusCircle,
  Radar,
  History
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../src/hooks/useAuth";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Skeleton } from "../../src/components/shared/Skeleton";
import { DashboardSkeleton } from "../../src/components/shared/PageSkeleton";
import { MonitorTable } from "../../src/components/monitors/MonitorTable";
import { NewMonitorSlideOver as MonitorModal } from "../../src/components/monitors/NewMonitorSlideOver";
import { Monitor } from "../../src/types";
import api from "../../src/lib/api";
import { motion } from "motion/react";
import { cn, getErrorMessage } from "../../src/lib/utils";

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMonitors = React.useCallback(async () => {
    try {
      const response = await api.get("/monitors");
      setMonitors(response.data);
    } catch (err: any) {
      console.error("Failed to fetch monitors", err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchMonitors();
    }
  }, [authLoading, fetchMonitors]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/monitors/${id}`);
      setMonitors(monitors.filter((m) => m.id !== id));
      toast.success("Monitor decommissioned");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleEdit = (monitor: Monitor) => {
    setEditingMonitor(monitor);
    setIsModalOpen(true);
  };

  const filteredMonitors = monitors.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const healthyCount = monitors.filter(m => m.status === "healthy").length;
  const failingCount = monitors.filter(m => m.status === "failing").length;

  if (authLoading || (isLoading && monitors.length === 0)) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Adjust for mobile */}
        <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-opacity-80 mt-16 md:mt-0">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Dashboard
              <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-brand-primary/20 hidden sm:inline-block">Live</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input 
                type="text" 
                placeholder="Search monitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#111111] border border-[#1F1F1F] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 transition-all w-48 xl:w-64 placeholder:text-white/40"
              />
            </div>
            <button
              onClick={() => {
                setEditingMonitor(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 md:px-5 h-9 md:h-10 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">{editingMonitor ? "Edit" : "New"} Monitor</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
              <StatCard label="Total Monitors" value={monitors.length} icon={Activity} color="text-brand-primary" />
              <StatCard label="Healthy" value={healthyCount} icon={CheckCircle2} color="text-brand-success" />
              <StatCard label="Failing" value={failingCount} icon={AlertCircle} color="text-brand-error" pulse={failingCount > 0} />
              <StatCard 
                label="Uptime Score" 
                value={monitors.length > 0 ? (healthyCount / monitors.length * 100).toFixed(0) + "%" : "100%"} 
                icon={Zap} 
                color={(monitors.length > 0 && healthyCount / monitors.length < 1) ? "text-yellow-500" : "text-brand-success"} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Active Pings
                    <span className="text-xs font-normal text-brand-muted">({filteredMonitors.length})</span>
                  </h2>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] text-brand-primary hover:underline uppercase tracking-widest font-bold"
                    >
                      Clear Search
                    </button>
                  )}
                </div>

                {isLoading && monitors.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : filteredMonitors.length > 0 ? (
                  <MonitorTable 
                    monitors={filteredMonitors} 
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ) : searchQuery ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-[#111111] border border-[#1F1F1F] rounded-3xl">
                    <Search className="w-10 h-10 text-brand-muted opacity-20 mb-4" />
                    <h3 className="text-white font-bold mb-1">No matches found</h3>
                    <p className="text-brand-muted text-xs">Try adjusting your search for &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
                  <EmptyState onAction={() => setIsModalOpen(true)} />
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <History className="w-4 h-4 text-brand-muted" />
                    System Activity
                  </h2>
                  <div className="space-y-4">
                    {monitors.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-[10px] text-brand-muted uppercase font-bold tracking-widest">Waiting for activity...</p>
                      </div>
                    )}
                    {monitors.slice(0, 5).map((m, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/3 border border-[#1F1F1F] hover:bg-white/5 transition-colors group">
                        <div className={cn(
                          "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border transition-all",
                          m.status === "healthy" ? "bg-brand-success/10 border-brand-success/20 text-brand-success" : 
                          m.status === "failing" ? "bg-brand-error/10 border-brand-error/20 text-brand-error" :
                          "bg-white/5 border-white/10 text-brand-muted"
                        )}>
                          <Radar className={cn("w-5 h-5", m.status === "healthy" && "animate-pulse")} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{m.name}</div>
                          <div className={"text-[10px] text-brand-muted mt-0.5"}>
                            {m.status === "healthy" ? "Receiving pings via collector" : 
                             m.status === "failing" ? "Monitor failed checking" : 
                             "Waiting for first ping"}
                          </div>
                          <div className="text-[9px] text-white/20 font-mono mt-1 uppercase tracking-tighter">Real-time status</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MonitorModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingMonitor(null);
          }}
          editingMonitor={editingMonitor}
          onSuccess={fetchMonitors}
        />
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, pulse = false }: any) {
  return (
    <div className="bg-[#111111] p-5 rounded-2xl border border-[#1F1F1F] relative overflow-hidden group hover:border-[#2F2F2F] transition-all">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <h3 className={cn("text-3xl font-bold tracking-tight", color, pulse && "animate-pulse")}>
              {value}
            </h3>
          </div>
        </div>
        <div className={cn("p-2.5 rounded-xl bg-white/5", color)}>
          <Icon className="w-5 h-5 opacity-80" />
        </div>
      </div>
      {/* Subtle Background Glow */}
      <div className={cn("absolute -bottom-10 -right-10 w-24 h-24 blur-[60px] opacity-10 rounded-full", color.replace('text', 'bg'))} />
    </div>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 bg-[#111111] border border-[#1F1F1F] rounded-3xl border-dashed"
    >
      <div className="w-20 h-20 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-6 border border-[#1F1F1F]">
        <Radar className="w-10 h-10 text-brand-muted opacity-30" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">No monitors yet</h2>
      <p className="text-brand-muted text-center max-w-sm mb-8 leading-relaxed">
        Start watching your cron jobs and background tasks. We&apos;ll notify you instantly if anything stops reporting.
      </p>
      <button
        onClick={onAction}
        className="px-6 h-10 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2 text-xs"
      >
        <PlusCircle className="w-5 h-5" />
        Create First Monitor
      </button>
    </motion.div>
  );
}
