"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Mail, Bell, Loader2, Send } from "lucide-react";
import { useAuth } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { LoadingSpinner } from "../../src/components/shared/LoadingSpinner";
import { cn } from "../../src/lib/utils";
import api from "../../src/lib/api";

export default function SettingsPage() {
  const { isLoading: authLoading } = useAuth();
  const { user } = useAuthStore();
  const [telegramId, setTelegramId] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setTelegramId(user.telegram_chat_id || "");
      setAlertEmail(user.alert_email || user.email);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/settings/alerts", {
        telegram_chat_id: telegramId || null,
        alert_email: alertEmail,
      });
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to save settings." });
    } finally {
      setIsLoading(false);
    }
  };

  const testTelegram = async () => {
    setIsTesting(true);
    try {
      await api.post("/settings/alerts/test", { channel: "telegram" });
      alert("Test alert sent to Telegram!");
    } catch (err) {
      alert("Failed to send test alert. Make sure your Chat ID is correct and you started the bot.");
    } finally {
      setIsTesting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-bg-base flex"><Sidebar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border-card bg-bg-surface px-8 flex items-center shrink-0">
          <h1 className="text-lg font-semibold text-white">Alert Settings</h1>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">Notification Channels</h2>
              <p className="text-brand-muted text-sm mt-1">
                Choose how you want to be notified when a monitor fails.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              {/* Telegram Card */}
              <div className="bg-bg-surface border border-border-card rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-border-card flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0088cc]/10 flex items-center justify-center rounded-lg text-[#0088cc]">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Telegram Alerts</h3>
                    <p className="text-xs text-brand-muted">Real-time instant notifications.</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-bg-base p-4 rounded-xl border border-border-card space-y-3">
                    <h4 className="text-sm font-semibold text-gray-300">Setup Instructions:</h4>
                    <ol className="text-xs text-brand-muted space-y-2 list-decimal list-inside">
                      <li>Open Telegram and search for <span className="text-brand-primary">@CronwatchBot</span></li>
                      <li>Send <span className="text-brand-primary font-mono">/start</span> to the bot</li>
                      <li>Copy your <span className="text-brand-primary font-mono">Chat ID</span> from the reply</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Your Telegram Chat ID</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors"
                        placeholder="e.g. 123456789"
                      />
                      <button
                        type="button"
                        onClick={testTelegram}
                        disabled={!telegramId || isTesting}
                        className="px-4 py-2 bg-border-card hover:bg-[#3A3A3A] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-bg-surface border border-border-card rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-border-card flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/10 flex items-center justify-center rounded-lg text-brand-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Email Notification</h3>
                    <p className="text-xs text-brand-muted">We&apos;ll email you the moment pings stop.</p>
                  </div>
                </div>
                <div className="p-6">
                  <label className="block text-sm font-medium text-text-muted mb-2">Alert Email Address</label>
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="alerts@company.com"
                  />
                </div>
              </div>

              {message.text && (
                <div className={cn("p-4 rounded-lg text-sm", message.type === "success" ? "bg-brand-success/10 text-brand-success" : "bg-brand-error/10 text-brand-error")}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
                Save My Alert Preferences
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
