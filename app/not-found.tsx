"use client";

import React from "react";
import Link from "next/link";
import { Radar, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-text-primary">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-primary/20 shadow-2xl shadow-brand-primary/10">
          <Radar className="w-10 h-10 text-brand-primary" />
        </div>
        
        <h1 className="text-6xl font-black mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold mb-4">Signal Lost</h2>
        <p className="text-brand-muted max-w-xs mx-auto mb-10 leading-relaxed text-sm">
          The monitor you are looking for has been decommissioned or moved to a different frequency.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98]"
        >
          <ChevronLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </motion.div>

      {/* Decorative background ping */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
