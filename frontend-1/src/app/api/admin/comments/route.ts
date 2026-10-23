import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAllDbComments,
  updateCommentStatus,
  deleteVisitorComment,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as "pending" | "approved" | "rejected" | null;
    const comments = await getAllDbComments(status || undefined);
    return NextResponse.json({ ok: true, comments }, { status: 200 });
  } catch (err) {
    console.error("[Admin Comments API] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid comment id or status" }, { status: 400 });
    }

    const success = await updateCommentStatus(Number(id), status);
    if (!success) {
      return NextResponse.json({ ok: false, error: "Failed to update comment" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: `Comment ${status} successfully` }, { status: 200 });
  } catch (err) {
    console.error("[Admin Comments API] PATCH error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update comment" }, { status: 500 });
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
      return NextResponse.json({ ok: false, error: "Missing comment id" }, { status: 400 });
    }

    const success = await deleteVisitorComment(Number(id));
    if (!success) {
      return NextResponse.json({ ok: false, error: "Failed to delete comment" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Comment deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("[Admin Comments API] DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete comment" }, { status: 500 });
  }
}
