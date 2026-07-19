"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  UsersRound,
  CreditCard,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/settings", label: "Organization", icon: Building2, exact: true },
  { href: "/settings/team", label: "Team", icon: Users },
  { href: "/settings/groups", label: "Groups", icon: UsersRound },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/settings/account", label: "Account", icon: UserCog },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-50 text-indigo-700"
                : "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
