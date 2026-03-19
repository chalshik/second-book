import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        default:     "bg-[#111] text-white hover:bg-[#333]",
        destructive: "bg-transparent text-red-600 hover:text-red-800 underline underline-offset-2",
        outline:     "border border-[#d0d0d0] bg-white text-[#111] hover:bg-[#f5f5f5]",
        ghost:       "text-[#111] hover:bg-[#f5f5f5]",
        link:        "text-[#111] underline underline-offset-2 hover:text-[#555]",
      },
      size: {
        default: "h-9 px-4 py-2 rounded",
        sm:      "h-7 px-3 text-xs rounded",
        lg:      "h-10 px-6 rounded",
        icon:    "h-9 w-9 rounded",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
