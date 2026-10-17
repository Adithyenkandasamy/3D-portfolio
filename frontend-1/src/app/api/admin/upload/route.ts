import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadMediaFile } from "@/lib/cloudinary";
import { recordServerMedia } from "@/lib/server-content-store";

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to upload media." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "portfolio";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data." },
        { status: 400 }
      );
    }

    // Upload to Cloudinary / local storage
    const result = await uploadMediaFile(file, folder);

    // Save record to media library index
    const mediaItem = {
      id: `media-${Date.now()}`,
      name: file.name,
      url: result.url,
      type: file.type,
      size: result.size,
      createdAt: new Date().toISOString(),
      provider: result.provider,
      publicId: result.publicId,
    };

    await recordServerMedia(mediaItem);

    return NextResponse.json({
      success: true,
      asset: mediaItem,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload media.";
    console.error("Upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
