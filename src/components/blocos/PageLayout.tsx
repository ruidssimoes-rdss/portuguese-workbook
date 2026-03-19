import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page-level wrapper that enforces max-width, padding, and Zone flow.
 * Usage: <PageLayout> <IntroBlock /> <FilterBlock /> <ContentGrid>...</ContentGrid> </PageLayout>
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={`w-full max-w-[1080px] mx-auto px-4 md:px-6 xl:px-8 pt-8 pb-16 page-enter ${className ?? ""}`}>
      {children}
    </div>
  );
}
