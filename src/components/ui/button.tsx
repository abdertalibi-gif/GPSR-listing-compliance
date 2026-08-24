import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#EA580C] text-white hover:bg-[#C2410C] shadow-sm",
        destructive: "bg-[#EF4444] text-white hover:bg-[#B91C1C] shadow-sm",
        outline: "border border-[#FED7AA] bg-white hover:bg-[#FFF7ED] text-[#EA580C]",
        secondary: "bg-[#F1F5F9] text-[#14213D] hover:bg-[#E7ECF3]",
        ghost: "hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#14213D]",
        link: "text-[#EA580C] underline-offset-4 hover:underline",
        success: "bg-[#10B981] text-white hover:bg-[#15803D] shadow-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-9 w-9",
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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    if (asChild && props.children && React.isValidElement(props.children)) {
      const child = props.children as React.ReactElement<Record<string, unknown>>;
      const childClass = (child.props as { className?: string }).className;
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size, className }), childClass),
        ref,
      } as never);
    }
    return <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  }
);
Button.displayName = "Button";
export { buttonVariants };
