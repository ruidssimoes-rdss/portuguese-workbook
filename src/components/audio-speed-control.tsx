"use client";

import { useEffect, useState } from "react";
import { AUDIO_SPEEDS, getAudioSpeed, setAudioSpeed, subscribeAudioSpeed, type AudioSpeed } from "@/lib/audio/speed";

const SPEED_LABEL: Record<AudioSpeed, string> = { 0.75: "Lento", 0.85: "Normal", 1: "Rápido" };

/** Lento 0.75 / Normal 0.85 / Rápido 1.0. The voice stays the same; only the rate changes. */
export function AudioSpeedControl() {
  const [speed, setSpeed] = useState<AudioSpeed>(DEFAULT_SAFE);

  useEffect(() => {
    setSpeed(getAudioSpeed());
    return subscribeAudioSpeed(setSpeed);
  }, []);

  return (
    <div className="inline-flex items-center" title="Playback speed. Same voice, slower by default.">
      <div role="group" aria-label="Playback speed" className="inline-flex h-7 items-center rounded-lg bg-aula-sunken p-[3px]">
        {AUDIO_SPEEDS.map((value) => {
          const on = speed === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() => setAudioSpeed(value)}
              className={`h-[22px] rounded-md px-2 text-[12px] transition-colors ${
                on ? "bg-white font-medium text-aula-text shadow-[0_1px_2px_rgba(0,0,0,0.04)]" : "text-[#5A5A57] hover:text-aula-text"
              }`}
            >
              {SPEED_LABEL[value]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const DEFAULT_SAFE: AudioSpeed = 0.85;
