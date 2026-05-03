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
import { useAuthStore } from "../../src/store/useAuthStore";
import { Skeleton } from "../../src/components/shared/Skeleton";
import { DashboardSkeleton } from "../../src/components/shared/PageSkeleton";
import { MonitorTable } from "../../src/components/monitors/MonitorTable";
import { NewMonitorSlideOver as MonitorModal } from "../../src/components/monitors/NewMonitorSlideOver";
import { ConfirmationModal } from "../../src/components/shared/ConfirmationModal";
import { Monitor } from "../../src/types";
import api from "../../src/lib/api";
import { motion } from "motion/react";
import { cn, getErrorMessage, PLAN_LIMITS } from "../../src/lib/utils";

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const safeMonitors = Array.isArray(monitors) ? monitors : [];

  const fetchMonitors = React.useCallback(async () => {
    try {
      const response = await api.get("monitors");
      if (Array.isArray(response.data)) {
        setMonitors(response.data);
      } else {
        console.warn("Expected array for monitors but got:", response.data);
        setMonitors([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch monitors", err);
      toast.error(getErrorMessage(err));
      setMonitors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchMonitors();
    }
  }, [authLoading, fetchMonitors]);

  const handleDeleteClick = (id: string) => {
    setMonitorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!monitorToDelete) return;
    
    setIsDeleting(true);
    console.log(`[UI] Attempting to decommission monitor ${monitorToDelete}`);
    try {
      console.log(`[UI] API DELETE /api/monitors/${monitorToDelete}`);
      const res = await api.delete(`monitors/${monitorToDelete}`);
      console.log(`[UI] Decommission response:`, res.data);
      setMonitors(prev => Array.isArray(prev) ? prev.filter((m) => m.id !== monitorToDelete) : []);
      toast.success("Monitor decommissioned");
    } catch (err: any) {
      console.error("[UI] Decommission failed:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setMonitorToDelete(null);
    }
  };

  const handleEdit = (monitor: Monitor) => {
    setEditingMonitor(monitor);
    setIsModalOpen(true);
  };

  const filteredSource = Array.isArray(monitors) ? monitors : [];

  const filteredMonitors = filteredSource.filter(m => 
    m && m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m && m.slug && m.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const healthyCount = filteredSource.filter(m => m && m.status === "healthy").length;
  const failingCount = filteredSource.filter(m => m && m.status === "failing").length;

  if (authLoading || (isLoading && filteredSource.length === 0)) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Adjust for mobile */}
        <header className="h-20 md:h-24 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80 mt-16 md:mt-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-brand-muted mt-1">Manage and watch your recurring jobs</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input 
                type="text" 
                placeholder="Search monitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#111111] border border-[#1F1F1F] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all w-48 xl:w-64 placeholder:text-white/20"
              />
            </div>
            <button
              onClick={() => {
                setEditingMonitor(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 md:px-6 h-11 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Monitor</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] mx-auto w-full">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-12">
              <StatCard 
                label={user?.plan === "free" ? "Monitor Usage (Free)" : "Total Monitors"} 
                value={user?.plan === "free" ? `${monitors.length} / ${PLAN_LIMITS.free}` : monitors.length} 
                icon={Activity} 
                color="text-brand-primary" 
              />
              <StatCard label="Healthy" value={healthyCount} icon={CheckCircle2} color="text-brand-success" />
              <StatCard label="Failing" value={failingCount} icon={AlertCircle} color="text-brand-error" pulse={failingCount > 0} />
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Monitors
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
                  onDelete={handleDeleteClick}
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
          </div>
        </div>

        <MonitorModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingMonitor(null);
          }}
          editingMonitor={editingMonitor}
          currentCount={monitors.length}
          onSuccess={fetchMonitors}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setMonitorToDelete(null);
          }}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Decommission Monitor"
          message="Are you sure you want to decommission this monitor? This will stop all monitoring and cannot be undone."
          confirmText="Decommission"
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 bg-[#111111]/50 border-2 border-dashed border-[#1F1F1F] rounded-[2rem]"
    >
      <div className="w-24 h-24 bg-brand-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
        <Radar className="w-12 h-12 text-brand-primary animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">No monitors yet</h2>
      <p className="text-brand-muted text-center max-w-sm mb-10 leading-relaxed text-sm">
        Add your first monitor to start watching your cron jobs and background tasks. We&apos;ll notify you instantly if anything fails.
      </p>
      <button
        onClick={onAction}
        className="px-8 h-12 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-3 text-sm active:scale-95"
      >
        <PlusCircle className="w-5 h-5" />
        Add First Monitor
      </button>
    </motion.div>
  );
}
