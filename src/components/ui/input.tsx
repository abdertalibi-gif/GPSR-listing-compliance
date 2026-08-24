import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#EA580C] focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
