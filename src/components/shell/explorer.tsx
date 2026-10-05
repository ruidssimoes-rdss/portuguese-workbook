"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronRight, LineChart, Play, Search, Settings } from "lucide-react";
import { formatCount } from "@/lib/format";
import type { ExplorerRow, ExplorerTree, FolderId, ShellData } from "@/lib/shell/types";
import { StateDot } from "./state-dot";
import { Skeleton } from "./skeleton";

// ─── Tree model ─────────────────────────────────────────

type NodeKind = "nav" | "folder" | "leaf" | "placeholder";

interface Node {
  id: string;
  kind: NodeKind;
  depth: number;
  label: string;
  href: string;
  parentId?: string;
  count?: number | null;
  /** Count shown in the overdue colour */
  urgent?: boolean;
  open?: boolean;
  row?: ExplorerRow;
}

type Folder = "vocab" | "review" | FolderId;

/** Folders open by default for a path, before the learner touches anything. */
function openByDefault(id: Folder, pathname: string, tree: ExplorerTree): boolean {
  if (id === "vocab") return true;
  if (id === "review") return pathname.startsWith("/vocabulary/a-rever");
  if (id === "grammar") return pathname.startsWith("/grammar/");
  if (id === "verbs") return pathname.startsWith("/conjugations/");
  if (id === "culture") return false;
  const cat = tree.vocab.categories.find((c) => `vocab:${c.id}` === id);
  return !!cat && pathname.startsWith(`${cat.href}/`);
}

function hrefPath(href: string): string {
  return href.split("?")[0];
}

// ─── Component ──────────────────────────────────────────

