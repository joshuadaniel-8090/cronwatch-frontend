import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Radio,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Radar,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";
import { Skeleton } from "../shared/Skeleton";
import { User } from "../../types";
import { AnimatePresence, motion } from "motion/react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Cron Monitors", icon: Radio, path: "/monitors" },
  { label: "Uptime", icon: Globe, path: "/url-monitors" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (user: User | null) => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const navContent = (
    <>
      {/* Logo */}
      <div className="h-24 flex items-center px-6 mb-2 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Radar className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-primary rounded-full animate-pulse border-2 border-[#111111]" />
          </div>
          <div
            className={cn(
              "flex flex-col transition-all",
              isCollapsed && "md:opacity-0 md:w-0",
            )}
          >
            <span className="text-xl font-bold text-white tracking-tight leading-none">
              Cronwatch
            </span>
          </div>
        </div>

        {/* Collapse Toggle - Only visible on desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-border-card border border-[#2F2F2F] rounded-full hidden md:flex items-center justify-center text-brand-muted hover:text-white transition-colors z-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden ml-auto p-2 text-brand-muted hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.label}
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden",
                isActive
                  ? "text-brand-primary bg-brand-primary/10"
                  : "text-brand-muted hover:text-white hover:bg-white/5",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive
                    ? "text-brand-primary"
                    : "text-brand-muted group-hover:text-white",
                )}
              />
              <span
                className={cn(
                  "transition-all",
                  isCollapsed && "md:opacity-0 md:w-0",
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-0 border border-brand-primary/20 rounded-xl"
                  initial={false}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Dropdown */}
      <div
        className="p-4 border-t border-border-card shrink-0 relative"
        ref={userMenuRef}
      >
        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute bottom-full left-4 mb-2 bg-[#1A1A1A] border border-[#2F2F2F] rounded-xl shadow-2xl z-50 py-2 min-w-45",
                isCollapsed ? "w-10 left-1 right-1" : "right-4",
              )}
            >
              <Link
                href="/settings"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-brand-muted hover:text-white hover:bg-white/5 transition-all w-full text-left"
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </Link>
              <div className="h-px bg-[#2F2F2F] my-1" />
              <button
                onClick={() => {
                  logout();
                  setIsUserMenuOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-brand-muted hover:text-brand-error hover:bg-brand-error/5 transition-all w-full text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isCollapsed && (
          <div className="flex justify-center mb-4">
            <span className="text-[12px] text-brand-primary/60 font-bold font-mono px-3 py-1 bg-brand-primary/5 rounded-full border border-brand-primary/10 tracking-tighter">
              v0.1.574
            </span>
          </div>
        )}

        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-xl bg-white/3 overflow-hidden transition-all border border-transparent hover:bg-white/5 hover:border-white/10 active:scale-[0.98]",
            isCollapsed ? "md:justify-center md:px-0" : "",
            isUserMenuOpen ? "bg-white/5 border-white/10" : "",
          )}
        >
          {isLoading && !user ? (
            <>
              <Skeleton circle className="w-9 h-9 shrink-0" />
              <div
                className={cn(
                  "flex flex-col gap-1.5 transition-all w-full text-left",
                  isCollapsed && "md:opacity-0 md:w-0",
                )}
              >
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2 w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-primary to-[#9333EA] flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/10 border border-white/10">
                <span className="text-xs font-bold text-white tracking-wider">
                  {getInitials(user)}
                </span>
              </div>
              <div
                className={cn(
                  "flex flex-col min-w-0 transition-all text-left",
                  isCollapsed && "md:opacity-0 md:w-0",
                )}
              >
                {!isCollapsed && user?.plan && (
                  <div className="mb-1">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border transition-all",
                        user.plan === "pro"
                          ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-[0_0_10px_rgba(124,58,237,0.1)]"
                          : "bg-white/5 text-brand-muted border-white/10 opacity-60",
                      )}
                    >
                      {user.plan}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white truncate">
                    {user?.name || user?.email?.split("@")[0]}
                  </span>
                </div>
                <span className="text-[10px] text-brand-muted truncate block font-medium opacity-60">
                  {user?.email}
                </span>
              </div>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden h-16 border-b border-border-card bg-[#111111]/80 backdrop-blur-md fixed top-0 left-0 right-0 z-60 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Radar className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Cronwatch</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-brand-muted hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-70 bg-[#111111] border-r border-border-card z-80 md:hidden flex flex-col"
            >
              {navContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "h-screen sticky top-0 bg-[#111111] border-r border-border-card hidden md:flex flex-col transition-all duration-300 z-50 shrink-0 overflow-hidden",
          isCollapsed ? "w-20" : "w-60",
        )}
      >
        {navContent}
      </aside>
    </>
  );
};
