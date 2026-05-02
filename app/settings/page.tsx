"use client";

import React, { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Mail, 
  Hash, 
  AlertTriangle, 
  Tv, 
  Phone, 
  Bell, 
  Send, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  ChevronDown,
  Save,
  Zap,
  Globe,
  Users,
  Shield,
  Clock,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { SettingsSkeleton } from "../../src/components/shared/PageSkeleton";
import { Skeleton } from "../../src/components/shared/Skeleton";
import { cn, getErrorMessage } from "../../src/lib/utils";
import api from "../../src/lib/api";
import { motion, AnimatePresence } from "motion/react";

type TestStatus = "idle" | "testing" | "success" | "error";

interface ChannelConfig {
  id: "telegram" | "email" | "slack" | "pagerduty" | "discord" | "sms";
  name: string;
  icon: any;
  color: string;
  placeholder: string;
  active: boolean;
  type: string;
  docs?: React.ReactNode;
}

const CHANNELS: ChannelConfig[] = [
  { 
    id: "telegram", 
    name: "Telegram", 
    icon: MessageSquare, 
    color: "#0088cc", 
    placeholder: "Enter Chat ID", 
    active: true, 
    type: "Chat ID",
    docs: (
      <div className="space-y-2">
        <p>1. Open Telegram and search for <span className="text-brand-primary">@CronwatchBot</span></p>
        <p>2. Send <span className="text-brand-primary font-mono">/start</span> to the bot</p>
        <p>3. Copy your <span className="text-brand-primary font-mono">Chat ID</span> from the reply and paste it here.</p>
      </div>
    )
  },
  { 
    id: "email", 
    name: "Email", 
    icon: Mail, 
    color: "#7C3AED", 
    placeholder: "Enter Email Address", 
    active: true, 
    type: "Email Address",
    docs: (
      <p>Configure the secondary email address where you want to receive alerts. If left empty, we will use your account email.</p>
    )
  },
  { 
    id: "slack", 
    name: "Slack", 
    icon: Hash, 
    color: "#E8A400", 
    placeholder: "Webhook URL", 
    active: false, 
    type: "Coming Soon",
    docs: (
      <div className="space-y-2">
        <p>1. Create a Slack App in your workspace.</p>
        <p>2. Enable <span className="font-bold">Incoming Webhooks</span>.</p>
        <p>3. Add a new Webhook to a channel and copy the URL.</p>
      </div>
    )
  },
  { 
    id: "pagerduty", 
    name: "PagerDuty", 
    icon: AlertTriangle, 
    color: "#06D6A0", 
    placeholder: "Integration Key", 
    active: false, 
    type: "Coming Soon",
    docs: (
      <p>Go to Service &gt; Integrations in PagerDuty and add a <span className="font-bold">Events API v2</span> integration.</p>
    )
  },
  { 
    id: "discord", 
    name: "Discord", 
    icon: Tv, 
    color: "#5865F2", 
    placeholder: "Webhook URL", 
    active: false, 
    type: "Coming Soon",
    docs: (
      <p>In Discord channel settings, go to <span className="font-bold">Integrations &gt; Webhooks</span> and create a new Webhook URL.</p>
    )
  },
  { 
    id: "sms", 
    name: "SMS", 
    icon: Phone, 
    color: "#6B7280", 
    placeholder: "Phone Number", 
    active: false, 
    type: "Coming Soon",
    docs: (
      <p>Enter your phone number in E.164 format (e.g., +1234567890). Note: SMS alerts may incur additional costs.</p>
    )
  },
];

export default function SettingsPage() {
  const { isLoading: authLoading } = useAuth();
  const { user, fetchUser } = useAuthStore();
  
  const [values, setValues] = useState<Record<string, string>>({
    telegram: "",
    email: "",
    slack: "",
    pagerduty: "",
    discord: "",
    sms: "",
  });
  
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({
    telegram: "idle",
    email: "idle",
  });

  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usePrimaryEmail, setUsePrimaryEmail] = useState(false);
  const [notifyOnRecoveryTelegram, setNotifyOnRecoveryTelegram] = useState(true);
  const [notifyOnRecoveryEmail, setNotifyOnRecoveryEmail] = useState(true);
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [initialNotifyValues, setInitialNotifyValues] = useState({ telegram: true, email: true });

  useEffect(() => {
    if (user) {
      const loadedValues = {
        telegram: user.telegram_chat_id || "",
        email: user.alert_email || user.email || "",
        slack: (user as any).slack_webhook || "",
        pagerduty: (user as any).pagerduty_key || "",
        discord: (user as any).discord_webhook || "",
        sms: (user as any).phone_number || "",
      };
      setValues(loadedValues);
      setInitialValues(loadedValues);
      setUsePrimaryEmail(user.alert_email === user.email || !user.alert_email);
      setNotifyOnRecoveryTelegram(user.notify_on_recovery_telegram ?? true);
      setNotifyOnRecoveryEmail(user.notify_on_recovery_email ?? true);
      setInitialNotifyValues({
        telegram: user.notify_on_recovery_telegram ?? true,
        email: user.notify_on_recovery_email ?? true
      });
    }
  }, [user]);

  const hasUnsavedChanges = Object.keys(values).some(key => values[key] !== initialValues[key]) || 
                            notifyOnRecoveryTelegram !== initialNotifyValues.telegram || 
                            notifyOnRecoveryEmail !== initialNotifyValues.email;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.put("/settings/alerts", {
        telegram_chat_id: values.telegram || null,
        alert_email: values.email || null,
        slack_webhook: values.slack || null,
        pagerduty_key: values.pagerduty || null,
        discord_webhook: values.discord || null,
        phone_number: values.sms || null,
        notify_on_recovery_telegram: notifyOnRecoveryTelegram,
        notify_on_recovery_email: notifyOnRecoveryEmail,
      });
      await fetchUser();
      toast.success("Preferences saved", {
        style: {
          background: "#111",
          color: "#fff",
          borderLeft: "4px solid #7C3AED"
        },
        position: "bottom-right"
      });
    } catch (err: any) {
      toast.error(getErrorMessage(err), {
        style: {
          background: "#111",
          color: "#fff",
          borderLeft: "4px solid #ef4444"
        },
        position: "bottom-right"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (channelId: string) => {
    const value = values[channelId];
    if (!value) return;

    setTestStatuses(prev => ({ ...prev, [channelId]: "testing" }));
    
    try {
      await api.post("/settings/alerts/test", {
        type: channelId,
        [channelId === "telegram" ? "chat_id" : "email"]: value,
      });
      setTestStatuses(prev => ({ ...prev, [channelId]: "success" }));
      toast.success("Test alert sent!", {
        style: {
          background: "#111",
          color: "#fff",
          borderLeft: "4px solid #22c55e"
        },
        position: "bottom-right"
      });
      setTimeout(() => setTestStatuses(prev => ({ ...prev, [channelId]: "idle" })), 3000);
    } catch (err: any) {
      setTestStatuses(prev => ({ ...prev, [channelId]: "error" }));
      toast.error("Failed to send test alert", {
        style: {
          background: "#111",
          color: "#fff",
          borderLeft: "4px solid #ef4444"
        },
        position: "bottom-right"
      });
      setTimeout(() => setTestStatuses(prev => ({ ...prev, [channelId]: "idle" })), 3000);
    }
  };

  const handleTestAll = async () => {
    const activeChannels = ["telegram", "email"].filter(id => !!values[id]);
    if (activeChannels.length === 0) {
      toast.error("No configured channels to test");
      return;
    }

    toast.loading("Testing all active channels...", { duration: 2000 });
    for (const channelId of activeChannels) {
      handleTest(channelId);
    }
  };

  const isConfigured = (id: string) => {
    if (id === "telegram") return !!user?.telegram_chat_id;
    if (id === "email") return !!user?.alert_email;
    return false;
  };

  const activeCount = ["telegram", "email"].filter(id => isConfigured(id)).length;

  if (authLoading) return <SettingsSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-border-card bg-bg-surface px-4 md:px-8 flex items-center shrink-0 mt-16 md:mt-0">
          <h1 className="text-base md:text-lg font-semibold text-white">Alert Settings</h1>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Notification Channels
              </h2>
              <p className="text-brand-muted text-sm md:text-base mt-2">
                Configure where you want to receive alerts when a monitor fails.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Left Column: Configured Channels */}
              <div className="w-full lg:w-[65%] space-y-8 md:space-y-10 group">
                <div className="grid gap-6">
                  {/* Telegram Card */}
                  <div className="bg-bg-surface border border-border-card rounded-2xl overflow-hidden shadow-xl hover:border-white/10 transition-all duration-300">
                    <div className="p-4 md:p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0088cc]/10 flex items-center justify-center rounded-xl text-[#0088cc] shadow-inner">
                          <MessageSquare className="w-5 md:w-6 h-5 md:h-6" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-white">Telegram</h3>
                          <p className="text-[10px] md:text-xs text-brand-muted mt-0.5">Instant alerts via Cronwatch Bot</p>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider",
                        isConfigured("telegram") ? "bg-brand-success/10 text-brand-success" : "bg-neutral-800 text-brand-muted"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isConfigured("telegram") ? "bg-brand-success" : "bg-brand-muted")} />
                        {isConfigured("telegram") ? "Connected" : "Setup"}
                      </div>
                    </div>
                    
                    <div className="h-px bg-border-card mx-6" />
                    
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-3 opacity-60">
                          Telegram Chat ID
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted opacity-50" />
                          <input
                            type="text"
                            value={values.telegram}
                            onChange={(e) => setValues(prev => ({ ...prev, telegram: e.target.value }))}
                            className="w-full pl-11 pr-4 py-3 bg-bg-base/60 border border-border-card rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-white/40"
                            placeholder="e.g. 123456789"
                          />
                        </div>

                        {isConfigured("telegram") && (
                          <label className="flex items-center gap-3 cursor-pointer group/rc py-1">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all",
                              notifyOnRecoveryTelegram ? "bg-brand-primary border-brand-primary shadow-sm shadow-brand-primary/40" : "border-border-card bg-bg-base/60"
                            )}>
                              {notifyOnRecoveryTelegram && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={4} />}
                              <input 
                                type="checkbox" 
                                checked={notifyOnRecoveryTelegram}
                                onChange={(e) => setNotifyOnRecoveryTelegram(e.target.checked)}
                                className="sr-only"
                              />
                            </div>
                            <span className="text-[11px] text-brand-muted group-hover/rc:text-white transition-colors">Also notify me when a monitor recovers</span>
                          </label>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setExpandedChannel(expandedChannel === "telegram" ? null : "telegram")}
                          className="flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-white transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Setup Instructions</span>
                          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", expandedChannel === "telegram" && "rotate-180")} />
                        </button>

                        <button
                          type="button"
                          disabled={!values.telegram || testStatuses.telegram === "testing"}
                          onClick={() => handleTest("telegram")}
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap",
                            testStatuses.telegram === "success" 
                              ? "bg-brand-success/20 border-brand-success text-brand-success" 
                              : testStatuses.telegram === "error"
                              ? "bg-brand-error/20 border-brand-error text-brand-error"
                              : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-40"
                          )}
                        >
                          {testStatuses.telegram === "testing" ? (
                            <Skeleton circle className="w-3.5 h-3.5 bg-white/20" />
                          ) : testStatuses.telegram === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : testStatuses.telegram === "error" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {testStatuses.telegram === "success" ? "Sent!" : testStatuses.telegram === "error" ? "Failed" : "Test Channel"}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedChannel === "telegram" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { step: 1, text: "Search @CronwatchBot on Telegram" },
                                { step: 2, text: "Send /start to the bot" },
                                { step: 3, text: "Copy Chat ID from reply" }
                              ].map((step) => (
                                <div key={step.step} className="p-3 bg-bg-base/40 border border-border-card rounded-xl flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-md bg-brand-primary/20 text-brand-primary text-[10px] flex items-center justify-center font-black shrink-0 relative top-0.5">
                                    {step.step}
                                  </div>
                                  <p className="text-[11px] text-brand-muted leading-tight">{step.text}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="bg-bg-surface border border-border-card rounded-2xl overflow-hidden shadow-xl hover:border-white/10 transition-all duration-300">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 flex items-center justify-center rounded-xl text-brand-primary shadow-inner">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Email alerts</h3>
                          <p className="text-xs text-brand-muted mt-0.5">Traditional inbox notifications</p>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        isConfigured("email") ? "bg-brand-success/10 text-brand-success" : "bg-neutral-800 text-brand-muted"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isConfigured("email") ? "bg-brand-success" : "bg-brand-muted")} />
                        {isConfigured("email") ? "Connected" : "Not configured"}
                      </div>
                    </div>
                    
                    <div className="h-px bg-border-card mx-6" />
                    
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-white uppercase tracking-widest opacity-60">
                            Alert Email Address
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group/cb">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all",
                              usePrimaryEmail ? "bg-brand-primary border-brand-primary shadow-sm shadow-brand-primary/40" : "border-border-card bg-bg-base/60"
                            )}>
                              {usePrimaryEmail && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={4} />}
                              <input 
                                type="checkbox" 
                                checked={usePrimaryEmail}
                                onChange={(e) => {
                                  setUsePrimaryEmail(e.target.checked);
                                  if (e.target.checked && user?.email) {
                                    setValues(prev => ({ ...prev, email: user.email }));
                                  }
                                }}
                                className="sr-only"
                              />
                            </div>
                            <span className="text-[11px] text-brand-muted group-hover/cb:text-white transition-colors">Use primary mail</span>
                          </label>
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted opacity-50" />
                          <input
                            type="email"
                            disabled={usePrimaryEmail}
                            value={values.email}
                            onChange={(e) => setValues(prev => ({ ...prev, email: e.target.value }))}
                            className={cn(
                              "w-full pl-11 pr-4 py-3 bg-bg-base/60 border border-border-card rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-white/40",
                              usePrimaryEmail && "opacity-50 cursor-not-allowed border-dashed"
                            )}
                            placeholder="alerts@company.com"
                          />
                        </div>

                        {isConfigured("email") && (
                          <label className="flex items-center gap-3 cursor-pointer group/rc py-1">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all",
                              notifyOnRecoveryEmail ? "bg-brand-primary border-brand-primary shadow-sm shadow-brand-primary/40" : "border-border-card bg-bg-base/60"
                            )}>
                              {notifyOnRecoveryEmail && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={4} />}
                              <input 
                                type="checkbox" 
                                checked={notifyOnRecoveryEmail}
                                onChange={(e) => setNotifyOnRecoveryEmail(e.target.checked)}
                                className="sr-only"
                              />
                            </div>
                            <span className="text-[11px] text-brand-muted group-hover/rc:text-white transition-colors">Also notify me when a monitor recovers</span>
                          </label>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-brand-muted italic">Configure a secondary email for emergency alerts.</p>
                        
                        <button
                          type="button"
                          disabled={!values.email || testStatuses.email === "testing"}
                          onClick={() => handleTest("email")}
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap",
                            testStatuses.email === "success" 
                              ? "bg-brand-success/20 border-brand-success text-brand-success" 
                              : testStatuses.email === "error"
                              ? "bg-brand-error/20 border-brand-error text-brand-error"
                              : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-40"
                          )}
                        >
                          {testStatuses.email === "testing" ? (
                            <Skeleton circle className="w-3.5 h-3.5 bg-white/20" />
                          ) : testStatuses.email === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : testStatuses.email === "error" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {testStatuses.email === "success" ? "Sent!" : testStatuses.email === "error" ? "Failed" : "Test Email"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isLoading}
                      className={cn(
                        "flex-1 h-10 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 text-xs",
                        hasUnsavedChanges && "ring-2 ring-brand-primary ring-offset-4 ring-offset-bg-base"
                      )}
                    >
                      {isLoading ? (
                        <Skeleton circle className="w-5 h-5 bg-white/20" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                      {isLoading ? "Saving..." : "Save Notification Preferences"}
                    </button>
                    {hasUnsavedChanges && (
                      <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce shadow-[0_0_10px_#7C3AED]" title="Unsaved changes" />
                    )}
                  </div>
                </div>

                {/* Coming Soon Section */}
                <div className="pt-10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-40 mb-6 flex items-center gap-3">
                    More channels coming soon
                    <div className="h-px bg-white/5 flex-1" />
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[
                      { name: "Slack", icon: Hash, color: "#E8A400" },
                      { name: "Discord", icon: Tv, color: "#5865F2" },
                      { name: "PagerDuty", icon: AlertTriangle, color: "#06D6A0" },
                      { name: "SMS", icon: Phone, color: "#6B7280" },
                      { name: "Webhook", icon: Globe, color: "#fb7185" },
                      { name: "MS Teams", icon: Users, color: "#6264A7" }
                    ].map((c) => (
                      <div key={c.name} className="relative group/soon bg-bg-surface/40 border border-border-card rounded-xl p-4 opacity-50 overflow-hidden">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/5 shadow-inner"
                            style={{ color: c.color }}
                          >
                            <c.icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-white block truncate">{c.name}</span>
                            <span className="text-[10px] text-brand-muted font-bold uppercase tracking-tighter">Soon</span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Shield className="w-3.5 h-3.5 text-brand-muted opacity-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Summary Panel */}
              <div className="w-full lg:w-[35%] lg:sticky lg:top-8 space-y-6">
                <div className="bg-bg-surface border border-border-card rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-[#6D31D1]" />
                  
                  <div className="p-6">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest opacity-60 mb-8">Alerting Summary</h3>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <div className="text-5xl font-black text-brand-success drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">{activeCount}</div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase tracking-tight">Active Channels</div>
                        <div className="text-xs text-brand-muted">Fully configured and live</div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {[
                        { id: "telegram", name: "Telegram Bot", icon: MessageSquare, color: "#0088cc" },
                        { id: "email", name: "Email Address", icon: Mail, color: "#7C3AED" }
                      ].map(c => {
                        const active = isConfigured(c.id);
                        return (
                          <div key={c.id} className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                            active ? "bg-white/[0.03] border-brand-success/20" : "bg-bg-base/30 border-border-card opacity-40"
                          )}>
                            <div className="flex items-center gap-3">
                              <c.icon className="w-4 h-4" style={{ color: active ? c.color : 'inherit' }} />
                              <span className="text-xs font-bold text-white">{c.name}</span>
                            </div>
                            {active ? (
                              <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_8px_#22c55e]" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-neutral-700" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleTestAll}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/testall"
                    >
                      <Zap className="w-4 h-4 text-brand-primary group-hover/testall:scale-125 transition-transform" />
                      Test All Channels
                    </button>
                  </div>
                  
                  <div className="p-6 bg-white/[0.02] border-t border-border-card">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-brand-muted leading-relaxed">
                        Alert notifications are delivered with <span className="text-white font-bold tracking-tight">less than 2s latency</span> globally. 
                        Enable more channels to ensure maximum coverage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-brand-primary/10 to-transparent border border-brand-primary/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 bg-brand-primary/20 rounded-lg text-brand-primary">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-white">Need custom alerts?</span>
                  </div>
                  <p className="text-[11px] text-brand-muted leading-relaxed mb-4">
                    Our API supports custom webhook integration for internal tools. Contact our support team for early access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

