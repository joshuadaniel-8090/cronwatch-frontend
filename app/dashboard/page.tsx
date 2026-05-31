"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle,
  Radar,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "../../src/hooks/useAuth";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Skeleton } from "../../src/components/shared/Skeleton";
import { DashboardSkeleton } from "../../src/components/shared/PageSkeleton";
import { NewMonitorSlideOver as MonitorModal } from "../../src/components/monitors/NewMonitorSlideOver";
import { Monitor } from "../../src/types";
import api from "../../src/lib/api";
import { motion } from "motion/react";
import { cn, getErrorMessage, PLAN_LIMITS, timeAgo } from "../../src/lib/utils";

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);

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

  const healthyCount = safeMonitors.filter(m => m && m.status === "healthy").length;
  const failingCount = safeMonitors.filter(m => m && m.status === "failing").length;

  const recentMonitors = [...safeMonitors]
    .filter(m => m.last_ping_at)
    .sort((a, b) => new Date(b.last_ping_at!).getTime() - new Date(a.last_ping_at!).getTime())
    .slice(0, 5);

  const hasMonitors = safeMonitors.length > 0;

  if (authLoading || (isLoading && safeMonitors.length === 0)) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 md:h-24 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80 mt-16 md:mt-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-brand-muted mt-1">Overview of your cron jobs, background tasks, and recent activity</p>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-300 mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-12">
              <StatCard 
                label={user?.plan === "free" ? "Monitor Usage (Free)" : "Total Monitors"} 
                value={user?.plan === "free" ? `${safeMonitors.length} / ${PLAN_LIMITS.free}` : safeMonitors.length} 
                icon={Activity} 
                color="text-brand-primary" 
              />
              <StatCard label="Healthy" value={healthyCount} icon={CheckCircle2} color="text-brand-success" />
              <StatCard label="Failing" value={failingCount} icon={AlertCircle} color="text-brand-error" pulse={failingCount > 0} />
            </div>

            {hasMonitors ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border-card pb-4">
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    Recent Activity
                  </h2>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/monitors"
                      className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </Link>
                    <div className="h-4 w-px bg-border-card" />
                    <button
                      onClick={() => {
                        setEditingMonitor(null);
                        setIsModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 uppercase tracking-widest transition-colors"
                    >
                      + New Monitor
                    </button>
                  </div>
                </div>

                {recentMonitors.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {recentMonitors.map((monitor) => (
                      <Link
                        key={monitor.id}
                        href={`/dashboard/${monitor.id}`}
                        className="bg-bg-surface border border-border-card rounded-xl p-4 hover:border-gray-500/30 transition-all flex items-center gap-4 group"
                      >
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0",
                          monitor.status === "healthy" ? "bg-brand-success" :
                          monitor.status === "failing" ? "bg-brand-error" :
                          "bg-brand-muted"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors truncate">
                              {monitor.name}
                            </span>
                            <span className="text-[9px] text-brand-muted font-mono truncate hidden sm:inline">
                              {monitor.slug}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <div className="flex items-center gap-1 text-[10px] text-brand-muted">
                              <Clock className="w-3 h-3" />
                              {monitor.last_ping_at ? timeAgo(monitor.last_ping_at) : "No pings yet"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                            monitor.status === "healthy" ? "text-brand-success bg-brand-success/10" :
                            monitor.status === "failing" ? "text-brand-error bg-brand-error/10" :
                            "text-brand-muted bg-bg-subtle"
                          )}>
                            {monitor.status}
                          </span>
                          <ArrowRight className="w-4 h-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 bg-bg-surface/50 border border-dashed border-border-card rounded-2xl">
                    <Zap className="w-8 h-8 text-brand-muted opacity-30 mb-3" />
                    <p className="text-brand-muted text-sm text-center">
                      Your monitors haven&apos;t received any pings yet.<br />
                      <Link href="/monitors" className="text-brand-primary hover:underline font-medium">
                        View all monitors
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="border-b border-border-card pb-4">
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    Get Started
                  </h2>
                </div>

                <div className="bg-bg-surface border border-border-card rounded-2xl p-8 md:p-10">
                  <div className="flex flex-col lg:flex-row gap-10 items-start">
                    <div className="flex-1 space-y-8">
                      <div className="flex gap-5">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold shrink-0">1</div>
                        <div>
                          <h3 className="text-sm font-bold text-text-primary mb-1">Create a monitor</h3>
                          <p className="text-xs text-brand-muted leading-relaxed">Define what you want to monitor — name it, set a schedule, and we&apos;ll generate a unique ping URL.</p>
                        </div>
                      </div>
                      <div className="flex gap-5">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold shrink-0">2</div>
                        <div>
                          <h3 className="text-sm font-bold text-text-primary mb-1">Add the ping to your script</h3>
                          <p className="text-xs text-brand-muted leading-relaxed">Append a simple HTTP request at the end of your cron job or background task.</p>
                        </div>
                      </div>
                      <div className="flex gap-5">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold shrink-0">3</div>
                        <div>
                          <h3 className="text-sm font-bold text-text-primary mb-1">Get notified on failure</h3>
                          <p className="text-xs text-brand-muted leading-relaxed">If your script doesn&apos;t check in on time, we&apos;ll alert you via Telegram, email, or wherever you configure.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 text-sm"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create Your First Monitor
                      </button>
                    </div>

                    <div className="lg:w-72 w-full bg-bg-base border border-border-card rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Radar className="w-4 h-4 text-brand-primary" />
                        <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">Quick Tip</span>
                      </div>
                      <div className="space-y-3 text-xs text-brand-muted leading-relaxed">
                        <p>You can also configure notification channels in <Link href="/settings" className="text-brand-primary hover:underline">Settings</Link> before creating your first monitor.</p>
                        <p>Need help? Check the <Link href="/" className="text-brand-primary hover:underline">docs</Link> for examples in Python, Node.js, and more.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <MonitorModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingMonitor(null);
          }}
          editingMonitor={editingMonitor}
          currentCount={safeMonitors.length}
          onSuccess={fetchMonitors}
        />
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, pulse = false }: any) {
  return (
    <div className="bg-bg-surface p-5 rounded-2xl border border-border-card relative overflow-hidden group hover:border-border-card transition-all">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <h3 className={cn("text-3xl font-bold tracking-tight", color, pulse && "animate-pulse")}>
              {value}
            </h3>
          </div>
        </div>
        <div className={cn("p-2.5 rounded-xl bg-bg-subtle", color)}>
          <Icon className="w-5 h-5 opacity-80" />
        </div>
      </div>
      <div className={cn("absolute -bottom-10 -right-10 w-24 h-24 blur-[60px] opacity-10 rounded-full", color.replace('text', 'bg'))} />
    </div>
  );
}
