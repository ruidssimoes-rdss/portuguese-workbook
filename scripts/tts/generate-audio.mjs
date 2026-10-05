#!/usr/bin/env node
/**
 * Pre-generates pt-PT audio for every Portuguese string in src/data with Piper,
 * then uploads the MP3s to the public Supabase Storage bucket `audio`.
 *
 *   npm run audio:generate                 # incremental: only missing clips
 *   npm run audio:generate -- --force "NIF" # regenerate + overwrite clips whose text contains this
 *
 * Dev-only. Needs scripts/tts/.venv (piper-tts), scripts/tts/voices/, ffmpeg.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, rmSync, renameSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { VOICE_ID, clipKey, normalize } from "./key.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const DATA = path.join(ROOT, "src/data");
const OUT = path.join(HERE, "out");
const SAMPLES = path.join(HERE, "samples");
const PYTHON = path.join(HERE, ".venv/bin/python");
const MODEL = path.join(HERE, "voices/pt_PT-tugao-medium.onnx");
const BUCKET = "audio";
const LENGTH_SCALE = 1.1;
const SENTENCE_SILENCE = 0.2;

const args = process.argv.slice(2);
const forceIdx = args.indexOf("--force");
const forceText = forceIdx >= 0 ? args[forceIdx + 1] : null;

/* ─── Env ─── */

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

/* ─── Collect strings ─── */

const readJson = (name) => JSON.parse(readFileSync(path.join(DATA, name), "utf8"));

function collect() {
  /** @type {Record<string, string[]>} */
  const sources = {};
  const add = (source, text) => {
    if (typeof text !== "string") return;
    const t = normalize(text);
    if (!/\p{L}/u.test(t)) return;
    (sources[source] ??= []).push(t);
  };

  for (const cat of readJson("vocab.json").categories) {
    for (const w of cat.words) {
      add("vocab.portuguese", w.portuguese);
      add("vocab.example", w.example);
    }
  }

  for (const [key, v] of Object.entries(readJson("verbs.json").verbs)) {
    add("verbs.infinitive", key.toLowerCase()); // verb-learn speaks the lowercase slug
    for (const c of v.conjugations ?? []) {
      add("verbs.Conjugation", c.Conjugation);
      add("verbs.Example Sentence", c["Example Sentence"]);
    }
  }

  for (const t of Object.values(readJson("grammar.json").topics)) {
    for (const r of t.rules ?? []) for (const ex of r.examples ?? []) add("grammar.rules.examples.pt", ex.pt);
    for (const q of t.questions ?? []) add("grammar.questions.exampleSentence", q.exampleSentence);
  }

  for (const s of readJson("sayings.json").sayings) {
    add("sayings.portuguese", s.portuguese);
    add("sayings.example", s.example);
  }
  for (const r of readJson("regional.json").expressions) {
    add("regional.expression", r.expression);
    add("regional.example", r.example);
  }
  for (const f of readJson("false-friends.json").falseFriends) {
    add("false-friends.portuguese", f.portuguese);
    add("false-friends.example", f.example);
  }
  for (const e of readJson("etiquette.json").tips) add("etiquette.titlePt", e.titlePt);

  // exams.ts is TypeScript with path aliases; pull the spoken fields out as string literals.
  const exams = readFileSync(path.join(DATA, "exams.ts"), "utf8");
  for (const [, field, raw] of exams.matchAll(/\b(audioText|prompt):\s*("(?:[^"\\]|\\.)*")/g)) {
    add(`exams.${field}`, JSON.parse(raw));
  }

  for (const k of Object.keys(sources)) sources[k] = [...new Set(sources[k])];
  return sources;
}

/* ─── Overrides (change what Piper hears, never the key) ─── */

const overrides = JSON.parse(readFileSync(path.join(HERE, "pronunciation-overrides.json"), "utf8"));
const overrideRes = Object.entries(overrides).map(([from, to]) => [
  new RegExp(`(?<![\\p{L}\\p{N}])${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "gu"),
  to,
]);
const spoken = (text) => overrideRes.reduce((t, [re, to]) => t.replace(re, to), text);

/* ─── Processes ─── */

function run(cmd, argv, { input } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-500)}`)),
    );
    p.stdin.end(input ?? "");
  });
}

