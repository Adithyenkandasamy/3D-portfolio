import { NextRequest, NextResponse } from "next/server";
import { getMusicTrackById } from "@/lib/cloudinary-music";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  try {
    const { id } = await params;
    const fullId = Array.isArray(id) ? id.join("/") : id;

    if (!fullId) {
      return NextResponse.json(
        { error: "Track ID path parameter is required." },
        { status: 400 }
      );
    }

    // Try full ID as well as prefixed with portfolio/music/ if not prefixed
    let track = await getMusicTrackById(fullId);
    if (!track && !fullId.startsWith("portfolio/music/")) {
      track = await getMusicTrackById(`portfolio/music/${fullId}`);
    }

    if (!track) {
      return NextResponse.json(
        { error: `Music track not found with ID "${fullId}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      song: {
        id: track.id,
        title: track.title,
        filename: track.filename,
        url: track.url,
        duration: track.duration || 0,
        format: track.format,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching song by ID";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
