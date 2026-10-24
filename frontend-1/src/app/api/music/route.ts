import { NextRequest, NextResponse } from "next/server";
import { getPublicSongs, getMusicTrackById } from "@/lib/cloudinary-music";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get("id");

    // Single track lookup by ID
    if (trackId) {
      const track = await getMusicTrackById(trackId);
      if (!track) {
        return NextResponse.json(
          { error: `Music track not found with id "${trackId}"` },
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
    }

    const assets = await getPublicSongs();

    // Map to minimal metadata required by the public player
    const songs = assets.map((song) => ({
      id: song.id,
      title: song.title,
      filename: song.filename,
      url: song.url,
      duration: song.duration || 0,
      format: song.format,
    }));

    return NextResponse.json(
      {
        songs,
        total: songs.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Public music playlist fetch error:", err);
    return NextResponse.json(
      {
        songs: [
          {
            id: "default_fallback",
            title: "Sakura Ambient Harmony",
            filename: "sakura.mp3",
            url: "/audio/sakura.mp3",
            duration: 214,
            format: "MP3",
          },
        ],
        total: 1,
        fallback: true,
      },
      { status: 200 }
    );
  }
}