async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

/** One Piper process for the whole batch: JSON lines in, WAVs out. */
async function synthesize(jobs) {
  if (jobs.length === 0) return;
  const input = jobs.map((j) => JSON.stringify({ text: j.speak, out: j.wav })).join("\n") + "\n";
  await run(PYTHON, [path.join(HERE, "piper_batch.py"), MODEL, String(LENGTH_SCALE), String(SENTENCE_SILENCE)], { input });
}

const TRIM = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05";
async function toMp3(wav, mp3) {
  await run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", wav,
    "-af", `${TRIM},areverse,${TRIM},areverse,loudnorm=I=-16:TP=-1.5:LRA=11,adelay=150:all=1,apad=pad_dur=0.15`,
    "-ac", "1", "-ar", "22050", "-codec:a", "libmp3lame", "-b:a", "48k", "-f", "mp3", `${mp3}.part`,
  ]);
  renameSync(`${mp3}.part`, mp3); // atomic: an interrupted run never leaves a truncated clip
  rmSync(wav);
}

async function inspect(mp3) {
  const { stderr } = await run("ffmpeg", ["-hide_banner", "-i", mp3, "-af", "volumedetect", "-f", "null", "-"]);
  const d = stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const v = stderr.match(/mean_volume: (-?[\d.]+) dB/);
  const duration = d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : NaN;
  const meanVolume = v ? +v[1] : -Infinity;
  return { duration, meanVolume };
}

/* ─── Storage ─── */

async function listUploaded(supabase) {
  const keys = new Set();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(BUCKET).list(VOICE_ID, { limit: 1000, offset });
    if (error) throw new Error(`list failed: ${error.message}`);
    for (const o of data) if (o.name.endsWith(".mp3")) keys.add(o.name.slice(0, -4));
    if (data.length < 1000) return keys;
  }
}

async function ensureBucket(supabase) {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true, allowedMimeTypes: ["audio/mpeg"] });
  if (error) throw new Error(`createBucket failed: ${error.message}`);
  console.log(`Created public bucket "${BUCKET}"`);
}

/* ─── Samples ─── */

const SAMPLE_TEXTS = (sources) => [
  ...sources["vocab.portuguese"].slice(0, 5).map((t) => ["vocab", t]),
  ...sources["vocab.example"].slice(0, 5).map((t) => ["example", t]),
  ...["eu fiz", "nós pusemos", "tu fazes", "eles disseram", "ela trouxe"].map((t) => ["conjugation", t]),
  ...[
    "Preciso do meu NIF para abrir a conta.",
    "Pode dar-me o seu IBAN, por favor?",
    "Vou aos CTT enviar esta carta.",
    "Tenho de entregar o IRS até junho.",
    "Procuramos um T1 ou um T2 em Lisboa.",
  ].map((t) => ["override", t]),
];

async function writeSamples(sources) {
  mkdirSync(SAMPLES, { recursive: true });
  const items = SAMPLE_TEXTS(sources).map(([kind, text], i) => {
    const slug = text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    const base = path.join(SAMPLES, `${String(i + 1).padStart(2, "0")}-${kind}-${slug}`);
    return { speak: spoken(text), wav: `${base}.wav`, mp3: `${base}.mp3` };
  });
  await synthesize(items);
  await pool(items, cpus().length, (it) => toMp3(it.wav, it.mp3));
  return items.length;
}

/* ─── Main ─── */

