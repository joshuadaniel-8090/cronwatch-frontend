"use client";

import React from "react";
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Timer,
  Clock,
  History
} from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

interface OverviewProps {
  heartbeatStats: { total: number; healthy: number; failing: number };
  uptimeStats: { total: number; up: number; down: number };
}

export function DashboardOverview({ heartbeatStats, uptimeStats }: OverviewProps) {
  const totalFailing = heartbeatStats.failing + uptimeStats.down;
  const overallHealth = heartbeatStats.total + uptimeStats.total > 0 
    ? Math.round(((heartbeatStats.healthy + uptimeStats.up) / (heartbeatStats.total + uptimeStats.total)) * 100) 
    : 100;

  return (
    <div className="space-y-12">
      {/* Global Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthCard 
          label="Overall System Health" 
          value={`${overallHealth}%`} 
          description="Average across all monitors"
          icon={ShieldCheck} 
          color="text-brand-success" 
        />
        <HealthCard 
          label="Active Incidents" 
          value={totalFailing} 
          description={totalFailing > 0 ? "Monitors currently failing" : "System operational"}
          icon={AlertCircle} 
          color={totalFailing > 0 ? "text-brand-error" : "text-brand-muted"}
          pulse={totalFailing > 0}
        />
        <HealthCard 
          label="Total Managed Assets" 
          value={heartbeatStats.total + uptimeStats.total} 
          description="Heartbeats & URL checks"
          icon={Activity} 
          color="text-brand-primary" 
        />
      </div>

      {/* Feature Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Heartbeat Card */}
        <FeatureCard 
          title="Heartbeat Monitoring"
          description="Passive monitoring for cron jobs, background workers, and scripts. We wait for them to ping us."
          stats={[
            { label: "Healthy", value: heartbeatStats.healthy, color: "text-brand-success" },
            { label: "Failing", value: heartbeatStats.failing, color: "text-brand-error" }
          ]}
          href="/monitors"
          icon={Activity}
          buttonText="Manage Heartbeats"
        />

        {/* Uptime Card */}
        <FeatureCard 
          title="Uptime Monitoring"
          description="Active monitoring for websites and APIs. We check them every minute to ensure they are online."
          stats={[
            { label: "Online", value: uptimeStats.up, color: "text-brand-success" },
            { label: "Offline", value: uptimeStats.down, color: "text-brand-error" }
          ]}
          href="/url-monitors"
          icon={Globe}
          buttonText="Manage Uptime"
        />
      </div>

      {/* Recent Activity Mockup */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-[2rem] p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <History className="w-5 h-5 text-orange-400" />
             </div>
             <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>
          <button className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest">
            View Audit Log
          </button>
        </div>
        
        <div className="space-y-4">
          <ActivityItem 
             title="Main API recovered" 
             time="2 minutes ago" 
             type="success"
             description="Uptime monitor back to normal (200 OK)"
          />
          <ActivityItem 
             title="Nightly Backup missed" 
             time="45 minutes ago" 
             type="error"
             description="Heartbeat monitor failed to ping within window"
          />
          <ActivityItem 
             title="New monitor created" 
             time="2 hours ago" 
             type="info"
             description="Marketing Website added to monitoring"
          />
        </div>
      </div>
    </div>
  );
}

function HealthCard({ label, value, description, icon: Icon, color, pulse }: any) {
  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-8 group hover:border-[#2F2F2F] transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-3 rounded-2xl bg-white/5", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {pulse && <div className="w-3 h-3 rounded-full bg-brand-error animate-ping" />}
      </div>
      <h4 className="text-4xl font-bold text-white mb-2 tracking-tight">{value}</h4>
      <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs text-brand-muted opacity-60">{description}</p>
    </div>
  );
}

function FeatureCard({ title, description, stats, href, icon: Icon, buttonText }: any) {
  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-[2.5rem] p-10 flex flex-col h-full group hover:border-brand-primary/30 transition-all relative overflow-hidden">
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-8 border border-brand-primary/20">
          <Icon className="w-7 h-7 text-brand-primary" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
        <p className="text-sm text-brand-muted leading-relaxed mb-10 opacity-80">
          {description}
        </p>
        
        <div className="grid grid-cols-2 gap-6 mb-12">
          {stats.map((stat: any, i: number) => (
            <div key={i} className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Link 
          href={href}
          className="mt-auto w-full h-14 bg-white/5 hover:bg-brand-primary text-white hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 group/btn"
        >
          {buttonText}
          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function ActivityItem({ title, time, type, description }: any) {
  const colors = {
    success: "bg-brand-success",
    error: "bg-brand-error",
    info: "bg-brand-primary"
  };
  
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
      <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", colors[type as keyof typeof colors])} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h5 className="text-sm font-bold text-white">{title}</h5>
          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-xs text-brand-muted opacity-70">{description}</p>
      </div>
    </div>
  );
}
