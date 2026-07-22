'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Globe } from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import { Skeleton } from '../shared/Skeleton';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : '');
    setApiUrl(baseUrl.replace(/\/$/, ""));

    const checkConnection = async () => {
      try {
        await api.get('auth/me', { silent: true } as any).catch(err => {
            if (err.response) return { status: 200 };
            throw err;
        });
        setStatus('connected');
      } catch (error) {
        console.error("[BackendStatus] Failed connect:", error);
        setStatus('disconnected');
      }
    };

    checkConnection();
  }, []);

  // Debug aid only — never show connectivity state or the backend hostname
  // to real visitors in production.
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all shadow-sm backdrop-blur-md",
        status === 'connected' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
        status === 'disconnected' ? "bg-red-500/10 border-red-500/20 text-red-400" :
        "bg-bg-subtle border-border-card text-brand-muted"
      )}>
        {status === 'checking' ? (
          <Skeleton circle className="w-3 h-3 bg-bg-subtle" />
        ) : status === 'connected' ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        
        {apiUrl && (
          <span className="font-mono truncate max-w-[180px] md:max-w-xs" title={apiUrl}>
            {apiUrl}
          </span>
        )}
        
        <span className={cn(
          "text-[10px] font-bold tracking-[0.1em] uppercase",
          status === 'connected' ? "text-emerald-400/70" :
          status === 'disconnected' ? "text-red-400/70" : "text-brand-muted/70"
        )}>
          {status === 'checking' ? 'Connecting…' : status}
        </span>
      </div>
    </div>
  );
}
