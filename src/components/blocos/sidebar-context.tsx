"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: true,
  isMobileOpen: false,
  isMobile: false,
  toggle: () => {},
  openMobile: () => {},
  closeMobile: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

const STORAGE_KEY = "sidebar-expanded";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Restore from localStorage + detect breakpoint
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const mq = window.matchMedia("(min-width: 1024px)");
    const mqXl = window.matchMedia("(min-width: 1280px)");

    const update = () => {
      const isDesktop = mq.matches;
      setIsMobile(!isDesktop);
      if (!isDesktop) {
        setIsMobileOpen(false);
      } else {
        // ≥1280: default expanded, ≥1024<1280: default collapsed
        if (stored !== null) {
          setIsExpanded(stored === "true");
        } else {
          setIsExpanded(mqXl.matches);
        }
      }
    };

    update();
    mq.addEventListener("change", update);
    mqXl.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      mqXl.removeEventListener("change", update);
    };
  }, []);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isExpanded, isMobileOpen, isMobile, toggle, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}
