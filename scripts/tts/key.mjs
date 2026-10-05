// Clip key spec — must match src/lib/audio/speak.ts exactly.
import { createHash } from "node:crypto";

export const VOICE_ID = "piper-pt_PT-tugao-medium";

export function normalize(text) {
  return text.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function clipKey(text) {
  return createHash("sha1").update(`${VOICE_ID}|${normalize(text)}`).digest("hex").slice(0, 16);
}
