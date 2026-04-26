"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, Loader2 } from "lucide-react";
import { useAuth } from "../../../src/hooks/useAuth";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { INTERVAL_OPTIONS, GRACE_OPTIONS, getErrorMessage } from "../../../src/lib/utils";
import api from "../../../src/lib/api";

export default function NewMonitorPage() {
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [interval, setInterval] = useState(3600);
  const [grace, setGrace] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/monitors", {
        name,
        interval_seconds: interval,
        grace_seconds: grace,
      });
      router.push(`/monitors/${response.data.id}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border-card bg-bg-surface px-8 flex items-center shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-white mr-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold text-white">Create Monitor</h1>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">New Monitor</h2>
              <p className="text-brand-muted text-sm mt-1">
                Configure how we should expect pings from your task.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-bg-surface border border-border-card rounded-xl p-6 lg:p-8 space-y-6 shadow-xl">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Monitor Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. Database Backup"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-text-muted">Expected Interval</label>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-brand-muted cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-[10px] text-gray-400 rounded border border-border-card opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        How often the task is supposed to run.
                      </div>
                    </div>
                  </div>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors appearance-none"
                  >
                    {INTERVAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-text-muted">Grace Period</label>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-brand-muted cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-[10px] text-gray-400 rounded border border-border-card opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Extra time we wait before sending an alert.
                      </div>
                    </div>
                  </div>
                  <select
                    value={grace}
                    onChange={(e) => setGrace(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors appearance-none"
                  >
                    {GRACE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="text-brand-error text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Monitor"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
