"use client";

import React, { useState } from "react";
import { 
  ChevronLeft, 
  Globe, 
  Shield, 
  Zap, 
  Lock,
  Plus,
  Trash2,
  Info,
  Clock,
  ArrowRight,
  Settings,
  Bell,
  Mail,
  Send,
  Code
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../../src/hooks/useAuth";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { createUrlMonitor, testUrlMonitor } from "../../../src/lib/api";
import { cn } from "../../../src/lib/utils";
import { ProBadge, ProLock } from "../../../src/components/shared/ProBadge";
import { DashboardSkeleton } from "../../../src/components/shared/PageSkeleton";

export default function NewUrlMonitorPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "up" | "down" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    protocol: "https",
    method: "GET",
    headers: [{ key: "", value: "" }],
    body: "",
    check_interval_seconds: 300,
    timeout_seconds: 10,
    expected_status_code: 200,
    alert_channels: {
      email: true,
      telegram: true
    },
    alert_threshold: 1
  });

  const handleAddHeader = () => {
    setFormData({ ...formData, headers: [...formData.headers, { key: "", value: "" }] });
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = [...formData.headers];
    newHeaders.splice(index, 1);
    setFormData({ ...formData, headers: newHeaders });
  };

  const handleHeaderChange = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...formData.headers];
    newHeaders[index][field] = value;
    setFormData({ ...formData, headers: newHeaders });
  };

  const handleTestUrl = async () => {
    if (!formData.url) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const res = await testUrlMonitor(formData.url);
      const data = res.data;
      
      if (data.status === "up") {
        setTestResult({
          status: "up",
          message: `Up — ${data.response_time_ms}ms (HTTP ${data.status_code})`
        });
      } else {
        setTestResult({
          status: "down",
          message: `Down — ${data.error_message || `HTTP ${data.status_code}`}`
        });
      }
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: "Test failed — check your connection"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.startsWith("http://") && !formData.url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    setIsSubmitting(true);
    try {
      // Process headers into record
      const headerRecord = formData.headers
        .filter(h => h.key && h.value)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

      await createUrlMonitor({
        ...formData,
        headers: headerRecord as any
      });
      toast.success("Uptime monitor created!");
      router.push("/url-monitors");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create monitor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <DashboardSkeleton />;

  const isPro = user?.plan === "pro";

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-24 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md bg-bg-base/80">
          <div className="flex items-center gap-6">
            <Link 
              href="/url-monitors"
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-muted hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">New Uptime Monitor</h1>
              <p className="text-xs text-brand-muted mt-1">Start monitoring your websites and APIs</p>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="max-w-[800px] mx-auto space-y-8 pb-20">
            
            {/* Section 1: Basic Info */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#1F1F1F] pb-4 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-brand-primary" />
                </div>
                <h3 className="text-lg font-bold text-white">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Monitor Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Main API"
                    className="w-full bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">URL to Monitor</label>
                  <div className="flex gap-3">
                    <input 
                      required
                      type="url" 
                      value={formData.url}
                      onChange={(e) => {
                        setFormData({ ...formData, url: e.target.value });
                        setTestResult(null);
                      }}
                      placeholder="https://api.example.com"
                      className="flex-1 bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleTestUrl}
                      disabled={!formData.url || isTesting}
                      className={cn(
                        "px-6 rounded-xl text-xs font-bold transition-all flex items-center justify-center min-w-[100px]",
                        "bg-white/5 hover:bg-white/10 text-white border border-[#1F1F1F]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isTesting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Test URL"
                      )}
                    </button>
                  </div>
                  {testResult && (
                    <div className={cn(
                      "flex items-center gap-2 text-[11px] font-bold mt-2 animate-in fade-in slide-in-from-top-1 duration-200",
                      testResult.status === "up" ? "text-brand-success" : "text-brand-error"
                    )}>
                      {testResult.status === "up" ? "✅" : "🔴"} {testResult.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Request Settings */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#1F1F1F] pb-4 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Request Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Protocol</label>
                  <select 
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value as any })}
                    className="w-full bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                  >
                    <option value="https">HTTPS (Recommended)</option>
                    <option value="http">HTTP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Method</label>
                  <select 
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                    className="w-full bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Request Headers</label>
                  <button 
                    type="button"
                    onClick={handleAddHeader}
                    className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Header
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.headers.map((header, index) => (
                    <div key={index} className="flex gap-3">
                      <input 
                        placeholder="Header key"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                        className="flex-1 bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                      <input 
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                        className="flex-1 bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveHeader(index)}
                        className="p-2 text-brand-muted hover:text-brand-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {formData.method === "POST" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Request Body</label>
                  <textarea 
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder='{ "key": "value" }'
                    className="w-full h-32 bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-brand-primary/50 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Section 3: Check Settings */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#1F1F1F] pb-4 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Check Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest flex items-center justify-between">
                    Check Interval
                  </label>
                  <div className="space-y-2">
                    <IntervalOption 
                      label="Every 5 minutes" 
                      selected={formData.check_interval_seconds === 300}
                      onClick={() => setFormData({ ...formData, check_interval_seconds: 300 })}
                    />
                    <IntervalOption 
                      label="Every 10 minutes" 
                      selected={formData.check_interval_seconds === 600}
                      onClick={() => setFormData({ ...formData, check_interval_seconds: 600 })}
                    />
                    <ProLock isLocked={!isPro}>
                      <IntervalOption 
                        label="Every 1 minute" 
                        pro
                        selected={formData.check_interval_seconds === 60}
                        onClick={() => setFormData({ ...formData, check_interval_seconds: 60 })}
                      />
                    </ProLock>
                    <ProLock isLocked={!isPro}>
                      <IntervalOption 
                        label="Every 30 seconds" 
                        pro
                        selected={formData.check_interval_seconds === 30}
                        onClick={() => setFormData({ ...formData, check_interval_seconds: 30 })}
                      />
                    </ProLock>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Timeout</label>
                    <select 
                      value={formData.timeout_seconds}
                      onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none"
                    >
                      <option value={10}>10 seconds (Default)</option>
                      {!isPro && <option disabled>30 seconds (Pro only)</option>}
                      {isPro && <option value={30}>30 seconds</option>}
                      {!isPro && <option disabled>60 seconds (Pro only)</option>}
                      {isPro && <option value={60}>60 seconds</option>}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Expected Status Code</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.expected_status_code}
                        onChange={(e) => setFormData({ ...formData, expected_status_code: parseInt(e.target.value) })}
                        className="w-full bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Code className="w-4 h-4 text-brand-muted opacity-40" />
                      </div>
                    </div>
                    <p className="text-[10px] text-brand-muted">Any code other than this will trigger an alert</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Alert Settings */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#1F1F1F] pb-4 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-error/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-brand-error" />
                </div>
                <h3 className="text-lg font-bold text-white">Alert Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Alert Channels</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.alert_channels.email}
                        onChange={(e) => setFormData({ ...formData, alert_channels: { ...formData.alert_channels, email: e.target.checked } })}
                        className="w-5 h-5 rounded-lg border-[#1F1F1F] bg-black/40 text-brand-primary focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                      />
                      <div className="flex items-center gap-2 text-sm text-white group-hover:text-brand-primary transition-colors">
                        <Mail className="w-4 h-4 opacity-40" /> Email
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.alert_channels.telegram}
                        onChange={(e) => setFormData({ ...formData, alert_channels: { ...formData.alert_channels, telegram: e.target.checked } })}
                        className="w-5 h-5 rounded-lg border-[#1F1F1F] bg-black/40 text-brand-primary focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                      />
                      <div className="flex items-center gap-2 text-sm text-white group-hover:text-brand-primary transition-colors">
                        <Send className="w-4 h-4 opacity-40" /> Telegram
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Alert after</label>
                  <div className="space-y-2">
                    <select 
                      value={formData.alert_threshold}
                      onChange={(e) => setFormData({ ...formData, alert_threshold: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none"
                    >
                      <option value={1}>1 failure (Default)</option>
                      {!isPro && <option disabled>2 consecutive failures (Pro only)</option>}
                      {isPro && <option value={2}>2 consecutive failures</option>}
                      {!isPro && <option disabled>3 consecutive failures (Pro only)</option>}
                      {isPro && <option value={3}>3 consecutive failures</option>}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className={cn(
                "w-full h-14 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-[0.99]",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Start Monitoring</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function IntervalOption({ label, selected, onClick, pro }: { label: string; selected: boolean; onClick: () => void; pro?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm",
        selected 
          ? "bg-brand-primary/10 border-brand-primary/30 text-white" 
          : "bg-black/20 border-[#1F1F1F] text-brand-muted hover:border-white/10"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
          selected ? "border-brand-primary" : "border-[#2F2F2F]"
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
        </div>
        {label}
      </div>
      {pro && <ProBadge />}
    </button>
  );
}
