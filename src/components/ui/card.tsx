"use client";

import { type ReactNode, useState } from "react";

type CardVariant = "outline" | "surface" | "ghost" | "featured";

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
  featured: "border border-[#E5E7EB] bg-white border-l-[3px] border-l-[#3C5E95]",
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
  const [pressed, setPressed] = useState(false);

  const base = "rounded-xl";
  const v = variantClasses[variant];
  const p = paddingClasses[padding];
  const hover = interactive
    ? "hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all duration-150 ease-out"
    : "";
  const active = interactive && pressed ? "scale-[0.995]" : "";
  const clickable = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${base} ${v} ${p} ${hover} ${active} ${clickable}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      onMouseDown={interactive ? () => setPressed(true) : undefined}
      onMouseUp={interactive ? () => setPressed(false) : undefined}
      onMouseLeave={interactive ? () => setPressed(false) : undefined}
    >
      {children}
    </div>
  );
}
