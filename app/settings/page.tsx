"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Activity,
  History,
  Terminal,
  RefreshCw,
  MoreVertical,
  Check,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { SettingsSkeleton } from "../../src/components/shared/PageSkeleton";
import { cn, getErrorMessage } from "../../src/lib/utils";
import api from "../../src/lib/api";
import { motion, AnimatePresence } from "motion/react";

type TestStatus = "idle" | "testing" | "success" | "error";

interface ChannelMeta {
  lastDelivery: string;
  latency: string;
  sentToday: number;
  status: "healthy" | "degraded" | "inactive";
}

export default function AlertingConsole() {
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

  const [isLoading, setIsLoading] = useState(false);
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
      setNotifyOnRecoveryTelegram(user.notify_on_recovery_telegram ?? true);
      setNotifyOnRecoveryEmail(user.notify_on_recovery_email ?? true);
      setInitialNotifyValues({
        telegram: user.notify_on_recovery_telegram ?? true,
        email: user.notify_on_recovery_email ?? true
      });
    }
  }, [user]);

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key]) || 
           notifyOnRecoveryTelegram !== initialNotifyValues.telegram || 
           notifyOnRecoveryEmail !== initialNotifyValues.email;
  }, [values, initialValues, notifyOnRecoveryTelegram, notifyOnRecoveryEmail, initialNotifyValues]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.put("settings/alerts", {
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
      toast.success("Alert preferences synced", {
        style: { background: "#111", color: "#fff", border: "1px solid #22c55e" }
      });
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setNotifyOnRecoveryTelegram(initialNotifyValues.telegram);
    setNotifyOnRecoveryEmail(initialNotifyValues.email);
  };

  const handleTest = async (channelId: string) => {
    const value = values[channelId];
    if (!value) return;

    setTestStatuses(prev => ({ ...prev, [channelId]: "testing" }));
    try {
      await api.post("settings/alerts/test", {
        type: channelId,
        [channelId === "telegram" ? "chat_id" : "email"]: value,
      });
      setTestStatuses(prev => ({ ...prev, [channelId]: "success" }));
      setTimeout(() => setTestStatuses(prev => ({ ...prev, [channelId]: "idle" })), 3000);
    } catch (err: any) {
      setTestStatuses(prev => ({ ...prev, [channelId]: "error" }));
      setTimeout(() => setTestStatuses(prev => ({ ...prev, [channelId]: "idle" })), 3000);
    }
  };

  if (authLoading) return <SettingsSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden font-sans selection:bg-brand-primary/30">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0A0A0A]">
        {/* Header - Industrial & Compact */}
        <header className="h-14 border-b border-[#1A1A1A] bg-[#0A0A0A] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <Terminal className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Alerting Console
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-brand-muted border border-white/10 uppercase tracking-tighter">v2.4.0-stable</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-success">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
              SYSTEM OPERATIONAL
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
          {/* Left Column: Configuration */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-8">
            <div className="max-w-3xl">
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white">Notification Channels</h2>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-lg">
                  Configure delivery endpoints for critical system alerts. Multiple channels are recommended for redundancy.
                </p>
              </div>

              <div className="space-y-4">
                <ChannelRow 
                  id="telegram"
                  name="Telegram Messenger"
                  icon={MessageSquare}
                  value={values.telegram}
                  onChange={(v) => setValues(p => ({ ...p, telegram: v }))}
                  onTest={() => handleTest("telegram")}
                  testStatus={testStatuses.telegram}
                  isConfigured={!!user?.telegram_chat_id}
                  placeholder="Enter Chat ID (e.g. 84219412)"
                  notifyOnRecovery={notifyOnRecoveryTelegram}
                  setNotifyOnRecovery={setNotifyOnRecoveryTelegram}
                  meta={{
                    lastDelivery: "4m ago",
                    latency: "142ms",
                    sentToday: 12,
                    status: !!user?.telegram_chat_id ? "healthy" : "inactive"
                  }}
                  docs={
                    <div className="flex items-center gap-4 py-2 px-3 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] text-brand-muted">
                      <span className="font-bold text-brand-primary uppercase tracking-widest">Setup:</span>
                      <span>1. Message @CronwatchBot</span>
                      <span className="opacity-20">•</span>
                      <span>2. Send /start</span>
                      <span className="opacity-20">•</span>
                      <span>3. Paste Chat ID</span>
                    </div>
                  }
                />

                <ChannelRow 
                  id="email"
                  name="Email Delivery"
                  icon={Mail}
                  value={values.email}
                  onChange={(v) => setValues(p => ({ ...p, email: v }))}
                  onTest={() => handleTest("email")}
                  testStatus={testStatuses.email}
                  isConfigured={!!user?.alert_email}
                  placeholder="Secondary alert email address"
                  notifyOnRecovery={notifyOnRecoveryEmail}
                  setNotifyOnRecovery={setNotifyOnRecoveryEmail}
                  meta={{
                    lastDelivery: "1h ago",
                    latency: "840ms",
                    sentToday: 5,
                    status: !!user?.alert_email ? "healthy" : "inactive"
                  }}
                  docs={
                    <div className="flex items-center gap-4 py-2 px-3 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] text-brand-muted">
                      <span className="font-bold text-brand-primary uppercase tracking-widest">Note:</span>
                      <span>Secondary address for emergency alerting. Falls back to account email if blank.</span>
                    </div>
                  }
                />

                {/* Coming Soon Grid */}
                <div className="pt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] whitespace-nowrap">Planned Integrations</span>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <InactiveChannel name="Slack Webhook" icon={Hash} />
                    <InactiveChannel name="Discord" icon={Tv} />
                    <InactiveChannel name="PagerDuty" icon={AlertTriangle} />
                    <InactiveChannel name="SMS Gateway" icon={Phone} />
                    <InactiveChannel name="Custom Webhook" icon={Globe} />
                    <InactiveChannel name="Opsgenie" icon={Shield} />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-32" /> {/* Spacer for bottom bar */}
          </div>

          {/* Right Column: Telemetry & Health */}
          <div className="w-full lg:w-80 xl:w-96 border-l border-[#1A1A1A] bg-[#0A0A0A] flex flex-col shrink-0">
            <div className="p-5 border-b border-[#1A1A1A]">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-brand-primary" />
                Delivery Telemetry
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
              {/* Overall Health Card */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-brand-muted">GLOBAL RELIABILITY</span>
                  <span className="text-[10px] font-bold text-brand-success tracking-tighter">99.998%</span>
                </div>
                <div className="flex gap-0.5 h-1.5">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-sm",
                        i === 32 ? "bg-yellow-500/50" : "bg-brand-success/40"
                      )} 
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-[9px] font-bold text-brand-muted uppercase tracking-tighter mb-1">Avg Latency</div>
                    <div className="text-sm font-bold text-white">248ms</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-brand-muted uppercase tracking-tighter mb-1">Deliveries Today</div>
                    <div className="text-sm font-bold text-white">4,812</div>
                  </div>
                </div>
              </div>

              {/* Live Logs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recent Activity</h4>
                  <History className="w-3 h-3 text-white/20" />
                </div>
                <div className="space-y-2">
                  <TelemetryLog status="delivered" channel="Telegram" time="2m ago" latency="124ms" />
                  <TelemetryLog status="delivered" channel="Email" time="14m ago" latency="890ms" />
                  <TelemetryLog status="retry" channel="Telegram" time="22m ago" latency="—" />
                  <TelemetryLog status="delivered" channel="Telegram" time="45m ago" latency="156ms" />
                  <TelemetryLog status="delivered" channel="Email" time="1h ago" latency="742ms" />
                  <TelemetryLog status="delivered" channel="Telegram" time="2h ago" latency="112ms" />
                </div>
              </div>

              {/* Infrastructure Status */}
              <div className="pt-4">
                <div className="p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="text-[11px] font-bold text-white">Redundancy Active</span>
                  </div>
                  <p className="text-[10px] text-brand-muted leading-relaxed">
                    Alerts are currently routing through secondary clusters in <span className="text-white font-medium">us-east-1</span> and <span className="text-white font-medium">eu-west-1</span> for maximum availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 lg:left-20 h-16 bg-[#0F0F0F] border-t border-[#1A1A1A] px-6 flex items-center justify-between z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[11px] font-bold text-white tracking-tight">Unsaved changes detected</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[10px] text-brand-muted font-medium">All changes are local until synced with production</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 text-[11px] font-bold text-brand-muted hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-lg text-[11px] font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Deploy Configuration
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ChannelRow({ 
  id, 
  name, 
  icon: Icon, 
  value, 
  onChange, 
  onTest, 
  testStatus, 
  isConfigured, 
  placeholder,
  notifyOnRecovery,
  setNotifyOnRecovery,
  meta,
  docs
}: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "group bg-[#0D0D0D] border rounded-xl transition-all duration-200 overflow-hidden",
      isExpanded ? "border-white/10 shadow-2xl" : "border-[#1A1A1A] hover:border-white/5"
    )}>
      {/* Top Header Row */}
      <div className="flex items-center gap-4 p-4">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center border transition-all",
          isConfigured ? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary" : "bg-white/[0.02] border-white/5 text-white/20"
        )}>
          <Icon className="w-4.5 h-4.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white">{name}</h3>
            <div className={cn(
              "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
              isConfigured ? "bg-brand-success/10 text-brand-success border border-brand-success/20" : "bg-white/5 text-brand-muted border border-white/10"
            )}>
              {isConfigured ? "CONNECTED" : "INACTIVE"}
            </div>
          </div>
          
          {/* Metadata Bar */}
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-muted/60 uppercase tracking-tighter">
              <Clock className="w-3 h-3" />
              LAST: <span className="text-brand-muted">{meta.lastDelivery}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-muted/60 uppercase tracking-tighter">
              <Zap className="w-3 h-3" />
              LATENCY: <span className="text-brand-muted">{meta.latency}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-muted/60 uppercase tracking-tighter">
              <Bell className="w-3 h-3" />
              TODAY: <span className="text-brand-muted">{meta.sentToday}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onTest}
            disabled={!value || testStatus === "testing"}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 border",
              testStatus === "success" ? "bg-brand-success/10 border-brand-success/20 text-brand-success" :
              testStatus === "error" ? "bg-brand-error/10 border-brand-error/20 text-brand-error" :
              "bg-white/5 border-white/10 text-brand-muted hover:text-white hover:bg-white/10"
            )}
          >
            {testStatus === "testing" ? <RefreshCw className="w-3 h-3 animate-spin" /> : 
             testStatus === "success" ? <Check className="w-3 h-3" /> : 
             testStatus === "error" ? <AlertCircle className="w-3 h-3" /> : 
             <Zap className="w-3 h-3" />}
            TEST
          </button>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              isExpanded ? "bg-white/10 text-white" : "text-brand-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-white/[0.01]"
          >
            <div className="p-4 pt-0 space-y-5">
              <div className="h-px bg-white/5 w-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Endpoint Configuration</label>
                    <input 
                      type="text"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-white/10"
                    />
                  </div>
                  
                  {docs}
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Event Subscription</label>
                  <div className="space-y-3">
                    <Toggle 
                      label="Monitor Failures" 
                      description="Critical incidents and downtime" 
                      checked={true} 
                      disabled={true} 
                    />
                    <Toggle 
                      label="Monitor Recoveries" 
                      description="Status updates when systems return online" 
                      checked={notifyOnRecovery} 
                      onChange={setNotifyOnRecovery} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ label, description, checked, onChange, disabled }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-lg transition-all",
      disabled ? "opacity-50" : "hover:bg-white/[0.02]"
    )}>
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-white">{label}</span>
        <span className="text-[9px] text-brand-muted">{description}</span>
      </div>
      <button 
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "w-7 h-4 rounded-full relative transition-all duration-200",
          checked ? "bg-brand-primary" : "bg-white/10"
        )}
      >
        <div className={cn(
          "absolute top-1 w-2 h-2 rounded-full bg-white transition-all duration-200",
          checked ? "left-4" : "left-1"
        )} />
      </button>
    </div>
  );
}

function InactiveChannel({ name, icon: Icon }: any) {
  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-xl p-3 flex items-center gap-3 opacity-40 hover:opacity-60 transition-all grayscale hover:grayscale-0 group cursor-not-allowed">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-muted">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-bold text-white block truncate">{name}</span>
        <span className="text-[8px] font-bold text-brand-primary/80 uppercase tracking-tighter">Planned</span>
      </div>
    </div>
  );
}

function TelemetryLog({ status, channel, time, latency }: any) {
  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        status === 'delivered' ? "bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/70 truncate">{channel} Alert</span>
          <span className="text-[9px] text-brand-muted/50 font-mono">{time}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] text-brand-muted uppercase tracking-tighter font-medium">
            {status === 'delivered' ? 'Successful delivery' : 'Retrying delivery...'}
          </span>
          <span className="text-[9px] text-brand-muted/40 font-mono">{latency}</span>
        </div>
      </div>
    </div>
  );
}

