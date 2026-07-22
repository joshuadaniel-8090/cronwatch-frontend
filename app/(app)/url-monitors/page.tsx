"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Globe,
  Trash2,
  Edit2,
  MoreVertical,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  Zap,
  BarChart3,
  Search,
  Radar,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getUrlMonitors,
  deleteUrlMonitor,
  updateUrlMonitor,
} from "@/lib/api";
import { UrlMonitor } from "@/types";
import {
  formatInterval,
  timeAgo,
  cn,
  getErrorMessage,
} from "@/lib/utils";
import { UrlMonitorsSkeleton } from "@/components/shared/PageSkeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { StatCard } from "@/components/shared/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppHeader } from "@/components/layout/AppHeader";
import { motion, AnimatePresence } from "motion/react";

const MOTION_DELETE = { duration: 0.3, ease: "easeOut" as const };

export default function UrlMonitorsPage() {
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();
  const [monitors, setMonitors] = useState<UrlMonitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpsell, setShowUpsell] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getUrlMonitors();
      setMonitors(res.data);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  const stats = useMemo(() => {
    return {
      total: monitors.length,
      up: monitors.filter((m) => m.status === "up").length,
      down: monitors.filter((m) => m.status === "down").length,
      degraded: monitors.filter((m) => (m.last_response_time_ms || 0) > 1500)
        .length,
    };
  }, [monitors]);

  const filteredMonitors = monitors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.url.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const requestDelete = (id: string) => setDeleteTarget(id);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUrlMonitor(deleteTarget);
      toast.success("Monitor deleted");
      setMonitors((prev) => prev.filter((m) => m.id !== deleteTarget));
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (monitor: UrlMonitor) => {
    try {
      const active = !monitor.is_active;
      await updateUrlMonitor(monitor.id, { is_active: active });
      setMonitors((prev) =>
        prev.map((m) =>
          m.id === monitor.id ? { ...m, is_active: active } : m,
        ),
      );
      toast.success(active ? "Monitor resumed" : "Monitor paused");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  if (authLoading || (isLoading && monitors.length === 0))
    return <UrlMonitorsSkeleton />;

  const isPro = user?.plan === "pro";

  return (
    <>
      <AppHeader
        title="Uptime"
        description="Real-time status of your websites and endpoints."
        actions={
          <>
            <SearchInput
              placeholder="Search monitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Link
              href="/monitors/new?type=url"
              className="flex items-center gap-2 px-6 h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Uptime Monitor</span>
            </Link>
          </>
        }
      />

      <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={MOTION_DELETE}
          className="p-8 flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-300 mx-auto w-full space-y-8 pb-20">
            {/* Stats Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                label="Total Monitors"
                value={stats.total}
                icon={Globe}
                color="text-brand-primary"
              />
              <StatCard
                label="All Up"
                value={stats.up}
                icon={CheckCircle2}
                color="text-brand-success"
              />
              <StatCard
                label="Degraded"
                value={stats.degraded}
                icon={AlertTriangle}
                color="text-brand-warning"
              />
              <StatCard
                label="Down"
                value={stats.down}
                icon={Zap}
                color="text-brand-error"
                pulse={stats.down > 0}
              />
            </div>

            {/* Monitors List */}
            <div className="space-y-4">
              {filteredMonitors.length > 0 ? (
                filteredMonitors.map((monitor) => (
                  <MonitorRow
                    key={monitor.id}
                    monitor={monitor}
                    onDelete={requestDelete}
                    onToggle={handleToggle}
                  />
                ))
              ) : searchQuery ? (
                <EmptyState
                  icon={Search}
                  title="No matches found"
                  description={`Try adjusting your search for "${searchQuery}".`}
                />
              ) : (
                <EmptyState
                  icon={Globe}
                  title="No uptime monitors yet"
                  description="Start monitoring your websites and APIs in seconds. We'll notify you instantly if anything fails."
                  action={
                    <Link
                      href="/monitors/new?type=url"
                      className="px-6 h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Uptime Monitor
                    </Link>
                  }
                />
              )}
            </div>
          </div>
        </motion.div>

        <ConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Monitor"
          message="Are you sure you want to delete this monitor? All history will be permanently removed."
          confirmText="Delete"
        />
    </>
  );
}

function MonitorRow({
  monitor,
  onDelete,
  onToggle,
}: {
  monitor: UrlMonitor;
  onDelete: (id: string) => void;
  onToggle: (m: UrlMonitor) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDown = monitor.status === "down";
  const isDegraded = (monitor.last_response_time_ms || 0) > 1500;

  const getStatusColor = () => {
    if (monitor.status === "waiting") return "bg-brand-muted";
    if (isDown) return "bg-brand-error";
    if (isDegraded) return "bg-brand-warning";
    return "bg-brand-success";
  };

  const getLatencyColor = (ms: number | null) => {
    if (!ms) return "text-brand-muted";
    if (ms < 500) return "text-brand-success";
    if (ms < 1500) return "text-brand-warning";
    return "text-brand-error";
  };

  return (
    <div className="bg-bg-surface border border-border-card rounded-2xl p-5 hover:border-brand-primary/30 transition-all group relative overflow-hidden">
      <div className="flex items-center gap-6 relative z-10">
        {/* Status Dot */}
        <div className="relative shrink-0">
          <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
          {isDown && (
            <div className="absolute inset-0 w-3 h-3 bg-brand-error rounded-full animate-ping opacity-75" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/url-monitors/${monitor.id}`}
              className="text-sm font-bold text-text-primary hover:text-brand-primary transition-colors truncate"
            >
              {monitor.name}
            </Link>
            <div className="flex items-center gap-1 text-[10px] text-brand-muted font-bold uppercase tracking-wider bg-bg-subtle px-2 py-0.5 rounded-md">
              {formatInterval(monitor.check_interval_seconds)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-brand-muted truncate max-w-50">
              {monitor.url}
            </span>
            <ExternalLink className="w-2.5 h-2.5 text-brand-muted opacity-40" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-12 shrink-0">
          <div className="flex flex-col gap-1 w-20">
            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
              Latency
            </span>
            <div
              className={cn(
                "text-xs font-mono font-bold",
                getLatencyColor(monitor.last_response_time_ms),
              )}
            >
              {monitor.last_response_time_ms
                ? `${monitor.last_response_time_ms}ms`
                : "—"}
            </div>
          </div>

          <div className="flex flex-col gap-1 w-16">
            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
              Status
            </span>
            <div className="text-xs font-mono font-bold text-text-primary/80">
              {monitor.last_status_code || "—"}
            </div>
          </div>

          <div className="flex flex-col gap-1 w-24">
            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
              Last Check
            </span>
            <div className="text-[11px] text-text-primary/60 font-medium">
              {timeAgo(monitor.last_checked_at)}
            </div>
          </div>

          <div className="flex flex-col gap-1 w-28">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-brand-muted mb-0.5">
              <span>Uptime</span>
              <span className="text-brand-success">
                {monitor.uptime_percentage_7d || 99.9}%
              </span>
            </div>
            <div className="h-1 w-full bg-bg-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-success rounded-full"
                style={{ width: `${monitor.uptime_percentage_7d || 99.9}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative ml-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-xl bg-bg-subtle hover:bg-bg-subtle flex items-center justify-center text-brand-muted transition-all"
            aria-label="More actions"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-bg-elevated border border-border-card rounded-xl shadow-2xl z-50 py-2 overflow-hidden"
                >
                  <Link
                    href={`/url-monitors/${monitor.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-text-primary hover:bg-bg-subtle transition-all"
                  >
                    <BarChart3 className="w-4 h-4 text-brand-primary" /> View
                    Details
                  </Link>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-text-primary hover:bg-bg-subtle transition-all text-left">
                    <Edit2 className="w-4 h-4 text-brand-primary" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      onToggle(monitor);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-text-primary hover:bg-bg-subtle transition-all text-left"
                  >
                    {monitor.is_active ? (
                      <>
                        <Pause className="w-4 h-4 text-brand-primary" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-brand-primary" /> Resume
                      </>
                    )}
                  </button>
                  <div className="h-px bg-border-card my-1" />
                  <button
                    onClick={() => {
                      onDelete(monitor.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-brand-error hover:bg-brand-error/5 transition-all text-left"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative background glow on hover */}
      <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

