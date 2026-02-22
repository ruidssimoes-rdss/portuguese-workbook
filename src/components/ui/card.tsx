import { type ReactNode } from "react";

type CardVariant = "outline" | "surface" | "ghost";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  interactive?: boolean;
  padding?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<CardVariant, string> = {
  outline: "border border-[#E5E7EB] bg-white",
  surface: "bg-[#FAFAFA] border border-[#E5E7EB]",
  ghost: "bg-transparent",
};

const paddingClasses = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  variant = "outline",
  interactive = false,
  padding = "lg",
  className,
  onClick,
}: CardProps) {
  const base = "rounded-xl";
  const v = variantClasses[variant];
  const p = paddingClasses[padding];
  const hover = interactive ? "hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-200" : "";
  const clickable = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${base} ${v} ${p} ${hover} ${clickable}${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
