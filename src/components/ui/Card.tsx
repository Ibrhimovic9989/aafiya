import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "glass" | "flat" | "outline";
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  onClick,
  className = "",
  padding = "md",
  variant = "default",
}: CardProps) {
  const Component = onClick ? "button" : "div";

  const variantStyles = {
    default: "bg-bg border border-border",
    glass: "bg-bg-secondary border border-border",
    flat: "bg-bg-secondary",
    outline: "bg-transparent border border-border",
  };

  return (
    <Component
      onClick={onClick}
      className={`rounded-xl transition-all duration-200 ${
        onClick ? "cursor-pointer hover:bg-bg-secondary tap" : ""
      } ${variantStyles[variant]} ${paddingMap[padding]} ${className}`}
    >
      {children}
    </Component>
  );
}
