"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Info, Bell, Tag, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { INTERVAL_OPTIONS, GRACE_OPTIONS, cn, getErrorMessage } from "../../lib/utils";
import api from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";
import { Monitor } from "../../types";

interface MonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMonitor: any) => void;
  editingMonitor?: Monitor | null;
}

export const NewMonitorSlideOver: React.FC<MonitorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingMonitor 
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
        response = await api.put(`/monitors/${editingMonitor.id}`, payload);
        toast.success("Monitor updated successfully");
      } else {
        response = await api.post("/monitors", payload);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#111111] border border-[#1F1F1F] rounded-2xl md:rounded-3xl shadow-2xl z-[70] flex flex-col h-full md:h-auto max-h-[100vh] md:max-h-[90vh] overflow-hidden"
          >
            <div className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-[#1F1F1F] shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {editingMonitor ? "Edit Monitor" : "Create New Monitor"}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-brand-muted hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <form id="monitor-form" onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Left Column */}
                  <div className="space-y-5 md:space-y-6">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Display Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        className={cn(
                          "w-full px-4 py-2.5 md:py-3 bg-[#0A0A0A] border rounded-xl text-sm md:text-base text-white focus:outline-none transition-all placeholder:text-white/60",
                          errors.name ? "border-brand-error" : "border-[#1F1F1F] focus:border-brand-primary"
                        )}
                        placeholder="e.g. Production API Heartbeat"
                      />
                      {errors.name && <p className="text-brand-error text-[10px] mt-1 font-bold">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlignLeft className="w-3 h-3" /> Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 md:py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-white/60 h-20 md:h-24 resize-none"
                        placeholder="What is this monitor for? (Optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Tags
                      </label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-white/40 text-sm"
                        placeholder="production, api, high-priority (comma separated)"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Interval</label>
                        <select
                          value={interval}
                          onChange={(e) => setInterval(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-white focus:outline-none focus:border-brand-primary transition-all cursor-pointer text-sm"
                        >
                          {INTERVAL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Grace</label>
                        <select
                          value={grace}
                          onChange={(e) => setGrace(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl text-white focus:outline-none focus:border-brand-primary transition-all cursor-pointer text-sm"
                        >
                          {GRACE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Bell className="w-3 h-3" /> Alert Channels
                      </label>
                      <div className="space-y-3">
                        {["email", "telegram", "both"].map((channel) => (
                          <label 
                            key={channel}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                              alertChannel === channel 
                                ? "bg-brand-primary/10 border-brand-primary/50 text-white" 
                                : "bg-[#0A0A0A] border-[#1F1F1F] text-brand-muted hover:border-[#2F2F2F]"
                            )}
                          >
                            <span className="text-sm font-medium capitalize">{channel}</span>
                            <input 
                              type="radio" 
                              name="alertChannel"
                              checked={alertChannel === channel}
                              onChange={() => setAlertChannel(channel as any)}
                              className="hidden"
                            />
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                              alertChannel === channel ? "border-brand-primary" : "border-brand-muted"
                            )}>
                              {alertChannel === channel && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      {/* Hints */}
                      <div className="mt-4 p-3 bg-white/3 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-brand-muted">Email Alert:</span>
                          <span className="text-white/80 font-medium truncate ml-2 max-w-[120px]">{user?.alert_email || user?.email || "Not set"}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-brand-muted">Telegram ID:</span>
                          <span className="text-white/80 font-medium">{user?.telegram_chat_id || "Not set"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 md:p-8 border-t border-[#1F1F1F] bg-[#0F0F0F] flex gap-3 md:gap-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 bg-[#1F1F1F] hover:bg-[#2F2F2F] text-white rounded-xl font-bold transition-all text-xs"
              >
                Cancel
              </button>
              <button
                form="monitor-form"
                type="submit"
                disabled={isLoading}
                className="flex-[2] h-10 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-[0.98] text-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMonitor ? "Save Changes" : "Create Monitor"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
