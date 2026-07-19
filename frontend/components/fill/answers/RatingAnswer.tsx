"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerFieldProps } from "./types";

export function RatingAnswer({ value, onChange }: AnswerFieldProps) {
  const [hover, setHover] = useState(0);
  const current = typeof value === "number" ? value : 0;
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || current);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-checked={current === n}
            role="radio"
            className="rounded-md p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-8 w-8",
                active ? "fill-amber-600 text-amber-600" : "text-ink-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
