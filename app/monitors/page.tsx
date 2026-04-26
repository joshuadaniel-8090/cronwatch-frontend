"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../src/hooks/useAuth";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { LoadingSpinner } from "../../src/components/shared/LoadingSpinner";
import { MonitorTable } from "../../src/components/monitors/MonitorTable";
import { NewMonitorSlideOver as MonitorModal } from "../../src/components/monitors/NewMonitorSlideOver";
import { Monitor } from "../../src/types";
import api from "../../src/lib/api";
import { getErrorMessage } from "../../src/lib/utils";
import toast from "react-hot-toast";

export default function MonitorsPage() {
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
    if (!window.confirm("Are you sure you want to delete this monitor?")) return;
    try {
      await api.delete(`/monitors/${id}`);
      setMonitors(monitors.filter((m) => m.id !== id));
      toast.success("Monitor deleted");
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
    m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: monitors.length,
    healthy: monitors.filter(m => m.status === "healthy").length,
    failing: monitors.filter(m => m.status === "failing").length,
  };

  if (authLoading) return <div className="min-h-screen bg-bg-base flex"><Sidebar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 md:h-20 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-opacity-80 mt-16 md:mt-0">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">Monitors</h1>
            <p className="text-[10px] text-brand-muted uppercase font-bold tracking-widest mt-0.5 hidden sm:block">
              Manage your heartbeats and cron jobs
            </p>
          </div>
          <button
            onClick={() => {
              setEditingMonitor(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 md:px-4 h-9 md:h-10 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Monitor</span>
          </button>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="p-4 md:p-6 bg-[#111111] border border-[#1F1F1F] rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-muted">
                  <Activity className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-0.5">Total</div>
                  <div className="text-xl md:text-2xl font-bold text-white">{stats.total}</div>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-[#111111] border border-[#1F1F1F] rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-success/10 flex items-center justify-center text-brand-success">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-0.5">Healthy</div>
                  <div className="text-xl md:text-2xl font-bold text-white">{stats.healthy}</div>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-[#111111] border border-[#1F1F1F] rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-error/10 flex items-center justify-center text-brand-error">
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-0.5">Failing</div>
                  <div className="text-xl md:text-2xl font-bold text-white">{stats.failing}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input 
                  type="text" 
                  placeholder="Search by name or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-[#111111] border border-[#1F1F1F] rounded-2xl text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-white/40 shadow-sm"
                />
              </div>
              <button className="px-4 py-2.5 md:py-3 bg-[#111111] border border-[#1F1F1F] hover:bg-[#1A1A1A] text-brand-muted hover:text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#111111] border border-[#1F1F1F] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredMonitors.length > 0 ? (
              <MonitorTable 
                monitors={filteredMonitors} 
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-[#111111] border border-dashed border-[#1F1F1F] rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-brand-muted mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No monitors found</h3>
                <p className="text-sm text-brand-muted max-w-xs text-center mb-6">
                  Ready to start monitoring? Create your first heartbeat to track pings.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 h-10 bg-brand-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-brand-primary/20 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Create First Monitor
                </button>
              </div>
            )}
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
