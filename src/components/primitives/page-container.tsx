import { type ReactNode } from "react";

type PageWidth = "default" | "narrow" | "xnarrow";

interface PageContainerProps {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
}

const widthClasses: Record<PageWidth, string> = {
  default: "max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10",
  narrow: "max-w-[896px] mx-auto px-4 md:px-6 lg:px-10",
  xnarrow: "max-w-[640px] mx-auto px-4 md:px-6",
};

export function PageContainer({ children, width = "default", className }: PageContainerProps) {
  return (
    <main className={`${widthClasses[width]}${className ? ` ${className}` : ""}`}>
      {children}
    </main>
  );
}
