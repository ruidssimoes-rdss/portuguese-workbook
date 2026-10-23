"use client";

/**
 * PageShell — the Aula app shell (Figma: Ecrãs / Hoje, Palavra…).
 *
 *   grey canvas ─┬─ sidebar (244px, collapses to a 60px rail)
 *                ├─ main panel  (floating white, rounded, scrolls)
 *                └─ right panel (optional, 340px — pass `panel`)
 *                   or a wider card dock (pass `dock`, from the book)
 *
 * On mobile the sidebar becomes an overlay opened from a slim top bar.
 */

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sidebar, AppLogo, useSidebarCollapsed } from "./sidebar";

export function PageShell({
  children,
  panel,
  dock,
  wideDock = false,
  header,
  wide = false,
  forceRail = false,
  snug = false,
}: {
  children: React.ReactNode;
  /** Optional right-hand panel content (Estado / Notas / Hoje). */
  panel?: React.ReactNode;
  /** Wider right dock for a book card. Replaces `panel` when both are set. */
  dock?: React.ReactNode;
  /** A bit wider, used while a practice session is open in the dock. */
  wideDock?: boolean;
  /** Optional sticky header row inside the main panel (breadcrumb + actions). */
  header?: React.ReactNode;
  /** Let the content use the full panel width instead of the 960px column. */
  wide?: boolean;
  /** Collapse the sidebar to its rail without writing that choice. */
  forceRail?: boolean;
  /** Use the 20px pad in the reading column when a dock is open on a tight width. */
  snug?: boolean;
}) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const rail = forceRail || collapsed;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="aula-shell flex h-dvh min-h-0 bg-aula-canvas">
      {/* Desktop sidebar */}
      <Sidebar collapsed={rail} lockRail={forceRail} onToggle={toggle} className="hidden h-full min-h-0 md:flex" />

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex bg-aula-canvas shadow-xl">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} className="h-dvh" />
            <button
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-aula-text-3"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-2 md:flex-row md:pl-0">
        {/* Mobile top bar */}
        <div className="flex h-11 shrink-0 items-center gap-2 px-2 md:hidden">
          <button
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-aula-text-2"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
            <span className="text-[13px] font-medium text-aula-text">Aula</span>
          </Link>
        </div>

        {/* Main panel */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-aula-line bg-aula-panel">
          {header && (
            <div className="flex h-12 shrink-0 items-center gap-1.5 px-5 text-[12px]">{header}</div>
          )}
          <div id="aula-scroll" className="aula-pane min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            <div
              className={`mx-auto min-w-0 pb-16 ${snug ? "px-pad" : "px-10 max-md:px-4"} ${header ? "pt-6" : "pt-10 max-md:pt-6"} ${
                wide ? "max-w-none" : "max-w-[960px]"
              }`}
            >
              {children}
            </div>
          </div>
        </main>

        {/* Book card dock, or the narrower info panel */}
        {dock ? (
          <aside className={`book-dock hidden min-h-0 shrink-0 flex-col overflow-hidden rounded-xl border border-aula-line bg-aula-panel lg:flex ${wideDock ? "book-dock-wide" : ""}`}>
            {dock}
          </aside>
        ) : (
          panel && (
            <aside className="aula-pane hidden min-h-0 w-[340px] shrink-0 overflow-y-auto rounded-xl border border-aula-line bg-aula-panel p-4 xl:block">
              {panel}
            </aside>
          )
        )}
      </div>
    </div>
  );
}

/** Breadcrumb for the PageShell header: <Crumbs items={["Vocabulário", "B1", "a saudade"]} /> */
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Navegação" className="flex min-w-0 items-center gap-1.5">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        const cls = last ? "truncate font-medium text-aula-text" : "truncate text-aula-text-3 hover:text-aula-text-2";
        return (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            {c.href && !last ? (
              <Link href={c.href} className={cls}>
                {c.label}
              </Link>
            ) : (
              <span className={cls}>{c.label}</span>
            )}
            {!last && <span className="text-aula-text-4">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
