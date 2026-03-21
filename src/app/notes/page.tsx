"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { SlideDrawer } from "@/components/ui/slide-drawer";
import { PageHeader, SectionLabel, BadgePill } from "@/components/primitives";
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

function NoteRow({
  note,
  onClick,
}: {
  note: Note;
  onClick: () => void;
}) {
  const preview = note.content.slice(0, 80).trim();
  const previewText = preview.length < note.content.length ? `${preview}…` : preview;
  const contextLabel = note.context_type
    ? `${CONTEXT_LABELS[note.context_type] ?? note.context_type}${note.context_label ? ` — ${note.context_label}` : ""}`
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#F7F7F5] transition-colors duration-100 cursor-pointer"
    >
      <span
        className={`w-[3px] shrink-0 self-stretch rounded-full ${note.is_pinned ? "bg-[#185FA5]" : "bg-transparent"}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-medium text-[#111111] truncate">
            {note.title?.trim() || "Sem título"}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {contextLabel && (
              <BadgePill label={contextLabel} variant="neutral" />
            )}
            <p className="text-[12px] text-[#6C6B71] truncate">{previewText || "Sem conteúdo"}</p>
          </div>
        </div>
        <span className="text-[11px] text-[#9B9DA3] shrink-0">{formatRelativeTime(note.updated_at)}</span>
      </div>
    </button>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
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
            <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-lg mb-4 text-[#6C6B71] bg-[#F7F7F5]">
              {contextLabel}
            </span>
          )}
          {linkedToHref && (
            <p className="text-[12px] text-[#6C6B71] mb-3">
              Ligado a:{" "}
              <Link href={linkedToHref} className="text-[#185FA5] hover:underline">
                {contextLabel} →
              </Link>
            </p>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            placeholder="Título"
            className="w-full text-[20px] font-medium text-[#111111] border-0 focus:ring-0 focus:outline-none placeholder:text-[#9B9DA3] mb-2"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Começar a escrever..."
            className="w-full min-h-[350px] text-[13px] text-[#6C6B71] leading-[1.8] border-0 focus:ring-0 focus:outline-none resize-y placeholder:text-[#9B9DA3]"
          />
          <div className="mt-4">
            <p className="text-[11px] font-medium text-[#9B9DA3] mb-2">Etiquetas</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border-[0.5px] border-[rgba(0,0,0,0.06)] bg-[#F7F7F5]"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-[#9B9DA3] hover:text-[#111111]" aria-label="Remover">×</button>
                </span>
              ))}
              <span className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="+ Adicionar"
                  className="w-24 px-2 py-0.5 rounded-lg text-[12px] border-[0.5px] border-[rgba(0,0,0,0.06)] focus:border-[rgba(0,0,0,0.12)] focus:ring-0 outline-none"
                />
                <button type="button" onClick={addTag} className="text-[12px] font-medium text-[#185FA5] hover:underline">
                  Adicionar
                </button>
              </span>
            </div>
          </div>
        </div>
        <div
          className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 rounded-[10px] mx-4 mb-4 bg-black/88 backdrop-blur-xl border border-[rgba(0,0,0,0.06)]"
        >
          <div className="flex items-center gap-1">
            {note && (
              <button
                type="button"
                onClick={handlePin}
                className="px-3 py-1.5 text-[11px] font-medium rounded-[12px] text-white/40 hover:text-white/[0.85] transition-colors"
              >
                {note.is_pinned ? "Desfixar" : "Fixar"}
              </button>
            )}
            {note && (
              <button
                type="button"
                onClick={handleArchive}
                className="px-3 py-1.5 text-[11px] font-medium rounded-[12px] text-white/40 hover:text-white/[0.85] transition-colors"
              >
                Arquivar
              </button>
            )}
            {(note || initialContext) && (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-[12px] transition-colors ${confirmDelete ? "text-red-400 hover:text-red-300" : "text-white/40 hover:text-red-400"}`}
              >
                {confirmDelete ? "Confirmar apagar" : "Apagar"}
              </button>
            )}
          </div>
          <span className="text-[10px] font-medium text-white/[0.35]">
            {saving ? "A guardar..." : savedAt != null ? "Guardado" : ""}
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

  return (
    <>
      <PageShell>
        <PageHeader title="Notas" subtitle="Your study notebook" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div />
          {isLoggedIn && (
            <button
              type="button"
              onClick={openNewNote}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Nova nota
            </button>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] font-medium text-[#111111] mb-2">
              Inicia sessão para usar o caderno
            </p>
            <p className="text-[13px] text-[#9B9DA3] mb-6">
              Guarda as tuas notas e sincroniza entre dispositivos.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-3 py-1.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
            >
              Entrar
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterId(f.id)}
                  className={`px-3 py-1.5 rounded-[5px] text-[12px] border-none cursor-pointer transition-all duration-100 ${
                    filterId === f.id
                      ? "text-[#111111] font-medium bg-[rgba(0,0,0,0.05)]"
                      : "text-[#9B9DA3] hover:text-[#6C6B71]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <div className="flex-1 min-w-[160px] max-w-xs ml-auto">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Pesquisar..."
                  className="pl-8 pr-3 py-1.5 border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg text-[12px] w-[220px] bg-white text-[#111111] outline-none placeholder:text-[#9B9DA3] focus:border-[rgba(0,0,0,0.12)] transition-colors"
                />
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag((prev) => (prev === tag ? null : tag))}
                    className={
                      selectedTag === tag
                        ? "px-2 py-0.5 text-[10px] font-medium text-white bg-[#111111] rounded-full"
                        : "px-2 py-0.5 text-[10px] text-[#9B9DA3] bg-[#F7F7F5] rounded-full hover:bg-[rgba(0,0,0,0.06)]"
                    }
                  >
                    {tag}{selectedTag === tag ? " ×" : ""}
                  </button>
                ))}
              </div>
            )}

            {dateFilterLabel && (
              <div className="flex items-center justify-between gap-2 mb-4 bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2">
                <span className="text-[13px] text-[#6C6B71]">{dateFilterLabel}</span>
                <button
                  type="button"
                  onClick={clearDateFilter}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#9B9DA3] hover:bg-[rgba(0,0,0,0.06)] hover:text-[#111111] transition-colors"
                  aria-label="Remover filtro de data"
                >
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <p className="text-[13px] text-[#9B9DA3] py-8">
                {debouncedSearch.trim() ? "A pesquisar..." : "A carregar..."}
              </p>
            ) : sortedNotes.length === 0 ? (
              <div className="text-[13px] text-[#9B9DA3] text-center py-16">
                <h3 className="text-[14px] font-medium text-[#111111] mb-2">Ainda sem notas</h3>
                <p className="mb-6">
                  Começa a capturar as tuas descobertas.
                </p>
                <button
                  type="button"
                  onClick={openNewNote}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Nova nota
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {(() => {
                  const pinned = sortedNotes.filter((n) => n.is_pinned);
                  const recent = sortedNotes.filter((n) => !n.is_pinned);
                  const showSections = filterId === "all" && pinned.length > 0;
                  return (
                    <>
                      {showSections && (
                        <SectionLabel>Fixadas</SectionLabel>
                      )}
                      {pinned.map((note) => (
                        <NoteRow key={note.id} note={note} onClick={() => openEditor(note)} />
                      ))}
                      {showSections && recent.length > 0 && (
                        <div className="mt-6">
                          <SectionLabel>Recentes</SectionLabel>
                        </div>
                      )}
                      {recent.map((note) => (
                        <NoteRow key={note.id} note={note} onClick={() => openEditor(note)} />
                      ))}
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}

        <div className="pb-16" />
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
      <PageShell>
        <PageHeader title="Notas" subtitle="Your study notebook" />
        <p className="text-[13px] text-[#9B9DA3] py-8">Loading...</p>
      </PageShell>
    }>
      <NotesContent />
    </Suspense>
  );
}
