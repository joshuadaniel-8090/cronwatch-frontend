// src/types/index.ts

export type Plan = "free" | "pro";
export type MonitorStatus = "healthy" | "failing" | "waiting";
export type AlertChannel = "telegram" | "email";

export interface User {
  id: string;
  email: string;
  plan: Plan;
  telegram_chat_id: string | null;
  alert_email: string | null;
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
  alert_channel: "telegram" | "email" | "both";
  tags: string[];
  created_at: string;
}

export interface Ping {
  id: string;
  monitor_id: string;
  received_at: string;
  status: "ok" | "late";
}

export interface Alert {
  id: string;
  monitor_id: string;
  triggered_at: string;
  channel: AlertChannel;
  is_resolved: boolean;
  resolved_at: string | null;
}
