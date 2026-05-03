// src/components/shared/StatusBadge.tsx
import React from "react";
import { MonitorStatus } from "../../types";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: MonitorStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const safeStatus = status || 'waiting';
  
  const config = {
    healthy: {
      bg: "bg-brand-success/10",
      dot: "bg-brand-success",
      text: "Healthy",
      color: "text-brand-success",
    },
    failing: {
      bg: "bg-brand-error/10",
      dot: "bg-brand-error",
      text: "Failing",
      color: "text-brand-error",
    },
    recovered: {
      bg: "bg-brand-success/10",
      dot: "bg-brand-success",
      text: "Recovered",
      color: "text-brand-success",
    },
    waiting: {
      bg: "bg-white/5",
      dot: "bg-brand-muted",
      text: "Waiting",
      color: "text-brand-muted",
    },
  };

  const currentConfig = config[safeStatus as keyof typeof config] || config.waiting;
  const { bg, dot, text, color } = currentConfig;

  return (
    <div className={cn("px-3 py-1 rounded-full flex items-center gap-2 border border-transparent shadow-sm", bg)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      <span className={cn("text-[11px] font-bold uppercase tracking-wider", color)}>{text}</span>
    </div>
  );
};
