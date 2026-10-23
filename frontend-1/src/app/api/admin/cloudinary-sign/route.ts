import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const ALLOWED_FOLDERS = [
  "portfolio/music",
  "portfolio/certificates",
  "portfolio/media",
  "portfolio",
];

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to sign upload requests." },
        { status: 401 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "portfolio/music";

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { error: `Forbidden: Upload folder must be one of: ${ALLOWED_FOLDERS.join(", ")}` },
        { status: 403 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sign upload request.";
    console.error("Cloudinary sign error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
