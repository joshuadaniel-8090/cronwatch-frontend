"use client";

import React, { useState } from "react";
import { X, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { INTERVAL_OPTIONS, GRACE_OPTIONS } from "../../lib/utils";
import api from "../../lib/api";

interface NewMonitorSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMonitor: any) => void;
}

export const NewMonitorSlideOver: React.FC<NewMonitorSlideOverProps> = ({ isOpen, onClose, onSuccess }) => {
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
      onSuccess(response.data);
      setName("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create monitor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-[#1F1F1F] shadow-2xl z-[70] flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#1F1F1F] shrink-0">
              <h2 className="text-lg font-bold text-white tracking-tight">Create New Monitor</h2>
              <button 
                onClick={onClose}
                className="p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <p className="text-brand-muted text-sm leading-relaxed">
                  Set up a new heartbeat monitor. We&apos;ll notify you if your backup, script, or cron job fails to report in within the expected interval.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5] mb-2">Monitor Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-700"
                    placeholder="e.g. Daily Database Backup"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium text-[#F5F5F5]">Expected Interval</label>
                      <div className="group relative">
                        <Info className="w-3.5 h-3.5 text-brand-muted cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-[10px] text-gray-400 rounded border border-[#1F1F1F] opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                          How often the task is supposed to run.
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        value={interval}
                        onChange={(e) => setInterval(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-white focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                      >
                        {INTERVAL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
                        <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>↓</motion.div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium text-[#F5F5F5]">Grace Period</label>
                      <div className="group relative">
                        <Info className="w-3.5 h-3.5 text-brand-muted cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-[10px] text-gray-400 rounded border border-[#1F1F1F] opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                          Extra time we wait before sending an alert.
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        value={grace}
                        onChange={(e) => setGrace(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-white focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                      >
                        {GRACE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
                        <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>↓</motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-brand-error/10 border border-brand-error/20 rounded-lg text-brand-error text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-[#1F1F1F] border border-[#2F2F2F] hover:bg-[#2F2F2F] text-white rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Monitor"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
