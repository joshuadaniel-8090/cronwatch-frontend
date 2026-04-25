// src/components/layout/Navbar.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  return (
    <nav className="h-16 border-b border-border-card bg-bg-header flex items-center justify-between px-6 sticky top-0 z-50">
      <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
          <Layout className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Cronwatch</span>
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface border border-border-card">
              <UserIcon className="w-3.5 h-3.5 text-brand-muted" />
              <span className="text-xs text-text-muted">{user?.email}</span>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex items-center gap-2 text-xs text-brand-muted hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-text-muted hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-brand-primary/20"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
