"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  error,
}: OTPInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.split("").slice(0, length);

  const setChar = (index: number, char: string) => {
    const next = value.split("");
    next[index] = char;
    const joined = next.join("").slice(0, length);
    onChange(joined);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setChar(index, digit);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[index]) {
        setChar(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        setChar(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={chars[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "h-14 w-full rounded-md border bg-white text-center text-xl font-semibold text-ink-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
            error ? "border-coral-600" : "border-ink-100",
          )}
        />
      ))}
    </div>
  );
}
