/**
 * Skeleton — loading placeholder with pulse animation.
 */

interface SkeletonProps {
  variant?: "text" | "card" | "circle";
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ variant = "text", width, height, className }: SkeletonProps) {
  const baseClass = "animate-pulse bg-[#F3F4F6]";

  const variantClasses = {
    text: "h-4 rounded",
    card: "rounded-xl",
    circle: "rounded-full",
  };

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className ?? ""}`}
      style={{
        width: width ?? (variant === "circle" ? "40px" : "100%"),
        height: height ?? (variant === "text" ? "16px" : variant === "circle" ? "40px" : "120px"),
      }}
    />
  );
}
