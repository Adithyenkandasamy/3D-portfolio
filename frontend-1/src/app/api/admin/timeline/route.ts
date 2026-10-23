import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAllDbTimelineEntries,
  saveDbTimelineEntry,
  deleteDbTimelineEntry,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await getAllDbTimelineEntries();
    return NextResponse.json({ ok: true, entries }, { status: 200 });
  } catch (err) {
    console.error("[Admin Timeline API] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch timeline entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entry = await req.json();
    if (!entry.id || !entry.title || !entry.institution) {
      return NextResponse.json({ ok: false, error: "Missing required timeline fields" }, { status: 400 });
    }

    const saved = await saveDbTimelineEntry(entry);
    if (!saved) {
      return NextResponse.json({ ok: false, error: "Failed to save timeline entry" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Timeline entry saved successfully" }, { status: 200 });
  } catch (err) {
    console.error("[Admin Timeline API] POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save timeline entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing timeline entry id" }, { status: 400 });
    }

    const deleted = await deleteDbTimelineEntry(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Failed to delete timeline entry" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Timeline entry deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("[Admin Timeline API] DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete timeline entry" }, { status: 500 });
  }
}
