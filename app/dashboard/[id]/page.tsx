"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2, Edit3, Terminal, Calendar, Clock, BarChart3, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../src/hooks/useAuth";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { MonitorDetailSkeleton } from "../../../src/components/shared/PageSkeleton";
import { PingHistoryTable } from "../../../src/components/monitors/PingHistoryTable";
import { StatusBadge } from "../../../src/components/shared/StatusBadge";
import { CopyButton } from "../../../src/components/shared/CopyButton";
import { NewMonitorSlideOver as MonitorModal } from "../../../src/components/monitors/NewMonitorSlideOver";
import { ConfirmationModal } from "../../../src/components/shared/ConfirmationModal";
import { Monitor, Ping } from "../../../src/types";
import { formatInterval, timeAgo, getErrorMessage } from "../../../src/lib/utils";
import api from "../../../src/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function MonitorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [pings, setPings] = useState<Ping[]>([]);
  const [monitorsCount, setMonitorsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [monitorRes, pingsRes, monitorsRes] = await Promise.all([
        api.get(`monitors/${id}`),
        api.get(`monitors/${id}/pings?limit=50`),
        api.get("monitors"),
      ]);
      setMonitor(monitorRes.data);
      setPings(Array.isArray(pingsRes.data) ? pingsRes.data : []);
      const monitorsData = monitorsRes.data;
      setMonitorsCount(Array.isArray(monitorsData) ? monitorsData.length : 0);
    } catch (err: any) {
      console.error("Failed to fetch monitor details", err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && id) {
      fetchData();
    }
  }, [id, authLoading, fetchData]);

  const handleDelete = async () => {
    setIsDeleting(true);
    console.log(`[UI] Attempting to delete monitor ${id}`);
    try {
      console.log(`[UI] Triggering DELETE request for /api/monitors/${id}`);
      const res = await api.delete(`monitors/${id}`);
      console.log(`[UI] Delete response:`, res.data);
      toast.success("Monitor deleted successfully");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[UI] Delete failed:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const [pingUrl, setPingUrl] = useState("");

  useEffect(() => {
    if (monitor && typeof window !== "undefined") {
      // Use logical relative path /api for the client ping URL so it works through the proxy
      const baseUrl = "/api";
      setPingUrl(`${window.location.origin}${baseUrl}/ping/${monitor.token}`);
    }
  }, [monitor]);

  if (authLoading || isLoading) return <MonitorDetailSkeleton />;
  if (!monitor) return <div className="min-h-screen bg-bg-base flex"><Sidebar /><div className="p-8 text-text-primary">Monitor not found</div></div>;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden font-sans text-text-primary">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 md:h-20 border-b border-border-card px-4 md:px-8 flex items-center shrink-0 bg-bg-base/80 backdrop-blur-md sticky top-0 z-40 mt-16 md:mt-0">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs md:text-sm text-brand-muted hover:text-text-primary mr-4 md:mr-6 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden xs:inline">Back to Dashboard</span>
            <span className="xs:hidden">Back</span>
          </button>
          <div className="h-8 w-px bg-border-card mr-4 md:mr-6" />
          <h1 className="text-base md:text-xl font-bold tracking-tight">Monitor Settings</h1>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
              <div>
                <div className="flex items-center gap-3 md:gap-4 mb-2 flex-wrap">
                  <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{monitor.name}</h2>
                  <div className="relative">
                    <StatusBadge status={monitor.status} />
                    {monitor.last_ping_status === "recovery" && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-success/10 border border-brand-success/20 text-brand-success text-[10px] font-bold animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Recovered
                      </span>
                    )}
                    {monitor.status === "failing" && (
                      <div className="absolute inset-0 bg-brand-error rounded-full animate-ping opacity-20" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm text-brand-muted font-mono flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-50 uppercase tracking-widest text-[9px] font-bold">ID:</span>
                    <span className="bg-bg-subtle px-2 py-0.5 rounded italic">{monitor.id}</span>
                  </div>
                  <span className="opacity-30 hidden xs:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-50 uppercase tracking-widest text-[9px] font-bold">created:</span>
                    <span>{format(new Date(monitor.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-4 md:px-5 bg-bg-surface border border-border-card hover:border-brand-primary/50 text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg shadow-black/20"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-4 md:px-5 bg-brand-error/10 border border-brand-error/20 hover:bg-brand-error text-brand-error hover:text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-error/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="p-5 md:p-6 bg-bg-surface border border-border-card rounded-2xl group hover:border-border-card transition-all">
                <div className="flex items-center gap-3 text-brand-muted mb-2 md:mb-3">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-50" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-muted">Expected Every</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">{formatInterval(monitor.interval_seconds)}</div>
              </div>
              <div className="p-5 md:p-6 bg-bg-surface border border-border-card rounded-2xl group hover:border-border-card transition-all">
                <div className="flex items-center gap-3 text-brand-muted mb-2 md:mb-3">
                  <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-50" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-muted">Last Active</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">{timeAgo(monitor.last_ping_at)}</div>
              </div>
              <div className="p-5 md:p-6 bg-bg-surface border border-border-card rounded-2xl group hover:border-border-card transition-all sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 text-brand-muted mb-2 md:mb-3">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-50" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-muted">Grace Period</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">{monitor.grace_seconds / 60}m extra</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 space-y-8">
                {/* Ping URL Section */}
                <div className="bg-bg-surface border border-brand-primary/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -mr-16 -mt-16" />
                  <div className="flex items-center gap-3 text-brand-primary font-bold mb-4">
                    <Terminal className="w-5 h-5" />
                    <h2 className="tracking-tight">Integration URL</h2>
                  </div>
                  <p className="text-sm text-brand-muted mb-6">Send an HTTP GET or POST request to this URL to reset the timer. Add it to the end of your script.</p>
                  <div className="relative group/copy">
                    <div className="bg-bg-base p-4 rounded-xl border border-border-card text-brand-muted text-sm overflow-x-auto font-mono scrollbar-hide">
                      curl -fsS {pingUrl}
                    </div>
                    <CopyButton text={`curl -fsS ${pingUrl}`} className="absolute top-3 right-3 opacity-0 group-hover/copy:opacity-100 transition-all bg-brand-primary text-white p-1.5 rounded-lg shadow-lg" />
                  </div>
                </div>

                {/* History */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">Recent Activity</h2>
                    <span className="text-[10px] uppercase font-bold text-brand-muted bg-bg-subtle px-2 py-1 rounded">Last 50 Pings</span>
                  </div>
                  <PingHistoryTable pings={pings} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-bg-surface border border-border-card rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-brand-primary opacity-20" />
                  <h3 className="text-lg font-bold text-text-primary mb-3">Notifications</h3>
                  <p className="text-sm text-brand-muted mb-6 leading-relaxed">
                    Recipients configured in your alert channels will be notified if this monitor enters a failing state.
                  </p>
                  <button
                    onClick={() => router.push("/settings")}
                    className="w-full py-2.5 bg-bg-subtle hover:bg-bg-subtle text-text-primary rounded-xl text-sm font-bold transition-all border border-border-card"
                  >
                    Manage Channels
                  </button>
                </div>

                <div className="p-6 bg-bg-surface border border-border-card rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold text-text-primary mb-4">Connection Details</h3>
                  <div className="space-y-5">
                    <div className="group/item">
                      <span className="text-[10px] text-brand-muted uppercase font-bold tracking-widest block mb-1">Public Token</span>
                      <div className="text-xs text-brand-muted font-mono bg-bg-base p-2 rounded border border-border-card break-all group-hover:text-text-primary transition-colors">{monitor.token}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MonitorModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          editingMonitor={monitor}
          currentCount={monitorsCount}
          onSuccess={fetchData}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Monitor"
          message={`Are you sure you want to delete "${monitor.name}"? This action is permanent and will delete all associated heartbeat history.`}
          confirmText="Delete Permanently"
        />
      </main>
    </div>
  );
}
