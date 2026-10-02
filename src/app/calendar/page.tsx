"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { SlideDrawer } from "@/components/ui/slide-drawer";
import { ChevronLeft, ChevronRight, Plus, Target } from "lucide-react";
import { Label, ScreenTitle, Track } from "@/components/aula";
import { useAuth } from "@/components/auth-provider";
import {
  getEventsForMonth,
  getEventsForDate,
  createPlannedEvent,
  updateEvent,
  deleteEvent,
  getWeeklyStats,
  getMonthlyStats,
  type CalendarEvent,
  type WeeklyStats,
} from "@/lib/calendar-service";
import { getGoalsForDisplay, getGoalHealth, type UserGoal } from "@/lib/goals-service";

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

const GOAL_TITLES: Record<string, string> = {
  lessons_a1: "Completar todas as lições A1",
  lessons_a2: "Completar todas as lições A2",
  lessons_b1: "Completar todas as lições B1",
  verbs_a1: "Rever todos os verbos A1",
  verbs_a2: "Rever todos os verbos A2",
  grammar_a1: "Rever todos os tópicos de gramática A1",
};

const GOAL_ITEM_LABELS: Record<string, string> = {
  lessons_a1: "lições",
  lessons_a2: "lições",
  lessons_b1: "lições",
  verbs_a1: "verbos",
  verbs_a2: "verbos",
  grammar_a1: "tópicos",
};

type ViewMode = "day" | "month";

const EVENT_COLORS: Record<string, string> = {
  lesson_passed: "#1F7A68",
  lesson_failed: "#5B45B8",
  exam_passed: "#1B2B61",
  exam_failed: "#5B45B8",
  practice: "#3F589F",
  planned: "#6B6B69",
  goal: "#98988F",
};

