import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  reorderServerProjects,
  reorderServerExperience,
  reorderServerCertificates,
  reorderServerAchievements,
  reorderServerEducation,
} from "@/lib/server-content-store";

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

    let updatedData: unknown = null;

    switch (type) {
      case "projects":
        updatedData = await reorderServerProjects(ids);
        break;
      case "experience":
        updatedData = await reorderServerExperience(ids);
        break;
      case "certificates":
        updatedData = await reorderServerCertificates(ids);
        break;
      case "achievements":
        updatedData = await reorderServerAchievements(ids);
        break;
      case "education":
        updatedData = await reorderServerEducation(ids);
        break;
      default:
        return NextResponse.json(
          { error: `Reordering not supported for type: ${type}` },
          { status: 400 }
        );
    }

    // Revalidate public landing and admin pages
    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, data: updatedData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reorder items.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
