"use client";

/**
 * Chapter practice in the rail (Figma: Ajudante · Rail, states Practice start,
 * Practice and Practice results). Optional, harder than the test, never gates.
 * The session lives in localStorage (practice-store), so closing the rail,
 * opening a card or reloading keeps the place.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { Chip } from "@/components/learn/kit";
import { AudioButton } from "@/components/primitives/audio-button";
import { getChapterContent } from "@/data/chapters";
import { getCurriculumLesson } from "@/data/resolve-lessons";
import type { PracticeItemType } from "@/data/chapter-types";
import { clipExists, speakPt } from "@/lib/audio/speak";
import { loadCourseLessons, rememberPractice } from "@/lib/course-path";
import { checkPractice, normalizeAnswer, type Verdict } from "@/lib/practice-check";
import {
  chapterPool,
  MORE_LENGTH,
  planSession,
  PRACTICE_TYPES,
  resolveItem,
  reviewPool,
  SESSION_LENGTH,
  type PracticeItem,
} from "@/lib/practice";
import {
  clearSession,
  loadSession,
  markSeen,
  missedIds,
  recordAnswer,
  saveSession,
  seenIds,
  type PracticeAnswer,
  type PracticeSession,
} from "@/lib/practice-store";

const TEAL = "#1F7A68";
const CORAL = "#B94A32";
const ACCENTS = ["á", "à", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"];
const MAX_PLAYS = 2;

const EYEBROW = "text-[11px] font-medium text-aula-text-3";
const PRIMARY =
  "tablet-target inline-flex h-7 items-center justify-center rounded-lg bg-aula-accent px-3 text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:cursor-not-allowed disabled:opacity-40";
const SECONDARY =
  "tablet-target inline-flex h-7 items-center justify-center rounded-lg border border-aula-border bg-white px-3 text-[12px] font-medium text-aula-text transition-colors hover:bg-aula-sunken disabled:cursor-not-allowed disabled:opacity-40";
const GHOST =
  "tablet-target inline-flex h-7 items-center justify-center rounded-lg px-3 text-[12px] font-medium text-aula-text transition-colors hover:bg-aula-sunken disabled:cursor-not-allowed disabled:opacity-40";

const TYPE_LABEL: Record<PracticeItemType, string> = {
  escrever: "Escrever",
  ouvir: "Ouvir",
  construir: "Construir",
  traduzir: "Traduzir",
};

const INSTRUCTION: Record<PracticeItemType, string> = {
  escrever: "Escreve em português",
  ouvir: "Ouve e escreve",
  construir: "Constrói a frase",
  traduzir: "Responde em português",
};

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** "Are you well? (To a friend.)" becomes the prompt and a quiet sub line. */
function splitPrompt(prompt: string): { main: string; sub?: string } {
  const m = prompt.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  return m && m[1] ? { main: m[1], sub: m[2] } : { main: prompt };
}

function resolveIds(ids: string[]): PracticeItem[] {
  return ids.map(resolveItem).filter((item): item is PracticeItem => Boolean(item));
}

/** Ouvir only ever plays a pre-generated clip. Items without one are swapped for one that has it, or become Escrever. */
async function settleOuvir(set: PracticeItem[], sources: (item: PracticeItem) => PracticeItem[]): Promise<PracticeItem[]> {
  const out: (PracticeItem | null)[] = [...set];
  const ok = await Promise.all(set.map((item) => (item.type === "ouvir" ? clipExists(item.text ?? item.answer) : Promise.resolve(true))));
  const taken = () => new Set(out.filter((other): other is PracticeItem => Boolean(other)).map((other) => normalizeAnswer(other.answer)));
  for (let i = 0; i < set.length; i++) {
    if (ok[i]) continue;
    out[i] = null;
    const pool = sources(set[i]);
    let replacement: PracticeItem | null = null;
    for (const candidate of pool) {
      if (candidate.type !== "ouvir" || taken().has(normalizeAnswer(candidate.answer))) continue;
      if (await clipExists(candidate.text ?? candidate.answer)) {
        replacement = candidate;
        break;
      }
    }
    replacement ??= pool.find((candidate) => candidate.type === "escrever" && !taken().has(normalizeAnswer(candidate.answer))) ?? null;
    out[i] = replacement;
  }
  return out.filter((item): item is PracticeItem => Boolean(item));
}

function tileOrders(items: PracticeItem[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const item of items) if (item.type === "construir" && item.tiles) out[item.id] = shuffle(item.tiles);
  return out;
}

