"use client";

import { useState } from "react";
import Link from "next/link";
import { PronunciationButton } from "@/components/pronunciation-button";
import type { DailyPrompt } from "@/data/daily-prompts";
import { validateResponse } from "@/lib/validate-response";
import { promptKeywords } from "@/data/prompt-keywords";

function getFuzzyVariants(normalized: string): string[] {
  const variants = new Set<string>();
  variants.add(normalized);
  if (normalized.startsWith("eu ")) {
    variants.add(normalized.slice(3).trim());
  }
  const trailing = [" obrigado", " obrigada", " e tu", " e contigo"];
  for (const t of trailing) {
    if (normalized.endsWith(t)) {
      variants.add(normalized.slice(0, -t.length).trim());
    }
  }
  if (normalized.startsWith("eu ")) {
    const withoutEu = normalized.slice(3).trim();
    for (const t of trailing) {
      if (withoutEu.endsWith(t)) {
        variants.add(withoutEu.slice(0, -t.length).trim());
      }
    }
  }
  return Array.from(variants);
}

export function HomeGreeting({ greeting }: { greeting: DailyPrompt }) {
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "correction" | "partial" | "unknown";
    display?: string;
    message?: string;
    correction?: string;
    explanation?: string;
    examples?: string[];
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  function handleSubmit() {
    const raw = userResponse.trim();
    if (!raw) return;

    const config = promptKeywords[greeting.id] || {
      sets: [],
      minMatches: 1,
      minWords: 2,
    };

    const result = validateResponse(
      raw,
      greeting.acceptedResponses,
      greeting.commonMistakes,
      config,
      getFuzzyVariants
    );

    switch (result.type) {
      case "exact":
        setFeedback({
          type: "success",
          display: result.display,
          message: result.feedback,
        });
        break;
      case "keyword":
        setFeedback({
          type: "success",
          display: result.display,
          message: result.feedback,
        });
        break;
      case "mistake":
        setFeedback({
          type: "correction",
          correction: result.correction,
          explanation: result.explanation,
        });
        break;
      case "partial":
        setFeedback({
          type: "partial",
          message: result.feedback,
          examples: result.examples,
        });
        break;
      case "unknown":
        setFeedback({
          type: "unknown",
          message: result.feedback,
          examples: result.examples,
        });
        break;
    }
  }

  return (
    <div className="bg-bg border border-border rounded-[12px] p-[30px] flex flex-col gap-5">
      {/* Row 1: PT + divider + EN + CEFR pill */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <PronunciationButton
              text={greeting.portuguese}
              variant="dark"
              className="shrink-0 mr-1"
            />
            <span className="text-2xl font-semibold text-text leading-[42px]">
              {greeting.portuguese}
            </span>
            <div className="hidden md:block w-px h-[34px] bg-border mx-5 shrink-0" />
            <span className="hidden md:inline text-2xl font-normal text-text-muted leading-[42px] truncate">
              {greeting.english}
            </span>
          </div>
          <p className="md:hidden text-[13px] text-text-muted mt-1">{greeting.english}</p>
        </div>
        <span className="text-[11px] font-semibold text-text bg-surface px-2.5 py-[3px] rounded-full shrink-0 self-start md:self-center">
          {greeting.level}
        </span>
      </div>

      {/* Row 2: Pronunciation */}
      <span className="font-mono text-[12px] text-text-muted leading-5">
        /{greeting.pronunciation}/
      </span>

      {/* Row 3: Input row */}
      {!feedback && (
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Your response in Portuguese:"
            className="w-full md:flex-1 min-w-0 h-[36px] px-3 rounded-[12px] border border-border bg-bg text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors duration-200"
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="h-[36px] px-3 rounded-[12px] border border-border bg-surface text-[13px] font-medium text-text-muted hover:text-text-secondary hover:border-border transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              Need a hint?
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="h-[36px] px-5 rounded-[12px] bg-[#003399] border border-[#003399] text-[13px] font-medium text-white hover:bg-[#002277] transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Hint display */}
      {showHint && !feedback && (
        <p className="text-[13px] text-text-secondary italic">
          {greeting.hint}
        </p>
      )}

      {/* Learn about the structure — hidden when feedback shown */}
      {!feedback && greeting.grammarLink && (
        <Link
          href={`/grammar/${greeting.grammarLink}`}
          className="inline-flex items-center justify-center h-[36px] px-3 rounded-[12px] bg-accent-light border border-accent-border text-[13px] font-medium text-[#003399] hover:text-[#002277] transition-colors duration-200 w-fit"
        >
          Learn about the structure
        </Link>
      )}

      {/* Feedback display */}
      {feedback && (
        <div
          className={`p-4 rounded-[12px] ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-100"
              : feedback.type === "correction"
                ? "bg-amber-50 border border-amber-100"
                : "bg-surface border border-border"
          }`}
        >
          {feedback.type === "success" && (
            <>
              {feedback.display && (
                <span className="text-[13px] font-semibold text-emerald-700 block">
                  {feedback.display}
                </span>
              )}
              <span className="text-[13px] text-emerald-600 mt-1 block">
                {feedback.message}
              </span>
            </>
          )}
          {feedback.type === "correction" && (
            <>
              <span className="text-[13px] font-semibold text-amber-700 block">
                {feedback.correction
                  ? `Almost! Try: ${feedback.correction}`
                  : "Almost!"}
              </span>
              <span className="text-[13px] text-amber-600 mt-1 block">
                {feedback.explanation}
              </span>
            </>
          )}
          {(feedback.type === "partial" || feedback.type === "unknown") && (
            <>
              <span className="text-[13px] font-medium text-text block">
                {feedback.message}
              </span>
              {feedback.examples && feedback.examples.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {feedback.examples.map((ex, i) => (
                    <li key={i} className="text-[13px] text-text-secondary">
                      • {ex}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setUserResponse("");
              setShowHint(false);
            }}
            className="text-[13px] text-text font-medium mt-3 hover:text-text-secondary transition-colors duration-200"
          >
            Try another response
          </button>
        </div>
      )}
    </div>
  );
}
