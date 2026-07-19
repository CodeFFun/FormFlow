"use client";

import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type Device = "desktop" | "mobile";

export function DeviceToggle({
  device,
  onChange,
}: {
  device: Device;
  onChange: (d: Device) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-ink-100 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("desktop")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
          device === "desktop"
            ? "bg-indigo-600 text-white"
            : "text-ink-500 hover:text-ink-900",
        )}
      >
        <Monitor className="h-4 w-4" /> Desktop
      </button>
      <button
        type="button"
        onClick={() => onChange("mobile")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
          device === "mobile"
            ? "bg-indigo-600 text-white"
            : "text-ink-500 hover:text-ink-900",
        )}
      >
        <Smartphone className="h-4 w-4" /> Mobile
      </button>
    </div>
  );
}
