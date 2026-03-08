"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchModal } from "@/components/search-modal";
import { useAuth } from "@/components/auth-provider";
import { BrandLogo } from "@/components/brand-logo";
import { getResolvedLessons } from "@/data/resolve-lessons";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import type { VerbDataSet } from "@/types";
import type { VocabData } from "@/types/vocab";
import type { GrammarData } from "@/types/grammar";
import type { SayingsData } from "@/types/saying";

const verbs = verbData as unknown as VerbDataSet;
const vocab = vocabData as unknown as VocabData;
const grammar = grammarData as unknown as GrammarData;
const sayings = (sayingsData as unknown as SayingsData).sayings;

const lessonCount = getResolvedLessons().length;
const verbCount = verbs.order.length;
const tenseCount = new Set(
  verbs.order.flatMap((k) => verbs.verbs[k]?.conjugations?.map((c) => c.Tense) ?? [])
).size;
const wordCount = vocab.categories.reduce((s, c) => s + (c.words?.length ?? 0), 0);
const categoryCount = vocab.categories.length;
const topicCount = Object.keys(grammar.topics).length;

/* ─── Menu data ─── */

interface MenuItem {
  title: string;
  portuguese: string;
  stats: string[];
  href: string;
}

const revisionItems: MenuItem[] = [
  {
    title: "Lessons",
    portuguese: "Lições",
    stats: [`${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`, "A1 progression"],
    href: "/lessons",
  },
  {
    title: "Exams",
    portuguese: "Exames",
    stats: ["CIPLE preparation", "Coming soon"],
    href: "/exams",
  },
];

const libraryItems: MenuItem[] = [
  {
    title: "Vocabulary",
    portuguese: "Vocabulário",
    stats: [`${wordCount} words`, `${categoryCount} categories`],
    href: "/vocabulary",
  },
  {
    title: "Conjugations",
    portuguese: "Conjugações",
    stats: [`${verbCount} verbs`, `${tenseCount} tenses`],
    href: "/conjugations",
  },
  {
    title: "Grammar",
    portuguese: "Gramática",
    stats: [`${topicCount} topics`, "A1–B1"],
    href: "/grammar",
  },
];

const REVISION_PATHS = ["/lessons", "/exams"];
const LIBRARY_PATHS = ["/vocabulary", "/conjugations", "/grammar"];
const NOTES_CALENDAR_PATHS = ["/notes", "/calendar"];

function matchesSection(pathname: string | null, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname?.startsWith(p + "/"));
}

/* ─── Chevron icon ─── */

