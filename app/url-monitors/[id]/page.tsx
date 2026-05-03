"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Pause, 
  Play,
  Activity,
  Timer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Zap,
  BarChart3,
  Bell,
  CheckCircle,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceArea
} from "recharts";
import { 
  getUrlMonitor, 
  getUrlMonitorLogs, 
  deleteUrlMonitor, 
  updateUrlMonitor,
  getUrlMonitorAlerts 
} from "../../../src/lib/api";
import { UrlMonitor, UrlMonitorLog, UrlMonitorAlert } from "../../../src/types";
import { timeAgo, formatInterval, cn, getErrorMessage } from "../../../src/lib/utils";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { DashboardSkeleton } from "../../../src/components/shared/PageSkeleton";
import { UptimeHistoryBar } from "../../../src/components/shared/UptimeHistoryBar";
import { motion } from "motion/react";

export default function UrlMonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [monitor, setMonitor] = useState<UrlMonitor | null>(null);
  const [logs, setLogs] = useState<UrlMonitorLog[]>([]);
  const [alerts, setAlerts] = useState<UrlMonitorAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [monitorRes, logsRes, alertsRes] = await Promise.all([
        getUrlMonitor(id),
        getUrlMonitorLogs(id),
        getUrlMonitorAlerts(id).catch(() => ({ data: [] }))
      ]);
      setMonitor(monitorRes.data);
      setLogs(logsRes.data);
      setAlerts(alertsRes.data);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
      router.push("/url-monitors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    setIsDeleting(true);
    try {
      await deleteUrlMonitor(id);
      toast.success("Monitor deleted");
      router.push("/url-monitors");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    if (!monitor) return;
    try {
      const active = !monitor.is_active;
      await updateUrlMonitor(id, { is_active: active });
      setMonitor({ ...monitor, is_active: active });
      toast.success(active ? "Monitor resumed" : "Monitor paused");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const chartData = useMemo(() => {
    return logs
      .slice()
      .reverse()
      .map(log => ({
        time: new Date(log.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTime: new Date(log.checked_at).toLocaleString(),
        latency: log.response_time_ms || 0,
        status: log.status,
        code: log.status_code
      }));
  }, [logs]);

  // Find downtime ranges for chart ReferenceArea
  const downRanges = useMemo(() => {
    const ranges: { start: string; end: string }[] = [];
    let currentRange: { start: string; end: string } | null = null;

    chartData.forEach((point, i) => {
      if (point.status === "down") {
        if (!currentRange) {
          currentRange = { start: point.time, end: point.time };
        } else {
          currentRange.end = point.time;
        }
      } else {
        if (currentRange) {
          ranges.push(currentRange);
          currentRange = null;
        }
      }
    });
    if (currentRange) ranges.push(currentRange);
    return ranges;
  }, [chartData]);

  if (isLoading || !monitor) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-24 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-6">
            <Link 
              href="/url-monitors"
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-muted hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{monitor.name}</h1>
                <StatusBadge status={monitor.status} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <a 
                  href={monitor.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-brand-muted hover:text-brand-primary flex items-center gap-1.5 transition-colors"
                >
                  {monitor.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-white/20">•</span>
                <span className="text-[10px] text-brand-muted">Last checked {timeAgo(monitor.last_checked_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className="px-4 h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              {monitor.is_active ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
            </button>
            <button
              className="px-4 h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 h-10 bg-brand-error/10 hover:bg-brand-error/20 text-brand-error rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <DetailStat label="Current Status" value={monitor.status.toUpperCase()} icon={Activity} color={monitor.status === 'up' ? 'text-brand-success' : 'text-brand-error'} />
              <DetailStat label="Uptime (7d)" value={`${monitor.uptime_percentage_7d || 99.9}%`} icon={ShieldCheck} color="text-brand-success" />
              <DetailStat label="Avg Latency" value={`${monitor.last_response_time_ms || 0}ms`} icon={Timer} color="text-brand-primary" />
              <DetailStat label="Last Status" value={monitor.last_status_code || "—"} icon={CheckCircle2} color="text-white/80" />
            </div>

            {/* Main Chart Container */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Response Time (24h)</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-primary" /> Latency</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-error/20" /> Downtime</div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#4B5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#4B5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `${val}ms`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2F2F2F', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                      labelStyle={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}
                      labelFormatter={(val, items) => items[0]?.payload?.fullTime}
                    />
                    {downRanges.map((range, i) => (
                      <ReferenceArea 
                        key={i}
                        x1={range.start} 
                        x2={range.end} 
                        fill="#EF4444" 
                        fillOpacity={0.1} 
                        stroke="none"
                      />
                    ))}
                    <Area 
                      type="monotone" 
                      dataKey="latency" 
                      stroke="#7C3AED" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorLatency)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 30 Day Uptime blocks */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-success/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-brand-success" />
                  </div>
                  <h3 className="text-lg font-bold text-white">30 Day Uptime History</h3>
                </div>
                <div className="text-[10px] font-bold text-brand-success uppercase tracking-widest">
                  100.0% Overall
                </div>
              </div>
              <UptimeHistoryBar days={30} />
              <div className="flex items-center justify-between text-[10px] text-brand-muted font-bold uppercase tracking-widest pt-2">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Logs and Alerts Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Check History Table */}
              <div className="lg:col-span-2 bg-[#111111] border border-[#1F1F1F] rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-[#1F1F1F] flex items-center gap-3">
                  <History className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-white">Check History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-brand-muted uppercase tracking-widest border-b border-[#1F1F1F]">
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Latency</th>
                        <th className="px-6 py-4">Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]">
                      {logs.map((log) => (
                        <tr key={log.id} className="text-xs hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 text-white/60">
                            <span title={new Date(log.checked_at).toLocaleString()}>
                              {timeAgo(log.checked_at)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                              log.status === 'up' ? "bg-brand-success/10 text-brand-success" : "bg-brand-error/10 text-brand-error"
                            )}>
                              {log.status === 'up' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {log.status}
                            </div>
                          </td>
                          <td className={cn(
                            "px-6 py-4 font-mono font-bold",
                            (log.response_time_ms || 0) < 500 ? "text-brand-success" : 
                            (log.response_time_ms || 0) < 1500 ? "text-yellow-500" : "text-brand-error"
                          )}>
                            {log.response_time_ms ? `${log.response_time_ms}ms` : "—"}
                          </td>
                          <td className="px-6 py-4 font-mono text-white/40">
                            {log.status_code || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alert History */}
              <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#1F1F1F] flex items-center gap-3">
                  <Bell className="w-5 h-5 text-brand-error" />
                  <h3 className="text-sm font-bold text-white">Recent Alerts</h3>
                </div>
                <div className="flex-1 p-6">
                  {alerts.length > 0 ? (
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="p-4 bg-black/20 rounded-2xl border border-[#1F1F1F] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-brand-error uppercase tracking-widest">Incident</span>
                            <span className="text-[10px] text-brand-muted">{timeAgo(alert.triggered_at)}</span>
                          </div>
                          <p className="text-xs text-white/80 font-medium">Monitor failed to respond</p>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-brand-muted uppercase font-bold">
                              {alert.channel}
                            </div>
                            {alert.is_resolved && (
                              <div className="px-2 py-0.5 rounded bg-brand-success/10 text-[9px] text-brand-success uppercase font-bold">
                                Resolved
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <ShieldCheck className="w-8 h-8 mb-3" />
                      <p className="text-xs font-bold uppercase tracking-widest">No alerts yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{label}</span>
        <Icon className={cn("w-4 h-4 opacity-40", color)} />
      </div>
      <div className={cn("text-2xl font-bold", color)}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isUp = status === "up";
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
      isUp ? "bg-brand-success/10 text-brand-success border border-brand-success/20" : "bg-brand-error/10 text-brand-error border border-brand-error/20"
    )}>
      <div className={cn("w-2 h-2 rounded-full", isUp ? "bg-brand-success" : "bg-brand-error")} />
      {status}
    </div>
  );
}
