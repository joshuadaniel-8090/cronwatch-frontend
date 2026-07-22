"use client";

import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, Globe } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../lib/api";
import { cn } from "../../lib/utils";

type BackendStatus = 'checking' | 'connected' | 'disconnected';

export function AuthInit({ children }: { children: React.ReactNode }) {
  const { fetchUser, isInitialized } = useAuthStore();
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const checkBackend = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' ? window.location.origin + '/api' : '');
      setApiUrl(baseUrl.replace(/\/$/, ""));

      try {
        await api.get('auth/me', { silent: true } as any).catch(err => {
          if (err.response) return { status: 200 };
          throw err;
        });
        setBackendStatus('connected');
      } catch {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
  }, []);

  if (!isInitialized) {
    // The connection-status badge + backend URL is a debug aid — it's only
    // shown outside production so anonymous visitors never see internal
    // infrastructure hostnames or connectivity state.
    const isDev = process.env.NODE_ENV === 'development';

    return (
      <div className="fixed inset-0 bg-bg-base flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center">
            <div className={isDev && backendStatus === 'connected'
              ? "absolute w-8 h-8 bg-brand-success/40 rounded-full animate-ping"
              : "absolute w-8 h-8 bg-brand-muted/20 rounded-full animate-pulse"
            } />
            <div className={cn(
              "relative w-4 h-4 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]",
              !isDev ? "bg-brand-muted" :
              backendStatus === 'connected' ? "bg-brand-success" :
              backendStatus === 'disconnected' ? "bg-brand-error" : "bg-brand-muted"
            )} />
          </div>
          {isDev && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-medium backdrop-blur-md bg-bg-surface border-border-card">
                {backendStatus === 'checking' ? (
                  <span className="w-3 h-3 rounded-full bg-brand-muted/50 animate-pulse" />
                ) : backendStatus === 'connected' ? (
                  <Wifi className="w-3 h-3 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-400" />
                )}
                <span className={cn(
                  "font-mono text-[10px] font-bold tracking-[0.15em] uppercase",
                  backendStatus === 'connected' ? "text-emerald-400" :
                  backendStatus === 'disconnected' ? "text-red-400" : "text-brand-muted"
                )}>
                  {backendStatus === 'checking' ? 'Connecting...' : backendStatus}
                </span>
              </div>
              {apiUrl && (
                <div className="flex items-center gap-1.5 text-[10px] text-brand-muted font-mono">
                  <Globe className="w-3 h-3" />
                  <span>{apiUrl}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
