"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2, Edit3, Terminal, Calendar, Clock, BarChart3 } from "lucide-react";
import { useAuth } from "../../../src/hooks/useAuth";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { LoadingSpinner } from "../../../src/components/shared/LoadingSpinner";
import { PingHistoryTable } from "../../../src/components/monitors/PingHistoryTable";
import { StatusBadge } from "../../../src/components/shared/StatusBadge";
import { CopyButton } from "../../../src/components/shared/CopyButton";
import { Monitor, Ping } from "../../../src/types";
import { formatInterval, timeAgo } from "../../../src/lib/utils";
import api from "../../../src/lib/api";
import { format } from "date-fns";

export default function MonitorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [pings, setPings] = useState<Ping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monitorRes, pingsRes] = await Promise.all([
          api.get(`/monitors/${id}`),
          api.get(`/monitors/${id}/pings?limit=50`),
        ]);
        setMonitor(monitorRes.data);
        setPings(pingsRes.data.pings);
      } catch (err) {
        console.error("Failed to fetch monitor details", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && id) {
      fetchData();
    }
  }, [id, authLoading]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this monitor?")) return;
    try {
      await api.delete(`/monitors/${id}`);
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to delete monitor");
    }
  };

  if (authLoading || isLoading) return <div className="min-h-screen bg-bg-base flex"><Sidebar /><LoadingSpinner /></div>;
  if (!monitor) return <div className="min-h-screen bg-bg-base flex"><Sidebar /><div className="p-8 text-white">Monitor not found</div></div>;

  const pingUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/ping/${monitor.token}`;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border-card bg-bg-surface px-8 flex items-center shrink-0">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-white mr-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold text-white">Monitor Details</h1>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight">{monitor.name}</h2>
                  <StatusBadge status={monitor.status} />
                </div>
                <p className="text-brand-muted text-sm font-mono uppercase tracking-tighter">
                  slug: {monitor.slug} • created {format(new Date(monitor.created_at), "MMM d, yyyy")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {}} // TODO: Edit modal
                  className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-card hover:border-text-muted text-text-muted hover:text-white rounded-md text-sm font-medium transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-error/10 border border-brand-error/20 hover:bg-brand-error text-brand-error hover:text-white rounded-md text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-bg-surface border border-border-card rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 text-brand-muted mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Expected Every</span>
                    </div>
                    <div className="text-xl font-bold text-white">{formatInterval(monitor.interval_seconds)}</div>
                  </div>
                  <div className="p-6 bg-bg-surface border border-border-card rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 text-brand-muted mb-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Last Ping</span>
                    </div>
                    <div className="text-xl font-bold text-white uppercase">{timeAgo(monitor.last_ping_at)}</div>
                  </div>
                  <div className="p-6 bg-bg-surface border border-border-card rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 text-brand-muted mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Grace Period</span>
                    </div>
                    <div className="text-xl font-bold text-white">{monitor.grace_seconds / 60}m extra</div>
                  </div>
                </div>

                {/* Ping URL Section */}
                <div className="bg-bg-surface border border-brand-primary/20 rounded-xl p-6 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 text-brand-primary font-semibold mb-4">
                    <Terminal className="w-5 h-5" />
                    <h2>Integration Guide</h2>
                  </div>
                  <p className="text-sm text-text-muted mb-4">Add this curl command to your cron job to start monitoring.</p>
                  <div className="relative group">
                    <pre className="bg-bg-base p-4 rounded-lg border border-border-card text-brand-muted text-sm overflow-x-auto font-mono">
                      curl -fsS {pingUrl}
                    </pre>
                    <CopyButton text={`curl -fsS ${pingUrl}`} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* History */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Ping History</h2>
                  <PingHistoryTable pings={pings} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-bg-surface border border-border-card rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Alert Setup</h3>
                  <p className="text-sm text-text-muted mb-4">
                    Make sure you have configured your alert channels in settings to receive notifications.
                  </p>
                  <button
                    onClick={() => router.push("/settings")}
                    className="w-full py-2 bg-border-card hover:bg-[#3A3A3A] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Go to Settings
                  </button>
                </div>

                <div className="p-6 bg-bg-surface border border-border-card rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Internal Details</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-brand-muted uppercase font-bold tracking-widest">Monitor ID</span>
                      <div className="text-sm text-text-muted font-mono mt-1 break-all">{monitor.id}</div>
                    </div>
                    <div>
                      <span className="text-xs text-brand-muted uppercase font-bold tracking-widest">Ping Token</span>
                      <div className="text-sm text-text-muted font-mono mt-1 select-all">{monitor.token}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
