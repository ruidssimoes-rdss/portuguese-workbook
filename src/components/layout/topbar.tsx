"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchModal } from "@/components/search-modal";
import { useAuth } from "@/components/auth-provider";
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

const verbCount = verbs.order.length;
const tenseCount = new Set(
  verbs.order.flatMap((k) => verbs.verbs[k]?.conjugations?.map((c) => c.Tense) ?? [])
).size;
const wordCount = vocab.categories.reduce((s, c) => s + (c.words?.length ?? 0), 0);
const categoryCount = vocab.categories.length;
const topicCount = Object.keys(grammar.topics).length;
const sayingCount = sayings.length;

const learnItems = [
  {
    title: "Conjugations",
    portuguese: "Conjugações",
    stats: [`${verbCount} verbs`, `${tenseCount} tenses`],
    href: "/conjugations",
    disabled: false,
  },
  {
    title: "Vocabulary",
    portuguese: "Vocabulário",
    stats: [`${wordCount} words`, `${categoryCount} categories`],
    href: "/vocabulary",
    disabled: false,
  },
  {
    title: "Grammar",
    portuguese: "Gramática",
    stats: [`${topicCount} topics`, "A1–B1"],
    href: "/grammar",
    disabled: false,
  },
  {
    title: "Culture",
    portuguese: "Cultura",
    stats: [`${sayingCount} sayings`, "Proverbs & expressions"],
    href: "/culture",
    disabled: false,
  },
  {
    title: "Practice",
    portuguese: "Prática",
    stats: ["4 practice modes"],
    href: "/practice",
    disabled: false,
  },
  {
    title: "How to Learn",
    portuguese: "Como Aprender",
    stats: ["Study tips & CEFR guide"],
    href: "/guide",
    disabled: false,
  },
];

const LEARN_PATHS = ["/conjugations", "/vocabulary", "/grammar", "/culture", "/practice"];

