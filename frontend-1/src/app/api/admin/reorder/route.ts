import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { reorderServerProjects } from "@/lib/server-content-store";

export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required to reorder items." },
      { status: 401 }
    );
  }

  try {
    const { type, ids } = await req.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: "Array of item IDs required." },
        { status: 400 }
      );
    }

    if (type === "projects") {
      const updated = await reorderServerProjects(ids);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { error: `Reordering not supported for type: ${type}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reorder items.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
