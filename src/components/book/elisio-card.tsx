"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { composeNote, passageFor, type ElisioPassage } from "@/lib/book/elisio";
import { encodeCard, encodePractice, FICHA_PARAM, PRATICAR_PARAM, type ElisioAbout } from "@/lib/book/types";
import { useBook } from "./book-context";

const FALLBACK = "Preparada sem modelo, a partir deste texto.";

function useLoginHref(): string {
  const book = useBook();
  const pathname = usePathname();
  const params = useSearchParams();
  const next = new URLSearchParams(params.toString());
  if (book.current) next.set(FICHA_PARAM, encodeCard(book.current));
  else next.delete(FICHA_PARAM);
  if (book.practice) next.set(PRATICAR_PARAM, encodePractice(book.practice));
  else next.delete(PRATICAR_PARAM);
  const query = next.toString();
  const path = query ? `${pathname}?${query}` : pathname;
  return `/auth/login?next=${encodeURIComponent(path)}`;
}

function SignInPrompt() {
  const href = useLoginHref();
  return (
    <div className="pt-2">
      <h2 className="font-sans text-[22px] font-semibold tracking-[-0.02em] text-aula-text">Entra para perguntar</h2>
      <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-[#5A5A57]">
        O capítulo continua aberto. Entra para perguntar ao Elísio.
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
      >
        Entrar
      </Link>
    </div>
  );
}

function preview(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 320) return clean;
  return `${clean.slice(0, 319).replace(/\s+\S*$/, "").trim()}…`;
}

function Note({ about, passage }: { about: ElisioAbout; passage: ElisioPassage }) {
  const first = passage.questions[0];
  const [question, setQuestion] = useState(first);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState(() => composeNote(passage, first));
  const [caption, setCaption] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const suggested = passage.questions.some((item) => item === question);
  const aboutKey = encodeCard({ kind: "elisio", about });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ai-v2/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about, question }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("ask failed");
        return res.json() as Promise<{ note?: string; source?: string }>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data.source === "claude" || data.source === "ollama") {
          if (data.note) setNote(data.note);
          setCaption(null);
        } else {
          if (data.note) setNote(data.note);
          setCaption(FALLBACK);
        }
        setPending(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (controller.signal.aborted) return;
        setCaption(FALLBACK);
        setPending(false);
      });
    return () => controller.abort();
  }, [about, aboutKey, question]);

  function ask(next: string) {
    const q = next.trim();
    if (q.length < 2 || q === question) return;
    setQuestion(q);
    setNote(composeNote(passage, q));
    setCaption(null);
    setPending(true);
    setDraft("");
  }

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aula-accent text-[13px] font-semibold text-white">
          E
        </span>
        <div className="min-w-0">
          <h2 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.02em] text-aula-text">Professor Elísio</h2>
          <p className="truncate text-[12px] text-[#5A5A57]">
            {passage.place} · {passage.label}
          </p>
        </div>
      </div>

      <blockquote className="mt-4 max-h-32 overflow-y-auto rounded-[10px] border border-aula-line bg-aula-sunken px-3 py-2.5 text-[13px] leading-relaxed text-aula-text">
        {preview(passage.text)}
      </blockquote>

      <div className="mt-4 flex flex-col items-start gap-1">
        {passage.questions.map((item) => {
          const on = item === question;
          return (
            <button
              key={item}
              type="button"
              onClick={() => ask(item)}
              className={`text-left text-[13px] leading-snug ${on ? "font-medium text-aula-accent" : "text-[#5A5A57] hover:text-aula-text"}`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {!suggested && <p className="mt-3 text-[13px] font-medium leading-snug text-aula-text">{question}</p>}

      <div className="mt-3 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint px-3 py-2.5">
        <p className="text-[13px] leading-relaxed text-aula-text">{note}</p>
      </div>
      {pending ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[#5A5A57]">A ler este passo…</p>
      ) : caption ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[#5A5A57]">{caption}</p>
      ) : null}

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <label htmlFor="elisio-question" className="text-[12px] text-[#5A5A57]">
          Outra pergunta
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="elisio-question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={400}
            lang="pt-PT"
            autoComplete="off"
            placeholder="Sobre este passo"
            className="h-9 min-w-0 flex-1 rounded-lg border border-aula-border bg-white px-3 text-[13px] text-aula-text outline-none placeholder:text-[#5A5A57] focus:border-aula-accent"
          />
          <button
            type="submit"
            disabled={draft.trim().length < 2}
            className="inline-flex h-9 shrink-0 items-center rounded-lg bg-aula-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:opacity-40"
          >
            Perguntar
          </button>
        </div>
      </form>
    </div>
  );
}

/** Elísio in the dock. Fechar closes this card and returns to the one under it. */
export function ElisioCard({ about }: { about: ElisioAbout }) {
  const { user, loading } = useAuth();
  const passage = passageFor(about);
  if (loading) return <p className="pt-2 text-[13px] text-[#5A5A57]">A preparar…</p>;
  if (!user) return <SignInPrompt />;
  if (!passage) return <p className="pt-2 text-[13px] text-[#5A5A57]">Não encontrei este passo.</p>;
  return <Note key={encodeCard({ kind: "elisio", about })} about={about} passage={passage} />;
}
