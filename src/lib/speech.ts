/** European Portuguese text-to-speech via the browser. Client-only. */

export function speakPortuguese(text: string, rate = 0.85): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return false;
  const syn = window.speechSynthesis;
  const voices = syn.getVoices();
  const voice = voices.find((v) => v.lang.startsWith("pt-PT")) ?? voices.find((v) => v.lang.startsWith("pt")) ?? null;
  syn.cancel();
  const u = new SpeechSynthesisUtterance(text.trim());
  u.lang = "pt-PT";
  u.rate = rate;
  if (voice) u.voice = voice;
  syn.speak(u);
  return true;
}
