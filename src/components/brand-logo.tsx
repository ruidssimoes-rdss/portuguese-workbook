import Image from "next/image";

type BrandLogoProps = {
  size?: "topbar" | "auth";
  className?: string;
  priority?: boolean;
};

const LOGO_SIZES = {
  topbar: { width: 32, height: 32 },
  auth: { width: 132, height: 46 },
} as const;

export function BrandLogo({ size = "topbar", className = "", priority = false }: BrandLogoProps) {
  const { width, height } = LOGO_SIZES[size];
  const sizeClass = size === "topbar" ? "h-8 w-8" : "h-11 w-auto";
  const mergedClassName = `${sizeClass} object-contain ${className}`.trim();

  return (
    <Image
      src="/aula-logo.svg"
      alt="Aula PT"
      width={width}
      height={height}
      priority={priority}
      className={mergedClassName}
    />
  );
}