function typeCounts(items: PracticeItem[]): Record<PracticeItemType, number> {
  const counts: Record<PracticeItemType, number> = { escrever: 0, ouvir: 0, construir: 0, traduzir: 0 };
  for (const item of items) counts[item.type]++;
  return counts;
}

// ─── Small parts ───

/** Plays the item's pre-generated clip only. Never the browser voice. */
function ClipButton({ text }: { text: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setOn(true);
        speakPt(text, { clipOnly: true })
          .catch(() => {})
          .finally(() => setOn(false));
      }}
      aria-label={`Ouvir ${text}`}
      title="Ouvir"
      className={`tablet-target-sq inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-aula-text-3 transition-colors hover:bg-aula-sunken hover:text-aula-text-2 ${on ? "bg-aula-selected" : ""}`}
    >
      <Volume2 size={14} strokeWidth={1.5} aria-hidden />
    </button>
  );
}

function AnswerAudio({ item, text }: { item: PracticeItem; text: string }) {
  return item.type === "ouvir" ? <ClipButton text={text} /> : <AudioButton text={text} className="shrink-0" />;
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-[18px] items-center rounded-[5px] bg-aula-selected px-1.5 text-[10.5px] font-semibold text-aula-text-2">{children}</span>;
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12px]">
      <p className="shrink-0 text-aula-text-3">{label}</p>
      <p className="min-w-0 text-right font-medium text-aula-text">{value}</p>
    </div>
  );
}

function AccentKeys({ onKey, disabled }: { onKey: (char: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      {ACCENTS.map((char) => (
        <button
          key={char}
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onKey(char)}
          className="tablet-target-sq inline-flex h-7 w-7 items-center justify-center rounded-md border border-aula-border bg-white text-[12px] font-medium text-aula-text-2 transition-colors hover:bg-aula-sunken disabled:opacity-40"
        >
          {char}
        </button>
      ))}
    </div>
  );
}

// ─── Checked feedback ───

function Checked({ item, answer }: { item: PracticeItem; answer: PracticeAnswer }) {
  const shown = checkPractice(answer.given, item.answer, item.accept).matched;
  const title = answer.verdict === "correct" ? "Certo" : answer.verdict === "slip" ? "Quase · accents count" : "Não é bem isso";
  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: answer.verdict === "correct" ? TEAL : CORAL }}>
        {answer.verdict === "correct" && <Check size={14} strokeWidth={2} aria-hidden />}
        {title}
      </p>
      {answer.verdict !== "correct" && (
        <p className="text-[12px] text-aula-text-2">{answer.given.trim() ? `You wrote ${answer.given.trim()}` : "No answer"}</p>
      )}
      <div className="flex items-center gap-1.5">
        <AnswerAudio item={item} text={item.type === "ouvir" ? item.answer : shown} />
        <p className="min-w-0 text-[15px] font-medium" style={{ color: TEAL }}>
          {item.type === "ouvir" ? item.answer : shown}
        </p>
      </div>
      {item.type === "ouvir" && item.translation && <p className="text-[12px] text-aula-text-3">{item.translation}</p>}
      {answer.verdict !== "correct" && <p className="text-[12.5px] leading-relaxed text-aula-text-2">{item.why}</p>}
    </div>
  );
}

// ─── One item ───

