// src/types/index.ts

export type Plan = "free" | "pro";
export type MonitorStatus = "healthy" | "failing" | "waiting" | "recovered";
export type AlertChannel = "telegram" | "email";

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: Plan;
  telegram_chat_id: string | null;
  alert_email: string | null;
  notify_on_recovery_telegram: boolean;
  notify_on_recovery_email: boolean;
  created_at: string;
}

export interface Monitor {
  id: string;
  name: string;
  description?: string;
  interval_seconds: number;
  grace_seconds: number;
  token: string;
  slug: string;
  is_active: boolean;
  last_ping_at: string | null;
  status: MonitorStatus;
  last_ping_status?: "success" | "late" | "missed" | "recovery";
  alert_channel: "telegram" | "email" | "both";
  tags: string[];
  created_at: string;
}

export interface Ping {
  id: string;
  monitor_id: string;
  received_at: string;
  status: "success" | "late" | "missed" | "recovery";
}

export interface Alert {
  id: string;
  monitor_id: string;
  triggered_at: string;
  channel: AlertChannel;
  is_resolved: boolean;
  resolved_at: string | null;
}
