"use client";

import { useState, useCallback } from "react";

interface ExplanationState {
  loading: boolean;
  explanation: string | null;
  tip: string | null;
}

export function useExplanation() {
  const [state, setState] = useState<ExplanationState>({
    loading: false,
    explanation: null,
    tip: null,
  });

  const fetchExplanation = useCallback(async (params: {
    wrongAnswer: string;
    correctAnswer: string;
    exerciseType: string;
    context: string;
    studentLevel: string;
  }) => {
    setState({ loading: true, explanation: null, tip: null });

    try {
      const response = await fetch("/api/ai-v2/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Explanation request failed");

      const data = await response.json();
      setState({
        loading: false,
        explanation: data.explanation || null,
        tip: data.tip || null,
      });
    } catch {
      setState({ loading: false, explanation: null, tip: null });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, explanation: null, tip: null });
  }, []);

  return { ...state, fetchExplanation, reset };
}