export function Explorer({ tree, onSearch }: { tree: ExplorerTree; onSearch: () => void }) {
  const pathname = usePathname();
  const [shell, setShell] = useState<ShellData | null>(null);
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const [children, setChildren] = useState<Record<string, ExplorerRow[]>>({});
  const [focusId, setFocusId] = useState<string | null>(null);
  const inflight = useRef(new Set<string>());
  const prevPath = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isOpen = useCallback(
    (id: Folder) => choices[id] ?? openByDefault(id, pathname, tree),
    [choices, pathname, tree]
  );

  // Shell data: on mount, and again after a practice session ends
  useEffect(() => {
    const leftPractice = prevPath.current?.startsWith("/learn") && !pathname.startsWith("/learn");
    const first = prevPath.current === null;
    prevPath.current = pathname;
    if (!first && !leftPractice) return;

    const controller = new AbortController();
    fetch("/api/shell", { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ShellData>) : null))
      .then((data) => {
        if (!data) return;
        setShell(data);
        // Word states may have changed — reload vocabulary folders on next open
        if (leftPractice) {
          setChildren((c) => Object.fromEntries(Object.entries(c).filter(([k]) => !k.startsWith("vocab:"))));
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [pathname]);

  // Lazy folders: load children server-side the first time they are open
  const openLazy: FolderId[] = [
    ...tree.vocab.categories.map((c) => `vocab:${c.id}` as FolderId),
    "grammar" as const,
    "verbs" as const,
    "culture" as const,
  ].filter((id) => isOpen(id) && (id.startsWith("vocab:") ? isOpen("vocab") : true));
  const missing = openLazy.filter((id) => !children[id]).join("|");

  useEffect(() => {
    if (!missing) return;
    for (const id of missing.split("|") as FolderId[]) {
      if (inflight.current.has(id)) continue;
      inflight.current.add(id);
      fetch(`/api/explorer?folder=${encodeURIComponent(id)}`)
        .then((r) => (r.ok ? (r.json() as Promise<ExplorerRow[]>) : []))
        .then((rows) => setChildren((c) => ({ ...c, [id]: rows })))
        .catch(() => {})
        .finally(() => inflight.current.delete(id));
    }
  }, [missing]);

  // Keep the active row in view
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  // ─── Flatten the visible tree ─────────────────────────

  const nodes: Node[] = [];
  const pushChildren = (parent: Folder, rows: ExplorerRow[] | undefined, count: number, depth: number) => {
    if (!rows) {
      for (let i = 0; i < count; i++) {
        nodes.push({ id: `${parent}#${i}`, kind: "placeholder", depth, label: "", href: "", parentId: parent });
      }
      return;
    }
    for (const r of rows) {
      nodes.push({ id: `${parent}>${r.id}`, kind: "leaf", depth, label: r.label, href: r.href, parentId: parent, count: r.count, row: r });
    }
  };

  const vocabOpen = isOpen("vocab");
  nodes.push({ id: "vocab", kind: "folder", depth: 0, label: "Vocabulário", href: "/vocabulary", count: tree.vocab.total, open: vocabOpen });
  if (vocabOpen) {
    const reviewOpen = isOpen("review");
    nodes.push({
      id: "review",
      kind: "folder",
      depth: 1,
      label: "A rever",
      href: "/vocabulary/a-rever",
      parentId: "vocab",
      count: shell ? shell.due.length : null,
      urgent: true,
      open: reviewOpen,
    });
    if (reviewOpen && shell) pushChildren("review", shell.due, 0, 2);
    for (const c of tree.vocab.categories) {
      const id = `vocab:${c.id}` as FolderId;
      const open = isOpen(id);
      nodes.push({ id, kind: "folder", depth: 1, label: c.title, href: c.href, parentId: "vocab", count: c.count, open });
      if (open) pushChildren(id, children[id], c.count, 2);
    }
  }
  for (const [id, label, href, count] of [
    ["grammar", "Gramática", "/grammar", tree.grammar],
    ["verbs", "Verbos", "/conjugations", tree.verbs],
    ["culture", "Cultura", "/culture", tree.culture],
  ] as const) {
    const open = isOpen(id);
    nodes.push({ id, kind: "folder", depth: 0, label, href, count, open });
    if (open) pushChildren(id, children[id], count, 1);
  }

  const navNodes: (Node & { icon: typeof Play })[] = [
    { id: "nav:hoje", kind: "nav", depth: 0, label: "Hoje", href: "/", icon: CalendarDays },
    { id: "nav:praticar", kind: "nav", depth: 0, label: "Praticar", href: "/learn?mode=review", icon: Play, count: shell ? shell.reviewCount : null, urgent: true },
    { id: "nav:progresso", kind: "nav", depth: 0, label: "Progresso", href: "/progress", icon: LineChart },
  ];

  const focusable = [...navNodes, ...nodes].filter((n) => n.kind !== "placeholder");
  const activeId = focusable.find((n) => hrefPath(n.href) === pathname)?.id;
  const tabStop = focusId && focusable.some((n) => n.id === focusId) ? focusId : activeId ?? focusable[0]?.id;

  // ─── Behaviour ────────────────────────────────────────

  const toggle = (id: string, open?: boolean) =>
    setChoices((c) => ({ ...c, [id]: open ?? !(c[id] ?? openByDefault(id as Folder, pathname, tree)) }));

  const focusNode = (id: string | undefined) => {
    if (!id) return;
    listRef.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const current = (e.target as HTMLElement).closest<HTMLElement>("[data-row]")?.dataset.row;
    const index = focusable.findIndex((n) => n.id === current);
    if (index < 0) return;
    const node = focusable[index];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusNode(focusable[Math.min(index + 1, focusable.length - 1)].id);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusNode(focusable[Math.max(index - 1, 0)].id);
        break;
      case "Home":
        e.preventDefault();
        focusNode(focusable[0].id);
        break;
      case "End":
        e.preventDefault();
        focusNode(focusable[focusable.length - 1].id);
        break;
      case "ArrowRight":
        if (node.kind === "folder") {
          e.preventDefault();
          if (!node.open) toggle(node.id, true);
          else focusNode(focusable[index + 1]?.parentId === node.id ? focusable[index + 1].id : undefined);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (node.kind === "folder" && node.open) toggle(node.id, false);
        else focusNode(node.parentId);
        break;
      case " ":
        if (node.kind === "folder") {
          e.preventDefault();
          toggle(node.id);
        }
        break;
    }
  };

  // ─── Render ───────────────────────────────────────────

  return (
    <nav
      aria-label="Explorador"
      onKeyDown={onKeyDown}
      className="flex h-full w-explorer shrink-0 flex-col border-r border-border-subtle bg-surface-side px-2.5 pt-3.5 pb-3"
    >
      {/* Workspace */}
      <div className="flex h-6 items-center gap-2 px-1.5">
        <span aria-hidden className="flex size-5 items-center justify-center rounded-row bg-accent text-caption font-semibold text-text-on-accent">
          A
        </span>
        <span className="text-[13px] font-semibold text-text-primary">Aula</span>
      </div>

      {/* Search */}
      <button
        type="button"
        onClick={onSearch}
        className="mt-3 flex h-8 w-full items-center gap-2 rounded-control border border-border-default bg-surface-raised px-2.5 text-left text-ui text-text-quaternary transition-colors hover:border-border-strong focus-visible:outline-offset-0"
      >
        <Search aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="flex-1 truncate">Procurar palavra, verbo, regra…</span>
        <kbd className="font-sans text-caption text-text-quaternary">⌘K</kbd>
      </button>

      <div ref={listRef} className="-mx-1 mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-1">
        {/* Primary navigation */}
        <ul className="flex flex-col gap-px">
          {navNodes.map((n) => {
            const Icon = n.icon;
            const active = n.id === activeId;
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  data-row={n.id}
                  tabIndex={n.id === tabStop ? 0 : -1}
                  onFocus={() => setFocusId(n.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-7 items-center gap-2.5 rounded-row border px-2 text-ui transition-colors focus-visible:outline-offset-[-2px] ${
                    active
                      ? "border-border-default bg-surface-raised text-accent"
                      : "border-transparent text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <Icon aria-hidden className="size-[15px] shrink-0 text-text-secondary" strokeWidth={1.6} />
                  <span className="flex-1 truncate">{n.label}</span>
                  {n.count === null ? (
                    <Skeleton className="h-2.5 w-3.5" />
                  ) : n.count !== undefined && n.count > 0 ? (
                    <span className="text-caption tabular-nums text-state-overdue">{formatCount(n.count)}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Library */}
        <p className="mt-6 mb-1.5 px-2 text-label font-medium uppercase text-text-quaternary">Biblioteca</p>
        <ul role="tree" aria-label="Biblioteca" className="flex flex-col pb-2">
          {nodes.map((n) => (
            <TreeRow
              key={n.id}
              node={n}
              active={n.id === activeId}
              tabbable={n.id === tabStop}
              onFocus={() => setFocusId(n.id)}
              onToggle={() => toggle(n.id)}
              onOpen={() => n.kind === "folder" && !n.open && toggle(n.id, true)}
            />
          ))}
        </ul>
      </div>

      <Foot shell={shell} />
    </nav>
  );
}

// ─── Rows ───────────────────────────────────────────────

const ROW = "flex h-[26px] items-center rounded-row border pr-2 text-ui transition-colors";

function indent(depth: number, leaf: boolean): React.CSSProperties {
  return { paddingLeft: 6 + depth * 14 + (leaf ? 2 : 0) };
}

function TreeRow({
  node,
  active,
  tabbable,
  onFocus,
  onToggle,
  onOpen,
}: {
  node: Node;
  active: boolean;
  tabbable: boolean;
  onFocus: () => void;
  onToggle: () => void;
  onOpen: () => void;
}) {
  if (node.kind === "placeholder") {
    return (
      <li aria-hidden className={`${ROW} border-transparent`} style={indent(node.depth, true)}>
        <Skeleton className="h-2.5 w-24" />
      </li>
    );
  }

  const tone = active
    ? "border-border-default bg-surface-raised text-accent"
    : "border-transparent text-text-primary hover:bg-surface-hover";
  const folder = node.kind === "folder";

  return (
    <li role="treeitem" aria-level={node.depth + 1} aria-expanded={folder ? !!node.open : undefined} aria-selected={active}>
      <div className={`${ROW} ${tone}`} style={indent(node.depth, !folder)}>
        {folder && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={node.open ? `Fechar ${node.label}` : `Abrir ${node.label}`}
            onClick={onToggle}
            className="-ml-0.5 mr-px flex size-3.5 shrink-0 items-center justify-center rounded-xs text-text-quaternary transition-colors hover:text-text-primary"
          >
            <ChevronRight
              aria-hidden
              className={`size-3 transition-transform ${node.open ? "rotate-90" : ""}`}
              strokeWidth={2}
            />
          </button>
        )}
        <Link
          href={node.href}
          data-row={node.id}
          tabIndex={tabbable ? 0 : -1}
          onFocus={onFocus}
          onClick={onOpen}
          aria-current={active ? "page" : undefined}
          className="-my-px flex h-[26px] min-w-0 flex-1 items-center rounded-row pl-1 focus-visible:outline-offset-[-2px]"
        >
          <span className="truncate">{node.label}</span>
          {node.row?.state ? (
            <StateDot state={node.row.state} overdueDays={node.row.overdueDays} />
          ) : node.count === null ? (
            <Skeleton className="ml-auto h-2.5 w-3.5" />
          ) : node.count !== undefined ? (
            <span className={`ml-auto pl-2 text-caption tabular-nums ${node.urgent && node.count > 0 ? "text-state-overdue" : "text-text-quaternary"}`}>
              {formatCount(node.count)}
            </span>
          ) : null}
        </Link>
      </div>
    </li>
  );
}

// ─── Foot ───────────────────────────────────────────────

function Foot({ shell }: { shell: ShellData | null }) {
  const standing = shell?.standing;
  const pct = standing ? Math.round(standing.progress * 100) : 0;

  return (
    <div className="shrink-0 pt-3">
      <div className="px-2">
        <div className="flex h-[15px] items-center justify-between text-caption tabular-nums">
          {standing ? (
            <>
              <span className="text-text-secondary">
                {standing.level} · {pct}% {standing.next ? `para ${standing.next}` : "dominado"}
              </span>
              <span className="text-text-quaternary">{formatCount(shell.masteredCount)} dominadas</span>
            </>
          ) : (
            <>
              <Skeleton className="h-2.5 w-[92px]" />
              <Skeleton className="h-2.5 w-[70px]" />
            </>
          )}
        </div>
        <div
          role="progressbar"
          aria-label={standing?.next ? `Progresso para ${standing.next}` : "Progresso"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="mt-2 h-[3px] overflow-hidden rounded-pill bg-track-empty"
        >
          <div className="h-full rounded-pill bg-accent transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-4 flex h-7 items-center gap-2.5 px-2">
        <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-label font-semibold text-accent">
          {shell ? shell.user.name.charAt(0).toUpperCase() : ""}
        </span>
        {shell ? (
          <span className="flex-1 truncate text-ui text-text-primary">{shell.user.name}</span>
        ) : (
          <span className="flex-1">
            <Skeleton className="h-2.5 w-16" />
          </span>
        )}
        <Link
          href="/settings"
          aria-label="Definições"
          className="flex size-6 items-center justify-center rounded-row text-text-quaternary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <Settings aria-hidden className="size-3.5" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
