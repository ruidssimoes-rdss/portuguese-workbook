"use client";

import { useState } from "react";
import Link from "next/link";
import { PronunciationButton } from "@/components/pronunciation-button";
import type { Greeting } from "@/data/greetings";

function normalizeForMatching(input: string): string {
  let s = input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // strip combining marks (accents)
    .replace(/[^\p{L}\p{N}\s]/gu, "") // remove punctuation, keep letters + numbers + spaces
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

function getFuzzyVariants(normalized: string): string[] {
  const variants = new Set<string>();
  variants.add(normalized);
  if (normalized.startsWith("eu ")) {
    variants.add(normalized.slice(3).trim());
  }
  const trailing = [
    " obrigado",
    " obrigada",
    " e tu",
    " e contigo",
  ];
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

export function HomeGreeting({ greeting }: { greeting: Greeting }) {
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "correction" | "unknown";
    display?: string;
    message?: string;
    correction?: string;
    explanation?: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  function handleSubmit() {
    const raw = userResponse.trim();
    if (!raw) return;

    const normalized = normalizeForMatching(raw);
    const variants = getFuzzyVariants(normalized);

    for (const acc of greeting.acceptedResponses) {
      if (normalized === acc.text) {
        setFeedback({ type: "success", display: acc.display, message: acc.feedback });
        return;
      }
      for (const v of variants) {
        if (v === acc.text) {
          setFeedback({ type: "success", display: acc.display, message: acc.feedback });
          return;
        }
      }
    }

    for (const mistake of greeting.commonMistakes) {
      if (normalized === mistake.text) {
        setFeedback({ type: "correction", correction: mistake.correction, explanation: mistake.explanation });
        return;
      }
      for (const v of variants) {
        if (v === mistake.text) {
          setFeedback({ type: "correction", correction: mistake.correction, explanation: mistake.explanation });
          return;
        }
      }
    }

    setFeedback({ type: "unknown" });
  }

  return (
    <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[30px] flex flex-col gap-5">
      {/* Row 1: PT + divider + EN + CEFR pill */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <PronunciationButton
              text={greeting.portuguese}
              variant="dark"
              className="shrink-0 mr-1"
            />
            <span className="text-[22px] font-bold text-[#262626] leading-[42px]">
              {greeting.portuguese}
            </span>
            <div className="hidden md:block w-px h-[34px] bg-[#9AA2AD] mx-5 shrink-0" />
            <span className="hidden md:inline text-[22px] font-normal text-[#A3AAB4] leading-[42px] truncate">
              {greeting.english}
            </span>
          </div>
          <p className="md:hidden text-[14px] text-[#A3AAB4] mt-1">{greeting.english}</p>
        </div>
        <span className="text-[11px] font-semibold text-[#3C5E95] bg-[#EBF2FA] px-2.5 py-[3px] rounded-full shrink-0 self-start md:self-center">
          {greeting.level}
        </span>
      </div>

      {/* Row 2: Pronunciation */}
      <span className="font-mono text-[12px] text-[#A3AAB4] leading-5">
        /{greeting.pronunciation}/
      </span>

      {/* Row 3: Input row */}
      {!feedback && (
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Your response in Portuguese:"
            className="w-full md:flex-1 min-w-0 h-[36px] px-3 rounded-[12px] border border-[#CFD3D9] bg-white text-[13px] text-[#262626] placeholder:text-[#CFD3D9] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="h-[36px] px-3 rounded-[12px] border border-[#CFD3D9] bg-[#F4F4F4] text-[13px] font-medium text-[#A2A6AE] hover:text-[#475569] hover:border-[#A2A6AE] transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              Need a hint?
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="h-[36px] px-5 rounded-[12px] bg-[#262626] border border-[#494949] text-[13px] font-medium text-white hover:bg-[#404040] transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Hint display */}
      {showHint && !feedback && (
        <p className="text-[13px] text-[#6B7280] italic">
          {greeting.hint}
        </p>
      )}

      {/* Learn about the structure — hidden when feedback shown */}
      {!feedback && (
        <Link
          href="/grammar"
          className="inline-flex items-center justify-center h-[36px] px-3 rounded-[12px] bg-[rgba(224,231,255,0.75)] border border-[rgba(79,70,229,0.75)] text-[13px] font-medium text-[rgba(79,70,229,0.75)] hover:bg-[rgba(224,231,255,1)] transition-colors duration-200 w-fit"
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
                : "bg-[#F3F4F6] border border-[#E5E7EB]"
          }`}
        >
          {feedback.type === "success" && (
            <>
              <span className="text-[14px] font-semibold text-emerald-700 block">
                {feedback.display}
              </span>
              <span className="text-[13px] text-emerald-600 mt-1 block">
                {feedback.message}
              </span>
            </>
          )}
          {feedback.type === "correction" && (
            <>
              <span className="text-[14px] font-semibold text-amber-700 block">
                {feedback.correction
                  ? `Almost! Try: ${feedback.correction}`
                  : "Almost!"}
              </span>
              <span className="text-[13px] text-amber-600 mt-1 block">
                {feedback.explanation}
              </span>
            </>
          )}
          {feedback.type === "unknown" && (
            <>
              <span className="text-[14px] font-medium text-[#374151] block">
                Hmm, I don&apos;t recognise that one.
              </span>
              <span className="text-[13px] text-[#6B7280] mt-1 block">
                That might be correct, but try a simpler response. Tap
                &quot;hint&quot; for ideas!
              </span>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setUserResponse("");
              setShowHint(false);
            }}
            className="text-[13px] text-[#3C5E95] font-medium mt-3 hover:text-[#2E4A75] transition-colors duration-200"
          >
            Try another response
          </button>
        </div>
      )}
    </div>
  );
}