function ChevronDown({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ─── Mega-menu dropdown panel (shared between Revision & Library) ─── */

function MegaPanel({
  label,
  labelPt,
  items,
  pathname,
  onClose,
  panelRef,
  onKeyDown,
  columns,
}: {
  label: string;
  labelPt: string;
  items: MenuItem[];
  pathname: string | null;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  columns: number;
}) {
  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full mt-2 w-[420px] max-w-[420px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-lg shadow-black/5 p-6 z-[60] animate-mega-open transition-all duration-200 ease-out"
      role="menu"
      onKeyDown={onKeyDown}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
        {label} · {labelPt}
      </p>
      <div className={`grid gap-3 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {items.map((item) => {
          const isCurrent = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              role="menuitem"
              tabIndex={0}
              className={`block rounded-lg border p-4 transition-all duration-200 hover:border-text/30 hover:bg-surface hover:shadow-sm hover:-translate-y-0.5 ${
                isCurrent ? "border-text/30 bg-surface" : "border-border-light"
              }`}
            >
              <span className="text-sm font-semibold text-text">{item.title}</span>
              <p className="text-xs text-text-secondary font-medium mt-0.5">{item.portuguese}</p>
              <p className="text-xs text-text-muted mt-3">{item.stats[0]}</p>
              {item.stats[1] && <p className="text-xs text-text-muted">{item.stats[1]}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Topbar ─── */

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"revision" | "library" | null>(null);
  const [shortcutHint, setShortcutHint] = useState<string>("⌘K");
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navLeftRef = useRef<HTMLDivElement>(null);
  const revisionTriggerRef = useRef<HTMLButtonElement>(null);
  const libraryTriggerRef = useRef<HTMLButtonElement>(null);
  const revisionPanelRef = useRef<HTMLDivElement>(null);
  const libraryPanelRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const closeSearchModal = useCallback(() => setSearchModalOpen(false), []);
  const closeMenus = useCallback(() => setOpenMenu(null), []);

  /* Escape handlers */
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

  /* Scroll detection */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(typeof window !== "undefined" && window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Cmd+K / Ctrl+K / "/" shortcut */
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

  /* User menu click-outside + escape */
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

  /* Dropdown escape */
  useEffect(() => {
    if (!openMenu) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const trigger = openMenu === "revision" ? revisionTriggerRef : libraryTriggerRef;
        setOpenMenu(null);
        trigger.current?.focus();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [openMenu]);

  /* Auto-focus first item when dropdown opens */
  useEffect(() => {
    const panel = openMenu === "revision" ? revisionPanelRef : openMenu === "library" ? libraryPanelRef : null;
    if (panel?.current) {
      const first = panel.current.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [openMenu]);

  /* Click outside nav closes dropdown */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (openMenu && navLeftRef.current && !navLeftRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);

  /* Close dropdown on navigation */
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  /* Arrow key navigation in panels */
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const panel = openMenu === "revision" ? revisionPanelRef.current : libraryPanelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (items.length === 0) return;
    const current = document.activeElement as HTMLElement;
    const idx = items.indexOf(current);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    }
  }, [openMenu]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "?";
  const initials = displayName.slice(0, 1).toUpperCase();
  const revisionActive = matchesSection(pathname, REVISION_PATHS);
  const libraryActive = matchesSection(pathname, LIBRARY_PATHS);

  /* Shared tab button classes */
  const tabClass = (active: boolean, menuOpen: boolean) =>
    `text-[13px] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
      active || menuOpen
        ? "text-[#003399] font-semibold bg-[#003399]/8"
        : "text-text-secondary hover:text-text hover:bg-surface"
    }`;

  const directLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
      active
        ? "text-[#003399] font-semibold bg-[#003399]/8"
        : "text-text-secondary hover:text-text hover:bg-surface"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 pt-3 pb-2 px-4 md:px-6 lg:px-10 pointer-events-none">
        <div className="max-w-[1280px] mx-auto pointer-events-auto">
          <div
            className={`flex items-center justify-between h-12 px-4 bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-[0_4px_24px_rgba(0,51,153,0.07),0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out ${
              isScrolled
                ? "shadow-[0_8px_32px_rgba(0,51,153,0.10),0_2px_8px_rgba(0,0,0,0.06)]"
                : ""
            }`}
          >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-md text-text-2 hover:text-text hover:bg-surface transition-colors"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div ref={navLeftRef} className="flex items-center gap-6 relative">
              <Link
                href="/"
                className="inline-flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <BrandLogo size="topbar" priority />
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {/* 1. Revision (dropdown) */}
                <button
                  ref={revisionTriggerRef}
                  type="button"
                  onClick={() => setOpenMenu((o) => (o === "revision" ? null : "revision"))}
                  aria-expanded={openMenu === "revision"}
                  aria-haspopup="true"
                  className={tabClass(revisionActive, openMenu === "revision")}
                >
                  Revision
                  <ChevronDown open={openMenu === "revision"} />
                </button>

                {/* 2. Library (dropdown) */}
                <button
                  ref={libraryTriggerRef}
                  type="button"
                  onClick={() => setOpenMenu((o) => (o === "library" ? null : "library"))}
                  aria-expanded={openMenu === "library"}
                  aria-haspopup="true"
                  className={tabClass(libraryActive, openMenu === "library")}
                >
                  Library
                  <ChevronDown open={openMenu === "library"} />
                </button>

                {/* 3. Culture (direct link) */}
                <Link
                  href="/culture"
                  className={directLinkClass(pathname === "/culture" || pathname?.startsWith("/culture/") === true)}
                >
                  Culture
                </Link>

                {/* 4. How to Learn (direct link) */}
                <Link
                  href="/guide"
                  className={directLinkClass(pathname === "/guide" || pathname?.startsWith("/guide/") === true)}
                >
                  How to Learn
                </Link>

                {/* 5. Notes (direct link) */}
                <Link
                  href="/notes"
                  className={`${directLinkClass(matchesSection(pathname, NOTES_CALENDAR_PATHS) && pathname === "/notes")} flex items-center gap-1.5`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Notes
                </Link>

                {/* 6. Calendar (direct link) */}
                <Link
                  href="/calendar"
                  className={`${directLinkClass(matchesSection(pathname, NOTES_CALENDAR_PATHS) && pathname === "/calendar")} flex items-center gap-1.5`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Calendar
                </Link>
              </nav>

              {/* Revision mega-menu panel */}
              {openMenu === "revision" && (
                <MegaPanel
                  label="REVISION"
                  labelPt="Revisão"
                  items={revisionItems}
                  pathname={pathname}
                  onClose={closeMenus}
                  panelRef={revisionPanelRef}
                  onKeyDown={handlePanelKeyDown}
                  columns={2}
                />
              )}

              {/* Library mega-menu panel */}
              {openMenu === "library" && (
                <MegaPanel
                  label="LIBRARY"
                  labelPt="Biblioteca"
                  items={libraryItems}
                  pathname={pathname}
                  onClose={closeMenus}
                  panelRef={libraryPanelRef}
                  onKeyDown={handlePanelKeyDown}
                  columns={3}
                />
              )}
            </div>
            {!authLoading && !user && (
              <Link
                href="/changelog"
                className="hidden md:inline-flex px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-text-muted hover:text-text-secondary transition-colors duration-200"
              >
                What&apos;s New
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 h-8 px-3 w-9 md:w-[160px] lg:w-[200px] rounded-full bg-surface hover:bg-border-light border border-border text-text-muted transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-border justify-center md:justify-start whitespace-nowrap"
              aria-label="Search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-text-muted"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="hidden md:inline text-sm text-text-muted">Search...</span>
              <kbd className="hidden md:inline ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded bg-border text-text-muted">
                {shortcutHint}
              </kbd>
            </button>

            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-surface animate-pulse shrink-0" aria-hidden />
            ) : user ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-text text-bg text-sm font-medium shrink-0 hover:opacity-90 transition-opacity"
                  aria-label="Menu da conta"
                  aria-expanded={userMenuOpen}
                >
                  {initials}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-lg py-1 z-[60] animate-fade-in">
                    <div className="px-3 py-2 border-b border-[var(--border-light)]">
                      <p className="text-sm font-medium text-text truncate">{displayName}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/lessons"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-[13px] text-text-2 hover:bg-surface hover:text-text"
                    >
                      Progress
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-[13px] text-text-2 hover:bg-surface hover:text-text"
                    >
                      Definições
                    </Link>
                    <Link
                      href="/changelog"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-[13px] text-text-2 hover:bg-surface hover:text-text"
                    >
                      What&apos;s New
                    </Link>
                    <div className="my-1 border-t border-border-light" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-[13px] text-text-2 hover:bg-surface hover:text-text"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="shrink-0 rounded-xl px-4 py-2 bg-[#003399] text-white text-sm font-medium hover:bg-[#002277] transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile menu ─── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="relative bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-primary)] shadow-lg animate-fade-in">
            <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-14">
              <span className="text-[13px] font-medium text-text-2">Menu</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 -mr-2 rounded-md text-text-2 hover:text-text hover:bg-surface transition-colors"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-0 pb-6 pt-2 flex flex-col">
              {/* Revision section */}
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-4 pt-4 pb-2">
                REVISION · Revisão
              </p>
              {revisionItems.map((item) => {
                const isCurrent = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`min-h-[44px] px-4 py-3 flex flex-col justify-center transition-colors ${
                      isCurrent ? "bg-surface text-text border-l-2 border-[#003399]" : "text-text-2 hover:bg-surface hover:text-text"
                    }`}
                  >
                    <span className="text-[15px] font-medium">{item.title}</span>
                    <span className="text-xs text-text-secondary">{item.portuguese}</span>
                  </Link>
                );
              })}

              <div className="border-t border-border-light my-2 mx-4" />

              {/* Notes & Calendar */}
              <Link
                href="/notes"
                onClick={closeMobileMenu}
                className={`min-h-[44px] px-4 py-3 flex flex-col justify-center transition-colors ${
                  pathname === "/notes" ? "bg-surface text-text border-l-2 border-[#003399]" : "text-text-2 hover:bg-surface hover:text-text"
                }`}
              >
                <span className="text-[15px] font-medium">Notes</span>
                <span className="text-xs text-text-secondary">Notas</span>
              </Link>
              <Link
                href="/calendar"
                onClick={closeMobileMenu}
                className={`min-h-[44px] px-4 py-3 flex flex-col justify-center transition-colors ${
                  pathname === "/calendar" ? "bg-surface text-text border-l-2 border-[#003399]" : "text-text-2 hover:bg-surface hover:text-text"
                }`}
              >
                <span className="text-[15px] font-medium">Calendar</span>
                <span className="text-xs text-text-secondary">Calendário</span>
              </Link>

              <div className="border-t border-border-light my-2 mx-4" />

              {/* Direct links */}
              <Link
                href="/guide"
                onClick={closeMobileMenu}
                className={`min-h-[44px] px-4 py-3 flex flex-col justify-center transition-colors ${
                  pathname === "/guide" ? "bg-surface text-text border-l-2 border-[#003399]" : "text-text-2 hover:bg-surface hover:text-text"
                }`}
              >
                <span className="text-[15px] font-medium">How to Learn</span>
                <span className="text-xs text-text-secondary">Como Aprender</span>
              </Link>
              <Link
                href="/culture"
                onClick={closeMobileMenu}
                className={`min-h-[44px] px-4 py-3 flex flex-col justify-center transition-colors ${
                  pathname === "/culture" || pathname?.startsWith("/culture/") ? "bg-surface text-text border-l-2 border-[#003399]" : "text-text-2 hover:bg-surface hover:text-text"
                }`}
              >
                <span className="text-[15px] font-medium">Culture</span>
                <span className="text-xs text-text-secondary">Cultura</span>
              </Link>

              <div className="border-t border-border-light my-2 mx-4" />

              {/* Library section */}
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-4 pt-4 pb-2">
                LIBRARY · Biblioteca
              </p>
              {libraryItems.map((item) => {
                const isCurrent = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`min-h-[44px] px-4 py-3 flex flex-col justify-center transition-colors ${
                      isCurrent ? "bg-surface text-text border-l-2 border-[#003399]" : "text-text-2 hover:bg-surface hover:text-text"
                    }`}
                  >
                    <span className="text-[15px] font-medium">{item.title}</span>
                    <span className="text-xs text-text-secondary">{item.portuguese}</span>
                  </Link>
                );
              })}

              <div className="border-t border-border-light my-2 mx-4" />

              {/* Changelog */}
              <Link
                href="/changelog"
                onClick={closeMobileMenu}
                className="min-h-[44px] px-4 py-3 flex items-center text-[15px] font-medium text-text-2 hover:bg-surface hover:text-text"
              >
                What&apos;s New
              </Link>

              {/* Auth section */}
              {!authLoading && (
                <>
                  <div className="my-1 border-t border-border mx-4" />
                  {user ? (
                    <>
                      <Link
                        href="/settings"
                        onClick={closeMobileMenu}
                        className="px-4 py-3 rounded-lg text-[15px] font-medium text-text-2 hover:bg-surface hover:text-text min-h-[44px] flex items-center"
                      >
                        Definições
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          handleSignOut();
                        }}
                        className="px-4 py-3 rounded-lg text-[15px] font-medium text-text-2 hover:bg-surface hover:text-text min-h-[44px] flex items-center w-full text-left"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="px-4 py-3 rounded-xl bg-[#003399] text-white text-sm font-medium hover:bg-[#002277] min-h-[44px] flex items-center transition-colors"
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
