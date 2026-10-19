import { NextResponse } from "next/server";
import { getPublicSongs } from "@/lib/cloudinary-music";

export async function GET() {
  try {
    const assets = await getPublicSongs();

    // Map to minimal metadata required by the public player
    // Never expose Cloudinary internal IDs or credentials
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
