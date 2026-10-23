import { NextResponse } from "next/server";
import { getDbTimelineEntries } from "@/lib/db";

export async function GET() {
  try {
    const entries = await getDbTimelineEntries();
    return NextResponse.json({ ok: true, entries }, { status: 200 });
  } catch (err) {
    console.error("[Timeline API] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch timeline entries" }, { status: 500 });
  }
}
