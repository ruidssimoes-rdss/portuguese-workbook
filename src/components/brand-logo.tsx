import Image from "next/image";

type BrandLogoProps = {
  size?: "topbar" | "auth";
  className?: string;
  priority?: boolean;
};

const LOGO_SIZES = {
  topbar: { width: 98, height: 34 },
  auth: { width: 132, height: 46 },
} as const;

export function BrandLogo({ size = "topbar", className = "", priority = false }: BrandLogoProps) {
  const { width, height } = LOGO_SIZES[size];

  return (
    <Image
      src="/aula-logo.svg"
      alt="Aula PT"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
