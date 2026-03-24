import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-light text-green",
  warning: "bg-amber-light text-amber",
  danger: "bg-red-light text-red",
  info: "bg-blue-light text-blue",
  neutral: "bg-bg-secondary text-text-secondary",
};

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
