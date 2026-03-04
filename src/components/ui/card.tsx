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
  outline: "border border-border bg-bg",
  surface: "bg-surface border border-border",
  ghost: "bg-transparent",
  featured: "border border-border bg-bg border-l-[3px] border-l-[#003399]",
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
    ? "hover:border-[#003399]/20 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399]/30 focus-visible:ring-offset-2"
    : "";
  const active = interactive && pressed ? "scale-[0.995]" : "";
  const clickable = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${base} ${v} ${p} ${hover} ${active} ${clickable}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      onMouseDown={interactive ? () => setPressed(true) : undefined}
      onMouseUp={interactive ? () => setPressed(false) : undefined}
      onMouseLeave={interactive ? () => setPressed(false) : undefined}
    >
      {children}
    </div>
  );
}
