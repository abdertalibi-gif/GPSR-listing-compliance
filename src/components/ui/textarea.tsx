import * as React from "react";
import { cn } from "@/lib/utils";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("flex min-h-[90px] w-full rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#EA580C] focus-visible:ring-2 focus-visible:ring-[#DBEAFE] transition-colors", className)} {...props} />
));
Textarea.displayName = "Textarea";
