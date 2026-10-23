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
  Compass,
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
      { href: "/guide", icon: Compass, label: "Como funciona" },
    ],
  },
];

const COLLAPSE_KEY = "aula:sidebar-collapsed";

/** Guitarra portuguesa mark. `size` is the mark edge in px (minimum 24). */
export function AppLogo({ size = 24 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- master SVG, not redrawn
    <img
      src="/brand/aula-mark-master.svg"
      alt=""
      width={size}
      height={size}
      draggable={false}
      aria-hidden="true"
      className="block shrink-0"
      style={{ width: size, height: size }}
    />
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
      // Read after mount so server and client markup match.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
