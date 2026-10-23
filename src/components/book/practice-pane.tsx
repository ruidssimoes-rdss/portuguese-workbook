"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LearnPlayer } from "@/components/learn/learn-player";
import type { Lesson } from "@/data/curriculum-types";
import type { GeneratedLesson } from "@/lib/exercise-generator";
import type { SectionResult } from "@/lib/exercise-types";
import { cardDrill, practiceLabel, type CardDrill } from "@/lib/book/practice";
import { createClient } from "@/lib/supabase/client";
import { updateItemMastery } from "@/lib/learning-engine/mastery-tracker";
import { encodeCard, encodePractice, FICHA_PARAM, PRATICAR_PARAM, type PracticeTarget } from "@/lib/book/types";
import { useBook } from "./book-context";

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
    <div>
      <h2 className="font-sans text-[22px] font-semibold tracking-[-0.02em] text-aula-text">Entra para praticar</h2>
      <p className="mt-heading max-w-[36ch] text-[13px] leading-relaxed text-[#5A5A57]">
        O capítulo continua aberto. A prática fica guardada na tua conta.
      </p>
      <Link
        href={href}
        className="tablet-target mt-card inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
      >
        Entrar
      </Link>
    </div>
  );
}

async function saveDrill(drill: CardDrill, results: SectionResult[]) {
  if (!drill.mastery || !drill.cefr) return;
  const total = results.reduce((sum, result) => sum + result.totalQuestions, 0);
  const correct = results.reduce((sum, result) => sum + result.totalCorrect, 0);
  if (total === 0) return;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await updateItemMastery(
      user.id,
      drill.mastery.contentType,
      drill.mastery.contentId,
      drill.cefr,
      correct / total >= 0.8,
      drill.mastery.contentCategory,
    );
  } catch {
    // The result still shows when the account cannot be reached.
  }
}

function CardSession({ target }: { target: Exclude<PracticeTarget, { kind: "lesson" }> }) {
  const book = useBook();
  const drill = useMemo(() => cardDrill(target), [target]);
  if (!drill) {
    return <p className="text-[13px] text-[#5A5A57]">Não há exercícios para isto.</p>;
  }
  const total = drill.sections.reduce((sum, section) => sum + section.totalQuestions, 0);
  const generated: GeneratedLesson = {
    learnItems: [],
    sections: drill.sections,
    totalPoints: total,
    passPoints: Math.ceil(total * 0.8),
  };
  const lesson: Lesson = {
    id: "card-practice",
    title: drill.title,
    ptTitle: drill.title,
    description: "",
    cefr: drill.cefr ?? "A1",
    estimatedMinutes: 2,
    order: 1,
    stages: [],
  };
  return (
    <LearnPlayer
      dock
      lesson={lesson}
      generated={generated}
      isReview={false}
      initial={{ state: "sections", currentSection: 0, sectionResults: [], learnIndex: 0 }}
      onDismiss={book.closePractice}
      onComplete={(results) => {
        void saveDrill(drill, results);
      }}
    />
  );
}

function PracticeBody({
  target,
  renderLesson,
}: {
  target: PracticeTarget;
  renderLesson?: (args: { onDismiss: () => void }) => React.ReactNode;
}) {
  const book = useBook();
  const { user, loading } = useAuth();
  if (loading) return <p className="text-[13px] text-[#5A5A57]">A preparar…</p>;
  if (!user) return <SignInPrompt />;
  if (target.kind === "lesson") {
    if (!renderLesson) {
      return <p className="text-[13px] text-[#5A5A57]">Esta prática é de uma lição.</p>;
    }
    return <>{renderLesson({ onDismiss: book.closePractice })}</>;
  }
  return <CardSession key={encodePractice(target)} target={target} />;
}

/** Exercise flow in the dock. Fechar returns to the card or the mastery panel. */
export function PracticePane({
  lessonTitle,
  renderLesson,
}: {
  lessonTitle?: string;
  renderLesson?: (args: { onDismiss: () => void }) => React.ReactNode;
}) {
  const book = useBook();
  const target = book.practice;
  if (!target) return null;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-item px-pad text-[12px] min-[744px]:max-[1439px]:h-12">
        <span className="text-[#5A5A57]">Prática</span>
        <span className="text-[#B5B5AE]">/</span>
        <span className="min-w-0 truncate font-medium text-aula-text">{practiceLabel(target, lessonTitle)}</span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={book.closePractice}
          className="tablet-target inline-flex h-7 items-center rounded-md px-2 text-[12px] font-medium text-[#5A5A57] hover:bg-aula-sunken hover:text-aula-text"
        >
          Fechar
        </button>
      </div>
      <div data-book-scroll className="aula-pane min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-pad pb-pad pt-heading">
        <PracticeBody target={target} renderLesson={renderLesson} />
      </div>
    </div>
  );
}
