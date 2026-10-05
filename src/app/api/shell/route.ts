import { NextResponse } from "next/server";
import { buildShellData, getLearner } from "@/lib/shell/learner";

export const dynamic = "force-dynamic";

export async function GET() {
  const learner = await getLearner();
  if (!learner) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json(buildShellData(learner), { headers: { "Cache-Control": "private, no-store" } });
}
