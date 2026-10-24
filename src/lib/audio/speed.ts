/**
 * Playback speed for the existing pt-PT clips and the browser voice fallback.
 * Stored on this device. When someone is signed in, the same value is mirrored
 * into user_settings.pronunciation_speed (column already exists).
 */

export const AUDIO_SPEEDS = [0.75, 0.85, 1] as const;
export type AudioSpeed = (typeof AUDIO_SPEEDS)[number];

export const DEFAULT_AUDIO_SPEED: AudioSpeed = 0.85;

const KEY = "aula-pt-audio-speed";
export const AUDIO_SPEED_EVENT = "aula-audio-speed";

export function snapAudioSpeed(value: number): AudioSpeed {
  let best: AudioSpeed = DEFAULT_AUDIO_SPEED;
  let dist = Infinity;
  for (const speed of AUDIO_SPEEDS) {
    const d = Math.abs(speed - value);
    if (d < dist) {
      dist = d;
      best = speed;
    }
  }
  return best;
}

export function hasLocalAudioSpeed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) != null;
  } catch {
    return false;
  }
}

export function getAudioSpeed(): AudioSpeed {
  if (typeof window === "undefined") return DEFAULT_AUDIO_SPEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw == null) return DEFAULT_AUDIO_SPEED;
    const n = Number(raw);
    if (!Number.isFinite(n)) return DEFAULT_AUDIO_SPEED;
    return snapAudioSpeed(n);
  } catch {
    return DEFAULT_AUDIO_SPEED;
  }
}

export function setAudioSpeed(value: number, options?: { mirror?: boolean }) {
  const speed = snapAudioSpeed(value);
  if (typeof window === "undefined") return speed;
  try {
    localStorage.setItem(KEY, String(speed));
  } catch {
    /* playback still uses the in-memory default on the next read */
  }
  window.dispatchEvent(new CustomEvent(AUDIO_SPEED_EVENT, { detail: speed }));
  if (options?.mirror !== false) void mirrorAudioSpeed(speed);
  return speed;
}

export function subscribeAudioSpeed(listener: (speed: AudioSpeed) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<number>).detail;
    listener(snapAudioSpeed(typeof detail === "number" ? detail : getAudioSpeed()));
  };
  window.addEventListener(AUDIO_SPEED_EVENT, onEvent);
  return () => window.removeEventListener(AUDIO_SPEED_EVENT, onEvent);
}

async function mirrorAudioSpeed(speed: AudioSpeed) {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("user_settings")
        .update({ pronunciation_speed: speed, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      return;
    }
    await supabase.from("user_settings").insert({
      user_id: user.id,
      pronunciation_speed: speed,
      show_phonetics: true,
      daily_goal: 10,
      show_translations: true,
    });
  } catch {
    /* This browser still has the speed. */
  }
}
