"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  ChevronLeft,
  Globe,
  Radio,
  Shield,
  Zap,
  Lock,
  Clock,
  Trash2,
  ArrowRight,
  Settings,
  Check,
  ChevronRight,
  AlertTriangle,
  Bell,
  Mail,
  Send,
  Cpu,
  History,
  Hash,
  RefreshCw,
  Tag,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { createUrlMonitor, testUrlMonitor } from "@/lib/api";
import api from "@/lib/api";
import {
  cn,
  INTERVAL_OPTIONS,
  GRACE_OPTIONS,
  getErrorMessage,
  PLAN_LIMITS,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UrlMonitorWizardSkeleton } from "@/components/shared/PageSkeleton";
import { motion, AnimatePresence } from "motion/react";

type MonitorType = "cron" | "url";

const STEPS = [
  { id: 1, title: "Target", description: "Define your endpoint" },
  { id: 2, title: "Rules", description: "Set check frequency" },
  { id: 3, title: "Alerts", description: "Configure notifications" },
  { id: 4, title: "Review", description: "Final confirmation" },
];

const URL_INTERVALS = [
  { label: "30s", value: 30, pro: true },
  { label: "1m", value: 60, pro: true },
  { label: "5m", value: 300, pro: false, recommended: true },
  { label: "10m", value: 600, pro: false },
];

function NewMonitorWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();

  const [monitorType, setMonitorType] = useState<MonitorType>(
    searchParams.get("type") === "url" ? "url" : "cron",
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "up" | "down" | "error";
    latency?: number;
    code?: number;
  } | null>(null);
  const [cronMonitorCount, setCronMonitorCount] = useState(0);

  // Shared
  const [name, setName] = useState("");
  const [alertChannels, setAlertChannels] = useState({
    email: true,
    telegram: true,
  });

  // Cron-only
  const [interval, setInterval] = useState(3600);
  const [grace, setGrace] = useState(300);
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");

  // URL-only
  const [formData, setFormData] = useState({
    url: "",
    protocol: "https",
    method: "GET",
    headers: [{ key: "", value: "" }],
    check_interval_seconds: 300,
    timeout_seconds: 10,
    expected_status_code: 200,
    alert_threshold: 1,
    recovery_alerts: true,
  });

  const isPro = user?.plan === "pro";

  useEffect(() => {
    if (monitorType === "cron") {
      api
        .get("monitors")
        .then((res) =>
          setCronMonitorCount(Array.isArray(res.data) ? res.data.length : 0),
        )
        .catch(() => {});
    }
  }, [monitorType]);

  // Auto-detect protocol and suggest name (URL type only)
  useEffect(() => {
    if (monitorType !== "url" || currentStep !== 1 || !formData.url) return;
    const url = formData.url.toLowerCase();

    if (url.startsWith("http://") && formData.protocol !== "http") {
      setFormData((p) => ({ ...p, protocol: "http" }));
    } else if (url.startsWith("https://") && formData.protocol !== "https") {
      setFormData((p) => ({ ...p, protocol: "https" }));
    } else if (!url.includes("://") && formData.protocol !== "https") {
      setFormData((p) => ({ ...p, protocol: "https" }));
    }

    if (!name) {
      try {
        const domain = new URL(url.includes("://") ? url : `https://${url}`)
          .hostname;
        const suggestedName =
          domain.split(".")[0].charAt(0).toUpperCase() +
          domain.split(".")[0].slice(1);
        if (suggestedName) setName(suggestedName);
      } catch (e) {}
    }

    if (url.includes(".") && url.length > 5) {
      const timer = setTimeout(() => {
        handleTestUrl();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formData.url, monitorType, currentStep]);

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
        code: res.data.status_code,
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

  const step1Invalid =
    monitorType === "cron"
      ? !name.trim()
      : !formData.url || isTesting;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (monitorType === "url") {
        const headerRecord = formData.headers
          .filter((h) => h.key && h.value)
          .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        await createUrlMonitor({
          name,
          url: formData.url,
          protocol: formData.protocol,
          method: formData.method,
          headers: headerRecord,
          check_interval_seconds: formData.check_interval_seconds,
          timeout_seconds: formData.timeout_seconds,
          expected_status_code: formData.expected_status_code,
          alert_channels: alertChannels,
          alert_threshold: formData.alert_threshold,
          recovery_alerts: formData.recovery_alerts,
        });
        toast.success("Monitor deployed successfully");
        router.push("/url-monitors");
      } else {
        if (user?.plan === "free" && cronMonitorCount >= PLAN_LIMITS.free) {
          toast.error(
            `Monitor limit reached. Free plan is limited to ${PLAN_LIMITS.free} monitors.`,
          );
          setIsSubmitting(false);
          return;
        }
        const tags = tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        const alert_channel =
          alertChannels.email && alertChannels.telegram
            ? "both"
            : alertChannels.telegram
              ? "telegram"
              : "email";
        const payload: any = {
          name: name.trim(),
          interval_seconds: interval,
          grace_seconds: grace,
          alert_channel,
        };
        if (description.trim()) payload.description = description.trim();
        if (tags.length > 0) payload.tags = tags;

        await api.post("monitors", payload);
        toast.success("Monitor created successfully");
        router.push("/monitors");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <UrlMonitorWizardSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden selection:bg-brand-primary/30 font-sans">
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-bg-subtle z-50">
          <motion.div
            className="h-full bg-brand-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "circOut" }}
          />
        </div>

        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[11px] font-bold text-brand-muted hover:text-text-primary transition-all uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Cancel
          </button>
        </div>

        {/* Wizard Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar pt-20 pb-32">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <StepContainer key="step1">
                  <StepHeader
                    icon={monitorType === "cron" ? Radio : Globe}
                    title="What are we monitoring?"
                    description={
                      monitorType === "cron"
                        ? "Cron jobs and background tasks that ping us to prove they ran."
                        : "Enter the URL of the website or API endpoint you want to track."
                    }
                  />

                  <div className="flex justify-center">
                    <div className="flex p-1 bg-bg-surface border border-border-card rounded-2xl gap-1">
                      <button
                        type="button"
                        onClick={() => setMonitorType("cron")}
                        className={cn(
                          "flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-bold transition-all",
                          monitorType === "cron"
                            ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                            : "text-brand-muted hover:text-text-primary",
                        )}
                      >
                        <Radio className="w-3.5 h-3.5" /> Cron / Heartbeat
                      </button>
                      <button
                        type="button"
                        onClick={() => setMonitorType("url")}
                        className={cn(
                          "flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-bold transition-all",
                          monitorType === "url"
                            ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                            : "text-brand-muted hover:text-text-primary",
                        )}
                      >
                        <Globe className="w-3.5 h-3.5" /> URL / Uptime
                      </button>
                    </div>
                  </div>

                  {monitorType === "url" ? (
                    <div className="space-y-8">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Globe className="w-5 h-5 text-brand-muted/40" />
                        </div>
                        <input
                          autoFocus
                          type="text"
                          value={formData.url}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, url: e.target.value }))
                          }
                          placeholder="https://api.acme.com/v1/health"
                          className="w-full h-16 bg-bg-surface border border-border-card rounded-2xl pl-12 pr-4 text-lg text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-text-primary/10"
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
                              testResult.status === "up"
                                ? "bg-brand-success/5 border-brand-success/20"
                                : "bg-brand-error/5 border-brand-error/20",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  testResult.status === "up"
                                    ? "bg-brand-success"
                                    : "bg-brand-error",
                                )}
                              />
                              <span
                                className={cn(
                                  "text-xs font-bold uppercase tracking-widest",
                                  testResult.status === "up"
                                    ? "text-brand-success"
                                    : "text-brand-error",
                                )}
                              >
                                {testResult.status === "up"
                                  ? `Endpoint Reachable (${testResult.latency}ms)`
                                  : "Endpoint Unreachable"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-brand-muted">
                              HTTP {testResult.code || "---"}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                          Monitor Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Production API"
                          className="w-full h-12 bg-bg-surface border border-border-card rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all"
                        />
                      </div>

                      <div className="pt-4 border-t border-border-card">
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="flex items-center gap-2 text-[10px] font-bold text-brand-muted hover:text-text-primary transition-all uppercase tracking-widest"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Advanced Configuration
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 transition-transform",
                              showAdvanced && "rotate-90",
                            )}
                          />
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
                                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                                      Method
                                    </label>
                                    <select
                                      value={formData.method}
                                      onChange={(e) =>
                                        setFormData((p) => ({
                                          ...p,
                                          method: e.target.value as any,
                                        }))
                                      }
                                      className="w-full h-10 bg-bg-surface border border-border-card rounded-lg px-3 text-xs text-text-primary focus:outline-none"
                                    >
                                      <option>GET</option>
                                      <option>POST</option>
                                      <option>HEAD</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                                      Expected Status
                                    </label>
                                    <input
                                      type="number"
                                      value={formData.expected_status_code}
                                      onChange={(e) =>
                                        setFormData((p) => ({
                                          ...p,
                                          expected_status_code: parseInt(
                                            e.target.value,
                                          ),
                                        }))
                                      }
                                      className="w-full h-10 bg-bg-surface border border-border-card rounded-lg px-3 text-xs text-text-primary focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                                      Custom Headers
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData((p) => ({
                                          ...p,
                                          headers: [
                                            ...p.headers,
                                            { key: "", value: "" },
                                          ],
                                        }))
                                      }
                                      className="text-[10px] text-brand-primary hover:text-text-primary"
                                    >
                                      + Add Header
                                    </button>
                                  </div>
                                  {formData.headers.map((h, i) => (
                                    <div key={i} className="flex gap-2">
                                      <input
                                        placeholder="Key"
                                        value={h.key}
                                        onChange={(e) => {
                                          const n = [...formData.headers];
                                          n[i].key = e.target.value;
                                          setFormData((p) => ({
                                            ...p,
                                            headers: n,
                                          }));
                                        }}
                                        className="flex-1 h-9 bg-bg-subtle border border-border-card rounded-lg px-3 text-xs text-text-primary"
                                      />
                                      <input
                                        placeholder="Value"
                                        value={h.value}
                                        onChange={(e) => {
                                          const n = [...formData.headers];
                                          n[i].value = e.target.value;
                                          setFormData((p) => ({
                                            ...p,
                                            headers: n,
                                          }));
                                        }}
                                        className="flex-1 h-9 bg-bg-subtle border border-border-card rounded-lg px-3 text-xs text-text-primary"
                                      />
                                      <button
                                        onClick={() =>
                                          setFormData((p) => ({
                                            ...p,
                                            headers: p.headers.filter(
                                              (_, idx) => idx !== i,
                                            ),
                                          }))
                                        }
                                        className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-error"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                          Monitor Name
                        </label>
                        <input
                          autoFocus
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Nightly Backup Job"
                          className="w-full h-14 bg-bg-surface border border-border-card rounded-2xl px-5 text-lg text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-text-primary/10"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                          Tags (optional)
                        </label>
                        <div className="relative">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted/40" />
                          <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="production, backup, priority"
                            className="w-full h-12 bg-bg-surface border border-border-card rounded-xl pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border-card">
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="flex items-center gap-2 text-[10px] font-bold text-brand-muted hover:text-text-primary transition-all uppercase tracking-widest"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Description (Optional)
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 transition-transform",
                              showAdvanced && "rotate-90",
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {showAdvanced && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Briefly describe what this monitor tracks..."
                                className="mt-6 w-full h-20 bg-bg-surface border border-border-card rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all resize-none placeholder:text-brand-muted/40"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </StepContainer>
              )}

              {currentStep === 2 && monitorType === "url" && (
                <StepContainer key="step2-url">
                  <StepHeader
                    icon={Clock}
                    title="How often should we check?"
                    description="Higher frequency means faster error detection but consumes more request quota."
                  />

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1 text-center block">
                        Check Interval
                      </label>
                      <div className="flex p-1.5 bg-bg-surface border border-border-card rounded-2xl gap-1">
                        {URL_INTERVALS.map((int) => (
                          <button
                            key={int.value}
                            type="button"
                            disabled={int.pro && !isPro}
                            onClick={() =>
                              setFormData((p) => ({
                                ...p,
                                check_interval_seconds: int.value,
                              }))
                            }
                            className={cn(
                              "flex-1 h-12 rounded-xl text-xs font-bold transition-all relative overflow-hidden flex flex-col items-center justify-center gap-0.5",
                              formData.check_interval_seconds === int.value
                                ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                                : "text-brand-muted hover:text-text-primary hover:bg-bg-subtle",
                              int.pro &&
                                !isPro &&
                                "opacity-40 grayscale cursor-not-allowed",
                            )}
                          >
                            {int.label}
                            {int.recommended &&
                              !formData.check_interval_seconds && (
                                <span className="text-[8px] opacity-60">
                                  Best
                                </span>
                              )}
                            {int.pro && !isPro && (
                              <Lock className="w-2.5 h-2.5 absolute top-1.5 right-1.5 opacity-40" />
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-[10px] text-brand-muted font-medium">
                        This configuration results in ~
                        <span className="text-text-primary">
                          {requestsPerMonth}
                        </span>{" "}
                        checks per month.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border-card">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                          Response Timeout
                        </label>
                        <div className="relative group">
                          <select
                            value={formData.timeout_seconds}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                timeout_seconds: parseInt(e.target.value),
                              }))
                            }
                            className="w-full h-12 bg-bg-surface border border-border-card rounded-xl px-4 text-sm text-text-primary focus:outline-none appearance-none"
                          >
                            <option value={5}>5 seconds</option>
                            <option value={10}>10 seconds</option>
                            <option value={30}>30 seconds</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                          Retries on failure
                        </label>
                        <div className="relative group">
                          <select className="w-full h-12 bg-bg-surface border border-border-card rounded-xl px-4 text-sm text-text-primary focus:outline-none appearance-none">
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

              {currentStep === 2 && monitorType === "cron" && (
                <StepContainer key="step2-cron">
                  <StepHeader
                    icon={Clock}
                    title="What's the expected schedule?"
                    description="Tell us how often this job should check in, and how much slack to allow before flagging it late."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                        Expected Every
                      </label>
                      <div className="relative group">
                        <select
                          value={interval}
                          onChange={(e) => setInterval(Number(e.target.value))}
                          className="w-full h-14 bg-bg-surface border border-border-card rounded-2xl px-5 text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                        >
                          {INTERVAL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                        Grace Period
                      </label>
                      <div className="relative group">
                        <select
                          value={grace}
                          onChange={(e) => setGrace(Number(e.target.value))}
                          className="w-full h-14 bg-bg-surface border border-border-card rounded-2xl px-5 text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                        >
                          {GRACE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-brand-muted font-medium">
                    We&apos;ll flag this monitor as failing if it doesn&apos;t
                    check in within the grace period after the expected
                    interval.
                  </p>
                </StepContainer>
              )}

              {currentStep === 3 && (
                <StepContainer key="step3">
                  <StepHeader
                    icon={Bell}
                    title="Who should be notified?"
                    description="Configure where and when alerts are delivered when this monitor goes down."
                  />

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest ml-1 text-center block">
                        Notification Channels
                      </label>
                      <div className="flex flex-wrap justify-center gap-3">
                        <ChannelPillLarge
                          active={alertChannels.email}
                          label="Email"
                          icon={Mail}
                          onClick={() =>
                            setAlertChannels((p) => ({
                              ...p,
                              email: !p.email,
                            }))
                          }
                        />
                        <ChannelPillLarge
                          active={alertChannels.telegram}
                          label="Telegram"
                          icon={Send}
                          onClick={() =>
                            setAlertChannels((p) => ({
                              ...p,
                              telegram: !p.telegram,
                            }))
                          }
                        />
                        <ChannelPillLarge
                          active={false}
                          label="Slack"
                          icon={Hash}
                          disabled
                        />
                      </div>
                    </div>

                    {monitorType === "url" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-border-card">
                        <div className="space-y-4">
                          <label className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-brand-primary" />
                            Sensitivity
                          </label>
                          <div className="space-y-2">
                            <p className="text-[10px] text-brand-muted leading-relaxed">
                              Wait for multiple failures before alerting to
                              avoid noise from network blips.
                            </p>
                            <select
                              value={formData.alert_threshold}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  alert_threshold: parseInt(e.target.value),
                                }))
                              }
                              className="w-full h-11 bg-bg-surface border border-border-card rounded-xl px-4 text-xs text-text-primary focus:outline-none appearance-none"
                            >
                              <option value={1}>Alert after 1 failure</option>
                              <option value={2}>Alert after 2 failures</option>
                              <option value={3}>Alert after 3 failures</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-brand-success" />
                            Recovery
                          </label>
                          <div className="space-y-2">
                            <p className="text-[10px] text-brand-muted leading-relaxed">
                              Notify me when the endpoint is back online and
                              functional.
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  recovery_alerts: !p.recovery_alerts,
                                }))
                              }
                              className={cn(
                                "w-full h-11 rounded-xl border px-4 flex items-center justify-between text-xs font-bold transition-all",
                                formData.recovery_alerts
                                  ? "bg-brand-success/5 border-brand-success/30 text-text-primary"
                                  : "bg-bg-subtle border-border-card text-brand-muted",
                              )}
                            >
                              Send Recovery Alerts
                              {formData.recovery_alerts ? (
                                <Check className="w-4 h-4 text-brand-success" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-border-card" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </StepContainer>
              )}

              {currentStep === 4 && monitorType === "url" && (
                <StepContainer key="step4-url">
                  <StepHeader
                    icon={Zap}
                    title="Ready to deploy?"
                    description="Review your configuration before we start the monitoring engine."
                  />

                  <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-bg-surface border border-border-card space-y-8">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-text-primary tracking-tight">
                            {name}
                          </h4>
                          <p className="text-sm font-mono text-brand-muted opacity-60 truncate max-w-sm">
                            {formData.url}
                          </p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                          {formData.method}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-10">
                        <SummaryItem
                          label="Frequency"
                          value={`Every ${formData.check_interval_seconds < 60 ? `${formData.check_interval_seconds}s` : `${formData.check_interval_seconds / 60}m`}`}
                          icon={History}
                        />
                        <SummaryItem
                          label="Load"
                          value={`${requestsPerMonth} reqs/mo`}
                          icon={Cpu}
                        />
                        <SummaryItem
                          label="Alerts"
                          value={`${formData.alert_threshold} fail threshold`}
                          icon={AlertTriangle}
                        />
                        <SummaryItem
                          label="Channels"
                          value={
                            Object.entries(alertChannels)
                              .filter(([_, v]) => v)
                              .map(
                                ([k]) => k.charAt(0).toUpperCase() + k.slice(1),
                              )
                              .join(", ") || "None"
                          }
                          icon={Bell}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-brand-primary" />
                      </div>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        By clicking create, you agree to start continuous
                        monitoring for this endpoint. Alerts will be dispatched
                        immediately upon detection of downtime.
                      </p>
                    </div>
                  </div>
                </StepContainer>
              )}

              {currentStep === 4 && monitorType === "cron" && (
                <StepContainer key="step4-cron">
                  <StepHeader
                    icon={Zap}
                    title="Ready to deploy?"
                    description="Review your configuration before we start listening for check-ins."
                  />

                  <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-bg-surface border border-border-card space-y-8">
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-text-primary tracking-tight">
                          {name}
                        </h4>
                        {description && (
                          <p className="text-sm text-brand-muted opacity-70">
                            {description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-10">
                        <SummaryItem
                          label="Expected Every"
                          value={
                            INTERVAL_OPTIONS.find((o) => o.value === interval)
                              ?.label || `${interval}s`
                          }
                          icon={History}
                        />
                        <SummaryItem
                          label="Grace Period"
                          value={
                            GRACE_OPTIONS.find((o) => o.value === grace)
                              ?.label || `${grace}s`
                          }
                          icon={Clock}
                        />
                        <SummaryItem
                          label="Alerts"
                          value={
                            Object.entries(alertChannels)
                              .filter(([_, v]) => v)
                              .map(
                                ([k]) => k.charAt(0).toUpperCase() + k.slice(1),
                              )
                              .join(", ") || "None"
                          }
                          icon={Bell}
                        />
                        <SummaryItem
                          label="Tags"
                          value={tagsInput || "None"}
                          icon={Tag}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-brand-primary" />
                      </div>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        We&apos;ll generate a unique ping URL after creation —
                        add it to the end of your script to start reporting in.
                      </p>
                    </div>
                  </div>
                </StepContainer>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-bg-base/80 backdrop-blur-md border-t border-border-card flex items-center justify-center z-50">
          <div className="w-full max-w-xl flex items-center justify-between px-6">
            <button
              onClick={prevStep}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[11px] font-bold text-brand-muted hover:text-text-primary transition-all flex items-center gap-2",
                currentStep === 1 && "opacity-0 pointer-events-none",
              )}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    s.id === currentStep
                      ? "w-8 bg-brand-primary"
                      : s.id < currentStep
                        ? "w-4 bg-brand-primary/40"
                        : "w-4 bg-bg-subtle",
                  )}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={currentStep === 1 && step1Invalid}
                className="h-11 px-8 rounded-xl text-[11px] gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 px-8 rounded-xl text-[11px] gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {monitorType === "cron" ? "Create Monitor" : "Create Monitor"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewMonitorPage() {
  return (
    <Suspense fallback={<UrlMonitorWizardSkeleton />}>
      <NewMonitorWizard />
    </Suspense>
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
      <div className="w-16 h-16 rounded-3xl bg-bg-subtle border border-border-card flex items-center justify-center mx-auto shadow-2xl">
        <Icon className="w-8 h-8 text-brand-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-text-primary tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-brand-muted text-sm max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function ChannelPillLarge({
  active,
  label,
  icon: Icon,
  onClick,
  disabled,
}: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-3xl border transition-all relative overflow-hidden group",
        active
          ? "bg-brand-primary/10 border-brand-primary/30 text-text-primary"
          : "bg-bg-subtle border-border-card text-brand-muted hover:border-border-card hover:text-text-primary",
        disabled && "opacity-20 grayscale cursor-not-allowed",
      )}
    >
      <Icon
        className={cn(
          "w-8 h-8 transition-transform duration-300",
          active
            ? "text-brand-primary scale-110"
            : "text-brand-muted group-hover:scale-110",
        )}
      />
      <span className="text-xs font-bold uppercase tracking-widest">
        {label}
      </span>
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
      <div className="w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-muted" />
      </div>
      <div className="space-y-0.5">
        <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
          {label}
        </div>
        <div className="text-sm font-bold text-text-primary">{value}</div>
      </div>
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
