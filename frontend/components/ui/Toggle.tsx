"use client";

import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start justify-between gap-4",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      {(label || description) && (
        <span className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-ink-900">
              {label}
            </span>
          )}
          {description && (
            <span className="mt-0.5 block text-xs text-ink-500">
              {description}
            </span>
          )}
        </span>
      )}
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2",
          checked ? "bg-indigo-600" : "bg-ink-100",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
