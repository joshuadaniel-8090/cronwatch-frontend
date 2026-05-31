"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  MessageSquare,
  Mail,
  Bell,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Zap,
  Bot,
  Settings as SettingsIcon,
  User,
  Shield,
  Calendar,
  BellOff,
  Clock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { SettingsSkeleton } from "../../src/components/shared/PageSkeleton";
import { ConfirmationModal } from "../../src/components/shared/ConfirmationModal";
import { cn, getErrorMessage } from "../../src/lib/utils";
import api from "../../src/lib/api";
import { motion, AnimatePresence } from "motion/react";

type TestStatus = "idle" | "testing" | "success" | "error";
const EASING = [0.16, 1, 0.3, 1] as [number, number, number, number];

const channels = [
  { id: "telegram" as const, label: "Telegram Messenger", desc: "Receive alerts directly in your Telegram", icon: MessageSquare, placeholder: "e.g. 84219412", inputLabel: "Chat ID", valueLabel: "Chat ID" },
  { id: "email" as const, label: "Email Delivery", desc: "Secondary address for emergency alerting", icon: Mail, placeholder: "e.g. alerts@example.com", inputLabel: "Email Address", valueLabel: "Email" },
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (email) return email[0].toUpperCase();
  return "U";
}

function formatValue(id: string, value: string): string {
  if (!value) return "";
  if (id === "telegram") return value;
  return value.length > 24 ? `${value.slice(0, 24)}...` : value;
}

