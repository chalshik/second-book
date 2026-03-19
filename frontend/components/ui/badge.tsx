import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-medium uppercase tracking-wider text-[#888] border border-[#ddd] px-1.5 py-0.5",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
