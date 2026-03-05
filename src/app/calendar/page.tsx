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
  getEventsInRange,
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

type ViewMode = "day" | "week" | "month";

const EVENT_STYLE: Record<string, { color: string; label: string }> = {
  auto_lesson_passed: { color: "#16A34A", label: "Lição" },
  auto_lesson_failed: { color: "#D97706", label: "Lição" },
  auto_exam_passed: { color: "#003399", label: "Exame" },
  auto_exam_failed: { color: "#D97706", label: "Exame" },
  auto_practice: { color: "#7C3AED", label: "Prática" },
  planned: { color: "#6B7280", label: "Planeado" },
};

function getEventStyle(e: CalendarEvent): { color: string; label: string } {
  if (e.event_type === "auto_lesson") return e.linked_passed ? EVENT_STYLE.auto_lesson_passed : EVENT_STYLE.auto_lesson_failed;
  if (e.event_type === "auto_exam") return e.linked_passed ? EVENT_STYLE.auto_exam_passed : EVENT_STYLE.auto_exam_failed;
  if (e.event_type === "auto_practice") return EVENT_STYLE.auto_practice;
  return EVENT_STYLE.planned;
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

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00–22:00

function getEventPosition(e: CalendarEvent): { top: number; height: number } {
  if (e.all_day) return { top: 0, height: 24 };
  const [sh, sm] = (e.start_time ?? "06:00").split(":").map(Number);
  const [eh, em] = (e.end_time ?? e.start_time ?? "07:00").split(":").map(Number);
  const startMins = sh * 60 + (sm || 0);
  const endMins = eh * 60 + (em || 0);
  const duration = Math.max(30, endMins - startMins);
  const top = ((startMins - 6 * 60) / 60) * 60; // 60px per hour
  const height = (duration / 60) * 60;
  return { top, height };
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

// ─── Main page ───
export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [cursorDate, setCursorDate] = useState<string>(() => toDateKey(today));
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [rangeEvents, setRangeEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState<"create" | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CalendarEvent | null>(null);

  const isLoggedIn = !authLoading && !!user;

  const cursor = useMemo(() => new Date(cursorDate + "T12:00:00"), [cursorDate]);
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const weekStart = useMemo(() => getMonday(cursor), [cursor]);
  const weekStartKey = toDateKey(weekStart);
  const weekEnd = addDays(weekStart, 6);
  const weekEndKey = toDateKey(weekEnd);

  const loadMonth = useCallback(async () => {
    const list = await getEventsForMonth(year, month);
    setMonthEvents(list);
  }, [year, month]);

  const loadRange = useCallback(async (start: string, end: string) => {
    const list = await getEventsInRange(start, end);
    setRangeEvents(list);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    const run = async () => {
      await loadMonth();
      if (viewMode === "week" || viewMode === "day") {
        await loadRange(viewMode === "week" ? weekStartKey : cursorDate, viewMode === "week" ? weekEndKey : cursorDate);
      }
      setLoading(false);
    };
    run();
  }, [isLoggedIn, viewMode, year, month, cursorDate, weekStartKey, weekEndKey, loadMonth, loadRange]);

  const eventsByDate = useMemo(() => {
    const list = viewMode === "month" ? monthEvents : rangeEvents;
    return list.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
      if (!acc[e.event_date]) acc[e.event_date] = [];
      acc[e.event_date].push(e);
      return acc;
    }, {});
  }, [viewMode, monthEvents, rangeEvents]);

  const monthStats = useMemo(() => ({
    lessons: monthEvents.filter((e) => e.event_type === "auto_lesson").length,
    exams: monthEvents.filter((e) => e.event_type === "auto_exam").length,
    practice: monthEvents.filter((e) => e.event_type === "auto_practice").length,
    planned: monthEvents.filter((e) => e.event_type === "planned").length,
  }), [monthEvents]);

  const navPrev = () => {
    if (viewMode === "month") {
      const d = new Date(year, month - 2, 1);
      setCursorDate(toDateKey(d));
    } else if (viewMode === "week") {
      setCursorDate(toDateKey(addDays(weekStart, -7)));
    } else {
      setCursorDate(toDateKey(addDays(cursor, -1)));
    }
  };

  const navNext = () => {
    if (viewMode === "month") {
      const d = new Date(year, month, 1);
      setCursorDate(toDateKey(d));
    } else if (viewMode === "week") {
      setCursorDate(toDateKey(addDays(weekStart, 7)));
    } else {
      setCursorDate(toDateKey(addDays(cursor, 1)));
    }
  };

  const navCenterLabel = viewMode === "month"
    ? `${MESES[month - 1]} ${year}`
    : viewMode === "week"
      ? formatDateRangePT(weekStartKey, weekEndKey)
      : formatDayLongPT(cursorDate);

  const handleDeleteEvent = async (event: CalendarEvent) => {
    await deleteEvent(event.id);
    setConfirmDelete(null);
    setDetailEvent(null);
    if (viewMode === "month") loadMonth(); else loadRange(viewMode === "week" ? weekStartKey : cursorDate, viewMode === "week" ? weekEndKey : cursorDate);
  };

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const currentTimeMins = today.getHours() * 60 + today.getMinutes();
  const currentTimeTop = ((currentTimeMins - 6 * 60) / 60) * 60;

  return (
    <>
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <PageHeader
            title="Calendário"
            titlePt="Calendário"
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
            {monthEvents.length > 0 && (
              <p className="text-[12px] text-gray-500 mb-4">
                Este mês: <span className="font-medium text-gray-700">{monthStats.lessons} lições</span>
                {" · "}<span className="font-medium text-gray-700">{monthStats.exams} exame</span>
                {" · "}<span className="font-medium text-gray-700">{monthStats.practice} prática</span>
                {" · "}<span className="font-medium text-gray-700">{monthStats.planned} planeado</span>
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                {(["day", "week", "month"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setViewMode(v)}
                    className={`px-3 py-1.5 rounded-[12px] text-sm font-medium transition-colors ${
                      viewMode === v ? "bg-[rgba(0,0,0,0.05)] text-gray-900" : "text-[rgba(0,0,0,0.5)] hover:text-gray-700"
                    }`}
                  >
                    {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={navPrev} className="text-sm text-gray-600 hover:text-gray-900">
                  {viewMode === "month" ? "← " + MESES[month - 2 < 0 ? 11 : month - 2] : viewMode === "week" ? "← Semana anterior" : "← Dia anterior"}
                </button>
                <span className="text-sm font-medium text-gray-800 min-w-[200px] text-center">{navCenterLabel}</span>
                <button type="button" onClick={navNext} className="text-sm text-gray-600 hover:text-gray-900">
                  {viewMode === "month" ? MESES[month > 11 ? 0 : month] + " →" : viewMode === "week" ? "Próxima semana →" : "Próximo dia →"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen("create")}
                className="px-4 py-2 text-sm font-medium text-white bg-[#003399] rounded-[12px] hover:bg-[#002266]"
              >
                Planear sessão
              </button>
            </div>

            {/* Legend */}
            <p className="text-[10px] text-[rgba(0,0,0,0.4)] mb-4">
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Aprovado</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /> Ainda não</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#003399]" /> Exame</span>
              <span className="inline-flex items-center gap-1 mr-3"><span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /> Prática</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" /> Planeado</span>
            </p>

            {loading ? (
              <p className="text-sm text-gray-500 py-8">A carregar...</p>
            ) : viewMode === "month" ? (
              <MonthGridView
                year={year}
                month={month}
                cursorDate={cursorDate}
                eventsByDate={eventsByDate}
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
            ) : viewMode === "week" ? (
              <WeekViewSimple
                weekDays={weekDays}
                eventsByDate={eventsByDate}
                currentTimeTop={currentTimeTop}
                onEventClick={(e) => setDetailEvent(e)}
              />
            ) : (
              <DayView
                dateKey={cursorDate}
                events={eventsByDate[cursorDate] ?? []}
                currentTimeTop={currentTimeTop}
                onEventClick={(e) => setDetailEvent(e)}
                onEditEvent={(e) => setEditingEvent(e)}
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
                  if (viewMode === "month") loadMonth(); else loadRange(viewMode === "week" ? weekStartKey : cursorDate, viewMode === "week" ? weekEndKey : cursorDate);
                }}
              />
            )}
            {editingEvent && (
              <EditEventDrawer
                event={editingEvent}
                onClose={() => setEditingEvent(null)}
                onSaved={() => {
                  setEditingEvent(null);
                  if (viewMode === "month") loadMonth(); else loadRange(viewMode === "week" ? weekStartKey : cursorDate, viewMode === "week" ? weekEndKey : cursorDate);
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
          {!isAuto && (
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

// Week view: day columns + time axis, events as blocks
function WeekViewSimple({
  weekDays,
  eventsByDate,
  currentTimeTop,
  onEventClick,
}: {
  weekDays: Date[];
  eventsByDate: Record<string, CalendarEvent[]>;
  currentTimeTop: number;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const todayKey = toDateKey(new Date());
  return (
    <div className="rounded-[12px] border border-[rgba(0,0,0,0.06)] overflow-hidden bg-white">
      <div className="grid border-b border-[rgba(0,0,0,0.03)]" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
        <div />
        {weekDays.map((d) => {
          const key = toDateKey(d);
          const isToday = key === todayKey;
          return (
            <div key={key} className={`py-2 text-center border-r border-[rgba(0,0,0,0.03)] ${isToday ? "bg-[#003399]/[0.03]" : ""}`}>
              <p className={`text-[10px] ${isToday ? "text-[#003399]" : "text-gray-400"}`}>{DIAS_CURTOS[d.getDay() === 0 ? 6 : d.getDay() - 1]}</p>
              <p className={`text-[13px] font-semibold ${isToday ? "text-[#003399]" : "text-gray-700"}`}>{d.getDate()}</p>
            </div>
          );
        })}
      </div>
      <div className="grid border-b border-[rgba(0,0,0,0.03)] min-h-[40px]" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
        <div className="px-2 py-1.5 text-[10px] text-gray-400 border-r border-[rgba(0,0,0,0.03)]">Todo o dia</div>
        {weekDays.map((d) => {
          const key = toDateKey(d);
          const events = (eventsByDate[key] ?? []).filter((e) => e.all_day);
          return (
            <div key={key} className="border-r border-[rgba(0,0,0,0.03)] p-1 space-y-1">
              {events.slice(0, 2).map((e) => {
                const st = getEventStyle(e);
                return (
                  <button key={e.id} type="button" onClick={() => onEventClick(e)} className="w-full text-left rounded-[12px] p-1.5 flex items-center gap-1.5" style={{ backgroundColor: st.color + "14" }}>
                    <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                    <span className="text-[11px] font-medium text-gray-800 truncate">{e.title}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="overflow-x-auto" style={{ height: 1020 }}>
        <div className="flex">
          <div className="shrink-0 w-14 border-r border-[rgba(0,0,0,0.03)]">
            {HOURS.map((h) => (
              <div key={h} className="h-[60px] text-[10px] text-gray-400 text-right pr-2 pt-0.5">{h}:00</div>
            ))}
          </div>
          {weekDays.map((d) => {
            const key = toDateKey(d);
            const isToday = key === todayKey;
            const events = eventsByDate[key] ?? [];
            const timedEvents = events.filter((e) => !e.all_day);
            return (
              <div key={key} className={`shrink-0 flex-1 min-w-[120px] relative border-r border-[rgba(0,0,0,0.03)] ${isToday ? "bg-[#003399]/[0.03]" : ""}`} style={{ height: 1020 }}>
                {timedEvents.map((e) => {
                  const { top, height } = getEventPosition(e);
                  const st = getEventStyle(e);
                  return (
                    <button key={e.id} type="button" onClick={() => onEventClick(e)} className="absolute left-1 right-1 rounded-[12px] p-2 overflow-hidden text-left border-l-2" style={{ top: top + 2, height: Math.max(height - 2, 36), backgroundColor: st.color + "14", borderLeftColor: st.color }}>
                      <span className="text-[10px] font-medium block truncate" style={{ color: st.color }}>{st.label}</span>
                      <span className="text-[12px] font-medium text-gray-800 truncate block">{e.title}</span>
                      {e.linked_score != null && <span className="text-[10px] text-gray-500">{Math.round(e.linked_score)}%</span>}
                    </button>
                  );
                })}
                {isToday && currentTimeTop >= 0 && currentTimeTop < 960 && (
                  <div className="absolute left-0 right-0 h-0.5 bg-[#003399] z-10" style={{ top: currentTimeTop }} />
                )}
              </div>
            );
          })}
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
  onEventClick,
  onEditEvent,
  confirmDelete,
  setConfirmDelete,
  onDelete,
}: {
  dateKey: string;
  events: CalendarEvent[];
  currentTimeTop: number;
  onEventClick: (e: CalendarEvent) => void;
  onEditEvent: (e: CalendarEvent) => void;
  confirmDelete: CalendarEvent | null;
  setConfirmDelete: (e: CalendarEvent | null) => void;
  onDelete: (e: CalendarEvent) => void;
}) {
  const allDay = events.filter((e) => e.all_day);
  const timed = events.filter((e) => !e.all_day);
  const isToday = isTodayKey(dateKey);
  return (
    <div className="rounded-[12px] border border-[rgba(0,0,0,0.06)] overflow-hidden bg-white">
      {allDay.length > 0 && (
        <div className="p-3 border-b border-[rgba(0,0,0,0.03)]">
          <p className="text-[10px] text-gray-400 mb-2">Dia inteiro</p>
          <div className="flex flex-wrap gap-2">
            {allDay.map((e) => {
              const st = getEventStyle(e);
              return (
                <button key={e.id} type="button" onClick={() => onEventClick(e)} className="rounded-[12px] px-3 py-2 flex items-center gap-2" style={{ backgroundColor: st.color + "14", borderLeft: `3px solid ${st.color}` }}>
                  <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: st.color }} />
                  <span className="text-[13px] font-medium text-gray-800">{e.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="relative" style={{ height: 17 * 60 }}>
        <div className="absolute inset-0 flex">
          <div className="w-14 shrink-0 border-r border-[rgba(0,0,0,0.03)]">
            {HOURS.map((h) => (
              <div key={h} className="h-[60px] text-[10px] text-gray-400 text-right pr-2 pt-0.5">{h}:00</div>
            ))}
          </div>
          <div className="flex-1 relative">
            {timed.map((e) => {
              const { top, height } = getEventPosition(e);
              const st = getEventStyle(e);
              return (
                <button key={e.id} type="button" onClick={() => onEventClick(e)} className="absolute left-2 right-2 rounded-[12px] p-2 overflow-hidden text-left border-l-2" style={{ top: top + 2, height: Math.max(height - 2, 36), backgroundColor: st.color + "14", borderLeftColor: st.color }}>
                  <span className="text-[10px] font-medium block" style={{ color: st.color }}>{st.label}</span>
                  <span className="text-[13px] font-medium text-gray-800 truncate block">{e.title}</span>
                  {e.linked_score != null && <span className="text-[11px] text-gray-500">{Math.round(e.linked_score)}%</span>}
                </button>
              );
            })}
            {isToday && currentTimeTop >= 0 && currentTimeTop < 960 && (
              <div className="absolute left-0 right-0 h-0.5 bg-[#003399] z-10" style={{ top: currentTimeTop }} />
            )}
          </div>
        </div>
      </div>
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
        {DIAS_CURTOS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">
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
              return (
                <button
                  key={di}
                  type="button"
                  onClick={() => dateKey && onSelectDay(dateKey)}
                  disabled={!dateKey}
                  className={`min-h-[100px] p-2 text-left border-r border-[rgba(0,0,0,0.03)] last:border-r-0 transition-colors ${
                    !dateKey ? "bg-[rgba(0,0,0,0.02)] cursor-default" : isToday ? "bg-[#003399]/[0.03]" : "hover:bg-[rgba(0,0,0,0.02)]"
                  }`}
                >
                  {day != null && (
                    <>
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
                              className="w-full text-left rounded-[12px] px-1.5 py-1 flex items-center gap-1"
                              style={{ backgroundColor: st.color + "14" }}
                            >
                              <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                              <span className="text-[10px] font-medium text-gray-800 truncate flex-1">{e.title}</span>
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