const EVENT_STYLE: Record<string, { color: string; label: string }> = {
  auto_lesson_passed: { color: "#1F7A68", label: "Lição" },
  auto_lesson_failed: { color: "#5B45B8", label: "Lição" },
  auto_exam_passed: { color: "#1B2B61", label: "Exame" },
  auto_exam_failed: { color: "#5B45B8", label: "Exame" },
  auto_practice: { color: "#3F589F", label: "Prática" },
  planned: { color: "#6B6B69", label: "Planeado" },
  goal: { color: "#98988F", label: "Objetivo" },
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

function getWeekRange(date: Date): { weekStart: string; weekEnd: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const weekStart = toDateKey(d);
  d.setDate(d.getDate() + 6);
  const weekEnd = toDateKey(d);
  return { weekStart, weekEnd };
}

function generateWeeklySummary(stats: WeeklyStats): string {
  const parts: string[] = [];
  if (stats.studyDays > 0) {
    parts.push(`Estudaste ${stats.studyDays} ${stats.studyDays === 1 ? "dia" : "dias"} esta semana`);
  }
  if (stats.notesCount > 0) {
    parts.push(`escreveste ${stats.notesCount} ${stats.notesCount === 1 ? "nota" : "notas"}`);
  }
  let summary = parts.length > 0 ? parts.join(" e ") + "." : "";
  const achievements: string[] = [];
  if (stats.lessonsCompleted > 0) {
    achievements.push(`${stats.lessonsCompleted} ${stats.lessonsCompleted === 1 ? "lição" : "lições"}`);
  }
  if (stats.practiceSessions > 0) {
    achievements.push(`${stats.practiceSessions} ${stats.practiceSessions === 1 ? "sessão de prática" : "sessões de prática"}`);
  }
  if (stats.examsTaken > 0) {
    achievements.push(`${stats.examsTaken} ${stats.examsTaken === 1 ? "exame" : "exames"}`);
  }
  if (achievements.length > 0) {
    summary += (summary ? " " : "") + "Completaste " + achievements.join(" e ") + ".";
  }
  return summary || "Ainda sem atividade esta semana. Começa hoje!";
}

function generateMonthlySummary(stats: WeeklyStats): string {
  const parts: string[] = [];
  if (stats.studyDays > 0) {
    parts.push(`Estudaste ${stats.studyDays} ${stats.studyDays === 1 ? "dia" : "dias"}`);
  }
  if (stats.notesCount > 0) {
    parts.push(`escreveste ${stats.notesCount} ${stats.notesCount === 1 ? "nota" : "notas"}`);
  }
  if (stats.lessonsCompleted > 0) {
    parts.push(`completaste ${stats.lessonsCompleted} ${stats.lessonsCompleted === 1 ? "lição" : "lições"}`);
  }
  if (parts.length === 0) return "Ainda sem atividade neste mês.";
  if (parts.length === 1) return parts[0] + ".";
  return parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1] + ".";
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
            <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex.: Rever conjugações verbais"
              className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Data</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded-lg border-aula-line text-aula-text accent-aula-accent"
            />
            <label htmlFor="allDay" className="text-[13px] text-aula-text-2">Dia inteiro</label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Hora início</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Hora fim</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Descrição (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-aula-text-2 border border-aula-border rounded-lg hover:bg-[rgba(0,0,0,0.02)]">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !title.trim()} className="px-4 py-2 text-[13px] font-medium text-white bg-aula-accent rounded-lg hover:bg-aula-accent-hover disabled:opacity-50">
              {saving ? "A guardar…" : "Guardar"}
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
  const [allDay, setAllDay] = useState(event.is_all_day);
  const [startTime, setStartTime] = useState(event.start_time?.slice(0, 5) ?? "19:00");
  const [endTime, setEndTime] = useState(event.end_time?.slice(0, 5) ?? "19:30");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const updated = await updateEvent(event.id, { title: title.trim(), description: description.trim() || null, event_date: eventDate, is_all_day: allDay, start_time: allDay ? null : startTime, end_time: allDay ? null : endTime });
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
            <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Data</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="editAllDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="rounded-lg border-aula-line text-aula-text accent-aula-accent" />
            <label htmlFor="editAllDay" className="text-[13px] text-aula-text-2">Dia inteiro</label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Hora início</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Hora fim</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Descrição (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-aula-text-2 border border-aula-border rounded-lg hover:bg-[rgba(0,0,0,0.02)]">Cancelar</button>
            <button type="submit" disabled={saving || !title.trim()} className="px-4 py-2 text-[13px] font-medium text-white bg-aula-accent rounded-lg hover:bg-aula-accent-hover disabled:opacity-50">{saving ? "A guardar…" : "Guardar"}</button>
          </div>
        </form>
      </div>
    </SlideDrawer>
  );
}

// ─── Goal drawer ───
const GOAL_OPTIONS: { id: string; label: string; type: string }[] = [
  { id: "lessons_a1", label: "Completar todas as lições A1", type: "lessons_a1" },
  { id: "lessons_a2", label: "Completar todas as lições A2", type: "lessons_a2" },
  { id: "lessons_b1", label: "Completar todas as lições B1", type: "lessons_b1" },
  { id: "verbs_a1", label: "Rever todos os verbos A1", type: "verbs_a1" },
  { id: "grammar_a1", label: "Rever todos os tópicos de gramática A1", type: "grammar_a1" },
];

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function GoalDrawer({
  editingGoal,
  onClose,
  onSaved,
}: {
  editingGoal: UserGoal | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditMode = editingGoal != null;
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
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setGoalType(editingGoal.goal_type);
      setTargetDate(editingGoal.target_date);
      setStudyDays(editingGoal.study_days.length > 0 ? [...editingGoal.study_days].sort((a, b) => a - b) : [1, 2, 3, 4, 5]);
      setConfirmDeleteGoal(false);
    }
  }, [editingGoal]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
      const a1Lessons = lessons.filter((l) => l.cefr === "A1");
      const a2Lessons = lessons.filter((l) => l.cefr === "A2");
      const b1Lessons = lessons.filter((l) => l.cefr === "B1");
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
        {
          id: "lessons_a2",
          label: `Completar todas as lições A2 (${a2Lessons.length} lições)`,
          total: a2Lessons.length,
          completed: a2Lessons.filter((l) => completedLessonIds.has(l.id)).length,
        },
        {
          id: "lessons_b1",
          label: `Completar todas as lições B1 (${b1Lessons.length} lições)`,
          total: b1Lessons.length,
          completed: b1Lessons.filter((l) => completedLessonIds.has(l.id)).length,
        },
        { id: "verbs_a1", label: `Rever todos os verbos A1 (${verbsA1.length} verbos)`, total: verbsA1.length, completed: 0 },
        { id: "grammar_a1", label: `Rever todos os tópicos de gramática A1 (${grammarA1.length} tópicos)`, total: grammarA1.length, completed: 0 },
      ]);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(targetDate + "T23:59:59");
    if (isEditMode && editingGoal) {
      const remaining = editingGoal.total_items - editingGoal.completed_items;
      import("@/lib/goals").then(({ getStudyDaysBetween }) => {
        const days = getStudyDaysBetween(from, to, studyDays);
        const label = GOAL_ITEM_LABELS[editingGoal.goal_type] ?? "itens";
        setPreview(remaining > 0 && days.length > 0 ? { remaining, days: days.length, label } : null);
      });
      return;
    }
    if (optionsWithCounts.length === 0) return;
    const opt = optionsWithCounts.find((o) => o.id === goalType);
    if (!opt) return;
    const remaining = opt.total - opt.completed;
    import("@/lib/goals").then(({ getStudyDaysBetween }) => {
      const days = getStudyDaysBetween(from, to, studyDays);
      setPreview(remaining > 0 && days.length > 0 ? { remaining, days: days.length, label: opt.label } : null);
    });
  }, [goalType, targetDate, studyDays, optionsWithCounts, isEditMode, editingGoal]);

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
      const { createGoalWithEvents } = await import("@/lib/goals-service");

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
      } else if (goalType === "lessons_a2") {
        const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
        const a2 = lessons.filter((l) => l.cefr === "A2");
        const progressMap = await import("@/lib/lesson-progress").then((m) => m.getLessonProgressMap());
        const completed = new Set(Object.entries(progressMap).filter(([, p]) => p.completed).map(([id]) => id));
        items = a2.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
        linkedType = "lesson";
      } else if (goalType === "lessons_b1") {
        const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
        const b1 = lessons.filter((l) => l.cefr === "B1");
        const progressMap = await import("@/lib/lesson-progress").then((m) => m.getLessonProgressMap());
        const completed = new Set(Object.entries(progressMap).filter(([, p]) => p.completed).map(([id]) => id));
        items = b1.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
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
        date: e.date,
        linkedId: e.linkedId,
        linkedType: e.linkedType,
      }));
      const result = await createGoalWithEvents({
        goalType,
        targetDate,
        studyDays,
        totalItems: opt.total,
        completedItems: opt.completed,
        events,
      });
      if (result) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingGoal || (preview && preview.remaining <= 0)) return;
    setSaving(true);
    try {
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date(targetDate + "T23:59:59");
      const { getStudyDaysBetween, generateGoalPlan } = await import("@/lib/goals");
      const { updateGoalPlan } = await import("@/lib/goals-service");

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
      } else if (goalType === "lessons_a2") {
        const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
        const a2 = lessons.filter((l) => l.cefr === "A2");
        const progressMap = await import("@/lib/lesson-progress").then((m) => m.getLessonProgressMap());
        const completed = new Set(Object.entries(progressMap).filter(([, p]) => p.completed).map(([id]) => id));
        items = a2.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
        linkedType = "lesson";
      } else if (goalType === "lessons_b1") {
        const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
        const b1 = lessons.filter((l) => l.cefr === "B1");
        const progressMap = await import("@/lib/lesson-progress").then((m) => m.getLessonProgressMap());
        const completed = new Set(Object.entries(progressMap).filter(([, p]) => p.completed).map(([id]) => id));
        items = b1.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
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
        date: e.date,
        linkedId: e.linkedId,
        linkedType: e.linkedType,
      }));
      const result = await updateGoalPlan(editingGoal.id, { targetDate, studyDays, events });
      if (result) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!editingGoal) return;
    setSaving(true);
    try {
      const { deleteGoal } = await import("@/lib/goals-service");
      const ok = await deleteGoal(editingGoal.id);
      if (ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      isOpen
      onClose={onClose}
      title={isEditMode ? "Ajustar objetivo" : "Definir objetivo"}
      ariaLabel={isEditMode ? "Ajustar objetivo" : "Definir objetivo"}
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-aula-text-2 mb-1">O que queres alcançar?</label>
          {isEditMode ? (
            <p className="px-3 py-2 rounded-lg text-[13px] text-aula-text bg-aula-sunken border border-aula-border">
              {GOAL_TITLES[goalType] ?? goalType}
            </p>
          ) : (
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none"
            >
              {optionsWithCounts.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
              {optionsWithCounts.length === 0 && (
                <option value="lessons_a1">Completar todas as lições A1</option>
              )}
            </select>
          )}
        </div>
        <div>
          <label className="block text-[12px] font-medium text-aula-text-2 mb-1">Até quando?</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none"
          />
        </div>
        <div>
          <p className="text-[12px] font-medium text-aula-text-2 mb-2">Em que dias estudas?</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`w-10 h-10 rounded-lg text-[13px] font-medium border-[0.5px] transition-colors ${
                  studyDays.includes(d) ? "bg-[rgba(0,0,0,0.05)] border-aula-line text-aula-text" : "border-aula-line text-aula-text-3 hover:border-aula-text-4"
                }`}
              >
                {WEEKDAY_LABELS[d - 1]}
              </button>
            ))}
          </div>
        </div>
        {preview && (
          <div className="rounded-lg border border-aula-border p-3 bg-aula-sunken">
            <p className="text-[12px] font-medium text-aula-text-2 mb-1">Plano sugerido:</p>
            <p className="text-[12px] text-aula-text-2">
              {preview.remaining} restantes ÷ {preview.days} dias disponíveis = ~{Math.ceil(preview.remaining / preview.days)} por dia
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-aula-text-2 border border-aula-border rounded-lg hover:bg-[rgba(0,0,0,0.02)]">
            Cancelar
          </button>
          {isEditMode ? (
            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving || (preview ? preview.remaining <= 0 || preview.days <= 0 : true)}
              className="px-4 py-2 text-[13px] font-medium text-white bg-aula-accent rounded-lg hover:bg-aula-accent-hover disabled:opacity-50"
            >
              {saving ? "A atualizar…" : "Atualizar plano"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving || !preview || preview.remaining <= 0 || preview.days <= 0}
              className="px-4 py-2 text-[13px] font-medium text-white bg-aula-accent rounded-lg hover:bg-aula-accent-hover disabled:opacity-50"
            >
              {saving ? "A criar…" : "Criar plano"}
            </button>
          )}
        </div>
        {isEditMode && editingGoal && (
          <div className="pt-4 mt-4 border-t border-aula-line">
            {!confirmDeleteGoal ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteGoal(true)}
                className="text-[12px] font-medium text-aula-overdue"
              >
                Eliminar objetivo
              </button>
            ) : (
              <div className="rounded-lg border border-aula-border p-3 bg-aula-sunken">
                <p className="text-[13px] font-medium text-aula-text mb-2">Tens a certeza?</p>
                <p className="text-[12px] text-aula-text-2 mb-3">
                  Os eventos futuros deste objetivo serão removidos. Os eventos passados ficam no calendário.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteGoal(false)}
                    className="px-3 py-1.5 text-[13px] font-medium text-aula-text-2 border border-aula-border rounded-lg hover:bg-[rgba(0,0,0,0.02)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteGoal}
                    disabled={saving}
                    className="px-3 py-1.5 text-[13px] font-medium text-white bg-aula-overdue rounded-lg disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
  const [reflectionStats, setReflectionStats] = useState<WeeklyStats | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  const isLoggedIn = !authLoading && !!user;

  const loadGoals = useCallback(async () => {
    const list = await getGoalsForDisplay();
    setGoals(list);
  }, []);

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
      await loadGoals();
      if (viewMode === "day") {
        await loadDay(cursorDate);
        const { getNoteActivityCountForDate } = await import("@/lib/notes-service");
        const count = await getNoteActivityCountForDate(cursorDate);
        setDayNoteCount(count);
      }
      setLoading(false);
    };
    run();
  }, [isLoggedIn, viewMode, year, month, cursorDate, loadMonth, loadDay, loadNoteActivity, loadGoals]);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() + 1 === month;
  }, [year, month]);

  useEffect(() => {
    if (!isLoggedIn || viewMode !== "month") {
      setReflectionStats(null);
      return;
    }
    setReflectionLoading(true);
    const run = async () => {
      try {
        if (isCurrentMonth) {
          const { weekStart, weekEnd } = getWeekRange(new Date());
          const stats = await getWeeklyStats(weekStart, weekEnd);
          setReflectionStats(stats);
        } else {
          const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
          const lastDay = new Date(year, month, 0).getDate();
          const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
          const stats = await getMonthlyStats(monthStart, monthEnd);
          setReflectionStats(stats);
        }
      } finally {
        setReflectionLoading(false);
      }
    };
    run();
  }, [isLoggedIn, viewMode, isCurrentMonth, year, month]);

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

  const activeGoalProgress = useMemo(() => {
    const active = goals.filter((g) => g.is_active);
    if (active.length === 0) return null;
    const first = active[0];
    const pct = first.total_items > 0 ? Math.round((first.completed_items / first.total_items) * 100) : 0;
    return pct;
  }, [goals]);

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

  const LEGEND = [
    { c: "#1F7A68", l: "Lição aprovada" },
    { c: "#5B45B8", l: "Ainda não" },
    { c: "#1B2B61", l: "Exame" },
    { c: "#3F589F", l: "Prática" },
    { c: "#6B6B69", l: "Planeado" },
    { c: "#98988F", l: "Objetivo" },
  ];

  const panel = isLoggedIn ? (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-aula-border bg-white p-4">
        <p className="mb-1.5 text-[12px] font-semibold text-aula-text">{isCurrentMonth ? "Esta semana" : `${MESES[month - 1]} ${year}`}</p>
        <p className="text-[12px] leading-relaxed text-aula-text-2">
          {reflectionLoading || !reflectionStats ? "A carregar…" : isCurrentMonth ? generateWeeklySummary(reflectionStats) : generateMonthlySummary(reflectionStats)}
        </p>
        {isCurrentMonth && reflectionStats && reflectionStats.notesCount > 0 && (
          <Link
            href={`/notes?updatedDateStart=${getWeekRange(new Date()).weekStart}&updatedDateEnd=${getWeekRange(new Date()).weekEnd}`}
            className="mt-2 inline-block text-[12px] font-medium text-aula-accent"
          >
            Ver notas desta semana →
          </Link>
        )}
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-aula-line pt-3">
          {[
            { n: monthStats.lessons, l: "lições" },
            { n: monthStats.exams, l: "exames" },
            { n: monthStats.practice, l: "prática" },
            { n: monthStats.planned, l: "planeado" },
          ].map((x) => (
            <div key={x.l}>
              <p className="text-[15px] font-semibold text-aula-text">{x.n}</p>
              <p className="text-[10.5px] text-aula-text-3">{x.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center">
          <Label className="flex-1">Objetivos</Label>
          <button
            type="button"
            onClick={() => {
              setEditingGoal(null);
              setDrawerOpen("goal");
            }}
            className="text-[11.5px] font-medium text-aula-accent"
          >
            + Novo
          </button>
        </div>
        {goals.length === 0 ? (
          <p className="text-[12px] leading-relaxed text-aula-text-2">Define um objetivo e o Aula marca as sessões no calendário por ti.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {goals.map((goal) => {
              const title = GOAL_TITLES[goal.goal_type] ?? goal.goal_type;
              const itemLabel = GOAL_ITEM_LABELS[goal.goal_type] ?? "itens";
              const pct = goal.total_items > 0 ? goal.completed_items / goal.total_items : 0;
              const isComplete = goal.completed_items >= goal.total_items;
              const health = !isComplete ? getGoalHealth(goal) : null;
              const healthLabel = health ? { ahead: "Adiantado", "on-track": "No caminho certo", behind: "Um pouco atrasado" }[health] : null;
              const targetD = new Date(goal.target_date + "T12:00:00");
              return (
                <div key={goal.id} className="rounded-[10px] border border-aula-border bg-white p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <Target size={13} strokeWidth={1.5} className={`mt-[2px] shrink-0 ${isComplete ? "text-[#1F7A68]" : "text-aula-text-3"}`} />
                    <p className={`flex-1 text-[12.5px] font-medium leading-snug ${isComplete ? "text-[#1F7A68]" : "text-aula-text"}`}>{title}</p>
                    {!isComplete && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGoal(goal);
                          setDrawerOpen("goal");
                        }}
                        className="text-[11px] text-aula-text-3 hover:text-aula-text"
                      >
                        Ajustar
                      </button>
                    )}
                  </div>
                  <Track value={Math.min(pct, 1)} tone={isComplete || health !== "behind" ? "accent" : "learning"} />
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-aula-text-2">
                      {goal.completed_items} de {goal.total_items} {itemLabel}
                    </span>
                    <span className={health === "behind" ? "text-[#5B45B8]" : "text-aula-text-3"}>
                      {isComplete ? "Concluído" : healthLabel ?? `até ${targetD.getDate()} ${MESES[targetD.getMonth()].slice(0, 3).toLowerCase()}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2">Legenda</Label>
        <div className="grid grid-cols-2 gap-y-1">
          {LEGEND.map((x) => (
            <span key={x.l} className="flex items-center gap-1.5 text-[11.5px] text-aula-text-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.c }} />
              {x.l}
            </span>
          ))}
        </div>
      </div>
    </div>
  ) : undefined;

  return (
    <>
      <PageShell header={<Crumbs items={[{ label: "Calendário" }]} />} panel={panel} wide>
        <ScreenTitle title="Calendário" subtitle="Os teus dias de estudo e o que vem a seguir" />

        {!isLoggedIn ? (
          <div className="mx-auto max-w-[680px] rounded-xl border border-aula-border p-8 text-center">
            <p className="text-[15px] font-semibold text-aula-text">Entra para usar o calendário</p>
            <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] text-aula-text-2">O calendário regista as tuas lições e exames e ajuda-te a planear.</p>
            <Link href="/auth/login" className="mt-4 inline-flex h-8 items-center rounded-lg bg-aula-accent px-4 text-[12.5px] font-medium text-white">
              Entrar
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg bg-aula-sunken p-[3px]">
                {(["month", "day"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setViewMode(v)}
                    className={`h-[26px] rounded-md border px-3 text-[12px] transition-colors ${
                      viewMode === v ? "border-aula-line bg-white font-medium text-aula-text shadow-[0_1px_2px_rgba(0,0,0,0.05)]" : "border-transparent text-aula-text-2 hover:text-aula-text"
                    }`}
                  >
                    {v === "month" ? "Mês" : "Dia"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={navPrev} aria-label="Anterior" className="flex h-8 w-8 items-center justify-center rounded-lg text-aula-text-2 hover:bg-aula-sunken hover:text-aula-text">
                  <ChevronLeft size={15} strokeWidth={1.5} />
                </button>
                <span className="min-w-[150px] text-center text-[14px] font-semibold text-aula-text">{navCenterLabel}</span>
                <button type="button" onClick={navNext} aria-label="Seguinte" className="flex h-8 w-8 items-center justify-center rounded-lg text-aula-text-2 hover:bg-aula-sunken hover:text-aula-text">
                  <ChevronRight size={15} strokeWidth={1.5} />
                </button>
              </div>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => setDrawerOpen("create")}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-aula-accent px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
              >
                <Plus size={14} strokeWidth={1.75} /> Planear sessão
              </button>
            </div>

            {loading ? (
              <p className="py-16 text-center text-[13px] text-aula-text-3">A carregar…</p>
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
                onGoalEventMoved={() => {
                  loadMonth();
                  if (viewMode === "day") loadDay(cursorDate);
                  setDetailEvent(null);
                }}
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
                editingGoal={editingGoal}
                onClose={() => {
                  setDrawerOpen(null);
                  setEditingGoal(null);
                }}
                onSaved={() => {
                  setDrawerOpen(null);
                  setEditingGoal(null);
                  loadMonth();
                  loadGoals();
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
      </PageShell>
    </>
  );
}

// ─── Event detail popover ───
function EventDetailPopover({
  event,
  onClose,
  onEdit,
  onDelete,
  onGoalEventMoved,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGoalEventMoved?: () => void;
}) {
  const [showMoveDate, setShowMoveDate] = useState(false);
  const [moveDate, setMoveDate] = useState(event.event_date);
  const [moving, setMoving] = useState(false);
  const style = getEventStyle(event);

  const handleMoveGoalEvent = async () => {
    if (moveDate === event.event_date) return;
    setMoving(true);
    try {
      const { moveGoalEvent } = await import("@/lib/calendar-service");
      const updated = await moveGoalEvent(event.id, moveDate);
      if (updated) {
        onGoalEventMoved?.();
        onClose();
      }
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative bg-white rounded-lg border border-aula-border p-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2">
          <span className="w-[6px] h-[6px] rounded-full shrink-0 mt-1.5" style={{ backgroundColor: style.color }} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-aula-text">{event.title}</p>
            <p className="text-[11px] text-aula-text-2 mt-0.5">{style.label}{event.linked_score != null ? ` · ${Math.round(event.linked_score)}%` : ""}{event.linked_passed !== null ? (event.linked_passed ? " · Aprovado" : " · Ainda não") : ""}</p>
            {event.created_at && (
              <p className="text-[10px] text-aula-text-3 mt-1">{new Date(event.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
            )}
            {event.event_type === "auto_lesson" && event.linked_id && (
              <Link href={`/lessons/${event.linked_id}`} className="text-[12px] text-aula-accent hover:underline mt-2 inline-block">Abrir lição</Link>
            )}
            {event.event_type === "auto_exam" && event.linked_id && (
              <Link href={`/exams/${event.linked_id}`} className="text-[12px] text-aula-accent hover:underline mt-2 inline-block">Abrir exame</Link>
            )}
          </div>
        </div>
        {event.event_type === "goal" && showMoveDate && (
          <div className="mt-3 pt-3 border-t border-aula-line">
            <p className="text-[12px] font-medium text-aula-text-2 mb-2">Mover para outra data</p>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-aula-border rounded-lg text-[13px] focus:border-aula-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleMoveGoalEvent}
                disabled={moving || moveDate === event.event_date}
                className="px-3 py-2 text-[13px] font-medium text-white bg-aula-accent rounded-lg hover:bg-aula-accent-hover disabled:opacity-50"
              >
                {moving ? "A guardar…" : "Mover"}
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-aula-line">
          {event.event_type === "goal" && (
            <>
              <button type="button" onClick={() => setShowMoveDate((v) => !v)} className="text-[13px] font-medium text-aula-text-2 hover:text-aula-text">
                {showMoveDate ? "Ocultar data" : "Ajustar"}
              </button>
              <button type="button" onClick={onDelete} className="text-[13px] font-medium text-aula-overdue">Apagar</button>
            </>
          )}
          {event.event_type === "planned" && (
            <>
              <button type="button" onClick={onEdit} className="text-[13px] font-medium text-aula-text-2 hover:text-aula-text">Editar</button>
              <button type="button" onClick={onDelete} className="text-[13px] font-medium text-aula-overdue">Apagar</button>
            </>
          )}
          <button type="button" onClick={onClose} className="text-[13px] font-medium text-aula-text-2 hover:text-aula-text">Fechar</button>
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
  const allDay = events.filter((e) => e.is_all_day);
  const timed = [...events.filter((e) => !e.is_all_day)].sort((a, b) => {
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
    <div className="rounded-lg border border-aula-border overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aula-line">
        <button type="button" onClick={onBackToMonth} className="text-[13px] font-medium text-aula-text-2 hover:text-aula-text">
          ← Voltar ao mês
        </button>
        <span className="text-[13px] font-medium text-aula-text">
          {formatDayLongPT(dateKey)}
        </span>
      </div>
      <div className="p-4 space-y-4">
        {timed.map((e) => {
          const st = getEventStyle(e);
          const timeStr = e.start_time ? formatTimePT(e.start_time) : "";
          return (
            <div key={e.id} className="rounded-lg border border-aula-border p-3 flex items-start gap-3">
              {timeStr && <span className="text-[11px] text-aula-text-2 shrink-0 w-12">{timeStr}</span>}
              <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: st.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: st.color }}>{typeLabel(e)}</p>
                <p className="text-[14px] font-medium text-aula-text">{e.title}</p>
                {e.linked_score != null && (
                  <p className="text-[12px] text-aula-text-2 mt-0.5">
                    {Math.round(e.linked_score)}%{e.linked_passed !== null ? (e.linked_passed ? " Aprovado" : " Ainda não") : ""}
                  </p>
                )}
              </div>
              {(e.event_type === "planned" || e.event_type === "goal") && (
                <button type="button" onClick={() => onEditEvent(e)} className="text-[12px] font-medium text-aula-accent hover:underline shrink-0">
                  {e.event_type === "goal" ? "Ajustar" : "Editar"}
                </button>
              )}
            </div>
          );
        })}
        {allDay.length > 0 && (
          <>
            <p className="text-[10px] font-medium text-aula-text-3 uppercase tracking-wide pt-2 border-t border-aula-line">──── Dia inteiro ────</p>
            {allDay.map((e) => {
              const st = getEventStyle(e);
              return (
                <div key={e.id} className="rounded-lg border border-aula-border p-3 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: st.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: st.color }}>{typeLabel(e)}</p>
                    <p className="text-[14px] font-medium text-aula-text">{e.title}</p>
                  </div>
                  {(e.event_type === "planned" || e.event_type === "goal") && (
                    <button type="button" onClick={() => onEditEvent(e)} className="text-[12px] font-medium text-aula-accent hover:underline shrink-0">
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
        <div className="px-4 py-3 border-t border-aula-line">
          <Link href={`/notes?updatedDate=${dateKey}`} className="text-[12px] text-aula-text-2 hover:text-aula-accent">
            Notas editadas: {dayNoteCount}
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
    <div className="overflow-hidden rounded-xl border border-aula-border bg-white">
      <div className="grid grid-cols-7 border-b border-aula-line bg-aula-sunken">
        {DIAS_CURTOS.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-medium text-aula-text-3">
            {d}
          </div>
        ))}
      </div>
      <div className="divide-y divide-aula-line">
        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 divide-x divide-aula-line">
            {row.map((day, di) => {
              const dateKey = day != null ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const events = dateKey ? (eventsByDate[dateKey] ?? []) : [];
              const isToday = dateKey === todayKey;
              const hasNoteActivity = dateKey ? noteActivityDates.has(dateKey) : false;
              if (!dateKey) return <div key={di} className="min-h-[104px] bg-aula-sunken/60" />;
              return (
                <div
                  key={di}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectDay(dateKey)}
                  onKeyDown={(e) => e.key === "Enter" && onSelectDay(dateKey)}
                  className={`group relative min-h-[104px] cursor-pointer p-1.5 text-left transition-colors ${isToday ? "bg-aula-accent-faint" : "hover:bg-aula-sunken"} ${dateKey === cursorDate && !isToday ? "bg-aula-sunken" : ""}`}
                >
                  <div className="mb-1 flex items-center justify-between px-0.5">
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[12px] font-medium ${isToday ? "bg-aula-accent text-white" : "text-aula-text"}`}
                    >
                      {day}
                    </span>
                    {hasNoteActivity && (
                      <span className="text-aula-text-4" title="Notas neste dia" aria-hidden>
                        <PencilIconSmall />
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
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
                          className="flex w-full items-center gap-1 rounded-[5px] px-1.5 py-[3px] text-left transition-colors hover:brightness-95"
                          style={{ backgroundColor: st.color + "14" }}
                        >
                          <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ backgroundColor: st.color }} />
                          <span className="flex-1 truncate text-[11px] text-aula-text">{e.title}</span>
                        </button>
                      );
                    })}
                    {events.length > 3 && <span className="px-1.5 text-[10.5px] text-aula-text-3">+{events.length - 3}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
