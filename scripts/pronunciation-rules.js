/**
 * The European Portuguese respelling rules shared by
 * scripts/retune-pronunciation.js (vocab.json) and
 * scripts/retune-pronunciation-extra.js (verbs, sayings, regional, false friends).
 *
 * The respelling marks the stressed syllable in capitals. Rules only touch
 * UNSTRESSED syllables (no capital letter), per word and per whole syllable,
 * so applying them twice changes nothing:
 *
 *   A. unstressed «a» is reduced: ...ah -> ...uh, also before a coda
 *      r/sh/s/z/d/b/p/t/k (falar -> fuh-LAHR, casa -> KAH-zuh). Not before l:
 *      in EP «a» stays open there (almoço, alguém, talvez). Nasals (ahn, ahm,
 *      ahng) are left alone. A lone «ah» word is the article «a» (-> uh)
 *      unless the Portuguese word is «à» / «às».
 *   B. unstressed «e» before a consonant or at the start of a word: ...eh /
 *      ...ehr -> ...uh / ...uhr (pequeno -> puh-KAY-noo). Final syllables
 *      (-vehl) are left alone.
 *   C. unstressed «o» after a consonant: ...oh -> ...oo (noventa -> noo-VEN-tuh).
 *   D. final plural/verb -s after a reduced vowel: ...uhs -> ...uhsh.
 *   O. a word-initial unstressed «oh» is «oo» (olá -> oo-LAH, obrigado ->
 *      oo-bree-GAH-doo). A capitalised OH (ouro, olho) is stressed and stays.
 *   H. an initial «h» spelling is Brazilian for «r»: HAH-too -> RRAH-too,
 *      hreh- -> rruh-.
 *   R. a word-initial «r» is rolled, written «rr» (renda -> RREN-duh).
 *   E. a final stressed bare «ER» is «EHR», the standard symbol (fazer -> fuh-ZEHR).
 *
 * A word of two or more syllables with no capital has no marked stress and is
 * skipped. An override (Portuguese entry -> exact pronunciation) is applied
 * last for the words the rules get wrong.
 */
"use strict";

const stressed = (syl) => /[A-Z]/.test(syl);

// Onsets may contain y (lyah, yah).
const RE_A = /^([^aeiou]*)ah(sh|r|s|z|d|b|p|t|k)?$/;
const RE_B = /^([^aeiou]*)eh(r)?$/;
const RE_C = /^([^aeiou]+)oh$/;

const stripPunct = (w) => w.replace(/^[«"'(]+|[.,;:!?)»"'…]+$/g, "");

function createRetuner(overrides = {}) {
  const stats = { A: 0, B: 0, C: 0, D: 0, O: 0, H: 0, R: 0, E: 0, override: 0 };
  const noStress = new Set();

  function fixHeads(syl) {
    return syl.map((s) => {
      if (/^h(?=[aeiou])/.test(s)) return s.replace(/^h/, "rr");
      if (/^hr/.test(s)) return s.replace(/^hr/, "rr");
      if (/^H(?=[A-Z])/.test(s)) return s.replace(/^H/, "RR");
      return s;
    });
  }

  /** Word-initial single r (or R) before a vowel is the rolled r: rr / RR. */
  function fixInitialR(syl) {
    const first = syl[0];
    let fixed = first;
    if (/^r(?=[aeiou])/.test(first)) fixed = "rr" + first.slice(1);
    else if (/^R(?=[AEIOU])/.test(first)) fixed = "RR" + first.slice(1);
    if (fixed === first) return syl;
    stats.R++;
    return [fixed, ...syl.slice(1)];
  }

  function retuneWord(word, orthWord, entry) {
    const tail = word.match(/[?!,.;:…]+$/)?.[0] ?? "";
    const core = tail ? word.slice(0, -tail.length) : word;
    let syl = fixInitialR(core.split("-"));
    if (syl.length === 1 && syl[0] !== core) return syl[0] + tail;

    if (syl.length === 1) {
      if (core === "ah" && orthWord && orthWord.toLowerCase() === "a") {
        stats.A++;
        return "uh" + tail;
      }
      return word;
    }
    if (!syl.some(stressed)) {
      noStress.add(`${entry}  →  ${word}`);
      return word;
    }

    const headFixed = fixHeads(syl);
    if (headFixed.join("-") !== syl.join("-")) stats.H++;
    syl = headFixed;

    const last = syl.length - 1;
    const out = syl.map((s, i) => {
      if (stressed(s)) return s;
      if (i === 0 && s === "oh") {
        stats.O++;
        return "oo";
      }
      let m = s.match(RE_A);
      if (m) {
        stats.A++;
        return `${m[1]}uh${m[2] ?? ""}`;
      }
      if (i < last && (m = s.match(RE_B))) {
        stats.B++;
        return `${m[1]}uh${m[2] ?? ""}`;
      }
      if (i < last && (m = s.match(RE_C))) {
        stats.C++;
        return `${m[1]}oo`;
      }
      return s;
    });

    if (/^[^AEIOU]*ER$/.test(out[last])) {
      out[last] = out[last].replace(/ER$/, "EHR");
      stats.E++;
    }
    const lastSyl = out[last];
    if (!stressed(lastSyl) && /uhs$/.test(lastSyl) && !/sh$/.test(lastSyl)) {
      out[last] = lastSyl.replace(/uhs$/, "uhsh");
      stats.D++;
    }
    return out.join("-") + tail;
  }

  function retune(portuguese, pronunciation) {
    if (Object.hasOwn(overrides, portuguese)) {
      if (overrides[portuguese] !== pronunciation) stats.override++;
      return overrides[portuguese];
    }
    const orthParts = portuguese.split(" / ");
    return pronunciation
      .split(" / ")
      .map((part, pi) => {
        const orthWords = (orthParts[pi] ?? "").split(" ").map(stripPunct);
        const words = part.split(" ");
        const aligned = orthWords.length === words.length;
        return words.map((w, wi) => retuneWord(w, aligned ? orthWords[wi] : null, portuguese)).join(" ");
      })
      .join(" / ");
  }

  return { retune, stats, noStress };
}

/**
 * Detects the Brazilian-leaning or off-style values the brief forbids.
 * `portuguese` (the entry's spelling) lets the open-final-ee check tell a real
 * final -e (Brazilian «tchee») from a diphthong off-glide (pai -> PAH-ee) or a
 * final -i (táxi -> TAK-see), so it is optional.
 */
function brazilianHits(pron, portuguese = null) {
  const hits = [];
  if (/tch|dj/i.test(pron)) hits.push("tch/dj");
  if (/(^|[\s\/-])[hH][A-Za-z]/.test(pron)) hits.push("initial h");
  if (portuguese) {
    const orthParts = portuguese.split(" / ");
    pron.split(" / ").forEach((part, pi) => {
      const orthWords = (orthParts[pi] ?? "").split(" ").map((w) => w.replace(/[^\p{L}-]/gu, "").toLowerCase());
      const words = part.split(" ");
      if (orthWords.length !== words.length) return;
      words.forEach((word, wi) => {
        const syl = word.replace(/[?!,.;:]+$/, "").split("-");
        const last = syl[syl.length - 1];
        if (syl.length > 1 && /^[^aeiou]+ee$/.test(last) && /e$/.test(orthWords[wi])) hits.push(`open final -ee in ${word}`);
      });
    });
  }
  return hits;
}

module.exports = { createRetuner, brazilianHits, stressed };
