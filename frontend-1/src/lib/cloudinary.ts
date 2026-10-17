import "server-only";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId: string;
  provider: "cloudinary" | "local";
  size: number;
  format: string;
  resourceType: "image" | "raw" | "video";
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * Validates uploaded file type and file size
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isDoc = ALLOWED_DOC_TYPES.includes(file.type);
  const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);

  if (!isImage && !isDoc && !isAudio) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, SVG, PDF, MP3.`,
    };
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxMb}MB limit (actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Uploads file to Cloudinary if configured, or saves to local /public/uploads as safe fallback
 */
export async function uploadMediaFile(
  file: File,
  folder: string = "portfolio"
): Promise<UploadResult> {
  const validation = validateUploadFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. If Cloudinary is configured, upload to Cloudinary
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const isPdf = file.type === "application/pdf";
      const resourceType = isPdf ? "raw" : "auto";

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error("Cloudinary upload failed:", error);
            reject(new Error(error?.message || "Cloudinary upload failed"));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            provider: "cloudinary",
            size: result.bytes,
            format: result.format || file.type.split("/")[1] || "bin",
            resourceType: result.resource_type as "image" | "raw" | "video",
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  // 2. Local fallback if Cloudinary credentials are not present
  const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "bin"}`;
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const sanitizedBase = path
    .basename(file.name, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const localFileName = `${sanitizedBase}_${Date.now()}_${randomSuffix}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, localFileName), buffer);

  const localUrl = `/uploads/${localFileName}`;

  return {
    url: localUrl,
    publicId: `local_${localFileName}`,
    provider: "local",
    size: file.size,
    format: ext.replace(".", ""),
    resourceType: file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
      ? "video"
      : "raw",
  };
}

/**
 * Deletes asset from Cloudinary or local storage
 */
export async function deleteMediaAsset(
  publicId: string,
  provider: "cloudinary" | "local" = "cloudinary"
): Promise<void> {
  if (provider === "cloudinary" && isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn("Could not destroy Cloudinary asset:", err);
    }
  } else if (provider === "local" || publicId.startsWith("local_")) {
    try {
      const fileName = publicId.replace("local_", "");
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
