"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Divider } from "@/components/ui/divider";
import { useAuth } from "@/components/auth-provider";
import {
  getEventsForMonth,
  getEventsForDate,
  createPlannedEvent,
  updateEvent,
  deleteEvent,
  type CalendarEvent,
} from "@/lib/calendar-service";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isToday(year: number, month: number, day: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month - 1 && t.getDate() === day;
}

function formatTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = parseInt(h!, 10);
  const mm = m ? parseInt(m, 10) : 0;
  if (hh === 0 && mm === 0) return "12:00 AM";
  if (hh < 12) return `${hh}:${String(mm).padStart(2, "0")} AM`;
  if (hh === 12) return `12:${String(mm).padStart(2, "0")} PM`;
  return `${hh - 12}:${String(mm).padStart(2, "0")} PM`;
}

function EventDots({ events }: { events: CalendarEvent[] }) {
  const lessonPassed = events.some((e) => e.event_type === "auto_lesson" && e.linked_passed);
  const lessonFailed = events.some((e) => e.event_type === "auto_lesson" && !e.linked_passed);
  const exam = events.some((e) => e.event_type === "auto_exam");
  const planned = events.some((e) => e.event_type === "planned");
  return (
    <div className="flex items-center justify-center gap-1 mt-1">
      {lessonPassed && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" title="Lesson passed" />}
      {(lessonFailed || planned) && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" title="Lesson failed or planned" />}
      {exam && <span className="w-1.5 h-1.5 rounded-full bg-[#003399]" title="Exam" />}
    </div>
  );
}

function CreateEventModal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md p-6" role="dialog" aria-label="Plan study session">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan study session</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Review verb conjugations"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-gray-300 text-[#003399] focus:ring-[#003399]"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">All day</label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#003399] rounded-lg hover:bg-[#002266] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEventModal({
  event,
  onClose,
  onSaved,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onSaved: () => void;
}) {
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
    const updated = await updateEvent(event.id, {
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      all_day: allDay,
      start_time: allDay ? null : startTime,
      end_time: allDay ? null : endTime,
    });
    setSaving(false);
    if (updated) {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md p-6" role="dialog" aria-label="Edit event">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editAllDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-gray-300 text-[#003399] focus:ring-[#003399]"
            />
            <label htmlFor="editAllDay" className="text-sm text-gray-700">All day</label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#003399] rounded-lg hover:bg-[#002266] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CalendarEvent | null>(null);

  const isLoggedIn = !authLoading && !!user;

  const loadMonth = useCallback(async () => {
    setLoading(true);
    const list = await getEventsForMonth(year, month);
    setMonthEvents(list);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadMonth();
  }, [isLoggedIn, loadMonth]);

  const loadDay = useCallback(async (dateKey: string) => {
    const list = await getEventsForDate(dateKey);
    setDayEvents(list);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !selectedDate) return;
    loadDay(selectedDate);
  }, [isLoggedIn, selectedDate, loadDay]);

  const eventsByDate = monthEvents.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    if (!acc[e.event_date]) acc[e.event_date] = [];
    acc[e.event_date].push(e);
    return acc;
  }, {});

  const grid = getMonthGrid(year, month);

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    await deleteEvent(event.id);
    setConfirmDelete(null);
    if (selectedDate) loadDay(selectedDate);
    loadMonth();
  };

  const monthStats = {
    lessons: monthEvents.filter((e) => e.event_type === "auto_lesson").length,
    exams: monthEvents.filter((e) => e.event_type === "auto_exam").length,
    planned: monthEvents.filter((e) => e.event_type === "planned").length,
  };

  return (
    <>
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PageHeader
              title="Calendar"
              titlePt="Calendário"
              section="REVISION"
              sectionPt="Revisão"
              tagline="Track your learning journey and plan ahead."
            />
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="shrink-0 flex items-center gap-2 h-10 px-4 bg-[#003399] hover:bg-[#002266] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Plan study session
              </button>
            )}
          </div>
          <Divider className="mt-4 mb-6" />
        </div>

        {!isLoggedIn ? (
          <div className="border border-gray-200 rounded-xl p-8 bg-white text-center">
            <p className="text-[15px] font-semibold text-gray-900">
              Sign in to use the calendar
            </p>
            <p className="text-[13px] text-gray-500 italic mt-1">
              Inicia sessão para ver o teu calendário
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-[36px] px-5 bg-[#003399] text-white rounded-xl text-[13px] font-medium hover:bg-[#002266] transition-colors duration-200 mt-5"
            >
              Entrar
            </Link>
          </div>
        ) : (
          <>
            {monthEvents.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                This month:{" "}
                <span className="font-medium text-gray-700">{monthStats.lessons} lessons completed</span>
                {" · "}
                <span className="font-medium text-gray-700">{monthStats.exams} exams taken</span>
                {" · "}
                <span className="font-medium text-gray-700">{monthStats.planned} sessions planned</span>
              </p>
            )}

            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MONTHS[month - 1]} {year}
              </h2>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
              <div className="grid grid-cols-7 border-b border-gray-200">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-semibold text-gray-500 uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-gray-100">
                {grid.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-7">
                    {row.map((day, di) => {
                      const dateKey = day != null ? toDateKey(year, month, day) : null;
                      const events = dateKey ? eventsByDate[dateKey] ?? [] : [];
                      const isSelected = selectedDate === dateKey;
                      const todayCell = day != null && isToday(year, month, day);
                      return (
                        <button
                          key={di}
                          type="button"
                          onClick={() => dateKey && setSelectedDate(dateKey)}
                          disabled={!dateKey}
                          className={`min-h-[72px] p-2 text-left border-r border-gray-100 last:border-r-0 transition-colors ${
                            !dateKey
                              ? "bg-gray-50/50 text-gray-300 cursor-default"
                              : todayCell
                                ? "bg-[#003399]/5 text-[#003399] font-medium"
                                : isSelected
                                  ? "bg-gray-100 text-gray-900"
                                  : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {day != null ? day : ""}
                          {events.length > 0 && <EventDots events={events} />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {selectedDate ? (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {(() => {
                    const s = new Date(selectedDate);
                    const t = new Date();
                    if (s.getFullYear() === t.getFullYear() && s.getMonth() === t.getMonth() && s.getDate() === t.getDate())
                      return " (Today)";
                    return "";
                  })()}
                </h3>
                {dayEvents.length === 0 ? (
                  <div className="py-8 text-center border border-gray-200 rounded-xl bg-gray-50/50">
                    <p className="text-sm text-gray-500">Nothing here yet.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Complete a lesson to see it logged, or plan a study session.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {dayEvents.map((event) => {
                      const isAuto = event.event_type === "auto_lesson" || event.event_type === "auto_exam";
                      const borderColor =
                        event.event_type === "auto_lesson"
                          ? event.linked_passed
                            ? "#16A34A"
                            : "#F59E0B"
                          : event.event_type === "auto_exam"
                            ? event.linked_passed
                              ? "#003399"
                              : "#F59E0B"
                            : event.color ?? "#9CA3AF";
                      return (
                        <li
                          key={event.id}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#003399]/30 hover:shadow-sm transition-all duration-200 flex"
                          style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}
                        >
                          <div className="flex-1 min-w-0 p-4">
                            {isAuto ? (
                              <Link
                                href={event.linked_type === "lesson" ? `/lessons/${event.linked_id}` : `/exams/${event.linked_id}`}
                                className="block"
                              >
                                <p className="text-[15px] font-semibold text-gray-900">{event.title}</p>
                                {event.linked_score != null && (
                                  <span className="text-xs font-medium text-gray-600">
                                    {Math.round(event.linked_score)}% · {event.linked_passed ? "Passed" : "Not yet"}
                                  </span>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Auto-logged
                                  {event.created_at && (
                                    <> · {new Date(event.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</>
                                  )}
                                </p>
                              </Link>
                            ) : (
                              <>
                                <p className="text-[15px] font-semibold text-gray-900">{event.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Planned
                                  {event.all_day ? " · All day" : ` · ${formatTime(event.start_time)}–${formatTime(event.end_time)}`}
                                </p>
                                {event.description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                                )}
                              </>
                            )}
                          </div>
                          {!isAuto && (
                            <div className="flex items-center gap-1 p-2">
                              <button
                                type="button"
                                onClick={() => setEditingEvent(event)}
                                className="p-2 rounded-lg text-gray-500 hover:text-[#003399] hover:bg-gray-100"
                                aria-label="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              {confirmDelete?.id === event.id ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(event)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium"
                                >
                                  Confirm delete
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDelete(event)}
                                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                                  aria-label="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            ) : (
              <div className="py-12 text-center border border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-[15px] font-semibold text-gray-900">Your learning calendar</p>
                <p className="text-sm text-gray-500 mt-1">
                  Lesson completions are logged automatically. Plan study sessions to stay on track.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 h-10 px-4 bg-[#003399] hover:bg-[#002266] text-white rounded-lg text-sm font-medium"
                >
                  Plan your first session
                </button>
              </div>
            )}

            {createModalOpen && (
              <CreateEventModal
                initialDate={selectedDate ?? toDateKey(year, month, today.getDate())}
                onClose={() => setCreateModalOpen(false)}
                onSaved={() => {
                  loadMonth();
                  if (selectedDate) loadDay(selectedDate);
                }}
              />
            )}
            {editingEvent && (
              <EditEventModal
                event={editingEvent}
                onClose={() => setEditingEvent(null)}
                onSaved={() => {
                  setEditingEvent(null);
                  if (selectedDate) loadDay(selectedDate);
                  loadMonth();
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