function ItemCard({
  item,
  answer,
  value,
  onValue,
  placed,
  onPlace,
  onUnplace,
  tiles,
  plays,
  onPlay,
  onEnter,
  inputRef,
}: {
  item: PracticeItem;
  answer: PracticeAnswer | null;
  value: string;
  onValue: (value: string) => void;
  placed: number[];
  onPlace: (i: number) => void;
  onUnplace: (i: number) => void;
  tiles: string[];
  plays: number;
  onPlay: (slow: boolean) => void;
  onEnter: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const locked = Boolean(answer);
  const border = !answer ? "border-aula-border focus:border-aula-accent" : answer.verdict === "correct" ? "border-[#1F7A68]" : "border-[#B94A32]";

  const insert = (char: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onValue(value.slice(0, start) + char + value.slice(end));
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };

  const input = (
    <>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          }
        }}
        readOnly={locked}
        placeholder="Escreve aqui…"
        aria-label="A tua resposta"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        lang="pt-PT"
        className={`tablet-target h-9 w-full min-w-0 rounded-lg border bg-white px-3 text-[13px] text-aula-text outline-none transition-colors placeholder:text-aula-text-3 ${border}`}
      />
      {!locked && <AccentKeys onKey={insert} />}
    </>
  );

  const head = (
    <div className="flex items-center gap-2">
      <Tag>{TYPE_LABEL[item.type]}</Tag>
      <p className={EYEBROW}>{INSTRUCTION[item.type]}</p>
    </div>
  );

  let body: React.ReactNode;
  if (item.type === "escrever") {
    const { main, sub } = splitPrompt(item.prompt ?? "");
    body = (
      <>
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-semibold text-aula-text">{main}</p>
          {sub && <p className="text-[12px] text-aula-text-3">{sub}</p>}
        </div>
        {input}
      </>
    );
  } else if (item.type === "ouvir") {
    const left = Math.max(0, MAX_PLAYS - plays);
    body = (
      <>
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-semibold text-aula-text">Write exactly what you hear</p>
          <p className="text-[12px] text-aula-text-3">No text on screen · {MAX_PLAYS} plays</p>
        </div>
        {!locked && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={left === 0} onClick={() => onPlay(false)} className={`${SECONDARY} gap-1.5`}>
              <Volume2 size={14} strokeWidth={1.5} aria-hidden />
              Ouvir
            </button>
            <button type="button" disabled={left === 0} onClick={() => onPlay(true)} className={GHOST}>
              Mais devagar
            </button>
            <p className="text-[11px] text-aula-text-3">{left === 0 ? "No plays left" : left === 1 ? "1 play left" : `${left} plays left`}</p>
          </div>
        )}
        {input}
      </>
    );
  } else if (item.type === "construir") {
    const { main, sub } = splitPrompt(item.prompt ?? "");
    body = (
      <>
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-semibold text-aula-text">{main}</p>
          <p className="text-[12px] text-aula-text-3">{sub ? `${sub.replace(/\.$/, "")} · some tiles are traps` : "Some tiles are traps"}</p>
        </div>
        <div
          className={`flex min-h-[44px] w-full flex-wrap content-start items-start gap-1.5 rounded-lg border bg-white p-2 ${
            !answer ? "border-aula-border" : answer.verdict === "correct" ? "border-[#1F7A68]" : "border-[#B94A32]"
          }`}
        >
          {locked && placed.length === 0
            ? (answer?.given ?? "")
                .split(" ")
                .filter(Boolean)
                .map((word, at) => (
                  <Chip key={`${word}-${at}`} state="placed" disabled>
                    {word}
                  </Chip>
                ))
            : placed.map((tileIndex, at) => (
                <Chip key={`${tileIndex}-${at}`} state="placed" disabled={locked} onClick={() => onUnplace(at)}>
                  {tiles[tileIndex]}
                </Chip>
              ))}
        </div>
        {!locked && (
          <div className="flex w-full flex-wrap gap-1.5">
            {tiles.map((tile, i) => (
              <Chip key={`${tile}-${i}`} state={placed.includes(i) ? "used" : "available"} onClick={() => onPlace(i)}>
                {tile}
              </Chip>
            ))}
          </div>
        )}
      </>
    );
  } else {
    body = (
      <>
        <div className="flex flex-col gap-1 rounded-lg bg-white p-3">
          <div className="flex items-center gap-1.5">
            <AudioButton text={item.line ?? ""} className="shrink-0" />
            <p className="min-w-0 text-[15px] font-medium text-aula-text" lang="pt-PT">
              {item.line}
            </p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-aula-text-2">{item.context}</p>
        {input}
      </>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-[10px] bg-aula-canvas p-4">
      {head}
      {body}
      {answer && <Checked item={item} answer={answer} />}
    </div>
  );
}

// ─── Screens ───

/** Start with the stored session when one resolves, otherwise Start waiting on a fresh plan. */
function storedStart(lessonId: string): Phase {
  const stored = loadSession(lessonId);
  const items = stored ? resolveIds(stored.items) : [];
  if (!stored || items.length === 0) return { name: "start", items: [], stored: null, checking: true };
  const ids = new Set(items.map((item) => item.id));
  const session: PracticeSession = {
    ...stored,
    items: items.map((item) => item.id),
    answers: stored.answers.filter((answer) => ids.has(answer.id)),
    index: Math.min(stored.index, items.length - 1),
  };
  return { name: "start", items, stored: session, checking: false };
}