function isLearnPage(pathname: string | null): boolean {
  return LEARN_PATHS.some((p) => pathname === p || pathname?.startsWith(p + "/"));
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [learnMenuOpen, setLearnMenuOpen] = useState(false);
  const [shortcutHint, setShortcutHint] = useState<string>("⌘K");
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navLeftRef = useRef<HTMLDivElement>(null);
  const learnTriggerRef = useRef<HTMLButtonElement>(null);
  const learnPanelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!learnMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLearnMenuOpen(false);
        learnTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [learnMenuOpen]);

  useEffect(() => {
    if (learnMenuOpen && learnPanelRef.current) {
      const first = learnPanelRef.current.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [learnMenuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (learnMenuOpen && navLeftRef.current && !navLeftRef.current.contains(e.target as Node)) {
        setLearnMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [learnMenuOpen]);

  useEffect(() => {
    setLearnMenuOpen(false);
  }, [pathname]);

  const handleLearnPanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const panel = learnPanelRef.current;
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
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "?";
  const initials = displayName.slice(0, 1).toUpperCase();
  const learnActive = isLearnPage(pathname);

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-14 bg-white/80 backdrop-blur-xl transition-all duration-300 ease-out ${
          isScrolled ? "border-b border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : ""
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between h-full">
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
            <div ref={navLeftRef} className="flex items-center gap-6 relative">
              <Link
                href="/"
                className="font-semibold text-[15px] tracking-tight hover:opacity-80 transition-opacity duration-200"
              >
                Aula PT
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <button
                  ref={learnTriggerRef}
                  type="button"
                  onClick={() => setLearnMenuOpen((o) => !o)}
                  aria-expanded={learnMenuOpen}
                  aria-haspopup="true"
                  className={`text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors duration-200 ${
                    learnActive || learnMenuOpen ? "text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Learn
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform duration-200 ${learnMenuOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                    pathname?.startsWith("/dashboard") ? "text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Progress
                </Link>
              </nav>
              {learnMenuOpen && (
                <div
                  ref={learnPanelRef}
                  className="absolute left-0 top-full mt-1 w-[560px] max-w-[560px] bg-white border border-gray-200/80 rounded-xl shadow-lg shadow-black/5 p-6 z-[60] animate-mega-open transition-all duration-200 ease-out"
                  role="menu"
                  onKeyDown={handleLearnPanelKeyDown}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    LEARN · Aprende
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {learnItems.map((item) => {
                      const isCurrent = pathname === item.href || pathname?.startsWith(item.href + "/");
                      const isGuide = item.href === "/guide";
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setLearnMenuOpen(false)}
                          role="menuitem"
                          tabIndex={0}
                          className={`block rounded-lg border p-4 transition-all duration-200 hover:border-[#3C5E95]/30 hover:bg-[#3C5E95]/[0.03] hover:shadow-sm hover:-translate-y-0.5 ${
                            isCurrent ? "border-[#3C5E95]/30 bg-[#3C5E95]/5" : isGuide ? "border-dashed border-gray-200" : "border-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-gray-900 flex-1">{item.title}</span>
                            {isGuide && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-[#3C5E95]/70 shrink-0"
                                aria-hidden
                              >
                                <path d="M4 19.5V6a2 2 0 0 1 2-2h9.5" />
                                <path d="M8 6h12a1 1 0 0 1 1 1v12.5l-3-2-3 2-3-2-3 2-3-2-3 2V8a2 2 0 0 1 2-2z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-[#3C5E95]/60 font-medium mt-0.5">{item.portuguese}</p>
                          <p className="text-xs text-gray-400 mt-3">{item.stats[0]}</p>
                          {item.stats[1] && <p className="text-xs text-gray-400">{item.stats[1]}</p>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {!authLoading && !user && (
              <Link
                href="/changelog"
                className="hidden md:inline-flex px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                What&apos;s New
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 h-9 px-3 w-9 md:w-[160px] lg:w-[200px] rounded-full bg-gray-100/80 hover:bg-gray-200/80 border border-gray-200/50 text-gray-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300/50 justify-center md:justify-start whitespace-nowrap"
              aria-label="Search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="hidden md:inline text-sm text-gray-400">Search...</span>
              <kbd className="hidden md:inline ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-200/60 text-gray-400">
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
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3C5E95] text-white text-sm font-medium shrink-0 hover:opacity-90 transition-opacity"
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
                    <Link
                      href="/changelog"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-[13px] text-text-2 hover:bg-bg-s hover:text-text"
                    >
                      What&apos;s New
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
                className="shrink-0 px-3 py-1.5 rounded-lg border border-[#3C5E95] text-[#3C5E95] text-[13px] font-medium hover:bg-sky-50 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

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
          <div className="relative bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-lg animate-fade-in">
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
            <nav className="px-0 pb-6 pt-2 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 pt-4 pb-2">
                LEARN · Aprende
              </p>
              {learnItems.map((item) => {
                const isCurrent = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`min-h-[44px] px-4 py-3 flex flex-col justify-center transition-colors ${
                      isCurrent ? "bg-[#3C5E95]/5 text-[#3C5E95] border-l-2 border-[#3C5E95]" : "text-text-2 hover:bg-bg-s hover:text-text"
                    }`}
                  >
                    <span className="text-[15px] font-medium">{item.title}</span>
                    <span className="text-xs text-[#3C5E95]/60">{item.portuguese}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-100 my-2 mx-4" />
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className={`min-h-[44px] px-4 py-3 flex items-center text-[15px] font-medium transition-colors ${
                  pathname?.startsWith("/dashboard") ? "bg-[#3C5E95]/5 text-[#3C5E95]" : "text-text-2 hover:bg-bg-s hover:text-text"
                }`}
              >
                Progress
              </Link>
              <Link
                href="/changelog"
                onClick={closeMobileMenu}
                className="min-h-[44px] px-4 py-3 flex items-center text-[15px] font-medium text-text-2 hover:bg-bg-s hover:text-text"
              >
                What&apos;s New
              </Link>
              {!authLoading && (
                <>
                  <div className="my-1 border-t border-gray-200 mx-4" />
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
                      className="px-4 py-3 rounded-lg text-[15px] font-medium text-[#3C5E95] hover:bg-sky-50 min-h-[44px] flex items-center"
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
