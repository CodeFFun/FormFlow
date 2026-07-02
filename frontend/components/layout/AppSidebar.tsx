"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bell, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}

const items: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p) => p === "/dashboard" || p.startsWith("/forms"),
  },
  {
    href: "/notifications",
    label: "Alerts",
    icon: Bell,
    match: (p) => p.startsWith("/notifications"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: (p) => p.startsWith("/settings"),
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[120px] flex-col items-center border-r border-ink-100 bg-white py-6">
      <Link
        href="/dashboard"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-serif text-lg font-semibold text-white"
        aria-label="FormFlow home"
      >
        F
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-[88px] flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-ink-500 hover:bg-ink-50 hover:text-ink-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
