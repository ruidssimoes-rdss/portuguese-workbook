"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Divider } from "@/components/ui/divider";
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
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned", isPinned: true },
  { id: "grammar", label: "Grammar", contextType: "grammar" },
  { id: "vocabulary", label: "Vocabulary", contextType: "vocabulary" },
  { id: "verbs", label: "Verbs", contextType: "verb" },
  { id: "lessons", label: "Lessons", contextType: "lesson" },
  { id: "archived", label: "Archived", isArchived: true },
];

const CONTEXT_BADGE_COLORS: Record<string, string> = {
  grammar: "bg-[#4B5563] text-white",
  vocabulary: "bg-[#5B4FA0] text-white",
  verb: "bg-[#3D6B9E] text-white",
  lesson: "bg-[#003399] text-white",
};

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function NoteCard({
  note,
  onClick,
}: {
  note: Note;
  onClick: () => void;
}) {
  const preview = note.content.slice(0, 100).trim();
  const previewText = preview.length < note.content.length ? `${preview}...` : preview;
  const badgeLabel = note.context_type
    ? `${note.context_type === "verb" ? "Verbs" : note.context_type.charAt(0).toUpperCase() + note.context_type.slice(1)} · ${note.context_label ?? note.context_id ?? ""}`
    : "Free-form";
  const badgeColor = note.context_type
    ? CONTEXT_BADGE_COLORS[note.context_type] ?? "bg-gray-500 text-white"
    : "bg-gray-400 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-[#003399]/30 hover:shadow-sm transition-all duration-200 ${
        note.is_pinned ? "border-l-4 border-l-[#003399]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {note.title || "Untitled note"}
          </h3>
          <span
            className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded ${badgeColor}`}
          >
            {badgeLabel}
          </span>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{previewText || "No content"}</p>
          <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(note.updated_at)}</p>
        </div>
        {note.is_pinned && (
          <span className="shrink-0 text-gray-400" aria-hidden>
            <PinIcon className="w-4 h-4" />
          </span>
        )}
      </div>
    </button>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7-7 7 7V5" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
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
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef({ title: "", content: "" });

  const loadNote = useCallback(async (id: string) => {
    const n = await getNoteById(id);
    if (n) {
      setNote(n);
      setTitle(n.title ?? "");
      setContent(n.content);
      lastSavedRef.current = { title: n.title ?? "", content: n.content };
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
          lastSavedRef.current = { title: n.title ?? "", content: n.content };
          onSaved(n);
        }
      });
    } else {
      setNote(null);
      setTitle("");
      setContent("");
      lastSavedRef.current = { title: "", content: "" };
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [initialNoteId, initialContext?.contextId]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(async () => {
    const t = title.trim();
    const c = content;
    if (t === lastSavedRef.current.title && c === lastSavedRef.current.content) return;
    if (note) {
      const updated = await updateNote(note.id, { title: t || null, content: c });
      if (updated) {
        setNote(updated);
        lastSavedRef.current = { title: updated.title ?? "", content: updated.content };
        setSavedAt(Date.now());
        onSaved(updated);
      }
    } else if (!initialContext && (t || c)) {
      const created = await createNote({ title: t || null, content: c });
      if (created) {
        setNote(created);
        lastSavedRef.current = { title: created.title ?? "", content: created.content };
        setSavedAt(Date.now());
        onSaved(created);
      }
    }
  }, [note, title, content, initialContext, onSaved]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(persist, 1000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, persist]);

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
    ? `${note.context_type === "verb" ? "Verbs" : note.context_type.charAt(0).toUpperCase() + note.context_type.slice(1)} · ${note.context_label ?? note.context_id ?? ""}`
    : initialContext && initialContext.contextType
      ? `${initialContext.contextType === "verb" ? "Verbs" : initialContext.contextType.charAt(0).toUpperCase() + initialContext.contextType.slice(1)} · ${initialContext.contextLabel}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-lg bg-white shadow-xl flex flex-col max-h-full"
        role="dialog"
        aria-label="Edit note"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Note</h2>
          <div className="flex items-center gap-2">
            {savedAt != null && (
              <span className="text-xs text-gray-500">
                Saved
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            placeholder="Note title (optional)"
            className="w-full text-lg font-medium text-gray-900 border-0 border-b border-gray-200 focus:border-[#003399] focus:ring-0 focus:outline-none pb-2"
          />
          {contextLabel && (
            <span className="inline-block text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
              {contextLabel}
            </span>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Start writing..."
            className="w-full min-h-[200px] text-sm text-gray-700 border border-gray-200 rounded-lg p-3 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 resize-y"
          />
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            {note && (
              <button
                type="button"
                onClick={handlePin}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003399]"
              >
                <PinIcon className="w-4 h-4" />
                {note.is_pinned ? "Unpin" : "Pin"}
              </button>
            )}
            {note && (
              <button
                type="button"
                onClick={handleArchive}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003399]"
              >
                Archive
              </button>
            )}
            {(note || initialContext) && (
              <button
                type="button"
                onClick={handleDelete}
                className={`flex items-center gap-1.5 text-sm ${confirmDelete ? "text-red-600 hover:text-red-700" : "text-gray-500 hover:text-[#003399]"}`}
              >
                <TrashIcon className="w-4 h-4" />
                {confirmDelete ? "Confirm delete" : "Delete"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotesContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [filterId, setFilterId] = useState("all");
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

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const f = FILTERS.find((x) => x.id === filterId);
    const list = await getUserNotes({
      contextType: f?.contextType,
      isPinned: f?.isPinned,
      isArchived: f?.isArchived ?? (filterId === "all" ? false : undefined),
      search: search.trim() || undefined,
    });
    setNotes(list);
    setLoading(false);
  }, [filterId, search]);

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

  const sortedNotes = [...notes].sort((a, b) => {
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
              title="Notes"
              titlePt="Notas"
              section="REVISION"
              sectionPt="Revisão"
              tagline="Your study notebook — capture ideas, rules, and discoveries."
            />
            {isLoggedIn && (
              <button
                type="button"
                onClick={openNewNote}
                className="shrink-0 flex items-center gap-2 h-10 px-4 bg-[#003399] hover:bg-[#002266] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                New Note
              </button>
            )}
          </div>
          <Divider className="mt-4 mb-6" />
        </div>

        {!isLoggedIn ? (
          <div className="border border-gray-200 rounded-xl p-8 bg-white text-center">
            <p className="text-[15px] font-semibold text-gray-900">
              Sign in to use your notebook
            </p>
            <p className="text-[13px] text-gray-500 italic mt-1">
              Inicia sessão para guardar as tuas notas
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-[36px] px-5 bg-[#003399] text-white border border-[#003399] rounded-xl text-[13px] font-medium hover:bg-[#002266] transition-colors duration-200 mt-5"
            >
              Entrar
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterId(f.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    filterId === f.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 bg-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" strokeWidth={2} />
                  </svg>
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500 py-8">Loading...</p>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center py-16">
                <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No notes yet</h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Start capturing your learning discoveries.
                </p>
                <button
                  type="button"
                  onClick={openNewNote}
                  className="inline-flex items-center gap-2 h-10 px-4 bg-[#003399] hover:bg-[#002266] text-white rounded-lg text-sm font-medium"
                >
                  <PencilIcon className="w-4 h-4" />
                  Create your first note
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {sortedNotes.map((note) => (
                  <li key={note.id}>
                    <NoteCard note={note} onClick={() => openEditor(note)} />
                  </li>
                ))}
              </ul>
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
              title="Notes"
              titlePt="Notas"
              section="REVISION"
              sectionPt="Revisão"
              tagline="Your study notebook — capture ideas, rules, and discoveries."
            />
            <Divider className="mt-4 mb-6" />
          </div>
          <p className="text-sm text-gray-500 py-8">Loading...</p>
          <div className="pb-16" />
        </PageContainer>
      </>
    }>
      <NotesContent />
    </Suspense>
  );
}
