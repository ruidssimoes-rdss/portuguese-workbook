"use client";

import { useEffect } from "react";

interface FeedbackOverlayProps {
  type: "correct" | "correct-accent" | "wrong";
  correctAnswer?: string;
  accentHint?: string;
  onDismiss: () => void;
}

export function FeedbackOverlay({
  type,
  correctAnswer,
  accentHint,
  onDismiss,
}: FeedbackOverlayProps) {
  useEffect(() => {
    const delay =
      type === "correct" ? 1500 : type === "correct-accent" ? 2000 : 2500;
    const timer = setTimeout(onDismiss, delay);
    return () => clearTimeout(timer);
  }, [type, onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-auto"
    >
      <div
        className={`w-full max-w-lg rounded-[12px] px-6 py-4 shadow-lg ${
          type === "wrong"
            ? "bg-[#DC2626] text-white"
            : "bg-[#059669] text-white"
        }`}
      >
        {type === "correct" && (
          <p className="text-[16px] font-semibold text-center">Correto!</p>
        )}
        {type === "correct-accent" && (
          <div className="text-center">
            <p className="text-[16px] font-semibold">Correto!</p>
            {accentHint && (
              <p className="text-[13px] mt-1 opacity-90">
                Atenção ao acento: {accentHint}
              </p>
            )}
          </div>
        )}
        {type === "wrong" && (
          <div className="text-center">
            <p className="text-[16px] font-semibold">Não é bem</p>
            {correctAnswer && (
              <p className="text-[13px] mt-1 opacity-90">
                A resposta correta é: {correctAnswer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
