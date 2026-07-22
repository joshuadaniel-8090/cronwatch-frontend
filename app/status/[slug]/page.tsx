"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Activity, Clock, Globe, ShieldCheck, Radar, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { StatusBadge } from "../../../src/components/shared/StatusBadge";
import { UptimeHistoryBar } from "../../../src/components/shared/UptimeHistoryBar";
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
        const response = await api.get(`status/${slug}`);
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
  if (!data)
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-text-primary">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-primary/20 shadow-2xl shadow-brand-primary/10">
            <Radar className="w-10 h-10 text-brand-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Status Page Not Found</h1>
          <p className="text-brand-muted max-w-xs mx-auto mb-10 leading-relaxed text-sm">
            This status page doesn&apos;t exist or is no longer public.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98]"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col p-4 md:p-8">
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
              <h1 className="text-4xl font-bold tracking-tight mb-3 text-text-primary">{data.name}</h1>
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
              <div className="text-2xl font-bold text-text-primary">{timeAgo(data.last_ping_at)}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">30-Day Uptime History</h3>
              <span className="text-xs text-brand-muted">Last updated recently</span>
            </div>
            <UptimeHistoryBar
              days={30}
              data={data.uptime_last_30_days.map((day) => ({
                date: day.date,
                uptime: day.status === "healthy" ? 100 : 0,
                status:
                  day.status === "healthy"
                    ? "up"
                    : day.status === "failing"
                      ? "down"
                      : "no_data",
              }))}
            />
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
