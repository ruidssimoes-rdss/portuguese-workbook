"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { SlideDrawer } from "@/components/ui/slide-drawer";
import { Pin, Plus, Search } from "lucide-react";
import { Label, ScreenTitle } from "@/components/aula";
import { useAuth } from "@/components/auth-provider";
import {
  getUserNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  archiveNote,
  type Note,
  type NoteContextType,
} from "@/lib/notes-service";

const FILTERS: { id: string; label: string; contextType?: NoteContextType; isPinned?: boolean; isArchived?: boolean }[] = [
  { id: "all", label: "Todas" },
  { id: "pinned", label: "Fixadas", isPinned: true },
  { id: "grammar", label: "Gramática", contextType: "grammar" },
  { id: "vocabulary", label: "Vocabulário", contextType: "vocabulary" },
  { id: "verbs", label: "Verbos", contextType: "verb" },
  { id: "lessons", label: "Lições", contextType: "lesson" },
  { id: "archived", label: "Arquivo", isArchived: true },
];

const CONTEXT_LABELS: Record<string, string> = {
  grammar: "Gramática",
  vocabulary: "Vocabulário",
  verb: "Verbos",
  lesson: "Lições",
};

const MESES: string[] = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function formatDateFilterLabel(
  updatedDateStart: string | undefined,
  updatedDateEnd: string | undefined,
  updatedDate: string | undefined
): string | null {
  if (updatedDateStart && updatedDateEnd) {
    const [y1, m1, d1] = updatedDateStart.split("-").map(Number);
    const [, m2, d2] = updatedDateEnd.split("-").map(Number);
    const monthName = MESES[m2 - 1];
    return `A mostrar notas de ${d1} a ${d2} de ${monthName}`;
  }
  if (updatedDate) {
    const [, m, d] = updatedDate.split("-").map(Number);
    const monthName = MESES[m - 1];
    return `A mostrar notas de ${d} de ${monthName}`;
  }
  return null;
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias`;
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

function NoteRow({ note, onClick }: { note: Note; onClick: () => void }) {
  const preview = note.content.replace(/\s+/g, " ").trim();
  const ctx = note.context_type ? (note.context_label || CONTEXT_LABELS[note.context_type] || note.context_type) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-aula-sunken"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {note.is_pinned && <Pin size={11} strokeWidth={1.75} className="shrink-0 text-aula-accent" />}
          <span className="truncate text-[13px] font-medium text-aula-text">{note.title?.trim() || "Sem título"}</span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-aula-text-2">{preview || "Sem conteúdo"}</p>
        {(ctx || (note.tags?.length ?? 0) > 0) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {ctx && <span className="rounded-md bg-aula-accent-faint px-1.5 py-[1px] text-[10.5px] font-medium text-aula-accent">{ctx}</span>}
            {(note.tags ?? []).map((t) => (
              <span key={t} className="rounded-md bg-aula-sunken px-1.5 py-[1px] text-[10.5px] text-aula-text-3">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="shrink-0 pt-[1px] text-[11px] text-aula-text-3">{formatRelativeTime(note.updated_at)}</span>
    </button>
  );
}

function NoteEditorDrawer({
  noteId: initialNoteId,
  initialContext,
  onClose,
  onSaved,
  onDeleted,
}: {
  noteId: string | null;
  initialContext?: { contextType: NoteContextType; contextId: string; contextLabel: string };
  onClose: () => void;
  onSaved: (note: Note) => void;
  onDeleted: () => void;
}) {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef({ title: "", content: "", tags: [] as string[] });

  const loadNote = useCallback(async (id: string) => {
    const n = await getNoteById(id);
    if (n) {
      setNote(n);
      setTitle(n.title ?? "");
      setContent(n.content);
      setTags(n.tags ?? []);
      lastSavedRef.current = { title: n.title ?? "", content: n.content, tags: n.tags ?? [] };
    }
  }, []);

  useEffect(() => {
    if (initialNoteId) {
      loadNote(initialNoteId);
    } else if (initialContext) {
      createNote({
        content: "",
        contextType: initialContext.contextType,
        contextId: initialContext.contextId,
        contextLabel: initialContext.contextLabel,
      }).then((n) => {
        if (n) {
          setNote(n);
          setTitle(n.title ?? "");
          setContent(n.content);
          setTags(n.tags ?? []);
          lastSavedRef.current = { title: n.title ?? "", content: n.content, tags: n.tags ?? [] };
          onSaved(n);
        }
      });
    } else {
      setNote(null);
      setTitle("");
      setContent("");
      setTags([]);
      lastSavedRef.current = { title: "", content: "", tags: [] };
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [initialNoteId, initialContext?.contextId]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(async () => {
    const t = title.trim();
    const c = content;
    const tagList = tags;
    if (t === lastSavedRef.current.title && c === lastSavedRef.current.content && JSON.stringify(tagList) === JSON.stringify(lastSavedRef.current.tags)) return;
    setSaving(true);
    try {
      if (note) {
        const updated = await updateNote(note.id, { title: t || null, content: c, tags: tagList });
        if (updated) {
          setNote(updated);
          lastSavedRef.current = { title: updated.title ?? "", content: updated.content, tags: updated.tags ?? [] };
          setSavedAt(Date.now());
          onSaved(updated);
        }
      } else if (!initialContext && (t || c)) {
        const created = await createNote({ title: t || null, content: c, tags: tagList });
        if (created) {
          setNote(created);
          lastSavedRef.current = { title: created.title ?? "", content: created.content, tags: created.tags ?? [] };
          setSavedAt(Date.now());
          onSaved(created);
        }
      }
    } finally {
      setSaving(false);
    }
  }, [note, title, content, tags, initialContext, onSaved]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(persist, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, tags, persist]);

  const handleBlur = () => {
    persist();
  };

  const handlePin = async () => {
    if (!note) return;
    const updated = await togglePinNote(note.id);
    if (updated) {
      setNote(updated);
      onSaved(updated);
    }
  };

  const handleArchive = async () => {
    if (!note) return;
    await archiveNote(note.id);
    onDeleted();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirmDelete && note) {
      setConfirmDelete(true);
      return;
    }
    if (note) {
      await deleteNote(note.id);
      onDeleted();
      onClose();
    }
  };

  const contextLabel = note?.context_type
    ? `${CONTEXT_LABELS[note.context_type] ?? note.context_type}${note.context_label ? ` — ${note.context_label}` : ""}`
    : initialContext && initialContext.contextType
      ? `${CONTEXT_LABELS[initialContext.contextType] ?? initialContext.contextType} — ${initialContext.contextLabel}`
      : null;
  const contextTypeKey = note?.context_type ?? initialContext?.contextType ?? null;

  const linkedToHref =
    note?.context_type && note?.context_id
      ? note.context_type === "grammar"
        ? `/grammar/${(note.context_id as string).replace(/\s+/g, "-").toLowerCase()}`
        : note.context_type === "vocabulary"
          ? "/vocabulary"
          : note.context_type === "verb"
            ? `/conjugations/${(note.context_id as string).toLowerCase()}`
            : note.context_type === "lesson"
              ? `/lessons/${note.context_id}`
              : null
      : initialContext
        ? initialContext.contextType === "grammar"
          ? `/grammar/${(initialContext.contextId as string).replace(/\s+/g, "-").toLowerCase()}`
          : initialContext.contextType === "vocabulary"
            ? "/vocabulary"
            : initialContext.contextType === "verb"
              ? `/conjugations/${(initialContext.contextId as string).toLowerCase()}`
              : initialContext.contextType === "lesson"
                ? `/lessons/${initialContext.contextId}`
                : null
        : null;

  const addTag = () => {
    const v = newTag.trim().toLowerCase();
    if (v && !tags.includes(v)) {
      setTags((prev) => [...prev, v]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <SlideDrawer
      isOpen
      onClose={onClose}
      title={contextLabel ?? "Nota"}
      ariaLabel="Editar nota"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {contextLabel && (
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-md bg-aula-accent-faint px-1.5 py-[1px] text-[11px] font-medium text-aula-accent">{contextLabel}</span>
              {linkedToHref && (
                <Link href={linkedToHref} className="text-[11.5px] text-aula-text-3 hover:text-aula-accent">
                  Abrir →
                </Link>
              )}
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            placeholder="Título"
            className="mb-2 w-full border-0 bg-transparent text-[20px] font-semibold tracking-[-0.01em] text-aula-text placeholder:text-aula-text-4 focus:outline-none focus:ring-0"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Começa a escrever…"
            className="min-h-[350px] w-full resize-y border-0 bg-transparent text-[13.5px] leading-[1.8] text-aula-text placeholder:text-aula-text-4 focus:outline-none focus:ring-0"
          />
          <div className="mt-4">
            <Label className="mb-2">Etiquetas</Label>
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-6 items-center gap-1 rounded-md bg-aula-sunken px-2 text-[11.5px] text-aula-text-2"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-[#98988F] hover:text-[#1F1F1F]" aria-label="Remover">×</button>
                </span>
              ))}
              <span className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="+ etiqueta"
                  className="h-6 w-24 rounded-md border border-aula-border bg-white px-2 text-[11.5px] outline-none focus:border-aula-accent"
                />
              </span>
            </div>
          </div>
        </div>
        <div
          className="flex shrink-0 items-center justify-between gap-4 border-t border-aula-line px-4 py-2.5"
        >
          <div className="flex items-center gap-1">
            {note && (
              <button
                type="button"
                onClick={handlePin}
                className="h-7 rounded-md px-2.5 text-[12px] font-medium text-aula-text-2 transition-colors hover:bg-aula-sunken hover:text-aula-text"
              >
                {note.is_pinned ? "Desfixar" : "Fixar"}
              </button>
            )}
            {note && (
              <button
                type="button"
                onClick={handleArchive}
                className="h-7 rounded-md px-2.5 text-[12px] font-medium text-aula-text-2 transition-colors hover:bg-aula-sunken hover:text-aula-text"
              >
                Arquivar
              </button>
            )}
            {(note || initialContext) && (
              <button
                type="button"
                onClick={handleDelete}
                className={`h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors ${confirmDelete ? "bg-[#FBE9E4] text-aula-overdue" : "text-aula-text-2 hover:bg-aula-sunken hover:text-aula-overdue"}`}
              >
                {confirmDelete ? "Apagar mesmo?" : "Apagar"}
              </button>
            )}
          </div>
          <span className="text-[11px] text-aula-text-3">
            {saving ? "A guardar…" : savedAt != null ? "Guardado" : ""}
          </span>
        </div>
      </div>
    </SlideDrawer>
  );
}

function NotesContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filterId, setFilterId] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerNoteId, setDrawerNoteId] = useState<string | null>(null);
  const [drawerContext, setDrawerContext] = useState<{
    contextType: NoteContextType;
    contextId: string;
    contextLabel: string;
  } | null>(null);
  const hasCreatedFromContext = useRef(false);

  const isLoggedIn = !authLoading && !!user;

  const urlContextType = searchParams.get("contextType");
  const urlContextId = searchParams.get("contextId");
  const updatedDateStart = searchParams.get("updatedDateStart") ?? undefined;
  const updatedDateEnd = searchParams.get("updatedDateEnd") ?? undefined;
  const updatedDate = searchParams.get("updatedDate") ?? undefined;
  const dateFilterLabel = formatDateFilterLabel(
    updatedDateStart,
    updatedDateEnd,
    updatedDateStart && updatedDateEnd ? undefined : updatedDate
  );
  const clearDateFilter = () => router.replace("/notes");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const f = FILTERS.find((x) => x.id === filterId);
    const updatedDate = searchParams.get("updatedDate") ?? undefined;
    const contextIdToUse = urlContextId ?? undefined;
    const list = await getUserNotes({
      contextType: f?.contextType,
      contextId: contextIdToUse,
      isPinned: f?.isPinned,
      isArchived: f?.isArchived ?? (filterId === "all" ? false : undefined),
      search: debouncedSearch.trim() || undefined,
      updatedDate: updatedDateStart && updatedDateEnd ? undefined : updatedDate || undefined,
      updatedDateStart: updatedDateStart || undefined,
      updatedDateEnd: updatedDateEnd || undefined,
    });
    setNotes(list);
    setLoading(false);
  }, [filterId, debouncedSearch, searchParams, urlContextId, updatedDateStart, updatedDateEnd]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotes();
  }, [isLoggedIn, fetchNotes]);

  useEffect(() => {
    if (!isLoggedIn || hasCreatedFromContext.current) return;
    const contextType = searchParams.get("contextType") as NoteContextType | null;
    const contextId = searchParams.get("contextId");
    const contextLabel = searchParams.get("contextLabel");
    if (
      (contextType === "grammar" || contextType === "vocabulary" || contextType === "verb" || contextType === "lesson") &&
      contextId &&
      contextLabel
    ) {
      hasCreatedFromContext.current = true;
      setDrawerContext({ contextType, contextId, contextLabel });
      setDrawerNoteId(null);
      setDrawerOpen(true);
      window.history.replaceState({}, "", "/notes");
    }
  }, [isLoggedIn, searchParams]);

  useEffect(() => {
    if (!urlContextType) return;
    const match = FILTERS.find((f) => f.contextType === urlContextType);
    if (match) setFilterId(match.id);
  }, [urlContextType]);

  const notesFilteredByTag = selectedTag
    ? notes.filter((n) => n.tags?.includes(selectedTag))
    : notes;
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => (n.tags ?? []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const sortedNotes = [...notesFilteredByTag].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const openNewNote = () => {
    setDrawerContext(null);
    setDrawerNoteId(null);
    setDrawerOpen(true);
  };

  const openEditor = (note: Note) => {
    setDrawerNoteId(note.id);
    setDrawerContext(null);
    setDrawerOpen(true);
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    setDrawerNoteId(null);
    setDrawerContext(null);
  };

  const pinned = sortedNotes.filter((n) => n.is_pinned);
  const recent = sortedNotes.filter((n) => !n.is_pinned);
  const showSections = filterId === "all" && pinned.length > 0;

  const panel = isLoggedIn ? (
    <div className="flex flex-col gap-6">
      <div>
        <Label className="mb-2">Coleções</Label>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterId(f.id)}
            className={`flex h-7 w-full items-center rounded-md px-2 text-left text-[12.5px] ${filterId === f.id ? "bg-aula-selected font-medium text-aula-text" : "text-aula-text-2 hover:bg-aula-sunken"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {allTags.length > 0 && (
        <div>
          <Label className="mb-2">Etiquetas</Label>
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag((prev) => (prev === tag ? null : tag))}
                className={`h-6 rounded-md px-2 text-[11.5px] transition-colors ${selectedTag === tag ? "bg-aula-accent text-white" : "bg-aula-sunken text-aula-text-2 hover:text-aula-text"}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-[11.5px] leading-relaxed text-aula-text-3">
        Também podes criar uma nota a partir de qualquer palavra, verbo ou regra. Fica ligada a ela.
      </p>
    </div>
  ) : undefined;

  return (
    <>
      <PageShell header={<Crumbs items={[{ label: "Notas" }]} />} panel={panel}>
        <div className="mx-auto max-w-[680px]">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <ScreenTitle title="Notas" subtitle="O teu caderno de estudo" />
            </div>
            {isLoggedIn && (
              <button
                type="button"
                onClick={openNewNote}
                className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-lg bg-aula-accent px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
              >
                <Plus size={14} strokeWidth={1.75} /> Nova nota
              </button>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="rounded-xl border border-aula-border p-8 text-center">
              <p className="text-[15px] font-semibold text-aula-text">Entra para usar o caderno</p>
              <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] text-aula-text-2">Guarda as tuas notas e tem-nas em todos os dispositivos.</p>
              <Link href="/auth/login" className="mt-4 inline-flex h-8 items-center rounded-lg bg-aula-accent px-4 text-[12.5px] font-medium text-white">
                Entrar
              </Link>
            </div>
          ) : (
            <>
              <label className="mb-5 flex h-8 items-center gap-2 rounded-lg border border-aula-line bg-aula-sunken px-2.5 focus-within:border-aula-border focus-within:bg-white">
                <Search size={14} strokeWidth={1.5} className="text-aula-text-3" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Procurar nas notas…"
                  className="w-full bg-transparent text-[12px] text-aula-text outline-none placeholder:text-aula-text-3"
                />
              </label>

              {dateFilterLabel && (
                <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-aula-accent-faint px-3 py-2">
                  <span className="text-[12.5px] text-aula-accent">{dateFilterLabel}</span>
                  <button type="button" onClick={clearDateFilter} className="text-[12px] font-medium text-aula-accent" aria-label="Remover filtro de data">
                    Limpar
                  </button>
                </div>
              )}

              {loading ? (
                <p className="py-8 text-center text-[13px] text-aula-text-3">{debouncedSearch.trim() ? "A procurar…" : "A carregar…"}</p>
              ) : sortedNotes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-aula-border px-6 py-12 text-center">
                  <p className="text-[14px] font-semibold text-aula-text">{debouncedSearch.trim() || selectedTag || filterId !== "all" ? "Nada aqui" : "Ainda sem notas"}</p>
                  <p className="mx-auto mt-1 max-w-[340px] text-[12.5px] text-aula-text-2">
                    {debouncedSearch.trim() || selectedTag || filterId !== "all" ? "Nenhuma nota com estes filtros." : "Aponta o que te custa, frases que ouviste, dúvidas para o Elísio."}
                  </p>
                </div>
              ) : (
                <>
                  {showSections && <Label className="mb-1 px-3">Fixadas</Label>}
                  {pinned.map((note) => (
                    <NoteRow key={note.id} note={note} onClick={() => openEditor(note)} />
                  ))}
                  {showSections && recent.length > 0 && <Label className="mb-1 mt-6 px-3">Recentes</Label>}
                  {recent.map((note) => (
                    <NoteRow key={note.id} note={note} onClick={() => openEditor(note)} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </PageShell>

      {isLoggedIn && drawerOpen && (
        <NoteEditorDrawer
          noteId={drawerNoteId}
          initialContext={drawerContext ?? undefined}
          onClose={closeEditor}
          onSaved={(n) => {
            setDrawerNoteId(n.id);
            fetchNotes();
          }}
          onDeleted={() => fetchNotes()}
        />
      )}
    </>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={
      <PageShell header={<Crumbs items={[{ label: "Notas" }]} />}>
        <p className="py-16 text-center text-[13px] text-aula-text-3">A carregar…</p>
      </PageShell>
    }>
      <NotesContent />
    </Suspense>
  );
}
