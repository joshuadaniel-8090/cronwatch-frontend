import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Radio, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Radar
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Monitors", icon: Radio, path: "/dashboard" }, // Using dashboard as base for monitors list for now
  { label: "Settings", icon: Settings, path: "/settings" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-[#111111] border-r border-[#1F1F1F] flex flex-col transition-all duration-300 z-50 shrink-0",
        isCollapsed ? "w-20" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Radar className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-primary rounded-full animate-pulse border-2 border-[#111111]" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-white tracking-tight">Cronwatch</span>
          )}
        </div>
        
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-[#1F1F1F] border border-[#2F2F2F] rounded-full flex items-center justify-center text-brand-muted hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.label === "Monitors" && pathname.startsWith("/monitors"));
          
          return (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden",
                isActive 
                  ? "text-brand-primary bg-brand-primary/5 border-l-2 border-brand-primary rounded-l-none" 
                  : "text-brand-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-brand-primary" : "text-brand-muted group-hover:text-white"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-[#1F1F1F]">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-white/5 mb-3 overflow-hidden",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand-primary">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">{user?.email?.split('@')[0]}</span>
              <span className="text-[10px] text-brand-muted truncate">{user?.email}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-brand-muted hover:text-brand-error hover:bg-brand-error/5 rounded-lg transition-all",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