async function main() {
  loadEnv();
  mkdirSync(OUT, { recursive: true });
  for (const f of [PYTHON, MODEL]) if (!existsSync(f)) throw new Error(`Missing ${path.relative(ROOT, f)} — see scripts/tts setup`);

  const sources = collect();
  const all = [...new Set(Object.values(sources).flat())];
  const byKey = new Map(all.map((t) => [clipKey(t), t]));
  if (byKey.size !== all.length) throw new Error("Key collision — widen the key");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = serviceKey && url ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;

  let uploaded = new Set();
  if (supabase) {
    await ensureBucket(supabase);
    uploaded = await listUploaded(supabase);
  }

  const forced = new Set(
    forceText ? [...byKey].filter(([, t]) => t.includes(forceText)).map(([k]) => k) : [],
  );
  const local = new Set(readdirSync(OUT).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4)));

  // 1. Generate everything not already uploaded or on disk.
  const todo = [...byKey]
    .filter(([k]) => forced.has(k) || (!uploaded.has(k) && !local.has(k)))
    .map(([key, text]) => ({ key, speak: spoken(text), wav: path.join(OUT, `${key}.wav`), mp3: path.join(OUT, `${key}.mp3`) }));

  console.log(`${byKey.size} unique strings, ${todo.length} to generate (voice ${VOICE_ID})`);
  const BATCH = 200;
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    await synthesize(batch);
    await pool(batch, cpus().length, (j) => toMp3(j.wav, j.mp3));
    process.stdout.write(`\r  generated ${Math.min(i + BATCH, todo.length)}/${todo.length}`);
  }
  if (todo.length) process.stdout.write("\n");

  // 2. QA every clip on disk that belongs to the current corpus.
  const onDisk = [...byKey.keys()].filter((k) => existsSync(path.join(OUT, `${k}.mp3`)));
  const failures = [];
  await pool(onDisk, cpus().length, async (k) => {
    const { duration, meanVolume } = await inspect(path.join(OUT, `${k}.mp3`));
    if (!(duration >= 0.3 && duration <= 20) || !(meanVolume > -45)) {
      failures.push(`${k}  ${duration.toFixed(2)}s  ${meanVolume} dB  «${byKey.get(k)}»`);
    }
  });

  // 3. Upload what the bucket doesn't have yet (and forced overwrites).
  let uploadedCount = 0;
  let uploadedBytes = 0;
  if (supabase) {
    const toUpload = onDisk.filter((k) => forced.has(k) || !uploaded.has(k));
    await pool(toUpload, 8, async (k) => {
      const file = path.join(OUT, `${k}.mp3`);
      const body = readFileSync(file);
      const { error } = await supabase.storage.from(BUCKET).upload(`${VOICE_ID}/${k}.mp3`, body, {
        contentType: "audio/mpeg",
        cacheControl: "31536000",
        upsert: forced.has(k),
      });
      if (error) throw new Error(`upload ${k} failed: ${error.message}`);
      uploadedCount++;
      uploadedBytes += body.length;
    });
  }

  const sampleCount = await writeSamples(sources);

  // 4. Totals.
  console.log("\nStrings per source:");
  for (const [s, list] of Object.entries(sources)) console.log(`  ${s.padEnd(36)} ${list.length}`);
  const diskBytes = onDisk.reduce((n, k) => n + statSync(path.join(OUT, `${k}.mp3`)).size, 0);
  console.log(`\nUnique strings:   ${byKey.size}`);
  console.log(`Clips generated:  ${todo.length}`);
  console.log(`Clips skipped:    ${byKey.size - todo.length}`);
  console.log(`Local clips:      ${onDisk.length} (${(diskBytes / 1e6).toFixed(1)} MB)`);
  console.log(
    supabase
      ? `Uploaded:         ${uploadedCount} (${(uploadedBytes / 1e6).toFixed(1)} MB)`
      : "Uploaded:         skipped — SUPABASE_SERVICE_ROLE_KEY not set in .env.local",
  );
  console.log(`Samples:          ${sampleCount} in ${path.relative(ROOT, SAMPLES)}/`);
  if (failures.length) {
    console.log(`\nQA failures (${failures.length}) — duration outside 0.3–20s or mean_volume ≤ -45 dB:`);
    for (const f of failures) console.log(`  ${f}`);
    process.exitCode = 1;
  } else {
    console.log("QA:               all clips 0.3–20s, mean_volume > -45 dB");
  }
  writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(Object.fromEntries(byKey), null, 0));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
