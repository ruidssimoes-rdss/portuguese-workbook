"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LineChart,
  BookOpen,
  BookA,
  Baseline,
  Type,
  Globe,
  Award,
  PenLine,
  Clock,
  Search,
  Send,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { SearchModal } from "@/components/search-modal";

type NavItem = { href: string; icon: LucideIcon; label: string };
type NavGroup = { label?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    items: [
      { href: "/", icon: CalendarDays, label: "Hoje" },
      { href: "/progress", icon: LineChart, label: "Progresso" },
    ],
  },
  {
    label: "Biblioteca",
    items: [
      { href: "/lessons", icon: BookOpen, label: "Lições" },
      { href: "/vocabulary", icon: BookA, label: "Vocabulário" },
      { href: "/grammar", icon: Baseline, label: "Gramática" },
      { href: "/conjugations", icon: Type, label: "Conjugações" },
      { href: "/culture", icon: Globe, label: "Cultura" },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/exams", icon: Award, label: "Exames" },
      { href: "/notes", icon: PenLine, label: "Notas" },
      { href: "/calendar", icon: Clock, label: "Calendário" },
    ],
  },
];

const COLLAPSE_KEY = "aula:sidebar-collapsed";

export function AppLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 350 350" fill="none" aria-hidden="true">
      <rect width="350" height="350" rx="80" fill="#1B2B61" />
      <path d="M126.085 90.8203C130.072 90.124 133.462 93.4698 133.462 97.6406V173.556C133.462 177.727 130.071 181.081 126.085 180.385C104.732 176.655 88.5 158.024 88.5 135.603C88.5002 113.182 104.732 94.5503 126.085 90.8203Z" fill="white" />
      <path d="M130.089 221.852C131.873 221.486 133.462 222.993 133.462 224.961V256.338C133.462 258.31 131.87 259.831 130.089 259.467C121.343 257.675 114.764 249.935 114.764 240.659C114.764 231.384 121.343 223.643 130.089 221.852Z" fill="white" />
      <path d="M261.035 173.638C261.514 177.688 258.161 181.064 254.001 181.064H142.028C137.862 181.064 134.45 177.683 134.928 173.638C138.741 141.38 165.527 116.404 197.981 116.404C230.436 116.404 257.222 141.38 261.035 173.638Z" fill="white" />
      <path d="M127.588 188.129C129.83 186.059 133.462 187.649 133.462 190.7V213.678C133.462 215.611 131.895 217.178 129.962 217.178H104.913C101.713 217.178 100.191 213.24 102.558 211.088L112.958 201.633L112.961 201.63L127.588 188.129Z" fill="white" />
      <path d="M195.026 216.457C197.174 218.605 197.174 222.087 195.026 224.235L193.047 226.214C190.9 228.362 187.417 228.362 185.269 226.214L172.217 213.161V193.647L195.026 216.457Z" fill="white" />
      <path d="M148.408 216.457C146.26 218.605 146.26 222.087 148.408 224.235L150.387 226.214C152.535 228.362 156.017 228.362 158.165 226.214L171.217 213.161V193.647L148.408 216.457Z" fill="white" />
      <path d="M253.792 260.357C253.792 260.357 253.792 242.301 253.792 224.244C253.792 183.774 171.717 174.999 171.717 174.999" stroke="white" strokeWidth="13" />
    </svg>
  );
}

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

/** Shared ⌘K handler + search modal state. */
function useSearch() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {}
  }, []);
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  return { collapsed, toggle };
}

