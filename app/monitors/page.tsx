"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Plus, 
  Search,
  PlusCircle,
  Radar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  PauseCircle,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../src/hooks/useAuth";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Skeleton } from "../../src/components/shared/Skeleton";
import { DashboardSkeleton } from "../../src/components/shared/PageSkeleton";
import { OperationalMonitorTable } from "../../src/components/monitors/OperationalMonitorTable";
import { NewMonitorSlideOver as MonitorModal } from "../../src/components/monitors/NewMonitorSlideOver";
import { ConfirmationModal } from "../../src/components/shared/ConfirmationModal";
import { Monitor } from "../../src/types";
import api from "../../src/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { cn, getErrorMessage } from "../../src/lib/utils";

type FilterStatus = "all" | "healthy" | "failing" | "paused";
type SortOption = "last_ping" | "uptime" | "name";

export default function MonitorsPage() {
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();
  
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("last_ping");
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMonitors = React.useCallback(async () => {
    try {
      const response = await api.get("monitors");
      setMonitors(Array.isArray(response.data) ? response.data : []);
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
    try {
      await api.delete(`monitors/${monitorToDelete}`);
      setMonitors(prev => prev.filter((m) => m.id !== monitorToDelete));
      toast.success("Monitor decommissioned");
    } catch (err: any) {
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

  const handleToggleStatus = async (id: string, active: boolean) => {
    try {
      await api.put(`monitors/${id}`, { is_active: active });
      setMonitors(prev => prev.map(m => m.id === id ? { ...m, is_active: active, status: active ? (m.last_ping_at ? 'healthy' : 'waiting') : 'paused' as any } : m));
      toast.success(active ? "Monitor resumed" : "Monitor paused");
    } catch (err) {
      toast.error("Failed to update monitor status");
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: monitors.length,
      healthy: monitors.filter(m => m.status === "healthy").length,
      failing: monitors.filter(m => m.status === "failing").length,
      paused: monitors.filter(m => !m.is_active).length
    };
  }, [monitors]);

  // Filtering and Sorting
  const processedMonitors = useMemo(() => {
    let result = monitors.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (filter === "healthy") matchesFilter = m.status === "healthy";
      if (filter === "failing") matchesFilter = m.status === "failing";
      if (filter === "paused") matchesFilter = !m.is_active;
      
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "last_ping") {
        const dateA = a.last_ping_at ? new Date(a.last_ping_at).getTime() : 0;
        const dateB = b.last_ping_at ? new Date(b.last_ping_at).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [monitors, searchQuery, filter, sortBy]);

  if (authLoading || (isLoading && monitors.length === 0)) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white tracking-tight">Monitor Management</h1>
            <div className="h-4 w-px bg-[#1F1F1F] mx-2" />
            <button
              onClick={() => { setEditingMonitor(null); setIsModalOpen(true); }}
              className="flex items-center gap-1.5 text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">New Monitor</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Find monitor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/20 border border-[#1F1F1F] rounded-lg pl-9 pr-4 py-1.5 text-[11px] focus:outline-none focus:border-brand-primary/50 transition-all w-48 placeholder:text-white/10"
              />
            </div>
          </div>
        </header>

        {/* Summary Row (Lightweight) */}
        <div className="px-8 py-2 border-b border-[#1F1F1F] bg-[#111111]/20 shrink-0">
          <p className="text-[9px] text-brand-muted font-bold uppercase tracking-[0.2em]">
            {stats.total} monitors • <span className="text-brand-success">{stats.healthy} healthy</span> • <span className="text-brand-error">{stats.failing} failing</span> {stats.paused > 0 && `• ${stats.paused} paused`}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="px-8 py-3 flex items-center justify-between bg-[#111111]/40 border-b border-[#1F1F1F] shrink-0">
          <div className="flex items-center gap-1">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All" count={stats.total} />
            <FilterButton active={filter === "healthy"} onClick={() => setFilter("healthy")} label="Healthy" count={stats.healthy} color="text-brand-success" />
            <FilterButton active={filter === "failing"} onClick={() => setFilter("failing")} label="Failing" count={stats.failing} color="text-brand-error" />
            <FilterButton active={filter === "paused"} onClick={() => setFilter("paused")} label="Paused" count={stats.paused} color="text-brand-muted" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border-none p-0 text-[10px] font-bold text-white focus:outline-none cursor-pointer hover:text-brand-primary transition-colors appearance-none pr-4 relative"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23A855F7\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '10px' }}
              >
                <option value="last_ping" className="bg-[#111111]">Last Ping</option>
                <option value="name" className="bg-[#111111]">Name</option>
                <option value="uptime" className="bg-[#111111]">Uptime</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            {isLoading && monitors.length === 0 ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : processedMonitors.length > 0 ? (
              <OperationalMonitorTable 
                monitors={processedMonitors} 
                onDelete={handleDeleteClick}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-[#111111] border border-[#1F1F1F] rounded-3xl">
                <Radar className="w-10 h-10 text-brand-muted opacity-20 mb-4" />
                <h3 className="text-white font-bold mb-1">No monitors found</h3>
                <p className="text-brand-muted text-xs">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>

        <MonitorModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingMonitor(null); }}
          editingMonitor={editingMonitor}
          currentCount={monitors.length}
          onSuccess={fetchMonitors}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setMonitorToDelete(null); }}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Monitor"
          message="Are you sure you want to delete this monitor? All history will be permanently removed."
          confirmText="Delete"
        />
      </main>
    </div>
  );
}

function FilterButton({ active, onClick, label, count, color = "text-white" }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all",
        active 
          ? "bg-brand-primary/10 text-brand-primary" 
          : "text-brand-muted hover:text-white"
      )}
    >
      <span className={cn(active ? "text-brand-primary" : color)}>{label}</span>
      <span className={cn(
        "text-[9px] opacity-60",
        active ? "text-brand-primary" : "text-brand-muted"
      )}>({count})</span>
    </button>
  );
}
