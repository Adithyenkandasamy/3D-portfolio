import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  uploadMusicAsset,
  validateAudioFile,
  invalidateMusicCache,
} from "@/lib/cloudinary-music";

/**
 * POST /api/admin/music/upload
 * Multi-file audio uploader to Cloudinary (folder: portfolio/music)
 */
export async function POST(req: NextRequest) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to upload audio." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    // Support both single file ('file') and multiple files ('files' or multiple 'file')
    const files: File[] = [];

    const fileEntries = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ];

    for (const entry of fileEntries) {
      if (entry instanceof File && entry.size > 0) {
        files.push(entry);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No valid audio files provided for upload." },
        { status: 400 }
      );
    }

    const uploadedAssets = [];
    const errors: { filename: string; error: string }[] = [];

    for (const file of files) {
      // 1. Server-side format & size validation
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        errors.push({
          filename: file.name,
          error: validation.error || "Unsupported or oversized audio file.",
        });
        continue;
      }

      // 2. Upload asset
      try {
        const asset = await uploadMusicAsset(file);
        uploadedAssets.push(asset);
      } catch (uploadErr: unknown) {
        const msg =
          uploadErr instanceof Error
            ? uploadErr.message
            : "Cloudinary upload failed";
        errors.push({
          filename: file.name,
          error: msg,
        });
      }
    }

    if (uploadedAssets.length > 0) {
      invalidateMusicCache();
    }

    const status =
      uploadedAssets.length > 0
        ? 200
        : errors.length > 0
        ? 400
        : 200;

    return NextResponse.json(
      {
        success: uploadedAssets.length > 0,
        uploaded: uploadedAssets,
        errors,
        totalUploaded: uploadedAssets.length,
        totalFailed: errors.length,
      },
      { status }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Audio upload request failed.";
    console.error("Music upload endpoint error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
