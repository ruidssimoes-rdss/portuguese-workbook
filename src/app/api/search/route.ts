import { NextResponse, type NextRequest } from "next/server";
import { search } from "@/lib/search";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 200);
  return NextResponse.json(search(q));
}
