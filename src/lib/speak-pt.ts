"use client";

import { useCallback, useEffect, useState } from "react";

const RATE = 0.85;

export function useSpeakPortuguese(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);

  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }, []);

  const selectVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = getVoices();
    const ptPT = voices.find((v) => v.lang.startsWith("pt-PT"));
    const pt = voices.find((v) => v.lang.startsWith("pt"));
    return ptPT ?? pt ?? null;
  }, [getVoices]);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
    const syn = window.speechSynthesis;
    syn.cancel();
    const voice = selectVoice();
    if (!voice) return;
    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = "pt-PT";
    u.rate = RATE;
    u.pitch = 1;
    u.voice = voice;
    u.onstart = () => setIsPlaying(true);
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    syn.speak(u);
  }, [text, selectVoice]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const syn = window.speechSynthesis;
    const onVoicesChanged = () => setVoicesReady(true);
    if (syn.getVoices().length > 0) setVoicesReady(true);
    syn.addEventListener("voiceschanged", onVoicesChanged);
    return () => {
      syn.removeEventListener("voiceschanged", onVoicesChanged);
      syn.cancel();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, isPlaying, voicesReady };
}
