"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchModal } from "@/components/search-modal";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { href: "/conjugations", label: "Conjugations" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/grammar", label: "Grammar" },
  { href: "/practice", label: "Practice" },
  { href: "/culture", label: "Culture" },
  { href: "/dashboard", label: "Progress & Tests" },
  { href: "/changelog", label: "What's New" },
];

const TOPBAR_HINTS = [
  "Search...",
  "How do you say...?",
  "Conjugate a verb...",
  "What does ... mean?",
];

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shortcutHint, setShortcutHint] = useState<string>("⌘K");
  const [searchHintIndex, setSearchHintIndex] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    setShortcutHint(isMac ? "⌘K" : "Ctrl+K");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchHintIndex((i) => (i + 1) % TOPBAR_HINTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Global Cmd+K / Ctrl+K and "/" to open search (only "/" when not in an input)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }
      if (e.key === "/" && !searchModalOpen) {
        const target = e.target as Node;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable)
        )
          return;
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchModalOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    window.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onEscape);
      window.removeEventListener("click", onClickOutside);
    };
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "?";
  const initials = displayName.slice(0, 1).toUpperCase();

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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-[13px] text-text-3 cursor-pointer w-12 md:w-48 transition-colors hover:border-gray-300 hover:text-text-2 justify-center md:justify-start"
              aria-label="Search"
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
              <span className="hidden md:inline">{TOPBAR_HINTS[searchHintIndex]}</span>
              <kbd className="hidden md:inline ml-auto text-[11px] px-1.5 py-0.5 border border-border rounded text-text-3 font-sans">
                {shortcutHint}
              </kbd>
            </button>

            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" aria-hidden />
            ) : user ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5B4FA0] text-white text-sm font-medium shrink-0 hover:opacity-90 transition-opacity"
                  aria-label="Menu da conta"
                  aria-expanded={userMenuOpen}
                >
                  {initials}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-[60] animate-fade-in">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-text truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-[13px] text-text-2 hover:bg-bg-s hover:text-text"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-[13px] text-text-2 hover:bg-bg-s hover:text-text"
                    >
                      Definições
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-[13px] text-text-2 hover:bg-bg-s hover:text-text"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="shrink-0 px-3 py-1.5 rounded-lg border border-[#5B4FA0] text-[#5B4FA0] text-[13px] font-medium hover:bg-indigo-50 transition-colors"
              >
                Entrar
              </Link>
            )}
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
              {!authLoading && (
                <>
                  <div className="my-1 border-t border-gray-200" />
                  {user ? (
                    <>
                      <Link
                        href="/settings"
                        onClick={closeMobileMenu}
                        className="px-4 py-3 rounded-lg text-[15px] font-medium text-text-2 hover:bg-bg-s hover:text-text min-h-[44px] flex items-center"
                      >
                        Definições
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          handleSignOut();
                        }}
                        className="px-4 py-3 rounded-lg text-[15px] font-medium text-text-2 hover:bg-bg-s hover:text-text min-h-[44px] flex items-center w-full text-left"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="px-4 py-3 rounded-lg text-[15px] font-medium text-[#5B4FA0] hover:bg-indigo-50 min-h-[44px] flex items-center"
                    >
                      Entrar
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <SearchModal open={searchModalOpen} onClose={closeSearchModal} />

    </>
  );
}
