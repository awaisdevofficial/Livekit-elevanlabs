"use client";

import { cn } from "@/components/lib-utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#4DFFCE] text-[#07080A] hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:ring-[#4DFFCE]/30 active:scale-[0.98] shadow-[0_0_30px_rgba(77,255,206,0.35)] hover:shadow-[0_0_30px_rgba(77,255,206,0.35)]",
  secondary:
    "border border-white/20 bg-transparent text-white hover:border-[#4DFFCE]/50 hover:bg-white/5 hover:-translate-y-0.5 focus-visible:ring-white/20 active:scale-[0.98]",
  danger:
    "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 focus-visible:ring-red-500/30 active:scale-[0.98]",
  ghost:
    "bg-transparent text-white/70 hover:bg-white/5 hover:text-white focus-visible:ring-white/10 active:scale-[0.98]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-full",
  md: "px-6 py-3 text-sm font-medium rounded-full",
  lg: "px-6 py-3 text-sm font-semibold rounded-full",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080A] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0 disabled:hover:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
