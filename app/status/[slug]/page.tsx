"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Clock, Globe, ShieldCheck } from "lucide-react";
import { StatusBadge } from "../../../src/components/shared/StatusBadge";
import { PublicStatusSkeleton } from "../../../src/components/shared/PageSkeleton";
import { MonitorStatus } from "../../../src/types";
import { formatInterval, timeAgo, cn } from "../../../src/lib/utils";
import api from "../../../src/lib/api";

interface StatusData {
  name: string;
  status: MonitorStatus;
  last_ping_at: string | null;
  interval_seconds: number;
  uptime_last_30_days: { date: string; status: MonitorStatus }[];
}

export default function PublicStatusPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/status/${slug}`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch public status", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  if (isLoading) return <PublicStatusSkeleton />;
  if (!data) return <div className="min-h-screen bg-bg-base p-8 text-white text-center">Status page not found</div>;

  return (
    <div className="min-h-screen bg-bg-base text-white flex flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <header className="flex items-center justify-between mb-12 py-4 border-b border-border-card">
          <div className="flex items-center gap-2">
            <Activity className="text-brand-primary w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">Cronwatch Status</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-brand-success/10 text-brand-success rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3 h-3" />
            Verified Monitor
          </div>
        </header>

        <main className="bg-bg-surface border border-border-card rounded-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">{data.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-brand-muted">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatInterval(data.interval_seconds)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Public Status Page</span>
                </div>
              </div>
            </div>
            <div className="scale-125 origin-left md:origin-right">
              <StatusBadge status={data.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Current Status</span>
              <div className={cn("text-2xl font-bold uppercase", data.status === "healthy" ? "text-brand-success" : "text-brand-error")}>
                {data.status === "healthy" ? "System Operational" : "System Failing"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Last Check-in</span>
              <div className="text-2xl font-bold text-white">{timeAgo(data.last_ping_at)}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">30-Day Uptime History</h3>
              <span className="text-xs text-brand-muted">Last updated recently</span>
            </div>
            <div className="flex gap-1 sm:gap-2 h-12">
              {data.uptime_last_30_days.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.status}`}
                  className={cn(
                    "flex-1 rounded-sm transition-all hover:scale-y-125 cursor-default shadow-sm",
                    day.status === "healthy" ? "bg-brand-success" : 
                    day.status === "failing" ? "bg-brand-error" : "bg-bg-base"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-brand-muted uppercase font-bold tracking-widest">
              <span>30 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </main>

        <footer className="mt-12 text-center text-brand-muted text-sm">
          <p>Powered by <a href="/" className="text-brand-primary font-semibold hover:underline">Cronwatch</a> — The invisible monitor for your infrastructure.</p>
        </footer>
      </div>
    </div>
  );
}