type Phase =
  | { name: "preparing" }
  | { name: "start"; items: PracticeItem[]; stored: PracticeSession | null; checking: boolean }
  | { name: "item"; items: PracticeItem[]; session: PracticeSession }
  | { name: "results"; items: PracticeItem[]; answers: PracticeAnswer[] };

export function ChapterPractice({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const lesson = useMemo(() => getCurriculumLesson(lessonId) ?? null, [lessonId]);
  // Mounted on the client only (after sign-in), so the stored session can seed the first render.
  const [phase, setPhase] = useState<Phase>(() => storedStart(lessonId));
  const [value, setValue] = useState("");
  const [placed, setPlaced] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const plan = useCallback(
    async (length: number): Promise<PracticeItem[]> => {
      if (!lesson) return [];
      const pool = chapterPool(lesson, getChapterContent(lesson.id));
      let review: PracticeItem[] = [];
      try {
        review = reviewPool(lesson, await loadCourseLessons());
      } catch {
        review = [];
      }
      const reviewLessons = [...new Set(review.map((item) => item.lessonId))];
      const missed = [...missedIds(lesson.id), ...reviewLessons.flatMap((id) => missedIds(id))];
      const set = planSession({ lesson, pool, review, missed, seen: seenIds(lesson.id), length });
      return settleOuvir(set, (item) => (item.lessonId === lesson.id ? pool : review.filter((other) => other.lessonId === item.lessonId)));
    },
    [lesson],
  );

  const freshStart = useCallback(() => {
    setPhase({ name: "start", items: [], stored: null, checking: true });
  }, []);

  // A fresh set is planned (and its Ouvir clips checked) whenever Start is waiting on one.
  const waiting = phase.name === "start" && phase.checking;
  useEffect(() => {
    if (!waiting) return;
    let cancelled = false;
    void plan(SESSION_LENGTH).then((items) => {
      if (!cancelled) setPhase({ name: "start", items, stored: null, checking: false });
    });
    return () => {
      cancelled = true;
    };
  }, [waiting, plan]);

  const begin = useCallback(
    (items: PracticeItem[], kind: "set" | "more") => {
      const session: PracticeSession = { items: items.map((item) => item.id), index: 0, answers: [], plays: 0, kind, tiles: tileOrders(items) };
      saveSession(lessonId, session);
      setValue("");
      setPlaced([]);
      setPhase({ name: "item", items, session });
    },
    [lessonId],
  );

  const resume = useCallback(
    (items: PracticeItem[], stored: PracticeSession) => {
      const tiles = { ...tileOrders(items.filter((item) => !stored.tiles?.[item.id])), ...(stored.tiles ?? {}) };
      const session = { ...stored, tiles };
      saveSession(lessonId, session);
      const current = items[session.index];
      const done = session.answers.find((answer) => answer.id === current?.id);
      setValue(done && current?.type !== "construir" ? done.given : "");
      setPlaced([]);
      setPhase({ name: "item", items, session });
    },
    [lessonId],
  );

  const finish = useCallback(
    (items: PracticeItem[], answers: PracticeAnswer[]) => {
      markSeen(lessonId, items.map((item) => item.id));
      clearSession(lessonId);
      rememberPractice(lessonId);
      try {
        void import("@/lib/streak-service").then(({ updateStreak }) => updateStreak()).catch(() => {});
      } catch {
        /* the result still shows */
      }
      setPhase({ name: "results", items, answers });
    },
    [lessonId],
  );

  const more = useCallback(() => {
    setPhase({ name: "preparing" });
    void plan(MORE_LENGTH).then((items) => {
      if (items.length === 0) freshStart();
      else begin(items, "more");
    });
  }, [plan, begin, freshStart]);

  // Item phase helpers
  const itemPhase = phase.name === "item" ? phase : null;
  const current = itemPhase ? itemPhase.items[itemPhase.session.index] : null;
  const currentAnswer = itemPhase && current ? (itemPhase.session.answers.find((answer) => answer.id === current.id) ?? null) : null;
  const tiles = current?.type === "construir" ? (itemPhase?.session.tiles?.[current.id] ?? current.tiles ?? []) : [];
  const given = current?.type === "construir" ? placed.map((i) => tiles[i]).join(" ") : value;
  const ready = current?.type === "construir" ? placed.length > 0 : value.trim().length > 0;

  const commit = useCallback(
    (text: string) => {
      if (!itemPhase || !current || currentAnswer) return;
      const verdict: Verdict = text.trim() ? checkPractice(text, current.answer, current.accept).verdict : "wrong";
      const answer = { id: current.id, given: text, verdict };
      const session = { ...itemPhase.session, answers: [...itemPhase.session.answers, answer] };
      saveSession(lessonId, session);
      recordAnswer(lessonId, current, text, verdict);
      setPhase({ ...itemPhase, session });
    },
    [itemPhase, current, currentAnswer, lessonId],
  );

  const next = useCallback(() => {
    if (!itemPhase) return;
    const index = itemPhase.session.index + 1;
    if (index >= itemPhase.items.length) {
      finish(itemPhase.items, itemPhase.session.answers);
      return;
    }
    const session = { ...itemPhase.session, index, plays: 0 };
    saveSession(lessonId, session);
    setValue("");
    setPlaced([]);
    setPhase({ ...itemPhase, session });
  }, [itemPhase, finish, lessonId]);

  const play = useCallback(
    (slow: boolean) => {
      if (!itemPhase || !current || current.type !== "ouvir") return;
      if (itemPhase.session.plays >= MAX_PLAYS) return;
      const session = { ...itemPhase.session, plays: itemPhase.session.plays + 1 };
      saveSession(lessonId, session);
      setPhase({ ...itemPhase, session });
      void speakPt(current.text ?? current.answer, { rate: slow ? 0.75 : undefined, clipOnly: true }).catch(() => {});
    },
    [itemPhase, current, lessonId],
  );

  const onEnter = useCallback(() => {
    if (currentAnswer) next();
    else if (ready) commit(given);
  }, [currentAnswer, next, ready, commit, given]);

  // Enter for Construir (no input) and after checking.
  useEffect(() => {
    if (!itemPhase) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "BUTTON" || target.tagName === "A")) return;
      e.preventDefault();
      onEnter();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [itemPhase, onEnter]);

  // Focus the input on each new item.
  const itemKey = current?.id;
  useEffect(() => {
    if (!itemKey || currentAnswer) return;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    return () => clearTimeout(t);
  }, [itemKey, currentAnswer]);

  if (!lesson) return <p className="px-4 text-[13px] text-aula-text-2">Esta prática é de uma lição.</p>;

  let content: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (phase.name === "preparing") {
    content = <p className="text-[13px] text-aula-text-2">A preparar…</p>;
  } else if (phase.name === "start") {
    const items = phase.stored ? resolveIds(phase.stored.items) : phase.items;
    const n = items.length;
    const reviewCount = items.filter((item) => item.lessonId !== lesson.id).length;
    const counts = typeCounts(items);
    const mix = PRACTICE_TYPES.filter((type) => counts[type] > 0)
      .map((type) => `${TYPE_LABEL[type]} ${counts[type]}`)
      .join(" · ");
    content = (
      <>
        <div className="flex w-full flex-col gap-1.5 rounded-[10px] bg-aula-accent-faint p-3">
          <p className={EYEBROW}>Prática</p>
          <p className="text-[18px] font-semibold text-aula-text">{lesson.titlePt}</p>
          <p className="text-[12px] text-aula-text-2">Optional. Harder than the test. Nothing here counts toward it.</p>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-[10px] bg-aula-canvas p-3">
          <p className={EYEBROW}>Nesta sessão</p>
          <FactRow label="Items" value={phase.checking ? "…" : `${n} items`} />
          <FactRow label="Time" value={phase.checking ? "…" : `about ${Math.ceil(n / 2)} min`} />
          <FactRow label="Review" value={phase.checking ? "…" : reviewCount > 0 ? `Review ${reviewCount}` : "No review yet"} />
          <FactRow label="Hints" value="No hints" />
          <FactRow label="Types" value={phase.checking ? "…" : mix} />
        </div>
        <p className="text-[12px] text-aula-text-3">Accents count: estás is not estas. You see the answer after you commit.</p>
      </>
    );
    footer = phase.stored ? (
      <>
        <button
          type="button"
          onClick={() => {
            clearSession(lessonId);
            freshStart();
          }}
          className={GHOST}
        >
          Começar de novo
        </button>
        <span className="flex-1" />
        <button type="button" onClick={() => resume(items, phase.stored as PracticeSession)} className={PRIMARY}>
          Retomar · {phase.stored.index + 1} of {n}
        </button>
      </>
    ) : (
      <>
        <span className="flex-1" />
        <button type="button" disabled={phase.checking || n === 0} onClick={() => begin(phase.items, "set")} className={PRIMARY}>
          {phase.checking ? "A preparar…" : "Começar"}
        </button>
      </>
    );
  } else if (phase.name === "item" && current) {
    const n = phase.items.length;
    const i = phase.session.index;
    const last = i === n - 1;
    content = (
      <>
        <div className="flex w-full flex-col gap-1.5">
          <p className="text-[12px] tabular-nums text-aula-text-3">
            {i + 1} of {n}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-aula-line">
            <div className="h-full rounded-full bg-aula-accent transition-[width]" style={{ width: `${Math.round(((i + (currentAnswer ? 1 : 0)) / n) * 100)}%` }} />
          </div>
        </div>
        <ItemCard
          key={current.id}
          item={current}
          answer={currentAnswer}
          value={value}
          onValue={setValue}
          placed={placed}
          onPlace={(tile) => setPlaced((cur) => (cur.includes(tile) ? cur : [...cur, tile]))}
          onUnplace={(at) => setPlaced((cur) => cur.filter((_, k) => k !== at))}
          tiles={tiles}
          plays={phase.session.plays}
          onPlay={play}
          onEnter={onEnter}
          inputRef={inputRef}
        />
      </>
    );
    footer = currentAnswer ? (
      <>
        <span className="flex-1" />
        <button type="button" onClick={next} className={PRIMARY}>
          {last ? "Ver resultado" : "Seguinte"}
        </button>
      </>
    ) : (
      <>
        <button type="button" onClick={() => commit("")} className={GHOST}>
          Não sei
        </button>
        <span className="flex-1" />
        <button type="button" disabled={!ready} onClick={() => commit(given)} className={PRIMARY}>
          Verificar
        </button>
      </>
    );
  } else if (phase.name === "results") {
    const n = phase.items.length;
    const byId = new Map(phase.answers.map((answer) => [answer.id, answer]));
    const correct = phase.answers.filter((answer) => answer.verdict === "correct").length;
    const slips = phase.answers.filter((answer) => answer.verdict === "slip").length;
    const wrong = n - correct - slips;
    const line = [slips > 0 ? `${slips} accent ${slips === 1 ? "slip" : "slips"}` : "", wrong > 0 ? `${wrong} wrong` : ""].filter(Boolean).join(" · ");
    const missed = phase.items.filter((item) => byId.get(item.id)?.verdict !== "correct");
    content = (
      <>
        <div className="flex w-full flex-col gap-1 rounded-[10px] bg-aula-accent-faint p-3">
          <p className={EYEBROW}>Resultado</p>
          <p className="text-[28px] font-semibold tabular-nums text-aula-text">
            {correct} of {n}
          </p>
          {line && <p className="text-[13px] text-aula-text-2">{line}</p>}
        </div>
        {missed.length > 0 ? (
          <div className="flex w-full flex-col rounded-[10px] bg-aula-canvas p-3">
            <p className={EYEBROW}>Missed</p>
            {missed.map((item) => {
              const answer = byId.get(item.id);
              const shown = item.type === "ouvir" ? item.answer : checkPractice(answer?.given ?? "", item.answer, item.accept).matched;
              const prompt = item.type === "ouvir" ? "Ouvir" : item.type === "traduzir" ? item.line : item.prompt;
              return (
                <div key={item.id} className="flex items-center gap-2.5 py-2">
                  <AnswerAudio item={item} text={shown} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-[12px] text-aula-text-2">{prompt}</p>
                    <p className="text-[13px] font-medium" style={{ color: TEAL }}>
                      {shown}
                    </p>
                    <p className="text-[12px] text-aula-text-3">{answer?.given.trim() ? `You wrote ${answer.given.trim()}` : "No answer"}</p>
                  </div>
                  <Link href={`/lessons/${item.lessonId}#section-${item.section}`} className="shrink-0 rounded-md px-1 text-[11px] tabular-nums text-aula-text-3 hover:bg-aula-sunken hover:text-aula-text-2">
                    §{item.section}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-aula-text-2">Nothing missed.</p>
        )}
        <p className="text-[12px] text-aula-text-3">Missed items come back first next time.</p>
      </>
    );
    footer = (
      <>
        <button type="button" onClick={onClose} className={SECONDARY}>
          Voltar ao capítulo
        </button>
        <span className="flex-1" />
        <button type="button" onClick={more} className={PRIMARY}>
          Mais 10
        </button>
      </>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div data-book-scroll className="aula-pane flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-3">
        {content}
      </div>
      {footer && <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 pb-4 pt-2">{footer}</div>}
    </div>
  );
}

