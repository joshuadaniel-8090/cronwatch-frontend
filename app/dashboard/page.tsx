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
  Radar
} from "lucide-react";
import { useAuth } from "../../src/hooks/useAuth";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { LoadingSpinner } from "../../src/components/shared/LoadingSpinner";
import { MonitorTable } from "../../src/components/monitors/MonitorTable";
import { NewMonitorSlideOver } from "../../src/components/monitors/NewMonitorSlideOver";
import { Monitor } from "../../src/types";
import api from "../../src/lib/api";
import { motion } from "motion/react";
import { cn } from "../../src/lib/utils";

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (!authLoading) {
      fetchMonitors();
    }
  }, [authLoading]);

  const handleDeleteMonitor = async (id: string) => {
    if (confirm("Are you sure you want to delete this monitor?")) {
      try {
        await api.delete(`/monitors/${id}`);
        setMonitors(monitors.filter(m => m.id !== id));
      } catch (err) {
        console.error("Failed to delete monitor", err);
      }
    }
  };

  const filteredMonitors = monitors.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const healthyCount = monitors.filter(m => m.status === "healthy").length;
  const failingCount = monitors.filter(m => m.status === "failing").length;

  if (authLoading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex overflow-hidden font-sans text-[#F5F5F5]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-[#1F1F1F] px-8 flex items-center justify-between shrink-0 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold tracking-tight">System Dashboard</h1>
            <p className="text-xs text-brand-muted mt-0.5">Overview of all active heartbeat monitors.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input 
                type="text" 
                placeholder="Search monitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#111111] border border-[#1F1F1F] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 transition-all w-64"
              />
            </div>
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="bg-brand-primary hover:bg-[#6D31D1] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>New Monitor</span>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1200px] mx-auto w-full">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Monitors" 
              value={monitors.length} 
              icon={Activity}
              color="text-brand-primary"
            />
            <StatCard 
              label="Healthy" 
              value={healthyCount} 
              icon={CheckCircle2}
              color="text-brand-success"
            />
            <StatCard 
              label="Failing" 
              value={failingCount} 
              icon={AlertCircle}
              color="text-brand-error"
              pulse={failingCount > 0}
            />
            <StatCard 
              label="Total Pings (24h)" 
              value="1,284" 
              icon={Zap}
              color="text-yellow-500"
            />
          </div>

          {/* Monitors Table Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Active Monitors</h2>
              <span className="text-xs text-brand-muted bg-[#111111] px-2 py-1 rounded border border-[#1F1F1F]">
                {filteredMonitors.length} matching
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filteredMonitors.length > 0 ? (
              <MonitorTable 
                monitors={filteredMonitors} 
                onDelete={handleDeleteMonitor}
              />
            ) : (
              <EmptyState onAction={() => setIsSlideOverOpen(true)} />
            )}
          </div>
        </div>
      </main>

      <NewMonitorSlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={(newMonitor) => {
          setMonitors([newMonitor, ...monitors]);
        }}
      />
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
        className="px-8 py-3 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2"
      >
        <PlusCircle className="w-5 h-5" />
        Create First Monitor
      </button>
    </motion.div>
  );
}
