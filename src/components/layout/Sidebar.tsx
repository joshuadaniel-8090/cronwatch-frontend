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
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";
import {
  applyTheme,
  getInitialTheme,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "../../lib/theme";
import { Skeleton } from "../shared/Skeleton";
import { User } from "../../types";
import { AnimatePresence, motion } from "motion/react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Jobs", icon: Radio, path: "/monitors" },
  { label: "Uptime", icon: Globe, path: "/url-monitors" },
];

const SettingsItem = { label: "Settings", icon: Settings, path: "/settings" } as const;

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeMode(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyTheme(mode);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
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
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-primary rounded-full animate-pulse border-2 border-bg-surface" />
          </div>
          <div className={cn(
            "flex flex-col transition-all",
            isCollapsed && "md:opacity-0 md:w-0"
          )}>
            <span className="text-xl font-bold text-text-primary tracking-tight leading-none">Cronwatch</span>
          </div>
        </div>
        
        {/* Collapse Toggle - Only visible on desktop */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 w-6 h-6 bg-border-card border border-border-card rounded-full hidden md:flex items-center justify-center text-brand-muted hover:text-text-primary transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
 
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden ml-auto p-2 text-brand-muted hover:text-text-primary"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
 
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.label}
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden",
                isActive 
                  ? "text-brand-primary bg-brand-primary/10" 
                  : "text-brand-muted hover:text-text-primary hover:bg-bg-subtle"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-brand-primary" : "text-brand-muted group-hover:text-text-primary"
              )} />
              <span className={cn(
                "transition-all",
                isCollapsed && "md:opacity-0 md:w-0"
              )}>{item.label}</span>
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

      {/* Settings (bottom of nav) */}
      <div className="px-4 mb-2">
        <Link
          href={SettingsItem.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden",
            pathname === SettingsItem.path || pathname.startsWith(SettingsItem.path)
              ? "text-brand-primary bg-brand-primary/10"
              : "text-brand-muted hover:text-text-primary hover:bg-bg-subtle"
          )}
        >
          <Settings className={cn(
            "w-5 h-5 shrink-0 transition-colors",
            pathname === SettingsItem.path || pathname.startsWith(SettingsItem.path)
              ? "text-brand-primary"
              : "text-brand-muted group-hover:text-text-primary"
          )} />
          <span className={cn(
            "transition-all",
            isCollapsed && "md:opacity-0 md:w-0"
          )}>{SettingsItem.label}</span>
          {(pathname === SettingsItem.path || pathname.startsWith(SettingsItem.path)) && (
            <motion.div
              layoutId="active-nav-bg"
              className="absolute inset-0 border border-brand-primary/20 rounded-xl"
              initial={false}
            />
          )}
        </Link>
      </div>

      {/* User / Dropdown */}
      <div className="p-4 border-t border-border-card shrink-0" ref={userMenuRef}>
        <div className="relative">
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-bg-elevated border border-border-card rounded-xl shadow-2xl z-50 py-2 min-w-40"
              >
                <div className="px-3 py-1">
                  <div className="flex items-center gap-1 rounded-xl bg-bg-subtle border border-border-card p-0.5">
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                        themeMode === "dark"
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-brand-muted hover:text-text-primary"
                      )}
                    >
                      <Moon className="w-3 h-3" />
                      {!isCollapsed && <span>Dark</span>}
                    </button>
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                        themeMode === "light"
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-brand-muted hover:text-text-primary"
                      )}
                    >
                      <Sun className="w-3 h-3" />
                      {!isCollapsed && <span>Light</span>}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border-card mx-3" />
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-brand-muted hover:text-brand-error hover:bg-brand-error/5 transition-all w-full text-left rounded-lg"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Logout</span>}
                </button>

                <div className="h-px bg-border-card mx-3" />
                <div className="px-4 py-2 text-center">
                  <span className="text-[11px] text-brand-primary/60 font-bold font-mono tracking-tighter">v0.1.574</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl bg-bg-subtle overflow-hidden transition-all border border-transparent hover:bg-bg-subtle hover:border-border-card active:scale-[0.98]",
              isCollapsed ? "md:justify-center md:px-0" : "",
              isUserMenuOpen ? "bg-bg-subtle border-border-card" : ""
            )}
          >
            {isLoading && !user ? (
              <>
                <Skeleton circle className="w-9 h-9 shrink-0" />
                <div className={cn(
                  "flex flex-col gap-1.5 transition-all w-full text-left",
                  isCollapsed && "md:opacity-0 md:w-0"
                )}>
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-primary to-[#9333EA] flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/10 border border-border-card">
                  <span className="text-xs font-bold text-white tracking-wider">
                    {getInitials(user)}
                  </span>
                </div>
                <div className={cn(
                  "flex flex-col min-w-0 transition-all text-left",
                  isCollapsed && "md:opacity-0 md:w-0"
                )}>
                  {!isCollapsed && user?.plan && (
                    <div className="mb-1">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border transition-all",
                        user.plan === "pro" 
                          ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-[0_0_10px_rgba(124,58,237,0.1)]" 
                          : "bg-bg-subtle text-brand-muted border-border-card opacity-60"
                      )}>
                        {user.plan}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-text-primary truncate">
                      {user?.name || user?.email?.split('@')[0]}
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
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden h-16 border-b border-border-card bg-bg-surface/80 backdrop-blur-md fixed top-0 left-0 right-0 z-60 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Radar className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-text-primary">Cronwatch</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-brand-muted hover:text-text-primary"
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
              className="fixed inset-y-0 left-0 w-70 bg-bg-surface border-r border-border-card z-80 md:hidden flex flex-col"
            >
              {navContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "h-screen sticky top-0 bg-bg-surface border-r border-border-card hidden md:flex flex-col transition-all duration-300 z-50 shrink-0 overflow-hidden",
          isCollapsed ? "w-20" : "w-60"
        )}
      >
        {navContent}
      </aside>
    </>
  );
};
