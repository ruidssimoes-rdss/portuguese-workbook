"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Divider } from "@/components/ui/divider";
import { SlideDrawer } from "@/components/ui/slide-drawer";
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

const CONTEXT_COLORS: Record<string, string> = {
  grammar: "text-slate-600",
  vocabulary: "text-indigo-600",
  verb: "text-sky-600",
  lesson: "text-[#003399]",
};

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
  const contextColor = note.context_type ? (CONTEXT_COLORS[note.context_type] ?? "text-gray-500") : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-[12px] hover:bg-[rgba(0,0,0,0.02)] transition-colors border border-transparent hover:border-[rgba(0,0,0,0.06)]"
    >
      <span
        className={`w-[3px] shrink-0 self-stretch rounded-full ${note.is_pinned ? "bg-[#003399]" : "bg-transparent"}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold text-gray-900 truncate">
            {note.title?.trim() || "Sem título"}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {contextLabel && (
              <span className={`text-[11px] font-medium ${contextColor}`}>{contextLabel}</span>
            )}
            <p className="text-[12px] text-gray-500 truncate">{previewText || "Sem conteúdo"}</p>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeTime(note.updated_at)}</span>
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
  const contextColor = contextTypeKey ? (CONTEXT_COLORS[contextTypeKey] ?? "text-gray-600") : "";

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
            <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-[12px] mb-4 ${contextColor} bg-gray-100`}>
              {contextLabel}
            </span>
          )}
          {linkedToHref && (
            <p className="text-[12px] text-gray-600 mb-3">
              Ligado a:{" "}
              <Link href={linkedToHref} className="text-[#003399] hover:underline">
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
            className="w-full text-[20px] font-semibold text-gray-900 border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400 mb-2"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Começar a escrever..."
            className="w-full min-h-[350px] text-[14px] text-gray-700/90 leading-[1.8] border-0 focus:ring-0 focus:outline-none resize-y placeholder:text-gray-400"
          />
          <div className="mt-4">
            <p className="text-[11px] font-medium text-gray-500 mb-2">Etiquetas</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] text-[12px] border border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)]"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-700" aria-label="Remover">×</button>
                </span>
              ))}
              <span className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="+ Adicionar"
                  className="w-24 px-2 py-0.5 rounded-[8px] text-[12px] border border-[rgba(0,0,0,0.06)] focus:border-[rgba(0,0,0,0.1)] focus:ring-0 outline-none"
                />
                <button type="button" onClick={addTag} className="text-[12px] font-medium text-[#003399] hover:underline">
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
  const [filterId, setFilterId] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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
      search: search.trim() || undefined,
      updatedDate: updatedDate || undefined,
    });
    setNotes(list);
    setLoading(false);
  }, [filterId, search, searchParams, urlContextId]);

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
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PageHeader
              title="Notas"
              section="REVISION"
              sectionPt="Revisão"
              tagline="O teu caderno de estudo — ideias, regras e descobertas."
            />
            {isLoggedIn && (
              <button
                type="button"
                onClick={openNewNote}
                className="shrink-0 flex items-center gap-2 h-10 px-4 bg-[#003399] hover:bg-[#002266] text-white rounded-[12px] text-sm font-medium transition-colors border border-[rgba(0,0,0,0.06)]"
              >
                <PencilIcon className="w-4 h-4" />
                Nova nota
              </button>
            )}
          </div>
          <Divider className="mt-4 mb-6" />
        </div>

        {!isLoggedIn ? (
          <div className="border border-[rgba(0,0,0,0.06)] rounded-[12px] p-8 bg-white text-center">
            <p className="text-[15px] font-semibold text-gray-900">
              Inicia sessão para usar o caderno
            </p>
            <p className="text-[13px] text-gray-500 mt-1">
              Guarda as tuas notas e sincroniza entre dispositivos.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-9 px-5 bg-[#003399] text-white rounded-[12px] text-[13px] font-medium hover:bg-[#002266] transition-colors mt-5 border border-[rgba(0,0,0,0.06)]"
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
                  className={`px-3 py-1.5 rounded-[12px] text-sm font-medium border transition-all ${
                    filterId === f.id
                      ? "bg-[rgba(0,0,0,0.05)] text-gray-900 border-[rgba(0,0,0,0.08)]"
                      : "border-[rgba(0,0,0,0.06)] text-gray-500 hover:text-gray-700 hover:border-[rgba(0,0,0,0.1)] bg-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <div className="flex-1 min-w-[160px] max-w-xs ml-auto">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar..."
                  className="w-full px-3 py-2 rounded-[12px] text-sm border border-[rgba(0,0,0,0.06)] focus:border-[rgba(0,0,0,0.1)] focus:ring-1 focus:ring-[rgba(0,0,0,0.05)] outline-none"
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
                        ? "px-2.5 py-1 text-[11px] font-medium text-white bg-[#003399] rounded-full"
                        : "px-2.5 py-1 text-[11px] font-medium text-[#9CA3AF] bg-[#F5F5F5] rounded-full hover:bg-[#EBEBEB] transition-colors duration-150"
                    }
                  >
                    {tag}{selectedTag === tag ? " ×" : ""}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p className="text-sm text-gray-500 py-8">A carregar...</p>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-gray-900">Ainda sem notas</h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Começa a capturar as tuas descobertas.
                </p>
                <button
                  type="button"
                  onClick={openNewNote}
                  className="inline-flex items-center gap-2 h-10 px-4 bg-[#003399] hover:bg-[#002266] text-white rounded-[12px] text-sm font-medium border border-[rgba(0,0,0,0.06)]"
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
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mt-4 mb-2" style={{ opacity: 0.85 }}>
                          Fixadas
                        </p>
                      )}
                      {pinned.map((note) => (
                        <NoteRow key={note.id} note={note} onClick={() => openEditor(note)} />
                      ))}
                      {showSections && recent.length > 0 && (
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mt-6 mb-2" style={{ opacity: 0.85 }}>
                          Recentes
                        </p>
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
      </PageContainer>

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
      <>
        <Topbar />
        <PageContainer>
          <div className="py-5">
            <PageHeader
              title="Notas"
              section="REVISION"
              sectionPt="Revisão"
              tagline="O teu caderno de estudo."
            />
            <Divider className="mt-4 mb-6" />
          </div>
          <p className="text-sm text-gray-500 py-8">A carregar...</p>
          <div className="pb-16" />
        </PageContainer>
      </>
    }>
      <NotesContent />
    </Suspense>
  );
}
