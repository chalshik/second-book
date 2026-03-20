import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    className={cn(
      "flex h-9 w-full border border-[var(--border,#ddd9d0)] bg-[var(--cream,#ede9df)] px-3 py-2 text-sm text-[var(--ink,#0f0e0c)] focus:outline-none focus:border-[var(--ink,#0f0e0c)] focus:bg-[var(--paper,#f5f2eb)] transition-colors disabled:opacity-50 cursor-pointer",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
