"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { language = "pt-PT", continuous = false, onResult, onError } = options;

  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: false,
    isListening: false,
    transcript: "",
    confidence: 0,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState((prev) => ({ ...prev, isSupported: !!SR }));

    if (!SR) return;

    const recognition = new SR();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      setState((prev) => ({ ...prev, transcript, confidence, isListening: false }));
      onResult?.(transcript, confidence);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg =
        event.error === "no-speech"
          ? "No speech detected. Try again."
          : event.error === "not-allowed"
            ? "Microphone access denied. Please allow microphone access."
            : `Speech recognition error: ${event.error}`;

      setState((prev) => ({ ...prev, error: errorMsg, isListening: false }));
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [language, continuous]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setState((prev) => ({ ...prev, isListening: true, transcript: "", error: null, confidence: 0 }));
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: "", error: null, confidence: 0 }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    reset,
  };
}
