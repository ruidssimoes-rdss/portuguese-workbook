import { describe, expect, it } from "vitest";
import { VOICE_ID as APP_VOICE_ID, clipKey as browserKey } from "@/lib/audio/speak";
import { VOICE_ID as SCRIPT_VOICE_ID, clipKey as nodeKey } from "../../../../scripts/tts/key.mjs";

const SAMPLES = ["Olá", "o comprovativo de morada", "Quando chegares, liga-me.", "eu fiz", "Há três anos que vivo aqui."];

describe("clip key parity (scripts/tts/key.mjs ↔ src/lib/audio/speak.ts)", () => {
  it("uses the same voice id", () => {
    expect(APP_VOICE_ID).toBe(SCRIPT_VOICE_ID);
  });

  it.each(SAMPLES)("«%s» hashes identically", async (text) => {
    const key = await browserKey(text);
    expect(key).toMatch(/^[0-9a-f]{16}$/);
    expect(key).toBe(nodeKey(text));
  });

  it("normalises NFC and whitespace the same way", async () => {
    const messy = "  Há três   anos ".replace("á", "á");
    expect(await browserKey(messy)).toBe(nodeKey(messy));
    expect(await browserKey(messy)).toBe(await browserKey("Há três anos"));
  });
});
