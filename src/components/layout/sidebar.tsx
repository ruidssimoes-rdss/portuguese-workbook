"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Calendar,
  LineChart,
  BookOpen,
  BookA,
  Baseline,
  Type,
  Globe,
  Award,
  Compass,
  PenLine,
  Search,
  Send,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useElisio } from "@/components/elisio/elisio-provider";
import { SearchModal } from "@/components/search-modal";

type NavItem = { href: string; icon: LucideIcon; label: string; cue?: string };
type NavGroup = { label?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    items: [
      { href: "/", icon: CalendarDays, label: "Hoje" },
      { href: "/lessons", icon: BookOpen, label: "Curso", cue: "Course" },
      { href: "/progress", icon: LineChart, label: "Progresso" },
    ],
  },
  {
    label: "Biblioteca",
    items: [
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
      { href: "/calendar", icon: Calendar, label: "Calendário" },
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
  lockRail = false,
  className = "",
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  /** Rail is required for the current width, so the expand control stays hidden. */
  lockRail?: boolean;
  className?: string;
}) {
  const isActive = useActive();
  const { user, loading } = useAuth();
  const search = useSearch();
  const elisio = useElisio();
  const askElisio = () => {
    onNavigate?.();
    elisio.openElisio();
  };
  const signedOut = !loading && !user;
  const elisioButton = (
    <button
      type="button"
      onClick={askElisio}
      aria-pressed={elisio.open}
      className="tablet-target flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-aula-border bg-aula-panel px-2.5 text-left text-[12.5px] font-medium text-aula-text transition-colors hover:border-aula-text-4"
    >
      <Send size={14} strokeWidth={1.5} className="shrink-0 text-aula-text-2" />
      <span className="truncate">Perguntar ao Elísio</span>
    </button>
  );

  if (collapsed) {
    return (
      <>
        <aside className={`flex min-h-0 w-[60px] shrink-0 flex-col items-center overflow-hidden pt-5 pb-3 ${className}`}>
          <Link href="/" aria-label="Aula" className="mb-[18px] shrink-0">
            <AppLogo />
          </Link>
          <nav className="aula-pane flex min-h-0 w-full flex-1 flex-col items-center gap-0.5 overflow-y-auto">
            {NAV.map((group, gi) => (
              <div key={gi} className="flex flex-col items-center gap-0.5">
                {gi > 0 && <div className="my-2 h-px w-5 bg-aula-line" />}
                {group.items.map((item) => (
                  <RailButton key={item.href} item={item} active={isActive(item.href)} onClick={onNavigate} />
                ))}
              </div>
            ))}
          </nav>
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <RailButton caption="Elísio" item={{ href: "", icon: Send, label: "Perguntar ao Elísio" }} active={elisio.open} onAction={askElisio} />
            {!loading && !user && (
              <RailButton item={{ href: "/auth/login", icon: LogIn, label: "Entrar" }} active={false} onClick={onNavigate} />
            )}
            <RailButton item={{ href: "/settings", icon: Settings, label: "Definições" }} active={isActive("/settings")} onClick={onNavigate} />
            {!lockRail && (
              <button
                onClick={onToggle}
                aria-label="Expandir barra lateral"
                className="tap-44 flex h-8 w-9 items-center justify-center rounded-lg text-aula-text-3 transition-colors hover:bg-aula-selected hover:text-aula-text-2"
              >
                <ChevronsRight size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </aside>
        <SearchModal open={search.open} onClose={() => search.setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <aside className={`flex min-h-0 w-[244px] shrink-0 flex-col overflow-hidden px-3 pt-3.5 pb-3 ${className}`}>
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
            className="tap-44 flex h-7 w-7 items-center justify-center rounded-md text-aula-text-3 transition-colors hover:bg-aula-selected hover:text-aula-text-2"
          >
            <Search size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="aula-pane mt-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto">
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
                      className={`tablet-target flex items-center gap-2.5 rounded-lg px-2.5 text-[12.5px] transition-colors duration-100 ${
                        item.cue ? "h-[30px] min-[744px]:h-auto min-[744px]:min-h-[40px] min-[744px]:py-1" : "h-[30px]"
                      } ${
                        active
                          ? "bg-aula-selected font-medium text-aula-text"
                          : "text-aula-text-2 hover:bg-aula-selected/60 hover:text-aula-text"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                      {item.cue ? (
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="leading-[16px]">{item.label}</span>
                          <span className="hidden text-[11px] font-normal leading-[14px] text-aula-text-3 min-[744px]:block">{item.cue}</span>
                        </span>
                      ) : (
                        item.label
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: Elísio for everyone; signed out, Entrar sits beside settings on the row below so neither label is squeezed. */}
        {signedOut && <div className="mb-1 flex">{elisioButton}</div>}
        <div className="flex items-center gap-1">
          {!signedOut && elisioButton}
          {signedOut && (
            <Link
              href="/auth/login"
              onClick={onNavigate}
              className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-aula-border bg-aula-panel px-2.5 text-[12.5px] font-medium text-aula-text transition-colors hover:border-aula-text-4"
            >
              <LogIn size={14} strokeWidth={1.5} className="text-aula-text-2" />
              Entrar
            </Link>
          )}
          <Link
            href="/settings"
            onClick={onNavigate}
            aria-label="Definições"
            className={`tablet-target-sq flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-aula-selected ${
              isActive("/settings") ? "bg-aula-selected text-aula-text" : "text-aula-text-3"
            }`}
          >
            <Settings size={15} strokeWidth={1.5} />
          </Link>
          {!lockRail && (
            <button
              onClick={onToggle}
              aria-label="Recolher barra lateral"
              className="tablet-target-sq tap-44 hidden h-8 w-8 items-center justify-center rounded-lg text-aula-text-3 transition-colors hover:bg-aula-selected md:flex"
            >
              <ChevronsLeft size={15} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </aside>
      <SearchModal open={search.open} onClose={() => search.setOpen(false)} />
    </>
  );
}

function RailButton({
  item,
  active,
  onClick,
  onAction,
  caption,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  /** Renders a button (no navigation) that calls this. */
  onAction?: () => void;
  caption?: string;
}) {
  const Icon = item.icon;
  const className = `tablet-target-sq tap-44 flex items-center justify-center rounded-lg transition-colors ${
    caption ? "h-auto min-h-11 w-11 flex-col gap-0.5 py-1" : "h-8 w-9"
  } ${active ? "bg-aula-selected text-aula-text" : "text-aula-text-2 hover:bg-aula-selected/60 hover:text-aula-text"}`;
  const body = (
    <>
      <Icon size={16} strokeWidth={1.5} />
      {caption && <span className="max-w-[52px] truncate text-[9px] font-medium leading-none">{caption}</span>}
    </>
  );
  if (onAction) {
    return (
      <button type="button" onClick={onAction} aria-label={item.label} aria-pressed={active} className={className}>
        {body}
      </button>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={item.cue ? `${item.label}, ${item.cue}` : item.label}
      title={caption ? undefined : item.cue ? `${item.label} · ${item.cue}` : item.label}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {body}
    </Link>
  );
}
