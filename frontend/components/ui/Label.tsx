import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-sm font-medium text-ink-900", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-coral-600">*</span>}
    </label>
  );
}
