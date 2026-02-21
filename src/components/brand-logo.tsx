import Image from "next/image";

type BrandLogoProps = {
  size?: "topbar" | "auth";
  className?: string;
  priority?: boolean;
};

const LOGO_SIZES = {
  auth: { width: 132, height: 46 },
} as const;

export function BrandLogo({ size = "topbar", className = "", priority = false }: BrandLogoProps) {
  if (size === "topbar") {
    return (
      <span className={`relative block h-8 w-8 overflow-hidden rounded-md ${className}`.trim()}>
        <Image
          src="/aula-logo.svg"
          alt="Aula PT"
          fill
          sizes="32px"
          priority={priority}
          className="object-cover"
        />
      </span>
    );
  }

  const { width, height } = LOGO_SIZES.auth;
  const mergedClassName = `h-11 w-auto object-contain ${className}`.trim();

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
