import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  listMusicAssets,
  deleteMusicAsset,
  updateMusicAssetTitle,
  invalidateMusicCache,
} from "@/lib/cloudinary-music";

/**
 * GET /api/admin/music
 * List all audio assets within portfolio/music with pagination metadata
 */
export async function GET(req: NextRequest) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to access music library." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("next_cursor") || undefined;
    const maxResults = Math.min(
      parseInt(searchParams.get("max_results") || "100", 10),
      100
    );

    const result = await listMusicAssets({
      next_cursor: cursor,
      max_results: maxResults,
    });

    return NextResponse.json({
      success: true,
      assets: result.assets,
      totalCount: result.totalCount,
      totalBytes: result.totalBytes,
      nextCursor: result.nextCursor,
      provider: result.provider,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list music assets.";
    console.error("Admin music listing error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/music
 * Safely delete an audio asset from portfolio/music
 */
export async function DELETE(req: NextRequest) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to delete audio assets." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const publicId = body?.publicId;

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json(
        { error: "Invalid request. 'publicId' string is required." },
        { status: 400 }
      );
    }

    // Strict Server-Side Validation: Asset must belong strictly to portfolio/music
    const isAllowedFolder =
      publicId.startsWith("portfolio/music/") ||
      publicId.startsWith("local_music_");

    if (!isAllowedFolder) {
      return NextResponse.json(
        {
          error:
            "Security Violation: Asset is outside 'portfolio/music'. Deletion rejected.",
        },
        { status: 403 }
      );
    }

    await deleteMusicAsset(publicId);
    invalidateMusicCache();

    return NextResponse.json({
      success: true,
      deletedPublicId: publicId,
      message: "Audio asset deleted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete audio asset.";
    console.error("Admin music delete error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/music
 * Update custom track title in Neon Postgres database
 */
export async function PATCH(req: NextRequest) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to update audio assets." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const id = body?.id || body?.publicId;
    const title = body?.title?.trim();

    if (!id || !title) {
      return NextResponse.json(
        { error: "Track 'id' (or 'publicId') and non-empty 'title' are required." },
        { status: 400 }
      );
    }

    const success = await updateMusicAssetTitle(id, title);
    if (!success) {
      return NextResponse.json(
        { error: `Could not update title for track ${id}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      title,
      message: "Track title updated successfully in database.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update track title.";
    console.error("Admin music patch error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
