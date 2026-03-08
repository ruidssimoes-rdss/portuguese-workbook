"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Divider } from "@/components/ui/divider";
import { SlideDrawer } from "@/components/ui/slide-drawer";
import { useAuth } from "@/components/auth-provider";
import {
  getEventsForMonth,
  getEventsForDate,
  createPlannedEvent,
  updateEvent,
  deleteEvent,
  type CalendarEvent,
} from "@/lib/calendar-service";

// ─── Portuguese labels ───
const MESES: string[] = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA: string[] = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira",
  "Sexta-feira", "Sábado", "Domingo",
];

const DIAS_CURTOS: string[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DIAS_HEADER: string[] = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

type ViewMode = "day" | "month";

const EVENT_COLORS: Record<string, string> = {
  lesson_passed: "#16A34A",
  lesson_failed: "#D97706",
  exam_passed: "#003399",
  exam_failed: "#D97706",
  practice: "#7C3AED",
  planned: "#6B7280",
  goal: "#0EA5E9",
};

const EVENT_STYLE: Record<string, { color: string; label: string }> = {
  auto_lesson_passed: { color: "#16A34A", label: "Lição" },
  auto_lesson_failed: { color: "#D97706", label: "Lição" },
  auto_exam_passed: { color: "#003399", label: "Exame" },
  auto_exam_failed: { color: "#D97706", label: "Exame" },
  auto_practice: { color: "#7C3AED", label: "Prática" },
  planned: { color: "#6B7280", label: "Planeado" },
  goal: { color: "#0EA5E9", label: "Objetivo" },
};

function getEventStyle(e: CalendarEvent): { color: string; label: string } {
  if (e.event_type === "auto_lesson") return e.linked_passed ? EVENT_STYLE.auto_lesson_passed : EVENT_STYLE.auto_lesson_failed;
  if (e.event_type === "auto_exam") return e.linked_passed ? EVENT_STYLE.auto_exam_passed : EVENT_STYLE.auto_exam_failed;
  if (e.event_type === "auto_practice") return EVENT_STYLE.auto_practice;
  if (e.event_type === "goal") return EVENT_STYLE.goal;
  return EVENT_STYLE.planned;
}

function PencilIconSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function isTodayKey(key: string): boolean {
  const t = new Date();
  return toDateKey(t) === key;
}

function formatTimePT(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = parseInt(h!, 10);
  const mm = m ? parseInt(m, 10) : 0;
  if (hh === 0 && mm === 0) return "0:00";
  return `${hh}:${String(mm).padStart(2, "0")}`;
}

function formatDateRangePT(startKey: string, endKey: string): string {
  const s = new Date(startKey + "T12:00:00");
  const e = new Date(endKey + "T12:00:00");
  const sm = MESES[s.getMonth()];
  const em = MESES[e.getMonth()];
  if (startKey === endKey) return `${s.getDate()} de ${sm} ${s.getFullYear()}`;
  if (s.getMonth() === e.getMonth()) return `${sm} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`;
  return `${s.getDate()} ${sm} – ${e.getDate()} ${em} ${s.getFullYear()}`;
}

function formatDayLongPT(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const dayName = DIAS_SEMANA[d.getDay() === 0 ? 6 : d.getDay() - 1];
  return `${dayName}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

// ─── Plan / Edit drawers (Portuguese labels) ───
function CreateEventDrawer({
  initialDate,
  onClose,
  onSaved,
}: {
  initialDate: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(initialDate);
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("19:30");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const created = await createPlannedEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      eventDate,
      allDay,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
    });
    setSaving(false);
    if (created) {
      onSaved();
      onClose();
    }
  };

  return (
    <SlideDrawer isOpen onClose={onClose} title="Planear sessão" ariaLabel="Planear sessão">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex.: Rever conjugações verbais"
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded-[12px] border-gray-300 text-[#003399] focus:ring-[#003399]"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">Dia inteiro</label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora início</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fim</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-[rgba(0,0,0,0.08)] rounded-[12px] hover:bg-[rgba(0,0,0,0.02)]">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-[#003399] rounded-[12px] hover:bg-[#002266] disabled:opacity-50">
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </SlideDrawer>
  );
}

function EditEventDrawer({ event, onClose, onSaved }: { event: CalendarEvent; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [eventDate, setEventDate] = useState(event.event_date);
  const [allDay, setAllDay] = useState(event.all_day);
  const [startTime, setStartTime] = useState(event.start_time?.slice(0, 5) ?? "19:00");
  const [endTime, setEndTime] = useState(event.end_time?.slice(0, 5) ?? "19:30");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const updated = await updateEvent(event.id, { title: title.trim(), description: description.trim() || null, event_date: eventDate, all_day: allDay, start_time: allDay ? null : startTime, end_time: allDay ? null : endTime });
    setSaving(false);
    if (updated) {
      onSaved();
      onClose();
    }
  };

  return (
    <SlideDrawer isOpen onClose={onClose} title="Editar evento" ariaLabel="Editar evento">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="editAllDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="rounded-[12px] border-gray-300 text-[#003399] focus:ring-[#003399]" />
            <label htmlFor="editAllDay" className="text-sm text-gray-700">Dia inteiro</label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora início</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fim</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-[rgba(0,0,0,0.08)] rounded-[12px] hover:bg-[rgba(0,0,0,0.02)]">Cancelar</button>
            <button type="submit" disabled={saving || !title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-[#003399] rounded-[12px] hover:bg-[#002266] disabled:opacity-50">{saving ? "A guardar..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </SlideDrawer>
  );
}

// ─── Goal drawer ───
const GOAL_OPTIONS: { id: string; label: string; type: "lessons_a1" | "verbs_a1" | "grammar_a1" }[] = [
  { id: "lessons_a1", label: "Completar todas as lições A1", type: "lessons_a1" },
  { id: "verbs_a1", label: "Rever todos os verbos A1", type: "verbs_a1" },
  { id: "grammar_a1", label: "Rever todos os tópicos de gramática A1", type: "grammar_a1" },
];

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function GoalDrawer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [goalType, setGoalType] = useState<string>("lessons_a1");
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [studyDays, setStudyDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [optionsWithCounts, setOptionsWithCounts] = useState<{ id: string; label: string; total: number; completed: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ remaining: number; days: number; label: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
      const a1Lessons = lessons.filter((l) => l.cefr === "A1");
      const progressMap = await import("@/lib/lesson-progress").then((m) => m.getLessonProgressMap());
      const completedLessonIds = new Set(Object.entries(progressMap).filter(([, p]) => p.completed).map(([id]) => id));
      const verbsData = (await import("@/data/verbs.json")).default as { order: string[]; verbs: Record<string, { meta: { english: string } }> };
      const verbOrder = verbsData.order ?? [];
      const verbsA1 = verbOrder.slice(0, 75).map((key) => ({
        id: key,
        title: `Rever: ${key} (${(verbsData.verbs as Record<string, { meta: { english: string } }>)[key]?.meta?.english ?? "verbo"})`,
      }));
      const grammarData = (await import("@/data/grammar.json")).default as { topics: Record<string, { id: string; titlePt: string; cefr: string }> };
      const grammarA1 = Object.values(grammarData.topics ?? {}).filter((t) => t.cefr === "A1").map((t) => ({ id: t.id, title: t.titlePt ?? t.id }));

      if (cancelled) return;
      setOptionsWithCounts([
        {
          id: "lessons_a1",
          label: `Completar todas as lições A1 (${a1Lessons.length} lições)`,
          total: a1Lessons.length,
          completed: a1Lessons.filter((l) => completedLessonIds.has(l.id)).length,
        },
        { id: "verbs_a1", label: `Rever todos os verbos A1 (${verbsA1.length} verbos)`, total: verbsA1.length, completed: 0 },
        { id: "grammar_a1", label: `Rever todos os tópicos de gramática A1 (${grammarA1.length} tópicos)`, total: grammarA1.length, completed: 0 },
      ]);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (optionsWithCounts.length === 0) return;
    const opt = optionsWithCounts.find((o) => o.id === goalType);
    if (!opt) return;
    const remaining = opt.total - opt.completed;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(targetDate + "T23:59:59");
    import("@/lib/goals").then(({ getStudyDaysBetween }) => {
      const days = getStudyDaysBetween(from, to, studyDays);
      setPreview(remaining > 0 && days.length > 0 ? { remaining, days: days.length, label: opt.label } : null);
    });
  }, [goalType, targetDate, studyDays, optionsWithCounts]);

  const toggleDay = (d: number) => {
    setStudyDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)));
  };

  const handleCreate = async () => {
    const opt = optionsWithCounts.find((o) => o.id === goalType);
    if (!opt || opt.total - opt.completed <= 0) return;
    setSaving(true);
    try {
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date(targetDate + "T23:59:59");
      const { getStudyDaysBetween, generateGoalPlan } = await import("@/lib/goals");
      const { createGoalEvents } = await import("@/lib/calendar-service");

      const availableDays = getStudyDaysBetween(from, to, studyDays);
      let items: { id: string; title: string }[] = [];
      let linkedType: "lesson" | "verb" | "grammar" = "lesson";

      if (goalType === "lessons_a1") {
        const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
        const a1 = lessons.filter((l) => l.cefr === "A1");
        const progressMap = await import("@/lib/lesson-progress").then((m) => m.getLessonProgressMap());
        const completed = new Set(Object.entries(progressMap).filter(([, p]) => p.completed).map(([id]) => id));
        items = a1.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
        linkedType = "lesson";
      } else if (goalType === "verbs_a1") {
        const verbsData = (await import("@/data/verbs.json")).default as { order: string[]; verbs: Record<string, { meta: { english: string } }> };
        const order = (verbsData.order ?? []).slice(0, 75);
        items = order.map((key) => ({ id: key, title: `Rever: ${key} (${(verbsData.verbs as Record<string, { meta: { english: string } }>)[key]?.meta?.english ?? "verbo"})` }));
        linkedType = "verb";
      } else if (goalType === "grammar_a1") {
        const grammarData = (await import("@/data/grammar.json")).default as { topics: Record<string, { id: string; titlePt: string; cefr: string }> };
        items = Object.values(grammarData.topics ?? {}).filter((t) => t.cefr === "A1").map((t) => ({ id: t.id, title: t.titlePt ?? t.id }));
        linkedType = "grammar";
      }

      const plan = generateGoalPlan(items, availableDays, linkedType);
      const events = plan.map((e) => ({
        title: e.title,
        eventDate: e.date,
        linkedType: e.linkedType,
        linkedId: e.linkedId,
        linkedLabel: e.title,
      }));
      await createGoalEvents(events);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer isOpen onClose={onClose} title="Definir objetivo" ariaLabel="Definir objetivo">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">O que queres alcançar?</label>
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
          >
            {optionsWithCounts.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
            {optionsWithCounts.length === 0 && (
              <option value="lessons_a1">Completar todas as lições A1</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Até quando?</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-[12px] text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Em que dias estudas?</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`w-10 h-10 rounded-[12px] text-sm font-medium border transition-colors ${
                  studyDays.includes(d) ? "bg-[rgba(0,0,0,0.06)] border-[rgba(0,0,0,0.1)] text-gray-900" : "border-[rgba(0,0,0,0.06)] text-gray-400 hover:border-[rgba(0,0,0,0.1)]"
                }`}
              >
                {WEEKDAY_LABELS[d - 1]}
              </button>
            ))}
          </div>
        </div>
        {preview && (
          <div className="rounded-[12px] border border-[rgba(0,0,0,0.06)] p-3 bg-[rgba(0,0,0,0.02)]">
            <p className="text-[12px] font-medium text-gray-700 mb-1">Plano sugerido:</p>
            <p className="text-[12px] text-gray-600">
              {preview.remaining} restantes ÷ {preview.days} dias disponíveis = ~{Math.ceil(preview.remaining / preview.days)} por dia
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-[rgba(0,0,0,0.08)] rounded-[12px] hover:bg-[rgba(0,0,0,0.02)]">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !preview || preview.remaining <= 0 || preview.days <= 0}
            className="px-4 py-2 text-sm font-medium text-white bg-[#003399] rounded-[12px] hover:bg-[#002266] disabled:opacity-50"
          >
            {saving ? "A criar..." : "Criar plano"}
          </button>
        </div>
      </div>
    </SlideDrawer>
  );
}

// ─── Main page ───
export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [cursorDate, setCursorDate] = useState<string>(() => toDateKey(today));
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [noteActivityDates, setNoteActivityDates] = useState<Set<string>>(new Set());
  const [dayNoteCount, setDayNoteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState<"create" | "goal" | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CalendarEvent | null>(null);

  const isLoggedIn = !authLoading && !!user;

  const cursor = useMemo(() => new Date(cursorDate + "T12:00:00"), [cursorDate]);
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;

  const loadMonth = useCallback(async () => {
    const list = await getEventsForMonth(year, month);
    setMonthEvents(list);
  }, [year, month]);

  const loadDay = useCallback(async (dateKey: string) => {
    const list = await getEventsForDate(dateKey);
    setDayEvents(list);
  }, []);

  const loadNoteActivity = useCallback(async () => {
    const { getNoteActivityDatesForMonth } = await import("@/lib/notes-service");
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const dates = await getNoteActivityDatesForMonth(start, end);
    setNoteActivityDates(new Set(dates));
  }, [year, month]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    const run = async () => {
      await loadMonth();
      await loadNoteActivity();
      if (viewMode === "day") {
        await loadDay(cursorDate);
        const { getNoteActivityCountForDate } = await import("@/lib/notes-service");
        const count = await getNoteActivityCountForDate(cursorDate);
        setDayNoteCount(count);
      }
      setLoading(false);
    };
    run();
  }, [isLoggedIn, viewMode, year, month, cursorDate, loadMonth, loadDay, loadNoteActivity]);

  const eventsByDate = useMemo(() => {
    const list = viewMode === "month" ? monthEvents : dayEvents;
    const byDate: Record<string, CalendarEvent[]> = {};
    list.forEach((e) => {
      if (!byDate[e.event_date]) byDate[e.event_date] = [];
      byDate[e.event_date].push(e);
    });
    return byDate;
  }, [viewMode, monthEvents, dayEvents]);

  const monthStats = useMemo(() => ({
    lessons: monthEvents.filter((e) => e.event_type === "auto_lesson").length,
    exams: monthEvents.filter((e) => e.event_type === "auto_exam").length,
    practice: monthEvents.filter((e) => e.event_type === "auto_practice").length,
    planned: monthEvents.filter((e) => e.event_type === "planned").length,
    goals: monthEvents.filter((e) => e.event_type === "goal").length,
  }), [monthEvents]);

  const navPrev = () => {
    if (viewMode === "month") {
      const d = new Date(year, month - 2, 1);
      setCursorDate(toDateKey(d));
    } else {
      setCursorDate(toDateKey(addDays(cursor, -1)));
    }
  };

  const navNext = () => {
    if (viewMode === "month") {
      const d = new Date(year, month, 1);
      setCursorDate(toDateKey(d));
    } else {
      setCursorDate(toDateKey(addDays(cursor, 1)));
    }
  };

  const navCenterLabel = viewMode === "month"
    ? `${MESES[month - 1]} ${year}`
    : formatDayLongPT(cursorDate);

  const handleDeleteEvent = async (event: CalendarEvent) => {
    await deleteEvent(event.id);
    setConfirmDelete(null);
    setDetailEvent(null);
    if (viewMode === "month") loadMonth(); else loadDay(cursorDate);
  };

  const goToMonthView = () => setViewMode("month");

  const currentTimeMins = today.getHours() * 60 + today.getMinutes();
  const currentTimeTop = ((currentTimeMins - 6 * 60) / 60) * 60;

  return (
    <>
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <PageHeader
            title="Calendário"
            section="REVISION"
            sectionPt="Revisão"
            tagline="Acompanha o teu percurso e planeia sessões de estudo."
          />
          <Divider className="mt-4 mb-6" />
        </div>

        {!isLoggedIn ? (
          <div className="border border-[rgba(0,0,0,0.08)] rounded-[12px] p-8 bg-white text-center">
            <p className="text-[15px] font-semibold text-gray-900">Inicia sessão para usar o calendário</p>
            <p className="text-[13px] text-gray-500 italic mt-1">Inicia sessão para ver o teu calendário</p>
            <Link href="/auth/login" className="inline-flex items-center justify-center h-9 px-5 bg-[#003399] text-white rounded-[12px] text-[13px] font-medium hover:bg-[#002266] transition-colors mt-5">
              Entrar
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-gray-500 mb-4">
              Este mês: <span className="font-medium text-gray-700">{monthStats.lessons} lições</span>
              {" · "}<span className="font-medium text-gray-700">{monthStats.exams} exame</span>
              {" · "}<span className="font-medium text-gray-700">{monthStats.practice} prática</span>
              {" · "}<span className="font-medium text-gray-700">{monthStats.planned} planeado</span>
              {monthStats.goals > 0 && <><span className="text-gray-400"> · </span><span className="font-medium text-gray-700">{monthStats.goals} objetivo</span></>}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                {(["month", "day"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setViewMode(v)}
                    className={`px-3 py-1.5 rounded-[12px] text-sm font-medium transition-colors ${
                      viewMode === v ? "bg-[rgba(0,0,0,0.05)] text-gray-900 border border-[rgba(0,0,0,0.08)]" : "text-[rgba(0,0,0,0.5)] hover:text-gray-700 border border-transparent"
                    }`}
                  >
                    {v === "month" ? "Mês" : "Dia"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={navPrev} className="text-sm text-gray-600 hover:text-gray-900">
                  {viewMode === "month" ? "← " + MESES[month - 2 < 0 ? 11 : month - 2] : "← Dia anterior"}
                </button>
                <span className="text-sm font-medium text-gray-800 min-w-[200px] text-center">{navCenterLabel}</span>
                <button type="button" onClick={navNext} className="text-sm text-gray-600 hover:text-gray-900">
                  {viewMode === "month" ? MESES[month > 11 ? 0 : month] + " →" : "Próximo dia →"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerOpen("create")}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#003399] rounded-[12px] hover:bg-[#002266] border border-[rgba(0,0,0,0.06)]"
                >
                  Planear sessão
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen("goal")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-[12px] border border-[rgba(0,0,0,0.08)] hover:bg-[rgba(0,0,0,0.03)]"
                >
                  Definir objetivo
                </button>
              </div>
            </div>

            {/* Legend */}
            <p className="text-[10px] text-[rgba(0,0,0,0.4)] mb-4">
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Aprovado</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /> Ainda não</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#003399]" /> Exame</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /> Prática</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" /> Planeado</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" /> Objetivo</span>
              <span className="inline-flex items-center gap-1"><span className="text-[rgba(0,0,0,0.4)]">📝</span> Notas</span>
            </p>

            {loading ? (
              <p className="text-sm text-gray-500 py-8">A carregar...</p>
            ) : viewMode === "month" ? (
              <MonthGridView
                year={year}
                month={month}
                cursorDate={cursorDate}
                eventsByDate={eventsByDate}
                noteActivityDates={noteActivityDates}
                onSelectDay={(key) => {
                  setCursorDate(key);
                  setViewMode("day");
                }}
                onEventClick={(e) => setDetailEvent(e)}
                onEditEvent={(e) => setEditingEvent(e)}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
                onDelete={handleDeleteEvent}
              />
            ) : (
              <DayView
                dateKey={cursorDate}
                events={eventsByDate[cursorDate] ?? []}
                currentTimeTop={currentTimeTop}
                dayNoteCount={dayNoteCount}
                onEventClick={(e) => setDetailEvent(e)}
                onEditEvent={(e) => setEditingEvent(e)}
                onBackToMonth={goToMonthView}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
                onDelete={handleDeleteEvent}
              />
            )}

            {detailEvent && (
              <EventDetailPopover
                event={detailEvent}
                onClose={() => setDetailEvent(null)}
                onEdit={() => {
                  setDetailEvent(null);
                  setEditingEvent(detailEvent);
                }}
                onDelete={() => setConfirmDelete(detailEvent)}
              />
            )}

            {drawerOpen === "create" && (
              <CreateEventDrawer
                initialDate={cursorDate}
                onClose={() => setDrawerOpen(null)}
                onSaved={() => {
                  setDrawerOpen(null);
                  loadMonth();
                  if (viewMode === "day") loadDay(cursorDate);
                }}
              />
            )}
            {drawerOpen === "goal" && (
              <GoalDrawer
                onClose={() => setDrawerOpen(null)}
                onSaved={() => {
                  setDrawerOpen(null);
                  loadMonth();
                  if (viewMode === "day") loadDay(cursorDate);
                }}
              />
            )}
            {editingEvent && (
              <EditEventDrawer
                event={editingEvent}
                onClose={() => setEditingEvent(null)}
                onSaved={() => {
                  setEditingEvent(null);
                  loadMonth();
                  if (viewMode === "day") loadDay(cursorDate);
                }}
              />
            )}
          </>
        )}

        <div className="pb-16" />
      </PageContainer>
    </>
  );
}

// ─── Event detail popover ───
function EventDetailPopover({
  event,
  onClose,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isAuto = event.event_type === "auto_lesson" || event.event_type === "auto_exam" || event.event_type === "auto_practice";
  const style = getEventStyle(event);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-lg p-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2">
          <span className="w-[6px] h-[6px] rounded-full shrink-0 mt-1.5" style={{ backgroundColor: style.color }} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-gray-900">{event.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{style.label}{event.linked_score != null ? ` · ${Math.round(event.linked_score)}%` : ""}{event.linked_passed !== null ? (event.linked_passed ? " · Aprovado" : " · Ainda não") : ""}</p>
            {event.created_at && (
              <p className="text-[10px] text-gray-400 mt-1">{new Date(event.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
            )}
            {event.event_type === "auto_lesson" && event.linked_id && (
              <Link href={`/lessons/${event.linked_id}`} className="text-[12px] text-[#003399] hover:underline mt-2 inline-block">Abrir lição</Link>
            )}
            {event.event_type === "auto_exam" && event.linked_id && (
              <Link href={`/exams/${event.linked_id}`} className="text-[12px] text-[#003399] hover:underline mt-2 inline-block">Abrir exame</Link>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[rgba(0,0,0,0.06)]">
          {event.event_type === "goal" && (
            <>
              <button type="button" onClick={onEdit} className="text-sm font-medium text-gray-600 hover:text-gray-900">Ajustar</button>
              <button type="button" onClick={onDelete} className="text-sm font-medium text-red-600 hover:text-red-700">Apagar</button>
            </>
          )}
          {event.event_type === "planned" && (
            <>
              <button type="button" onClick={onEdit} className="text-sm font-medium text-gray-600 hover:text-gray-900">Editar</button>
              <button type="button" onClick={onDelete} className="text-sm font-medium text-red-600 hover:text-red-700">Apagar</button>
            </>
          )}
          <button type="button" onClick={onClose} className="text-sm font-medium text-gray-600 hover:text-gray-900">Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Day view ───
function DayView({
  dateKey,
  events,
  currentTimeTop,
  dayNoteCount,
  onEventClick,
  onEditEvent,
  onBackToMonth,
  confirmDelete,
  setConfirmDelete,
  onDelete,
}: {
  dateKey: string;
  events: CalendarEvent[];
  currentTimeTop: number;
  dayNoteCount: number;
  onEventClick: (e: CalendarEvent) => void;
  onEditEvent: (e: CalendarEvent) => void;
  onBackToMonth: () => void;
  confirmDelete: CalendarEvent | null;
  setConfirmDelete: (e: CalendarEvent | null) => void;
  onDelete: (e: CalendarEvent) => void;
}) {
  const allDay = events.filter((e) => e.all_day);
  const timed = [...events.filter((e) => !e.all_day)].sort((a, b) => {
    const ta = a.start_time ?? "00:00";
    const tb = b.start_time ?? "00:00";
    return ta.localeCompare(tb);
  });
  const isToday = isTodayKey(dateKey);
  const typeLabel = (e: CalendarEvent) => {
    if (e.event_type === "auto_lesson") return "LIÇÃO";
    if (e.event_type === "auto_exam") return "EXAME";
    if (e.event_type === "auto_practice") return "PRÁTICA";
    if (e.event_type === "goal") return "OBJETIVO";
    return "PLANEADO";
  };
  return (
    <div className="rounded-[12px] border border-[rgba(0,0,0,0.06)] overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
        <button type="button" onClick={onBackToMonth} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          ← Voltar ao mês
        </button>
        <span className="text-[13px] font-semibold text-gray-800">
          {formatDayLongPT(dateKey)}
        </span>
      </div>
      <div className="p-4 space-y-4">
        {timed.map((e) => {
          const st = getEventStyle(e);
          const timeStr = e.start_time ? formatTimePT(e.start_time) : "";
          return (
            <div key={e.id} className="rounded-[12px] border border-[rgba(0,0,0,0.06)] p-3 flex items-start gap-3">
              {timeStr && <span className="text-[11px] text-gray-500 shrink-0 w-12">{timeStr}</span>}
              <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: st.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: st.color }}>{typeLabel(e)}</p>
                <p className="text-[14px] font-medium text-gray-900">{e.title}</p>
                {e.linked_score != null && (
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {Math.round(e.linked_score)}%{e.linked_passed !== null ? (e.linked_passed ? " Aprovado" : " Ainda não") : ""}
                  </p>
                )}
              </div>
              {(e.event_type === "planned" || e.event_type === "goal") && (
                <button type="button" onClick={() => onEditEvent(e)} className="text-[12px] font-medium text-[#003399] hover:underline shrink-0">
                  {e.event_type === "goal" ? "Ajustar" : "Editar"}
                </button>
              )}
            </div>
          );
        })}
        {allDay.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pt-2 border-t border-[rgba(0,0,0,0.06)]">──── Dia inteiro ────</p>
            {allDay.map((e) => {
              const st = getEventStyle(e);
              return (
                <div key={e.id} className="rounded-[12px] border border-[rgba(0,0,0,0.06)] p-3 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: st.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: st.color }}>{typeLabel(e)}</p>
                    <p className="text-[14px] font-medium text-gray-900">{e.title}</p>
                  </div>
                  {(e.event_type === "planned" || e.event_type === "goal") && (
                    <button type="button" onClick={() => onEditEvent(e)} className="text-[12px] font-medium text-[#003399] hover:underline shrink-0">
                      {e.event_type === "goal" ? "Ajustar" : "Editar"}
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
      {dayNoteCount > 0 && (
        <div className="px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <Link href={`/notes?updatedDate=${dateKey}`} className="text-[12px] text-gray-600 hover:text-[#003399]">
            📝 Notas editadas: {dayNoteCount}
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Month grid view ───
function getMonthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startDay = first.getDay();
  const monFirst = startDay === 0 ? 6 : startDay - 1;
  const daysInMonth = last.getDate();
  const rows: (number | null)[][] = [];
  let row: (number | null)[] = [];
  for (let i = 0; i < monFirst; i++) row.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(d);
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }
  return rows;
}

function MonthGridView({
  year,
  month,
  cursorDate,
  eventsByDate,
  noteActivityDates,
  onSelectDay,
  onEventClick,
  onEditEvent,
  confirmDelete,
  setConfirmDelete,
  onDelete,
}: {
  year: number;
  month: number;
  cursorDate: string;
  eventsByDate: Record<string, CalendarEvent[]>;
  noteActivityDates: Set<string>;
  onSelectDay: (key: string) => void;
  onEventClick: (e: CalendarEvent) => void;
  onEditEvent: (e: CalendarEvent) => void;
  confirmDelete: CalendarEvent | null;
  setConfirmDelete: (e: CalendarEvent | null) => void;
  onDelete: (e: CalendarEvent) => void;
}) {
  const grid = getMonthGrid(year, month);
  const todayKey = toDateKey(new Date());
  return (
    <div className="rounded-[12px] border border-[rgba(0,0,0,0.06)] overflow-hidden bg-white">
      <div className="grid grid-cols-7 border-b border-[rgba(0,0,0,0.03)]">
        {DIAS_HEADER.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>
      <div className="divide-y divide-[rgba(0,0,0,0.03)]">
        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7">
            {row.map((day, di) => {
              const dateKey = day != null ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const events = dateKey ? eventsByDate[dateKey] ?? [] : [];
              const isToday = dateKey === todayKey;
              const hasNoteActivity = dateKey ? noteActivityDates.has(dateKey) : false;
              return (
                <button
                  key={di}
                  type="button"
                  onClick={() => dateKey && onSelectDay(dateKey)}
                  disabled={!dateKey}
                  className={`min-h-[100px] p-2 text-left border-r border-[rgba(0,0,0,0.03)] last:border-r-0 transition-colors relative ${
                    !dateKey ? "bg-[rgba(0,0,0,0.02)] cursor-default" : isToday ? "bg-[#003399]/[0.03]" : "hover:bg-[rgba(0,0,0,0.015)]"
                  }`}
                >
                  {day != null && (
                    <>
                      {hasNoteActivity && (
                        <span className="absolute top-2 right-2 w-[10px] h-[10px] flex items-center justify-center text-[10px]" style={{ color: "rgba(0,0,0,0.15)" }} aria-hidden>
                          <PencilIconSmall />
                        </span>
                      )}
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-[12px] text-[13px] font-semibold ${isToday ? "bg-[#003399] text-white" : "text-gray-700"}`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {events.slice(0, 3).map((e) => {
                          const st = getEventStyle(e);
                          return (
                            <button
                              key={e.id}
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                onEventClick(e);
                              }}
                              className="w-full text-left rounded-[6px] px-1.5 py-1 flex items-center gap-1"
                              style={{ backgroundColor: st.color + "0F" }}
                            >
                              <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                              <span className="text-[11px] font-medium text-gray-800 truncate flex-1">{e.title}</span>
                            </button>
                          );
                        })}
                        {events.length > 3 && <span className="text-[10px] text-gray-400">+{events.length - 3} mais</span>}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
