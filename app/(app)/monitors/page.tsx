"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Radar,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { Skeleton } from "@/components/shared/Skeleton";
import { MonitorsSkeleton } from "@/components/shared/PageSkeleton";
import { MonitorTable } from "@/components/monitors/MonitorTable";
import { EditMonitorModal } from "@/components/monitors/EditMonitorModal";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { StatCard } from "@/components/shared/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppHeader } from "@/components/layout/AppHeader";
import { Monitor } from "@/types";
import api from "@/lib/api";

import { motion } from "motion/react";
import { cn, getErrorMessage } from "@/lib/utils";

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
      setMonitors((prev) => prev.filter((m) => m.id !== monitorToDelete));
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
      setMonitors((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                is_active: active,
                status: active
                  ? m.last_ping_at
                    ? "healthy"
                    : "waiting"
                  : ("paused" as any),
              }
            : m,
        ),
      );
      toast.success(active ? "Monitor resumed" : "Monitor paused");
    } catch (err) {
      toast.error("Failed to update monitor status");
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: monitors.length,
      healthy: monitors.filter((m) => m.status === "healthy").length,
      failing: monitors.filter((m) => m.status === "failing").length,
      paused: monitors.filter((m) => !m.is_active).length,
    };
  }, [monitors]);

  // Filtering and Sorting
  const processedMonitors = useMemo(() => {
    let result = monitors.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  if (authLoading || (isLoading && monitors.length === 0))
    return <MonitorsSkeleton />;

  return (
    <>
      <AppHeader
        title="Monitor Management"
        description="Keep an eye on job health, uptime, and recent checks."
        actions={
          <>
            <SearchInput
              placeholder="Find monitor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 md:w-64"
            />
            <Link
              href="/monitors/new?type=cron"
              className="flex items-center gap-2 px-4 md:px-6 h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Monitor</span>
            </Link>
          </>
        }
      />

      <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-300 mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatCard
                label="Total Monitors"
                value={stats.total}
                icon={Activity}
                color="text-brand-primary"
              />
              <StatCard
                label="Healthy"
                value={stats.healthy}
                icon={CheckCircle2}
                color="text-brand-success"
              />
              <StatCard
                label="Failing"
                value={stats.failing}
                icon={AlertCircle}
                color="text-brand-error"
                pulse={stats.failing > 0}
              />
            </div>

            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border-card pb-4">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  Monitors
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-subtle border border-border-card overflow-x-auto custom-scrollbar">
                    <FilterButton
                      active={filter === "all"}
                      onClick={() => setFilter("all")}
                      label="All"
                      count={stats.total}
                    />
                    <FilterButton
                      active={filter === "healthy"}
                      onClick={() => setFilter("healthy")}
                      label="Healthy"
                      count={stats.healthy}
                      color="text-brand-success"
                    />
                    <FilterButton
                      active={filter === "failing"}
                      onClick={() => setFilter("failing")}
                      label="Failing"
                      count={stats.failing}
                      color="text-brand-error"
                    />
                    <FilterButton
                      active={filter === "paused"}
                      onClick={() => setFilter("paused")}
                      label="Paused"
                      count={stats.paused}
                      color="text-brand-muted"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest hidden sm:inline">
                      Sort:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-bg-subtle border border-border-card rounded-xl px-3 py-2 text-[11px] font-bold text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all appearance-none pr-8 cursor-pointer"
                    >
                      <option value="last_ping" className="bg-bg-surface">
                        Last Ping
                      </option>
                      <option value="name" className="bg-bg-surface">
                        Name
                      </option>
                      <option value="uptime" className="bg-bg-surface">
                        Uptime
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoading && monitors.length === 0 ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : processedMonitors.length > 0 ? (
                <MonitorTable
                  monitors={processedMonitors}
                  onDelete={handleDeleteClick}
                  onEdit={handleEdit}
                />
              ) : (
                <EmptyState
                  icon={Radar}
                  title="No monitors found"
                  description="Try adjusting your filters or search query."
                />
              )}
            </div>
          </div>
        </motion.div>

        <EditMonitorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMonitor(null);
          }}
          monitor={editingMonitor}
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
          title="Delete Monitor"
          message="Are you sure you want to delete this monitor? All history will be permanently removed."
          confirmText="Delete"
        />
    </>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  color = "text-text-primary",
}: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all whitespace-nowrap",
        active
          ? "bg-brand-primary/10 text-brand-primary shadow-[0_0_0_1px_rgba(168,85,247,0.25)]"
          : "text-brand-muted hover:text-text-primary hover:bg-bg-subtle",
      )}
    >
      <span className={cn(active ? "text-brand-primary" : color)}>{label}</span>
      <span
        className={cn(
          "text-[9px] opacity-60",
          active ? "text-brand-primary" : "text-brand-muted",
        )}
      >
        ({count})
      </span>
    </button>
  );
}
