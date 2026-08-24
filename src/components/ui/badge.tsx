import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "border-transparent bg-[#EA580C] text-white",
      secondary: "border-transparent bg-[#F1F5F9] text-[#14213D]",
      destructive: "border-transparent bg-[#EF4444] text-white",
      outline: "text-[#334155] border-[#E7ECF3] bg-white",
      success: "border-transparent bg-[#10B981] text-white",
      warning: "border-transparent bg-[#F59E0B] text-white",
      info: "border-transparent bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
