"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const { fetchUser, isInitialized } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-[#080808] flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* The "Signal Beep" effect */}
            <div className="absolute w-8 h-8 bg-brand-success/40 rounded-full animate-ping" />
            <div className="relative w-4 h-4 bg-brand-success rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-brand-success text-[10px] font-mono font-bold tracking-[0.3em] uppercase animate-pulse">
              System Checking
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
