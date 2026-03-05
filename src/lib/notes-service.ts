import { createClient } from "@/lib/supabase/client";

export type NoteContextType = "grammar" | "vocabulary" | "verb" | "lesson" | null;

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  context_type: NoteContextType;
  context_id: string | null;
  context_label: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteFilters {
  contextType?: NoteContextType;
  contextId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
  search?: string;
}

export async function getUserNotes(
  filters?: NoteFilters
): Promise<Note[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (filters?.isArchived !== undefined) {
    query = query.eq("is_archived", filters.isArchived);
  }
  if (filters?.isPinned !== undefined) {
    query = query.eq("is_pinned", filters.isPinned);
  }
  if (filters?.contextType != null) {
    query = query.eq("context_type", filters.contextType);
  }
  if (filters?.contextId != null) {
    query = query.eq("context_id", filters.contextId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  let notes: Note[] = data.map((row) => mapRowToNote(row));
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    notes = notes.filter(
      (n) =>
        (n.title ?? "").toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }
  return notes;
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", noteId)
    .single();

  if (error || !data) return null;
  return mapRowToNote(data);
}

export interface CreateNoteData {
  title?: string | null;
  content: string;
  contextType?: NoteContextType;
  contextId?: string | null;
  contextLabel?: string | null;
  color?: string | null;
}

export async function createNote(data: CreateNoteData): Promise<Note | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row, error } = await supabase
    .from("user_notes")
    .insert({
      user_id: user.id,
      title: data.title ?? null,
      content: data.content ?? "",
      context_type: data.contextType ?? null,
      context_id: data.contextId ?? null,
      context_label: data.contextLabel ?? null,
      color: data.color ?? null,
    })
    .select()
    .single();

  if (error || !row) return null;
  return mapRowToNote(row);
}

export async function updateNote(
  noteId: string,
  data: Partial<Pick<Note, "title" | "content" | "is_pinned" | "is_archived" | "color">>
): Promise<Note | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.content !== undefined) payload.content = data.content;
  if (data.is_pinned !== undefined) payload.is_pinned = data.is_pinned;
  if (data.is_archived !== undefined) payload.is_archived = data.is_archived;
  if (data.color !== undefined) payload.color = data.color;

  const { data: row, error } = await supabase
    .from("user_notes")
    .update(payload)
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !row) return null;
  return mapRowToNote(row);
}

export async function deleteNote(noteId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("user_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  return !error;
}

export async function togglePinNote(noteId: string): Promise<Note | null> {
  const current = await getNoteById(noteId);
  if (!current) return null;
  return updateNote(noteId, { is_pinned: !current.is_pinned });
}

export async function archiveNote(noteId: string): Promise<Note | null> {
  return updateNote(noteId, { is_archived: true });
}

function mapRowToNote(row: Record<string, unknown>): Note {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: (row.title as string | null) ?? null,
    content: (row.content as string) ?? "",
    context_type: (row.context_type as NoteContextType) ?? null,
    context_id: (row.context_id as string | null) ?? null,
    context_label: (row.context_label as string | null) ?? null,
    is_pinned: Boolean(row.is_pinned),
    is_archived: Boolean(row.is_archived),
    color: (row.color as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
