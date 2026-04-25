"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Layout } from "lucide-react";
import { useAuth } from "../../src/hooks/useAuth";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { LoadingSpinner } from "../../src/components/shared/LoadingSpinner";
import { MonitorTable } from "../../src/components/monitors/MonitorTable";
import { Monitor } from "../../src/types";
import api from "../../src/lib/api";

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        const response = await api.get("/monitors");
        setMonitors(response.data);
      } catch (err) {
        console.error("Failed to fetch monitors", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchMonitors();
    }
  }, [authLoading]);

  const healthyCount = monitors.filter(m => m.status === "healthy").length;
  const failingCount = monitors.filter(m => m.status === "failing").length;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border-card bg-bg-surface px-8 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold text-white">Monitor Overview</h1>
          <Link
            href="/monitors/new"
            className="bg-brand-primary hover:bg-[#6D31D1] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Monitor</span>
          </Link>
        </header>

        <div className="p-8 flex-1 flex flex-col space-y-6 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bg-surface p-4 rounded-lg border border-border-card">
              <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Total Monitors</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{monitors.length}</span>
                <span className="text-xs text-brand-success font-medium">+0 this week</span>
              </div>
            </div>
            <div className="bg-bg-surface p-4 rounded-lg border border-border-card">
              <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Healthy</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-brand-success">{healthyCount}</span>
                <span className="text-xs text-brand-muted">
                  {monitors.length > 0 ? ((healthyCount / monitors.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="bg-bg-surface p-4 rounded-lg border border-border-card">
              <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Failing</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-brand-error">{failingCount}</span>
                <span className="text-xs text-brand-error">{failingCount > 0 ? "Needs attention" : "Normal"}</span>
              </div>
            </div>
            <div className="bg-bg-surface p-4 rounded-lg border border-border-card">
              <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Total Pings</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">0</span>
                <span className="text-xs text-brand-muted">Last 24h</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : monitors.length > 0 ? (
            <MonitorTable monitors={monitors} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-bg-surface border border-border-card rounded-2xl border-dashed">
              <Layout className="w-12 h-12 text-brand-muted mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">No monitors yet</h2>
              <p className="text-brand-muted text-center max-w-xs mb-8">
                Get started by creating your first monitor to track your cron jobs and background tasks.
              </p>
              <Link
                href="/monitors/new"
                className="px-6 py-2.5 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-md text-sm font-semibold transition-all shadow-lg shadow-brand-primary/20"
              >
                Create My First Monitor
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
