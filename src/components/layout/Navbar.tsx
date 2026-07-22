// src/components/layout/Navbar.tsx
import React from "react";
import Link from "next/link";
import { Layout, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const Navbar: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuthStore();

  return (
    <nav className="h-16 border-b border-border-card bg-bg-header flex items-center justify-between px-6 sticky top-0 z-50">
      <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
          <Layout className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-text-primary tracking-tight">Cronwatch</span>
      </Link>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="w-24 h-8 bg-bg-subtle animate-pulse rounded-xl" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-primary/20"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="text-xs text-brand-muted hover:text-text-primary transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-primary/20"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
