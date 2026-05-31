"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { INTERVAL_OPTIONS, GRACE_OPTIONS, cn, getErrorMessage, PLAN_LIMITS } from "../../lib/utils";
import api from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";
import { Monitor } from "../../types";

interface MonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMonitor: any) => void;
  editingMonitor?: Monitor | null;
  currentCount: number;
}

export const NewMonitorSlideOver: React.FC<MonitorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingMonitor,
  currentCount
}) => {
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [interval, setInterval] = useState(3600);
  const [grace, setGrace] = useState(300);
  const [alertChannel, setAlertChannel] = useState<"telegram" | "email" | "both">("email");
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingMonitor) {
      setName(editingMonitor.name);
      setDescription(editingMonitor.description || "");
      setInterval(editingMonitor.interval_seconds);
      setGrace(editingMonitor.grace_seconds);
      setAlertChannel(editingMonitor.alert_channel || "email");
      setTagsInput(editingMonitor.tags?.join(", ") || "");
    } else {
      setName("");
      setDescription("");
      setInterval(3600);
      setGrace(300);
      setAlertChannel("email");
      setTagsInput("");
    }
    setErrors({});
  }, [editingMonitor, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!editingMonitor && user?.plan === "free" && currentCount >= PLAN_LIMITS.free) {
      toast.error(`Monitor limit reached. Free plan is limited to ${PLAN_LIMITS.free} monitors.`, {
        icon: "🛡️",
        style: {
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          borderLeft: "4px solid #ef4444"
        }
      });
      return;
    }

    setIsLoading(true);

    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const payload: any = {
      name: name.trim(),
      interval_seconds: interval,
      grace_seconds: grace,
    };

    if (description.trim()) payload.description = description.trim();
    if (alertChannel) payload.alert_channel = alertChannel;
    if (tags.length > 0) payload.tags = tags;

    try {
      let response;
      if (editingMonitor) {
        response = await api.put(`monitors/${editingMonitor.id}`, payload);
        toast.success("Monitor updated successfully");
      } else {
        response = await api.post("monitors", payload);
        toast.success("Monitor created successfully");
      }
      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-[520px] bg-bg-base border border-border-card rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] z-[70] flex flex-col overflow-hidden"
          >
            <div className="h-14 flex items-center justify-between px-6 border-b border-border-card shrink-0 font-sans">
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                {editingMonitor ? "Edit Monitor" : "Create New Monitor"}
              </h2>
              <button 
                onClick={onClose}
                className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar font-sans">
              <form id="monitor-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    className={cn(
                      "w-full h-11 px-4 bg-bg-surface border rounded-lg text-[13px] text-text-primary focus:outline-none transition-all placeholder:text-zinc-700",
                      errors.name ? "border-red-500/50" : "border-border-card focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                    )}
                    placeholder="e.g. Production API Heartbeat"
                  />
                  {errors.name && <p className="text-red-400 text-[10px] ml-1">{errors.name}</p>}
                </div>

                {/* URL placeholder hint for Cronwatch app context */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Monitor URL</label>
                  <div className="w-full h-11 px-4 bg-bg-base border border-border-card rounded-lg text-[13px] text-text-muted flex items-center cursor-not-allowed">
                    Unique endpoint generated after creation
                  </div>
                </div>

                {/* Interval & Grace Inline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Interval</label>
                    <select
                      value={interval}
                      onChange={(e) => setInterval(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-bg-surface border border-border-card rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer appearance-none"
                    >
                      {INTERVAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Grace Period</label>
                    <select
                      value={grace}
                      onChange={(e) => setGrace(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-bg-surface border border-border-card rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer appearance-none"
                    >
                      {GRACE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alert Channels - Segmented style checkboxes/labels */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Alert Channels</label>
                  <div className="flex flex-col gap-2">
                    {["email", "telegram", "both"].map((channel) => (
                      <label 
                        key={channel}
                        className={cn(
                          "flex items-center justify-between h-11 px-4 rounded-lg border cursor-pointer transition-all",
                          alertChannel === channel 
                            ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-400" 
                            : "bg-bg-surface border-border-card text-text-muted hover:bg-bg-subtle"
                        )}
                      >
                        <span className="text-[13px] font-medium capitalize">{channel}</span>
                        <input 
                          type="radio" 
                          name="alertChannel"
                          checked={alertChannel === channel}
                          onChange={() => setAlertChannel(channel as any)}
                          className="hidden"
                        />
                        <div className={cn(
                          "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors",
                          alertChannel === channel ? "border-indigo-500 bg-indigo-500" : "border-zinc-700"
                        )}>
                          {alertChannel === channel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-surface border border-border-card rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700 h-20 resize-none"
                    placeholder="Briefly describe what this monitor tracks..."
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Tags</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full h-11 px-4 bg-bg-surface border border-border-card rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="production, api, priority (comma separated)"
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-5 border-t border-border-card bg-bg-base flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="text-[13px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors px-4"
              >
                Cancel
              </button>
              <button
                form="monitor-form"
                type="submit"
                disabled={isLoading}
                className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 text-text-primary rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
              >
                {isLoading ? "Saving..." : editingMonitor ? "Save Changes" : "Create Monitor"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
