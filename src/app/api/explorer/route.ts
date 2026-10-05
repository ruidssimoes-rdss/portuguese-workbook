import { NextResponse, type NextRequest } from "next/server";
import { getCategory, getCultureSections, getGrammarTopics, getVerbs } from "@/lib/library";
import { getLearner, wordRow, wordState } from "@/lib/shell/learner";
import type { ExplorerRow } from "@/lib/shell/types";

export const dynamic = "force-dynamic";

/** Children of one explorer folder. Vocabulary rows carry the learner's state. */
export async function GET(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder") ?? "";

  let rows: ExplorerRow[] | null = null;
  if (folder.startsWith("vocab:")) {
    const category = getCategory(folder.slice("vocab:".length));
    if (category) {
      const learner = await getLearner();
      const now = new Date();
      rows = category.words.map((w) => wordRow(w, wordState(learner, w, now)));
    }
  } else if (folder === "grammar") {
    rows = getGrammarTopics().map((t) => ({ id: t.href, label: t.label, href: t.href }));
  } else if (folder === "verbs") {
    rows = getVerbs().map((v) => ({ id: v.href, label: v.label, href: v.href }));
  } else if (folder === "culture") {
    rows = getCultureSections().map((c) => ({ id: c.href, label: c.label, href: c.href, count: c.count }));
  }

  if (!rows) return NextResponse.json({ error: "Unknown folder" }, { status: 404 });
  return NextResponse.json(rows, { headers: { "Cache-Control": "private, no-store" } });
}
