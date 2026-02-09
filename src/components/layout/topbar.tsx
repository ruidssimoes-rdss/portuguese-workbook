"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/conjugations", label: "Conjugations" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/grammar", label: "Grammar" },
  { href: "/practice", label: "Practice" },
  { href: "/dashboard", label: "Progress & Tests" },
  { href: "/changelog", label: "What's New" },
];

export function Topbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const closeSearchModal = useCallback(() => setSearchModalOpen(false), []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [mobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    if (!searchModalOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearchModal();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [searchModalOpen, closeSearchModal]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-l">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-md text-text-2 hover:text-text hover:bg-bg-s transition-colors"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-[15px] tracking-tight"
            >
              Aula PT
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FA0] focus:ring-offset-1 ${
                      isActive
                        ? "bg-indigo-100 text-[#5B4FA0]"
                        : "text-text-2 hover:text-text hover:bg-bg-s"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-text-3 cursor-pointer min-w-[120px] md:min-w-[160px] transition-colors hover:border-[#999] hover:text-text-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-40 shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>Search…</span>
              <kbd className="hidden md:inline ml-auto text-[11px] px-1.5 py-0.5 border border-border rounded text-text-3 font-sans">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-white/90 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="relative bg-white border-b border-border-l shadow-lg animate-fade-in">
            <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-14">
              <span className="text-[13px] font-medium text-text-2">Menu</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 -mr-2 rounded-md text-text-2 hover:text-text hover:bg-bg-s transition-colors"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-6 pb-6 pt-2 flex flex-col gap-0.5">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`px-4 py-3 rounded-lg text-[15px] font-medium transition-colors duration-200 min-h-[44px] flex items-center ${
                      isActive
                        ? "bg-indigo-100 text-[#5B4FA0]"
                        : "text-text-2 hover:bg-bg-s hover:text-text"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Search coming soon modal */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-label="Search"
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={closeSearchModal}
          />
          <div className="relative bg-white border border-border rounded-xl shadow-lg p-6 max-w-sm w-full animate-fade-in">
            <p className="text-[15px] text-text text-center">Search is coming soon</p>
            <button
              type="button"
              onClick={closeSearchModal}
              className="mt-4 w-full py-2.5 rounded-lg border border-border text-[14px] font-medium text-text hover:bg-bg-s transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </>
  );
}
