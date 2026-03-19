"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "./sidebar-context";
import type { ReactNode } from "react";

// Routes that render full-screen without sidebar
const FULL_SCREEN_PATTERNS = [
  /^\/lessons\/[^/]+$/, // /lessons/a1-01, /lessons/ai-session-xxx
  /^\/exams\/[^/]+$/,   // /exams/a1-mock
  /^\/auth\//,          // /auth/login, /auth/signup, etc.
  /^\/onboarding$/,     // /onboarding
];

export function SidebarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isExpanded, isMobile } = useSidebar();

  const isFullScreen = FULL_SCREEN_PATTERNS.some((p) => p.test(pathname));

  if (isFullScreen) {
    return <>{children}</>;
  }

  // On mobile: add top padding for the mobile top bar (56px)
  // On desktop: add left margin for the sidebar
  const marginLeft = isMobile ? 0 : isExpanded ? 240 : 60;
  const paddingTop = isMobile ? 56 : 0;

  return (
    <>
      <Sidebar />
      <main
        className="transition-all duration-200 ease-out min-h-screen"
        style={{ marginLeft, paddingTop }}
      >
        {children}
      </main>
    </>
  );
}