/* ─── Expanded sidebar ─── */

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
  className = "",
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  className?: string;
}) {
  const isActive = useActive();
  const { user, loading } = useAuth();
  const search = useSearch();

  if (collapsed) {
    return (
      <>
        <aside className={`flex w-[60px] shrink-0 flex-col items-center pt-5 pb-3 ${className}`}>
          <Link href="/" aria-label="Aula" className="mb-[18px]">
            <AppLogo />
          </Link>
          <nav className="flex flex-col items-center gap-0.5">
            {NAV.map((group, gi) => (
              <div key={gi} className="flex flex-col items-center gap-0.5">
                {gi > 0 && <div className="my-2 h-px w-5 bg-aula-line" />}
                {group.items.map((item) => (
                  <RailButton key={item.href} item={item} active={isActive(item.href)} onClick={onNavigate} />
                ))}
              </div>
            ))}
          </nav>
          <div className="flex-1" />
          <div className="flex flex-col items-center gap-0.5">
            <RailButton
              item={{ href: user ? "/tutor" : "/auth/login", icon: user ? Send : LogIn, label: user ? "Perguntar ao Elísio" : "Entrar" }}
              active={false}
              onClick={onNavigate}
            />
            <RailButton item={{ href: "/settings", icon: Settings, label: "Definições" }} active={isActive("/settings")} onClick={onNavigate} />
            <button
              onClick={onToggle}
              aria-label="Expandir barra lateral"
              className="flex h-8 w-9 items-center justify-center rounded-lg text-aula-text-3 transition-colors hover:bg-aula-selected hover:text-aula-text-2"
            >
              <ChevronsRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </aside>
        <SearchModal open={search.open} onClose={() => search.setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <aside className={`flex w-[244px] shrink-0 flex-col px-3 pt-3.5 pb-3 ${className}`}>
        {/* Workspace header */}
        <div className="flex h-8 items-center gap-2 pl-2 pr-1">
          <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
            <AppLogo />
            <span className="text-[13px] font-medium tracking-[-0.01em] text-aula-text">Aula</span>
          </Link>
          <div className="flex-1" />
          <button
            onClick={() => search.setOpen(true)}
            aria-label="Procurar (⌘K)"
            title="Procurar  ⌘K"
            className="flex h-7 w-7 items-center justify-center rounded-md text-aula-text-3 transition-colors hover:bg-aula-selected hover:text-aula-text-2"
          >
            <Search size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-3.5 flex flex-1 flex-col">
          {NAV.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-3.5" : ""}>
              {group.label && (
                <div className="px-2.5 pb-1.5 text-[11px] text-aula-text-3">{group.label}</div>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-[30px] items-center gap-2.5 rounded-lg px-2.5 text-[12.5px] transition-colors duration-100 ${
                        active
                          ? "bg-aula-selected font-medium text-aula-text"
                          : "text-aula-text-2 hover:bg-aula-selected/60 hover:text-aula-text"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex items-center gap-1">
          {!loading && user ? (
            <Link
              href="/tutor"
              onClick={onNavigate}
              className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-aula-border bg-aula-panel px-2.5 text-[12.5px] font-medium text-aula-text transition-colors hover:border-aula-text-4"
            >
              <Send size={14} strokeWidth={1.5} className="text-aula-text-2" />
              Perguntar ao Elísio
            </Link>
          ) : !loading ? (
            <Link
              href="/auth/login"
              onClick={onNavigate}
              className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-aula-border bg-aula-panel px-2.5 text-[12.5px] font-medium text-aula-text transition-colors hover:border-aula-text-4"
            >
              <LogIn size={14} strokeWidth={1.5} className="text-aula-text-2" />
              Entrar
            </Link>
          ) : (
            <div className="h-8 flex-1" />
          )}
          <Link
            href="/settings"
            onClick={onNavigate}
            aria-label="Definições"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-aula-selected ${
              isActive("/settings") ? "bg-aula-selected text-aula-text" : "text-aula-text-3"
            }`}
          >
            <Settings size={15} strokeWidth={1.5} />
          </Link>
          <button
            onClick={onToggle}
            aria-label="Recolher barra lateral"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-aula-text-3 transition-colors hover:bg-aula-selected md:flex"
          >
            <ChevronsLeft size={15} strokeWidth={1.5} />
          </button>
        </div>
      </aside>
      <SearchModal open={search.open} onClose={() => search.setOpen(false)} />
    </>
  );
}

function RailButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={item.label}
      title={item.label}
      aria-current={active ? "page" : undefined}
      className={`flex h-8 w-9 items-center justify-center rounded-lg transition-colors ${
        active ? "bg-aula-selected text-aula-text" : "text-aula-text-2 hover:bg-aula-selected/60 hover:text-aula-text"
      }`}
    >
      <Icon size={16} strokeWidth={1.5} />
    </Link>
  );
}