export default function SettingsPage() {
  const { isLoading: authLoading } = useAuth();
  const { user, fetchUser } = useAuthStore();

  const [values, setValues] = useState<Record<string, string>>({ telegram: "", email: "" });
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({ telegram: "idle", email: "idle" });
  const [isSaving, setIsSaving] = useState(false);
  const [notifyOnRecoveryTelegram, setNotifyOnRecoveryTelegram] = useState(true);
  const [notifyOnRecoveryEmail, setNotifyOnRecoveryEmail] = useState(true);
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [initialNotify, setInitialNotify] = useState({ telegram: true, email: true });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const v = { telegram: user.telegram_chat_id || "", email: user.alert_email || user.email || "" };
      setValues(v);
      setInitialValues(v);
      setNotifyOnRecoveryTelegram(user.notify_on_recovery_telegram ?? true);
      setNotifyOnRecoveryEmail(user.notify_on_recovery_email ?? true);
      setInitialNotify({
        telegram: user.notify_on_recovery_telegram ?? true,
        email: user.notify_on_recovery_email ?? true,
      });
    }
  }, [user]);

  const hasUnsaved = useMemo(() => (
    Object.keys(values).some((k) => values[k] !== initialValues[k]) ||
    notifyOnRecoveryTelegram !== initialNotify.telegram ||
    notifyOnRecoveryEmail !== initialNotify.email
  ), [values, initialValues, notifyOnRecoveryTelegram, notifyOnRecoveryEmail, initialNotify]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("settings/alerts", {
        telegram_chat_id: values.telegram || null,
        alert_email: values.email || null,
        notify_on_recovery_telegram: notifyOnRecoveryTelegram,
        notify_on_recovery_email: notifyOnRecoveryEmail,
      });
      await fetchUser();
      toast.success("Preferences saved", { style: { background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-card)" } });
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setNotifyOnRecoveryTelegram(initialNotify.telegram);
    setNotifyOnRecoveryEmail(initialNotify.email);
  };

  const handleTest = async (channelId: string) => {
    const value = values[channelId];
    if (!value) return;
    setTestStatuses((p) => ({ ...p, [channelId]: "testing" }));
    try {
      await api.post("settings/alerts/test", {
        type: channelId,
        [channelId === "telegram" ? "chat_id" : "email"]: value,
      });
      setTestStatuses((p) => ({ ...p, [channelId]: "success" }));
      setTimeout(() => setTestStatuses((p) => ({ ...p, [channelId]: "idle" })), 3000);
    } catch {
      setTestStatuses((p) => ({ ...p, [channelId]: "error" }));
      setTimeout(() => setTestStatuses((p) => ({ ...p, [channelId]: "idle" })), 3000);
    }
  };

  const handleDeleteAccount = useCallback(() => {
    setDeleteConfirmOpen(false);
    toast.success("Account deletion request submitted. We'll follow up at your email.", {
      style: { background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-card)" },
      duration: 5000,
    });
  }, []);

  const initials = getInitials(user?.name, user?.email);
  const memberSince = user?.created_at
    ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
    : null;
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  if (authLoading) return <SettingsSkeleton />;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden font-sans selection:bg-brand-primary/20">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-bg-base relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }}
          />
          <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-primary/[0.04] rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-brand-primary/[0.02] rounded-full blur-3xl" />
        </div>

        <header className="relative z-10 h-20 md:h-24 px-6 md:px-10 flex items-center shrink-0 bg-bg-base/80 backdrop-blur-md border-b border-border-card mt-16 md:mt-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-brand-primary shadow-sm shadow-brand-primary/5 ring-1 ring-brand-primary/10">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
              <p className="text-sm text-brand-muted/70 mt-0.5">Manage your account and notification preferences.</p>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASING }}
          className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
        >
          <div className="max-w-2xl mx-auto p-6 md:p-10 space-y-12">

            {/* ── Section 1: Account Profile ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary ring-1 ring-brand-primary/15">
                  <User className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Account Profile</h2>
                  <p className="text-xs text-brand-muted/60 mt-0.5">Your identity and plan details.</p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-border-card via-border-card/50 to-transparent mb-6" />

              <ProfileCard
                initials={initials}
                displayName={displayName}
                email={user?.email}
                plan={user?.plan}
                memberSince={memberSince}
              />
            </section>

            {/* ── Section 2: Notification Channels ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary ring-1 ring-brand-primary/15">
                  <Bell className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Notification Channels</h2>
                  <p className="text-xs text-brand-muted/60 mt-0.5">Connect delivery endpoints for real-time alerting.</p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-border-card via-border-card/50 to-transparent mb-6" />

              <div className="space-y-5">
                {channels.map((ch, i) => (
                  <motion.div
                    key={ch.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: EASING }}
                  >
                    <ChannelCard
                      {...ch}
                      value={values[ch.id]}
                      onChange={(v: string) => setValues((p) => ({ ...p, [ch.id]: v }))}
                      onTest={() => handleTest(ch.id)}
                      testStatus={testStatuses[ch.id]}
                      isConfigured={ch.id === "telegram" ? !!user?.telegram_chat_id : !!user?.alert_email}
                      notifyOnRecovery={ch.id === "telegram" ? notifyOnRecoveryTelegram : notifyOnRecoveryEmail}
                      setNotifyOnRecovery={ch.id === "telegram" ? setNotifyOnRecoveryTelegram : setNotifyOnRecoveryEmail}
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── Section 3: Alert Behavior ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary ring-1 ring-brand-primary/15">
                  <Shield className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Alert Behavior</h2>
                  <p className="text-xs text-brand-muted/60 mt-0.5">Control which events trigger notifications.</p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-border-card via-border-card/50 to-transparent mb-6" />

              <AlertBehaviorCard
                notifyOnRecoveryTelegram={notifyOnRecoveryTelegram}
                setNotifyOnRecoveryTelegram={setNotifyOnRecoveryTelegram}
                notifyOnRecoveryEmail={notifyOnRecoveryEmail}
                setNotifyOnRecoveryEmail={setNotifyOnRecoveryEmail}
              />
            </section>

            {/* ── Section 4: Danger Zone ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-error/10 flex items-center justify-center text-brand-error ring-1 ring-brand-error/15">
                  <Trash2 className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Danger Zone</h2>
                  <p className="text-xs text-brand-muted/60 mt-0.5">Irreversible account actions.</p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-brand-error/20 via-brand-error/10 to-transparent mb-6" />

              <DangerCard onDelete={() => setDeleteConfirmOpen(true)} />
            </section>

          </div>

          <AnimatePresence>
            {hasUnsaved && (
              <motion.div
                initial={{ y: 80, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 80, opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASING }}
                className="sticky bottom-6 mt-8 mx-6 md:mx-auto max-w-2xl bg-bg-surface/90 backdrop-blur-xl border border-border-card rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
              >
                <div className="px-5 h-14 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary/50" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
                    </span>
                    <span className="text-sm font-medium text-text-primary">Unsaved changes</span>
                    <div className="h-4 w-px bg-border-card" />
                    <span className="text-xs text-brand-muted/60 hidden sm:block">Local changes not yet synced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleReset}
                      className="px-4 py-[7px] text-xs font-medium text-brand-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-elevated">
                      Discard
                    </button>
                    <button onClick={handleSave} disabled={isSaving}
                      className="inline-flex items-center gap-2 px-5 py-[7px] bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-brand-primary/25 disabled:opacity-50 active:scale-[0.97] hover:shadow-brand-primary/35">
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="This action cannot be undone. All monitors, alerts, and account data will be permanently deleted. Are you sure you want to proceed?"
          confirmText="Delete Account"
          cancelText="Cancel"
          type="danger"
        />
      </main>
    </div>
  );
}

/* ─── Sub-components ─── */

function ProfileCard({
  initials,
  displayName,
  email,
  plan,
  memberSince,
}: {
  initials: string;
  displayName: string;
  email?: string | null;
  plan?: string | null;
  memberSince: string | null;
}) {
  return (
    <div className="relative bg-bg-surface rounded-xl overflow-hidden border border-border-card shadow-sm transition-all hover:shadow-md hover:border-brand-primary/10 duration-300">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-primary/60 via-brand-primary/20 to-brand-primary/[0.01] pointer-events-none" />
      <div className="p-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-lg font-bold text-brand-primary ring-2 ring-brand-primary/15 shadow-sm shadow-brand-primary/5">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-success border-2 border-bg-surface" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-semibold text-text-primary">{displayName}</h3>
              {plan && plan !== "pro" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[9px] font-bold uppercase tracking-wider">
                  <Shield className="w-2.5 h-2.5" />
                  {plan}
                </span>
              )}
              {plan === "pro" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-success/10 border border-brand-success/20 text-brand-success text-[9px] font-bold uppercase tracking-wider">
                  <Check className="w-2.5 h-2.5" />
                  Pro
                </span>
              )}
            </div>
            {email && (
              <p className="text-sm text-brand-muted/70 mt-0.5">{email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-card">
          <div className="flex items-center gap-1.5 text-[11px] text-brand-muted/60">
            <Calendar className="w-3 h-3" />
            Member since {memberSince || "today"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary/10 text-[10px] font-semibold text-brand-primary shrink-0 mt-0.5 ring-1 ring-brand-primary/15">
        {n}
      </span>
      <span className="text-xs text-brand-muted leading-relaxed pt-0.5">{children}</span>
    </div>
  );
}

function Toggle({ label, description, checked, onChange, disabled }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
      disabled ? "opacity-40" : "hover:bg-bg-subtle/40",
    )}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs font-medium text-text-primary">{label}</span>
        <span className="text-[10px] text-brand-muted/60 leading-relaxed">{description}</span>
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
          checked ? "bg-brand-primary" : "bg-bg-elevated",
          disabled && "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ChannelCard({
  id,
  label,
  desc,
  icon: Icon,
  value,
  onChange,
  onTest,
  testStatus,
  isConfigured,
  placeholder,
  inputLabel,
  notifyOnRecovery,
  setNotifyOnRecovery,
}: any) {
  const [expanded, setExpanded] = useState(false);

  const setupGuide = id === "telegram" ? (
    <div className="rounded-lg border border-border-card bg-gradient-to-br from-bg-subtle/40 to-bg-subtle/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card bg-brand-primary/[0.02]">
        <Bot className="w-3.5 h-3.5 text-brand-primary" />
        <span className="text-xs font-medium text-text-primary">Setup Guide</span>
      </div>
      <div className="p-4 space-y-2.5">
        <Step n={1}>
          Open Telegram and message{" "}
          <a href="https://t.me/cron_watch_bot" target="_blank" rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-primary/80 font-medium underline underline-offset-2">
            cron_watch_bot
            <ExternalLink className="w-3 h-3 inline ml-0.5 relative -top-0.5" />
          </a>
        </Step>
        <Step n={2}>
          Send{" "}
          <code className="px-1.5 py-0.5 rounded bg-bg-surface border border-border-card text-text-primary font-mono text-[11px] font-semibold">/start</code>
          {" "}to receive your Chat ID
        </Step>
        <Step n={3}>
          Copy the Chat ID and paste it above
        </Step>
      </div>
    </div>
  ) : (
    <div className="rounded-lg border border-border-card bg-gradient-to-br from-amber-500/[0.03] to-transparent overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card">
        <span className="text-xs font-medium text-amber-500/80">Note</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-brand-muted leading-relaxed">
          Secondary address for emergency alerting. Falls back to your account email if left blank.
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative bg-bg-surface rounded-xl overflow-hidden transition-all duration-300",
        "border shadow-sm",
        expanded
          ? "border-brand-primary/15 shadow-lg shadow-brand-primary/[0.04]"
          : "border-border-card hover:shadow-md hover:border-brand-primary/10",
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-primary/60 via-brand-primary/20 to-brand-primary/[0.01] pointer-events-none" />

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all",
            isConfigured
              ? "bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 text-brand-primary shadow-sm shadow-brand-primary/5 ring-1 ring-brand-primary/10"
              : "bg-bg-subtle text-brand-muted/50 ring-1 ring-border-card",
          )}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap max-w-[200px]",
                    isConfigured
                      ? "bg-brand-success/10 text-brand-success"
                      : "bg-bg-subtle text-brand-muted/60",
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isConfigured ? "bg-brand-success" : "bg-brand-muted/40",
                    )} />
                    <span className="truncate">
                      {isConfigured && value
                        ? `Connected · ${formatValue(id, value)}`
                        : "Not configured"}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-brand-muted/60 mt-1">{desc}</p>
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-all border shrink-0",
                  expanded
                    ? "bg-bg-subtle text-text-primary border-border-card"
                    : "border-transparent text-brand-muted/40 hover:bg-bg-subtle hover:text-text-primary hover:border-border-card",
                )}
                aria-label={expanded ? `Close ${label} settings` : `Open ${label} settings`}
                aria-expanded={expanded}
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expanded && "rotate-180")} />
              </button>
            </div>

            {expanded && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-text-primary/40 uppercase tracking-widest">
                  {inputLabel}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className={cn(
                    "w-full bg-bg-subtle border rounded-lg px-3.5 py-3 text-sm text-text-primary placeholder:text-brand-muted/40 transition-all",
                    "focus:outline-none focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/[0.12]",
                    "hover:border-brand-primary/20",
                    isConfigured ? "border-brand-primary/10" : "border-border-card",
                  )}
                />
                {id === "telegram" && (
                  <p className="text-[10px] text-brand-muted/40 mt-0.5">Chat IDs are numeric — sent by the bot when you run /start</p>
                )}
                {id === "email" && (
                  <p className="text-[10px] text-brand-muted/40 mt-0.5">Leave blank to use your account email as fallback</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASING }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-card">
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-5">
                  <div className="space-y-3">{setupGuide}</div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-medium text-text-primary/40 uppercase tracking-widest">
                      Alert Events
                    </label>
                    <div className="rounded-lg border border-border-card bg-bg-subtle/20 p-1.5 space-y-0.5">
                      <Toggle
                        label="Monitor Failures"
                        description="Critical incidents and downtime"
                        checked={true}
                        disabled
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

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-xs font-medium text-brand-muted/60 hover:text-text-primary transition-colors"
                  >
                    Collapse
                  </button>
                  <button
                    onClick={onTest}
                    disabled={!value || testStatus === "testing"}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all border min-w-[112px] justify-center",
                      testStatus === "success"
                        ? "bg-brand-success/10 border-brand-success/20 text-brand-success"
                        : testStatus === "error"
                          ? "bg-brand-error/10 border-brand-error/20 text-brand-error"
                          : "bg-bg-subtle border-border-card text-brand-muted/70 hover:text-text-primary hover:bg-bg-elevated active:scale-[0.97]",
                    )}
                  >
                    {testStatus === "testing" ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing</>
                    ) : testStatus === "success" ? (
                      <><Check className="w-3.5 h-3.5" /> Delivered</>
                    ) : testStatus === "error" ? (
                      <><AlertCircle className="w-3.5 h-3.5" /> Failed</>
                    ) : (
                      <><Zap className="w-3.5 h-3.5" /> Send Test</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertBehaviorCard({
  notifyOnRecoveryTelegram,
  setNotifyOnRecoveryTelegram,
  notifyOnRecoveryEmail,
  setNotifyOnRecoveryEmail,
}: {
  notifyOnRecoveryTelegram: boolean;
  setNotifyOnRecoveryTelegram: (v: boolean) => void;
  notifyOnRecoveryEmail: boolean;
  setNotifyOnRecoveryEmail: (v: boolean) => void;
}) {
  return (
    <div className="relative bg-bg-surface rounded-xl overflow-hidden border border-border-card shadow-sm transition-all hover:shadow-md hover:border-brand-primary/10 duration-300">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-primary/60 via-brand-primary/20 to-brand-primary/[0.01] pointer-events-none" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-primary/60" />
              <span className="text-xs font-semibold text-text-primary">Telegram</span>
            </div>
            <div className="rounded-lg border border-border-card bg-bg-subtle/20 p-1.5 space-y-0.5">
              <Toggle
                label="Recovery Alerts"
                description="Notify when systems come back online"
                checked={notifyOnRecoveryTelegram}
                onChange={setNotifyOnRecoveryTelegram}
              />
              <Toggle
                label="First Failure Alert"
                description="Instant notification on initial failure"
                checked={true}
                disabled
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-primary/60" />
              <span className="text-xs font-semibold text-text-primary">Email</span>
            </div>
            <div className="rounded-lg border border-border-card bg-bg-subtle/20 p-1.5 space-y-0.5">
              <Toggle
                label="Recovery Alerts"
                description="Notify when systems come back online"
                checked={notifyOnRecoveryEmail}
                onChange={setNotifyOnRecoveryEmail}
              />
              <Toggle
                label="First Failure Alert"
                description="Instant notification on initial failure"
                checked={true}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-muted/40" />
              <span className="text-[11px] text-brand-muted/50">Digest mode (batched alerts)</span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-bg-subtle text-brand-muted/40 text-[9px] font-medium uppercase tracking-wider">
              <BellOff className="w-2.5 h-2.5" />
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerCard({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="relative bg-bg-surface rounded-xl overflow-hidden border border-brand-error/15 shadow-sm transition-all hover:shadow-md hover:border-brand-error/25 duration-300">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-error/50 via-brand-error/20 to-transparent pointer-events-none" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-semibold text-text-primary">Delete Account</h3>
            </div>
            <p className="text-xs text-brand-muted/70 mt-1 leading-relaxed">
              Permanently remove your account and all associated data. This includes your monitors, alert history, and personal information.
            </p>
          </div>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all border border-brand-error/20 bg-brand-error/5 text-brand-error hover:bg-brand-error/10 hover:border-brand-error/30 active:scale-[0.97] shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
