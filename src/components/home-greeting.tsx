"use client";

import { useState } from "react";
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
  // Portuguese-specific: ç → c is already handled by NFD (ç = c + combining cedilla)
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

    // Check accepted responses (exact or fuzzy)
    for (const acc of greeting.acceptedResponses) {
      if (normalized === acc.text) {
        setFeedback({
          type: "success",
          display: acc.display,
          message: acc.feedback,
        });
        return;
      }
      for (const v of variants) {
        if (v === acc.text) {
          setFeedback({
            type: "success",
            display: acc.display,
            message: acc.feedback,
          });
          return;
        }
      }
    }

    // Check common mistakes
    for (const mistake of greeting.commonMistakes) {
      if (normalized === mistake.text) {
        setFeedback({
          type: "correction",
          correction: mistake.correction,
          explanation: mistake.explanation,
        });
        return;
      }
      for (const v of variants) {
        if (v === mistake.text) {
          setFeedback({
            type: "correction",
            correction: mistake.correction,
            explanation: mistake.explanation,
          });
          return;
        }
      }
    }

    // Unknown
    setFeedback({ type: "unknown" });
  }

  return (
    <div className="mb-8">
      <div className="bg-white border border-[#E9E9E9] rounded-[16px] p-6 md:p-8">
        <span className="text-[11px] font-semibold text-[#3C5E95] bg-[#EBF2FA] px-2.5 py-[3px] rounded-full">
          {greeting.level}
        </span>
        <h2 className="text-[28px] md:text-[34px] font-bold text-[#111827] mt-4 leading-tight">
          {greeting.portuguese}
        </h2>
        <p className="text-[16px] text-[#9CA3AF] mt-1">{greeting.english}</p>
        <span className="font-mono text-[13px] text-[#9CA3AF] mt-1 block">
          /{greeting.pronunciation}/
        </span>
        <PronunciationButton
          text={greeting.portuguese}
          variant="dark"
          className="mt-3"
        />
        <div className="mt-6">
          <label className="text-[13px] text-[#6B7280] font-medium block mb-2">
            Your response in Portuguese:
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Type your answer..."
              className="flex-1 h-11 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[15px] text-[#111827] placeholder:text-[#C9CDD3] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 px-5 bg-[#262626] border border-[#262626] rounded-[12px] text-[14px] font-medium text-[#FAFAFA] shadow-[0_1px_2px_rgba(38,38,38,0.24),inset_0_1px_0_1px_rgba(255,255,255,0.16)] hover:bg-[#404040] transition-colors duration-200 whitespace-nowrap"
            >
              Reply
            </button>
          </div>
          {!feedback && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-[13px] text-[#3C5E95] font-medium mt-2 hover:text-[#2E4A75] transition-colors duration-200"
            >
              Need a hint?
            </button>
          )}
          {showHint && !feedback && (
            <p className="text-[13px] text-[#6B7280] mt-2 italic">
              {greeting.hint}
            </p>
          )}
        </div>
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-[12px] ${
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
    </div>
  );
}
