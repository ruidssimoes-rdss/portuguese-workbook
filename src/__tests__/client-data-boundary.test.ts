/**
 * Build check: no file marked "use client" may import anything from src/data,
 * directly or transitively. The corpus (verbs.json alone is 4.3 MB) must stay
 * on the server. Type-only imports are ignored because they are erased.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "..");
const DATA_DIR = path.join(SRC, "data");
const EXTS = [".ts", ".tsx", ".js", ".jsx", ".json"];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

function isClientFile(source: string): boolean {
  // The directive must be the first statement; allow leading comments/whitespace
  const head = source.replace(/^(\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/))*/, "").slice(0, 40);
  return /^\s*["']use client["']/.test(head);
}

/** Runtime import specifiers in a file (type-only imports are skipped). */
function runtimeImports(source: string): string[] {
  const specs: string[] = [];
  const re =
    /(?:^|\n)\s*(import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|(?:^|\n)\s*import\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    if (m[5]) { specs.push(m[5]); continue; } // dynamic import()
    if (m[6]) { specs.push(m[6]); continue; } // side-effect import
    if (m[2]) continue; // `import type` / `export type`
    const clause = m[3] ?? "";
    // `import { type A, type B } from` is type-only when every specifier is typed
    const braces = clause.match(/\{([\s\S]*)\}/);
    if (braces && !/\*\s+as/.test(clause) && !/^[^{]*\w+\s*,\s*\{/.test(clause)) {
      const names = braces[1].split(",").map((n) => n.trim()).filter(Boolean);
      if (names.length > 0 && names.every((n) => n.startsWith("type "))) continue;
    }
    specs.push(m[4]);
  }
  return specs;
}

function resolveSpecifier(fromFile: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // package
  const candidates = [base, ...EXTS.map((e) => base + e), ...EXTS.map((e) => path.join(base, "index" + e))];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

const files = walk(SRC);
const importCache = new Map<string, string[]>();
function importsOf(file: string): string[] {
  if (!importCache.has(file)) {
    const src = file.endsWith(".json") ? "" : fs.readFileSync(file, "utf8");
    importCache.set(
      file,
      runtimeImports(src).map((s) => resolveSpecifier(file, s)).filter((f): f is string => !!f)
    );
  }
  return importCache.get(file)!;
}

/** Shortest import chain from `start` to a file under src/data, or null. */
function findDataChain(start: string): string[] | null {
  const queue: string[][] = [[start]];
  const seen = new Set<string>([start]);
  while (queue.length) {
    const chain = queue.shift()!;
    const file = chain[chain.length - 1];
    if (file.startsWith(DATA_DIR + path.sep)) return chain;
    for (const next of importsOf(file)) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push([...chain, next]);
    }
  }
  return null;
}

describe("client/data boundary", () => {
  const clientFiles = files.filter((f) => isClientFile(fs.readFileSync(f, "utf8")));

  it("finds client components to check", () => {
    expect(clientFiles.length).toBeGreaterThan(10);
  });

  it("no client component imports src/data, directly or transitively", () => {
    const violations = clientFiles
      .map((f) => ({ file: f, chain: findDataChain(f) }))
      .filter((v) => v.chain)
      .map((v) => v.chain!.map((p) => path.relative(SRC, p)).join("\n    → "));
    expect(violations, `\n${violations.join("\n\n")}\n`).toEqual([]);
  });
});
