"use client";

/**
 * Elísio in the rail (Figma: Ajudante · Rail, states Elísio and Elísio thread).
 * Answers come from Aula's chapters and library through the local matcher. Never live AI.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { ElisioAvatar } from "@/components/chapter/elisio-avatar";
import { AudioButton } from "@/components/primitives/audio-button";
import { getGrammar } from "@/lib/book/catalog";
import type { ElisioAbout } from "@/lib/book/types";
import { chapterLabel } from "@/lib/chapter-nav";
import { courseLesson } from "@/lib/elisio/index";
import { askElisio } from "@/lib/elisio/match";
import { suggestionsFor } from "@/lib/elisio/suggest";
import type { ElisioAnswer, ElisioContext, ElisioResult, ElisioTag } from "@/lib/elisio/types";
import { useElisio, type ElisioEntry } from "./elisio-provider";

const EYEBROW = "text-[11px] font-medium text-aula-text-3";
const CARD = "flex w-full flex-col gap-2 rounded-[10px] bg-aula-canvas p-3";

function aboutTitle(about: ElisioAbout): string {
  switch (about.about) {
    case "lesson":
      return courseLesson(about.id)?.titlePt ?? about.id;
    case "grammar":
      return getGrammar(about.id)?.title ?? about.id;
    case "verb":
      return about.id;
    case "word":
      return about.word;
  }
}

/** Below 1024 the rail is a sheet or a cover, so a link should close it. */
function useCloseOnNavigate(): () => void {
  const { closeElisio } = useElisio();
  return () => {
    if (window.matchMedia("(max-width: 1023px)").matches) closeElisio();
  };
}

function TagPill({ tag }: { tag: ElisioTag }) {
  const tone = tag.tone === "in" ? "bg-[#E1F2ED] text-[#1F7A68]" : "bg-aula-selected text-aula-text-2";
  return <span className={`inline-flex h-[18px] shrink-0 items-center rounded-[5px] px-2 text-[10px] font-medium whitespace-nowrap ${tone}`}>{tag.text}</span>;
}

function AbrirLink({ link }: { link: ElisioAnswer["link"] }) {
  const onNavigate = useCloseOnNavigate();
  return (
    <Link href={link.href} onClick={onNavigate} className="inline-flex h-7 w-fit items-center rounded-lg px-2 text-[12px] font-medium text-aula-text transition-colors hover:bg-aula-selected">
      {link.label}
    </Link>
  );
}

function Question({ text }: { text: string }) {
  return (
    <div className="flex w-full justify-end">
      <p className="max-w-[85%] rounded-[10px] bg-aula-selected px-3 py-2 text-[13px] text-aula-text [overflow-wrap:anywhere]">{text}</p>
    </div>
  );
}

function AnswerCard({ answer }: { answer: ElisioAnswer }) {
  return (
    <div className={CARD}>
      <div className="flex items-start gap-2">
        <ElisioAvatar size={20} />
        <p className="min-w-0 flex-1 text-[13px] font-semibold text-aula-text">{answer.title}</p>
        <TagPill tag={answer.tag} />
      </div>
      {answer.tag.note && <p className="text-[12px] text-aula-text-3">{answer.tag.note}</p>}
      {answer.explanation && <p className="text-[13px] leading-relaxed text-aula-text-2">{answer.explanation}</p>}
      {answer.example && (
        <div className="flex items-start gap-1.5">
          <AudioButton text={answer.example.pt} className="shrink-0" />
          <div className="min-w-0 pt-1">
            <p className="text-[13px] font-medium text-aula-accent" lang="pt-PT">
              {answer.example.pt}
            </p>
            {answer.example.en && <p className="text-[12px] text-aula-text-3">{answer.example.en}</p>}
          </div>
        </div>
      )}
      <AbrirLink link={answer.link} />
    </div>
  );
}

function NoMatch({ closest }: { closest: ElisioAnswer[] }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2">
        <ElisioAvatar size={20} />
        <p className={EYEBROW}>Elísio</p>
      </div>
      <p className="text-[13px] leading-relaxed text-aula-text-2">I don&apos;t have that yet. I only answer from what&apos;s in Aula&apos;s course and library.</p>
      {closest.length > 0 && (
        <>
          <p className={EYEBROW}>Closest</p>
          {closest.map((item) => (
            <div key={`${item.kind}:${item.id}`} className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="min-w-0 text-[13px] font-medium text-aula-text">{item.title}</p>
              <TagPill tag={item.tag} />
              <span className="flex-1" />
              <AbrirLink link={item.link} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function Reply({ entry, context }: { entry: ElisioEntry; context: ElisioContext }) {
  const result: ElisioResult = useMemo(() => askElisio(entry.question, { ...context, currentId: entry.currentId, about: undefined }), [entry, context]);
  return result.type === "answer" ? <AnswerCard answer={result.answer} /> : <NoMatch closest={result.closest} />;
}

export function ElisioRail() {
  const elisio = useElisio();
  const { context, thread } = elisio;
  const [value, setValue] = useState("");
  const scroller = useRef<HTMLDivElement | null>(null);
  const suggestions = useMemo(() => (context ? suggestionsFor(context) : []), [context]);
  const current = context ? courseLesson(context.currentId) : undefined;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, context]);

  const send = () => {
    if (value.trim().length < 2) return;
    elisio.ask(value);
    setValue("");
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <div className="flex shrink-0 items-center gap-2.5 px-4 pt-4 pb-3">
        <ElisioAvatar size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-aula-text">Elísio</p>
          <p className="truncate text-[12px] text-aula-text-3">From Aula&apos;s chapters and library · not live AI</p>
        </div>
        <button
          type="button"
          onClick={elisio.closeElisio}
          aria-label="Fechar"
          className="tablet-target-sq inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-aula-selected text-aula-text-2 transition-colors hover:bg-aula-border hover:text-aula-text"
        >
          <X size={16} strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <div ref={scroller} className="aula-pane flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 pb-4">
        {!context ? (
          <p className="text-[13px] text-aula-text-2">A preparar…</p>
        ) : thread.length === 0 ? (
          <div className="flex flex-col gap-2">
            <p className={EYEBROW}>Sugestões{current ? ` · ${chapterLabel(current)}` : ""}</p>
            {suggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => elisio.ask(q)}
                className="w-full rounded-lg border border-aula-line px-3 py-2 text-left text-[13px] text-aula-text transition-colors hover:bg-aula-sunken"
              >
                {q}
              </button>
            ))}
          </div>
        ) : (
          thread.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-3">
              <Question text={entry.question} />
              <Reply entry={entry} context={context} />
            </div>
          ))
        )}
      </div>

      <div className="h-px w-full shrink-0 bg-aula-line" />
      <div className="flex shrink-0 flex-col gap-2 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {context?.about && <p className="truncate text-[12px] text-aula-text-3">About: {aboutTitle(context.about)}</p>}
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, 300))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            maxLength={300}
            placeholder="Ask in English or Portuguese"
            aria-label="Pergunta ao Elísio"
            lang="pt-PT"
            autoComplete="off"
            className="tablet-target h-9 min-w-0 flex-1 rounded-lg border border-aula-border bg-white px-3 text-[13px] text-aula-text outline-none transition-colors placeholder:text-aula-text-3 focus:border-aula-accent"
          />
          <button
            type="button"
            onClick={send}
            disabled={value.trim().length < 2}
            aria-label="Perguntar"
            className="tablet-target inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-aula-accent px-3 text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={13} strokeWidth={1.5} aria-hidden />
            Perguntar
          </button>
        </div>
      </div>
    </div>
  );
}
