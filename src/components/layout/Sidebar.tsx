// src/components/layout/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, PlusCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border-card bg-bg-base hidden md:flex flex-col p-4 gap-2 h-screen shrink-0">
      <div className="mb-6 h-16 flex items-center px-4 border-b border-border-card -mx-4 -mt-4 bg-bg-surface">
        <span className="text-white font-bold text-lg">Cronwatch</span>
      </div>

      <div className="mb-4">
        <Link
          href="/monitors/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-brand-primary/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Monitor</span>
        </Link>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-brand-muted hover:text-white hover:bg-bg-surface"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-brand-primary" : "text-brand-muted")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
