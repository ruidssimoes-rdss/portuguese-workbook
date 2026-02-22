import { type ReactNode, type ButtonHTMLAttributes } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

interface ButtonAsButton extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  href?: never;
}

interface ButtonAsLink {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  href: string;
  disabled?: never;
  type?: never;
  onClick?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#111827] text-white hover:bg-[#1F2937] hover:-translate-y-[0.5px] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#3C5E95] focus-visible:ring-offset-2",
  secondary: "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] hover:text-[#111827] bg-white focus-visible:ring-2 focus-visible:ring-[#3C5E95] focus-visible:ring-offset-2",
  ghost: "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] focus-visible:ring-2 focus-visible:ring-[#3C5E95] focus-visible:ring-offset-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-out outline-none";
  const v = variantClasses[variant];
  const s = sizeClasses[size];
  const classes = `${base} ${v} ${s}${className ? ` ${className}` : ""}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href: _, ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
