"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import { PronunciationButton } from "@/components/pronunciation-button";
import { cefrPillClass } from "@/lib/cefr";
import { lessons } from "@/data/lessons";
import type { LessonItem } from "@/data/lessons";
import {
  getLessonProgress,
  toggleLessonItem,
} from "@/lib/lesson-progress";

function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#111827] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[13px] font-medium text-[#9CA3AF] shrink-0">
        {completed}/{total}
      </span>
    </div>
  );
}

function LessonCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
        checked
          ? "border-[#111827] bg-[#111827]"
          : "border-[#D1D5DB] hover:border-[#9CA3AF]"
      }`}
      aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}

function VocabularyCard({
  item,
  checked,
  onToggle,
}: {
  item: LessonItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-xl p-5 transition-all duration-200 ${
        checked
          ? "border-[#E5E7EB] bg-[#FAFAFA]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <div className={`flex gap-4 ${checked ? "opacity-75" : ""}`}>
        <LessonCheckbox checked={checked} onToggle={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <PronunciationButton text={item.word ?? ""} size="sm" />
            <span className="text-[15px] font-semibold text-[#111827]">
              {item.word}
            </span>
          </div>
          {item.pronunciation && (
            <p className="text-[12px] font-mono text-[#9CA3AF] mt-1">
              {item.pronunciation}
            </p>
          )}
          <p className="text-[13px] text-[#6B7280] mt-1">{item.translation}</p>
          {item.example && (
            <div className="bg-[#F9FAFB] rounded-lg px-3 py-2 mt-2">
              <p className="text-[13px] italic text-[#374151]">
                &ldquo;{item.example.pt}&rdquo;
              </p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {item.example.en}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerbCard({
  item,
  checked,
  onToggle,
}: {
  item: LessonItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-xl p-5 transition-all duration-200 ${
        checked
          ? "border-[#E5E7EB] bg-[#FAFAFA]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <div className={`flex gap-4 ${checked ? "opacity-75" : ""}`}>
        <LessonCheckbox checked={checked} onToggle={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PronunciationButton text={item.verb ?? ""} size="sm" />
              <span className="text-[15px] font-semibold text-[#111827]">
                {item.verb}
              </span>
              <span className="text-[13px] text-[#6B7280]">
                — {item.verbTranslation}
              </span>
            </div>
            {item.tense && (
              <span className="text-[11px] font-semibold text-[#9CA3AF]">
                {item.tense}
              </span>
            )}
          </div>
          {item.conjugations && (
            <div className="space-y-0.5 mt-3">
              {item.conjugations.map((c) => (
                <div
                  key={c.pronoun}
                  className="flex items-baseline gap-3 text-[13px]"
                >
                  <span className="w-[64px] text-[#9CA3AF] shrink-0">
                    {c.pronoun}
                  </span>
                  <span className="font-medium text-[#111827]">{c.form}</span>
                </div>
              ))}
            </div>
          )}
          {item.verbSlug && (
            <Link
              href={`/conjugations/${item.verbSlug}`}
              className="inline-block text-[13px] font-medium text-[#3C5E95] hover:underline mt-3"
            >
              View all tenses →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function GrammarCard({
  item,
  checked,
  onToggle,
}: {
  item: LessonItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-xl p-5 transition-all duration-200 ${
        checked
          ? "border-[#E5E7EB] bg-[#FAFAFA]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <div className={`flex gap-4 ${checked ? "opacity-75" : ""}`}>
        <LessonCheckbox checked={checked} onToggle={onToggle} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#111827]">
            {item.rule}
          </p>
          {item.rulePt && (
            <p className="text-[13px] text-[#6B7280] italic mt-1">
              {item.rulePt}
            </p>
          )}
          {item.grammarExamples && item.grammarExamples.length > 0 && (
            <div className="space-y-1.5 mt-3">
              {item.grammarExamples.map((ex, i) => (
                <div key={i} className="flex items-start gap-2">
                  <PronunciationButton
                    text={ex.pt}
                    size="sm"
                    className="shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[13px] text-[#374151]">{ex.pt}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{ex.en}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {item.topicSlug && item.topicTitle && (
            <Link
              href={`/grammar/${item.topicSlug}`}
              className="inline-block text-[13px] font-medium text-[#3C5E95] hover:underline mt-3"
            >
              {item.topicTitle} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function CultureCard({
  item,
  checked,
  onToggle,
}: {
  item: LessonItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-xl p-5 transition-all duration-200 ${
        checked
          ? "border-[#E5E7EB] bg-[#FAFAFA]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <div className={`flex gap-4 ${checked ? "opacity-75" : ""}`}>
        <LessonCheckbox checked={checked} onToggle={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <PronunciationButton text={item.expression ?? ""} size="sm" />
            <p className="text-[15px] font-semibold text-[#111827] italic">
              &ldquo;{item.expression}&rdquo;
            </p>
          </div>
          <p className="text-[13px] text-[#6B7280] mt-2">{item.meaning}</p>
          {item.literal && (
            <p className="text-[12px] text-[#9CA3AF] mt-1">
              Literal: {item.literal}
            </p>
          )}
          {item.cultureTip && (
            <p className="text-[12px] text-[#9CA3AF] mt-1">
              {item.cultureTip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonContent({ id }: { id: string }) {
  const router = useRouter();
  const lesson = lessons.find((l) => l.id === id);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessonProgress(id).then((data) => {
      setProgress(data);
      setLoading(false);
    });
  }, [id]);

  if (!lesson) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[13px] text-[#9CA3AF]">Lesson not found.</p>
          <Link
            href="/lessons"
            className="text-[13px] font-medium text-[#3C5E95] hover:underline mt-2 inline-block"
          >
            Back to Lessons
          </Link>
        </main>
      </>
    );
  }

  const handleToggle = async (itemId: string) => {
    const newState = !progress[itemId];
    setProgress((prev) => ({ ...prev, [itemId]: newState }));
    const success = await toggleLessonItem(id, itemId, newState);
    if (!success) {
      setProgress((prev) => ({ ...prev, [itemId]: !newState }));
    }
  };

  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalItems = lesson.items.length;

  const vocabItems = lesson.items.filter((i) => i.type === "vocabulary");
  const verbItems = lesson.items.filter((i) => i.type === "verb");
  const grammarItems = lesson.items.filter((i) => i.type === "grammar");
  const cultureItems = lesson.items.filter((i) => i.type === "culture");

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="py-5">
          <Link
            href="/lessons"
            className="text-[13px] font-medium text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            ← Lessons
          </Link>
          <div className="flex items-start justify-between gap-3 mt-3">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">
                {lesson.title}
              </h1>
              <p className="text-[13px] text-[#6B7280] italic mt-0.5">
                {lesson.ptTitle}
              </p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">
                ~{lesson.estimatedMinutes} min · {totalItems} items
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0 ${cefrPillClass(lesson.cefr)}`}
            >
              {lesson.cefr}
            </span>
          </div>
          <div className="mt-4">
            <ProgressBar completed={completedCount} total={totalItems} />
          </div>
          <div className="border-t border-[#F3F4F6] mt-4 mb-6" />
        </div>

        {loading ? (
          <p className="text-[13px] text-[#9CA3AF] py-8">Loading...</p>
        ) : (
          <div className="pb-16 space-y-8">
            {vocabItems.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  Vocabulary
                </p>
                <div className="space-y-3">
                  {vocabItems.map((item) => (
                    <VocabularyCard
                      key={item.id}
                      item={item}
                      checked={!!progress[item.id]}
                      onToggle={() => handleToggle(item.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {verbItems.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  Verb
                </p>
                <div className="space-y-3">
                  {verbItems.map((item) => (
                    <VerbCard
                      key={item.id}
                      item={item}
                      checked={!!progress[item.id]}
                      onToggle={() => handleToggle(item.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {grammarItems.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  Grammar
                </p>
                <div className="space-y-3">
                  {grammarItems.map((item) => (
                    <GrammarCard
                      key={item.id}
                      item={item}
                      checked={!!progress[item.id]}
                      onToggle={() => handleToggle(item.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {cultureItems.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  Culture
                </p>
                <div className="space-y-3">
                  {cultureItems.map((item) => (
                    <CultureCard
                      key={item.id}
                      item={item}
                      checked={!!progress[item.id]}
                      onToggle={() => handleToggle(item.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <LessonContent id={id} />
    </ProtectedRoute>
  );
}
