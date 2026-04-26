// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format seconds to human readable
// 3600 → "Every 1 hour"
// 300 → "Every 5 minutes"
export function formatInterval(seconds: number): string {
  if (seconds < 60) return `Every ${seconds} seconds`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `Every ${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) {
    return `Every ${hours} hour${hours > 1 ? "s" : ""}`;
  }
  const days = Math.floor(hours / 24);
  return `Every ${days} day${days > 1 ? "s" : ""}`;
}

// Format timestamp to relative time
// "2025-04-23T10:00:00Z" → "3 minutes ago"
export function timeAgo(timestamp: string | null): string {
  if (!timestamp) return "Never";
  return `${formatDistanceToNow(new Date(timestamp))} ago`;
}

// Safely extract error message from API response
export function getErrorMessage(err: any): string {
  const data = err?.response?.data;
  
  // Try common error field names
  const message = data?.detail || data?.message || data?.error || data?.msg;
  
  if (!message) {
    if (err.message) return err.message;
    return "An unexpected error occurred.";
  }
  
  if (typeof message === "string") return message;
  
  if (Array.isArray(message)) {
    return message.map((d: any) => d.msg || d.message || "Validation error").join(", ");
  }
  
  if (typeof message === "object") {
    return message.msg || message.message || JSON.stringify(message);
  }
  
  return "Something went wrong.";
}

// Map seconds correctly for dropdowns
export const INTERVAL_OPTIONS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
  { label: "1 hour", value: 3600 },
  { label: "6 hours", value: 21600 },
  { label: "12 hours", value: 43200 },
  { label: "24 hours", value: 86400 },
];

export const GRACE_OPTIONS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "30 minutes", value: 1800 },
];
