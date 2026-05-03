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
    const checkConnection = async () => {
      try {
        // Try to reach a public or auth endpoint
        await api.get('auth/me').catch(err => {
            // Even if it's 401, if we got a response, the backend is UP
            if (err.response) return { status: 200 };
            throw err;
        });
        setStatus('connected');
      } catch (error) {
        console.error("[BackendStatus] Failed connect:", error);
        setStatus('disconnected');
      }
      
      const baseUrl = api.defaults.baseURL || '';
      setApiUrl(baseUrl);
    };

    checkConnection();
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all shadow-sm backdrop-blur-md",
        status === 'connected' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
        status === 'disconnected' ? "bg-red-500/10 border-red-500/20 text-red-400" :
        "bg-white/5 border-white/10 text-brand-muted"
      )}>
        {status === 'checking' ? (
          <Skeleton circle className="w-3 h-3 bg-white/20" />
        ) : status === 'connected' ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        
        <span className="capitalize">{status === 'checking' ? 'Checking...' : status}</span>
        
        {status === 'connected' && apiUrl && (
          <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-emerald-500/20">
            <Globe className="w-3 h-3 opacity-70" />
            <span className="opacity-70 font-mono truncate max-w-[150px] md:max-w-xs" title={apiUrl}>
              {apiUrl}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
