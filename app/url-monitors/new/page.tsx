"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Code,
  Check,
  ChevronRight,
  Cpu,
  Activity,
  AlertTriangle,
  History,
  LayoutGrid,
  Hash,
  X,
  RefreshCw,
  Server,
  MousePointer2,
  Terminal,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../../src/hooks/useAuth";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { createUrlMonitor, testUrlMonitor } from "../../../src/lib/api";
import { cn } from "../../../src/lib/utils";
import { ProBadge } from "../../../src/components/shared/ProBadge";
import { DashboardSkeleton } from "../../../src/components/shared/PageSkeleton";
import { motion, AnimatePresence } from "motion/react";

const STEPS = [
  { id: 1, title: "Target", description: "Define your endpoint" },
  { id: 2, title: "Rules", description: "Set check frequency" },
  { id: 3, title: "Alerts", description: "Configure notifications" },
  { id: 4, title: "Review", description: "Final confirmation" },
];

const INTERVALS = [
  { label: "30s", value: 30, pro: true },
  { label: "1m", value: 60, pro: true },
  { label: "5m", value: 300, pro: false, recommended: true },
  { label: "10m", value: 600, pro: false },
];

export default function NewUrlMonitorPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "up" | "down" | "error";
    latency?: number;
    code?: number;
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
    alert_threshold: 1,
    recovery_alerts: true,
    cooldown_duration: 300
  });

  const isPro = user?.plan === "pro";

  // Auto-detect protocol and suggest name
  useEffect(() => {
    if (formData.url && currentStep === 1) {
      const url = formData.url.toLowerCase();
      
      // Protocol detection
      if (url.startsWith("http://") && formData.protocol !== "http") {
        setFormData(p => ({ ...p, protocol: "http" }));
      } else if (url.startsWith("https://") && formData.protocol !== "https") {
        setFormData(p => ({ ...p, protocol: "https" }));
      } else if (!url.includes("://") && formData.protocol !== "https") {
        setFormData(p => ({ ...p, protocol: "https" }));
      }

      // Name suggestion
      if (!formData.name) {
        try {
          const domain = new URL(url.includes("://") ? url : `https://${url}`).hostname;
          const suggestedName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
          if (suggestedName) setFormData(p => ({ ...p, name: suggestedName }));
        } catch (e) {}
      }

      // Auto-test after short delay if URL looks valid
      if (url.includes(".") && url.length > 5) {
        const timer = setTimeout(() => {
          handleTestUrl();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [formData.url]);

  const requestsPerMonth = useMemo(() => {
    const daily = (24 * 60 * 60) / formData.check_interval_seconds;
    return Math.round(daily * 30).toLocaleString();
  }, [formData.check_interval_seconds]);

  const handleTestUrl = async () => {
    if (!formData.url || isTesting) return;
    setIsTesting(true);
    try {
      const res = await testUrlMonitor(formData.url);
      setTestResult({
        status: res.data.status,
        latency: res.data.response_time_ms,
        code: res.data.status_code
      });
    } catch (err: any) {
      setTestResult({ status: "error" });
    } finally {
      setIsTesting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const headerRecord = formData.headers
        .filter(h => h.key && h.value)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

      await createUrlMonitor({
        ...formData,
        headers: headerRecord as any
      });
      toast.success("Monitor deployed successfully");
      router.push("/url-monitors");
    } catch (err: any) {
      toast.error("Deployment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex overflow-hidden selection:bg-brand-primary/30 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-50">
          <motion.div 
            className="h-full bg-brand-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "circOut" }}
          />
        </div>

        {/* Wizard Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar pt-20 pb-32">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <StepContainer key="step1">
                  <StepHeader 
                    icon={Globe} 
                    title="What are we monitoring?" 
                    description="Enter the URL of the website or API endpoint you want to track."
                  />
                  
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Globe className="w-5 h-5 text-brand-muted/40" />
                      </div>
                      <input 
                        autoFocus
                        type="text"
                        value={formData.url}
                        onChange={(e) => setFormData(p => ({ ...p, url: e.target.value }))}
                        placeholder="https://api.acme.com/v1/health"
                        className="w-full h-16 bg-[#111111] border border-[#222] rounded-2xl pl-12 pr-4 text-lg text-white focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-white/10"
                      />
                      <AnimatePresence>
                        {isTesting && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                          >
                            <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {testResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 rounded-xl border flex items-center justify-between",
                            testResult.status === "up" ? "bg-brand-success/5 border-brand-success/20" : "bg-brand-error/5 border-brand-error/20"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", testResult.status === "up" ? "bg-brand-success" : "bg-brand-error")} />
                            <span className={cn("text-xs font-bold uppercase tracking-widest", testResult.status === "up" ? "text-brand-success" : "text-brand-error")}>
                              {testResult.status === "up" ? `Endpoint Reachable (${testResult.latency}ms)` : "Endpoint Unreachable"}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-brand-muted">HTTP {testResult.code || "---"}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">Monitor Name</label>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Production API"
                        className="w-full h-12 bg-[#111111] border border-[#222] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <button 
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-[10px] font-bold text-brand-muted hover:text-white transition-all uppercase tracking-widest"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Advanced Configuration
                        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showAdvanced && "rotate-90")} />
                      </button>
                      
                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Method</label>
                                  <select 
                                    value={formData.method}
                                    onChange={(e) => setFormData(p => ({ ...p, method: e.target.value as any }))}
                                    className="w-full h-10 bg-[#111111] border border-[#222] rounded-lg px-3 text-xs text-white focus:outline-none"
                                  >
                                    <option>GET</option>
                                    <option>POST</option>
                                    <option>HEAD</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Expected Status</label>
                                  <input 
                                    type="number"
                                    value={formData.expected_status_code}
                                    onChange={(e) => setFormData(p => ({ ...p, expected_status_code: parseInt(e.target.value) }))}
                                    className="w-full h-10 bg-[#111111] border border-[#222] rounded-lg px-3 text-xs text-white focus:outline-none"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Custom Headers</span>
                                  <button 
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, headers: [...p.headers, { key: "", value: "" }] }))}
                                    className="text-[10px] text-brand-primary hover:text-white"
                                  >+ Add Header</button>
                                </div>
                                {formData.headers.map((h, i) => (
                                  <div key={i} className="flex gap-2">
                                    <input placeholder="Key" value={h.key} onChange={(e) => { const n = [...formData.headers]; n[i].key = e.target.value; setFormData(p => ({ ...p, headers: n })) }} className="flex-1 h-9 bg-white/5 border border-white/5 rounded-lg px-3 text-xs text-white" />
                                    <input placeholder="Value" value={h.value} onChange={(e) => { const n = [...formData.headers]; n[i].value = e.target.value; setFormData(p => ({ ...p, headers: n })) }} className="flex-1 h-9 bg-white/5 border border-white/5 rounded-lg px-3 text-xs text-white" />
                                    <button onClick={() => setFormData(p => ({ ...p, headers: p.headers.filter((_, idx) => idx !== i) }))} className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-error"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </StepContainer>
              )}

              {currentStep === 2 && (
                <StepContainer key="step2">
                  <StepHeader 
                    icon={Clock} 
                    title="How often should we check?" 
                    description="Higher frequency means faster error detection but consumes more request quota."
                  />

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1 text-center block">Check Interval</label>
                      <div className="flex p-1.5 bg-[#111111] border border-[#222] rounded-2xl gap-1">
                        {INTERVALS.map((int) => (
                          <button
                            key={int.value}
                            type="button"
                            disabled={int.pro && !isPro}
                            onClick={() => setFormData(p => ({ ...p, check_interval_seconds: int.value }))}
                            className={cn(
                              "flex-1 h-12 rounded-xl text-xs font-bold transition-all relative overflow-hidden flex flex-col items-center justify-center gap-0.5",
                              formData.check_interval_seconds === int.value 
                                ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20" 
                                : "text-brand-muted hover:text-white hover:bg-white/5",
                              int.pro && !isPro && "opacity-40 grayscale cursor-not-allowed"
                            )}
                          >
                            {int.label}
                            {int.recommended && !formData.check_interval_seconds && <span className="text-[8px] opacity-60">Best</span>}
                            {int.pro && !isPro && <Lock className="w-2.5 h-2.5 absolute top-1.5 right-1.5 opacity-40" />}
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-[10px] text-brand-muted font-medium">
                        This configuration results in ~<span className="text-white">{requestsPerMonth}</span> checks per month.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">Response Timeout</label>
                        <div className="relative group">
                          <select 
                            value={formData.timeout_seconds}
                            onChange={(e) => setFormData(p => ({ ...p, timeout_seconds: parseInt(e.target.value) }))}
                            className="w-full h-12 bg-[#111111] border border-[#222] rounded-xl px-4 text-sm text-white focus:outline-none appearance-none"
                          >
                            <option value={5}>5 seconds</option>
                            <option value={10}>10 seconds</option>
                            <option value={30}>30 seconds</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">Retries on failure</label>
                        <div className="relative group">
                          <select className="w-full h-12 bg-[#111111] border border-[#222] rounded-xl px-4 text-sm text-white focus:outline-none appearance-none">
                            <option>No retries</option>
                            <option>1 retry</option>
                            <option>2 retries</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </StepContainer>
              )}

              {currentStep === 3 && (
                <StepContainer key="step3">
                  <StepHeader 
                    icon={Bell} 
                    title="Who should be notified?" 
                    description="Configure where and when alerts are delivered when your monitor goes down."
                  />

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1 text-center block">Notification Channels</label>
                      <div className="flex flex-wrap justify-center gap-3">
                        <ChannelPillLarge 
                          active={formData.alert_channels.email} 
                          label="Email" 
                          icon={Mail}
                          onClick={() => setFormData(p => ({ ...p, alert_channels: { ...p.alert_channels, email: !p.alert_channels.email } }))}
                        />
                        <ChannelPillLarge 
                          active={formData.alert_channels.telegram} 
                          label="Telegram" 
                          icon={Send}
                          onClick={() => setFormData(p => ({ ...p, alert_channels: { ...p.alert_channels, telegram: !p.alert_channels.telegram } }))}
                        />
                        <ChannelPillLarge 
                          active={false} 
                          label="Slack" 
                          icon={Hash}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                      <div className="space-y-4">
                        <label className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-brand-primary" />
                          Sensitivity
                        </label>
                        <div className="space-y-2">
                          <p className="text-[10px] text-brand-muted leading-relaxed">Wait for multiple failures before alerting to avoid noise from network blips.</p>
                          <select 
                            value={formData.alert_threshold}
                            onChange={(e) => setFormData(p => ({ ...p, alert_threshold: parseInt(e.target.value) }))}
                            className="w-full h-11 bg-[#111111] border border-[#222] rounded-xl px-4 text-xs text-white focus:outline-none appearance-none"
                          >
                            <option value={1}>Alert after 1 failure</option>
                            <option value={2}>Alert after 2 failures</option>
                            <option value={3}>Alert after 3 failures</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-brand-success" />
                          Recovery
                        </label>
                        <div className="space-y-2">
                          <p className="text-[10px] text-brand-muted leading-relaxed">Notify me when the endpoint is back online and functional.</p>
                          <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, recovery_alerts: !p.recovery_alerts }))}
                            className={cn(
                              "w-full h-11 rounded-xl border px-4 flex items-center justify-between text-xs font-bold transition-all",
                              formData.recovery_alerts ? "bg-brand-success/5 border-brand-success/30 text-white" : "bg-white/5 border-white/5 text-brand-muted"
                            )}
                          >
                            Send Recovery Alerts
                            {formData.recovery_alerts ? <Check className="w-4 h-4 text-brand-success" /> : <div className="w-4 h-4 rounded-full border border-white/20" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </StepContainer>
              )}

              {currentStep === 4 && (
                <StepContainer key="step4">
                  <StepHeader 
                    icon={Zap} 
                    title="Ready to deploy?" 
                    description="Review your configuration before we start the monitoring engine."
                  />

                  <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-[#111111] border border-[#222] space-y-8">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-white tracking-tight">{formData.name}</h4>
                          <p className="text-sm font-mono text-brand-muted opacity-60 truncate max-w-sm">{formData.url}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                          {formData.method}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-10">
                        <SummaryItem label="Frequency" value={`Every ${formData.check_interval_seconds < 60 ? `${formData.check_interval_seconds}s` : `${formData.check_interval_seconds / 60}m`}`} icon={History} />
                        <SummaryItem label="Load" value={`${requestsPerMonth} reqs/mo`} icon={Cpu} />
                        <SummaryItem label="Alerts" value={`${formData.alert_threshold} fail threshold`} icon={AlertTriangle} />
                        <SummaryItem label="Channels" value={Object.entries(formData.alert_channels).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(", ")} icon={Bell} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-brand-primary" />
                      </div>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        By clicking create, you agree to start continuous monitoring for this endpoint. Alerts will be dispatched immediately upon detection of downtime.
                      </p>
                    </div>
                  </div>
                </StepContainer>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#0A0A0A]/80 backdrop-blur-md border-t border-white/5 flex items-center justify-center z-50">
          <div className="w-full max-w-xl flex items-center justify-between px-6">
            <button 
              onClick={prevStep}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[11px] font-bold text-brand-muted hover:text-white transition-all flex items-center gap-2",
                currentStep === 1 && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map(s => (
                <div 
                  key={s} 
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    s === currentStep ? "w-8 bg-brand-primary" : s < currentStep ? "w-4 bg-brand-primary/40" : "w-4 bg-white/10"
                  )} 
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <button 
                onClick={nextStep}
                disabled={currentStep === 1 && (!formData.url || isTesting)}
                className="px-8 py-2.5 bg-white text-black hover:bg-white/90 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-white/10 active:scale-[0.98]"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 shadow-xl shadow-brand-primary/20 active:scale-[0.98]"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Create Monitor
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-10"
    >
      {children}
    </motion.div>
  );
}

function StepHeader({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto shadow-2xl">
        <Icon className="w-8 h-8 text-brand-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{title}</h2>
        <p className="text-brand-muted text-sm max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ChannelPillLarge({ active, label, icon: Icon, onClick, disabled }: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-3xl border transition-all relative overflow-hidden group",
        active 
          ? "bg-brand-primary/10 border-brand-primary/30 text-white" 
          : "bg-white/[0.02] border-white/5 text-brand-muted hover:border-white/20 hover:text-white",
        disabled && "opacity-20 grayscale cursor-not-allowed"
      )}
    >
      <Icon className={cn("w-8 h-8 transition-transform duration-300", active ? "text-brand-primary scale-110" : "text-brand-muted group-hover:scale-110")} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      {active && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-brand-primary" />
        </div>
      )}
    </button>
  );
}

function SummaryItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-muted" />
      </div>
      <div className="space-y-0.5">
        <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{label}</div>
        <div className="text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  );
}
