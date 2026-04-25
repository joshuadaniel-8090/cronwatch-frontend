// src/components/shared/StatusBadge.tsx
import React from "react";
import { MonitorStatus } from "../../types";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: MonitorStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    healthy: {
      dot: "bg-green-500",
      text: "Healthy",
      color: "text-green-500",
    },
    failing: {
      dot: "bg-red-500",
      text: "Failing",
      color: "text-red-500",
    },
    waiting: {
      dot: "bg-gray-500",
      text: "Waiting",
      color: "text-gray-500",
    },
  };

  const { dot, text, color } = config[status];

  return (
    <div className="flex items-center gap-2">
      <span className={cn("inline-block w-2.5 h-2.5 rounded-full", dot)} />
      <span className={cn("text-sm font-medium", color)}>{text}</span>
    </div>
  );
};
