/**
 * European Portuguese playback. Client-only.
 *
 * Plays the pre-generated Piper clip from Supabase Storage (see scripts/tts/).
 * Falls back to the browser's speechSynthesis — pt-PT voices only, never pt-BR —
 * when there is no clip (AI-generated text, new content) or playback fails.
 *
 * The key spec must match scripts/tts/key.mjs exactly.
 */

export const VOICE_ID = "piper-pt_PT-tugao-medium";

const AUDIO_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/${VOICE_ID}`;
const CACHE_LIMIT = 50;
const FALLBACK_RATE = 0.95;
/** Tiny silent WAV, played synchronously inside the click to unlock the element on iOS Safari. */
const SILENCE = "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA==";

export function normalize(text: string): string {
  return text.normalize("NFC").trim().replace(/\s+/g, " ");
}

export async function clipKey(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${VOICE_ID}|${normalize(text)}`);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

const keys = new Map<string, string>();
const clips = new Map<string, HTMLAudioElement>();
const failed = new Set<string>();
let current: HTMLAudioElement | null = null;
let speechPrimed = false;
let generation = 0;

function stopAll() {
  if (current) {
    current.pause();
    current.currentTime = 0;
    current = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

function remember(key: string, audio: HTMLAudioElement) {
  clips.delete(key);
  clips.set(key, audio);
  if (clips.size > CACHE_LIMIT) clips.delete(clips.keys().next().value as string);
}

/** Resolves when the clip ends; rejects if it can't load or play. */
function playClip(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = (fn: () => void) => () => {
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onEnd);
      fn();
    };
    const onEnd = done(resolve);
    const onError = done(() => reject(new Error("clip failed")));
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    current = audio;
    audio.play().then(() => audio.addEventListener("pause", onEnd), onError);
  });
}

function waitForVoices(syn: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const voices = syn.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);
  return new Promise((resolve) => {
    const finish = () => {
      syn.removeEventListener("voiceschanged", finish);
      clearTimeout(timer);
      resolve(syn.getVoices());
    };
    const timer = setTimeout(finish, 1000);
    syn.addEventListener("voiceschanged", finish);
  });
}

async function speakFallback(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) throw new Error("speech unavailable");
  const syn = window.speechSynthesis;
  const voices = (await waitForVoices(syn)).filter((v) => v.lang.replace("_", "-") === "pt-PT");
  const voice = voices.find((v) => /enhanced|premium/i.test(v.name)) ?? voices[0] ?? null;
  syn.cancel();
  const u = new SpeechSynthesisUtterance(normalize(text));
  u.lang = "pt-PT";
  u.rate = FALLBACK_RATE;
  if (voice) u.voice = voice;
  await new Promise<void>((resolve, reject) => {
    u.onend = () => resolve();
    u.onerror = (e) => (e.error === "interrupted" || e.error === "canceled" ? resolve() : reject(new Error(e.error)));
    syn.speak(u);
  });
}

/**
 * Speak European Portuguese text. Call from a click handler.
 * Resolves when playback finishes (or is interrupted by another call); rejects only if nothing could play.
 */
export async function speakPt(text: string): Promise<void> {
  if (typeof window === "undefined" || !text.trim()) return;
  stopAll();
  const gen = ++generation;

  // Everything before the first await runs inside the user gesture (Safari autoplay rules).
  if (!speechPrimed && window.speechSynthesis) {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    speechPrimed = true;
  }
  const knownKey = keys.get(text);
  let audio = knownKey ? clips.get(knownKey) : undefined;
  if (!audio && !(knownKey && failed.has(knownKey))) {
    audio = new Audio(SILENCE);
    audio.play().catch(() => {});
  }

  const key = knownKey ?? (await clipKey(text));
  keys.set(text, key);
  if (gen !== generation) return; // superseded by another call

  if (audio && !failed.has(key)) {
    if (!clips.has(key)) {
      audio.pause();
      audio.src = `${AUDIO_BASE}/${key}.mp3`;
    } else {
      audio.currentTime = 0;
    }
    try {
      await playClip(audio);
      remember(key, audio);
      return;
    } catch {
      if (gen !== generation) return;
      failed.add(key);
      clips.delete(key);
      current = null;
    }
  }

  if (gen === generation) await speakFallback(text);
}
