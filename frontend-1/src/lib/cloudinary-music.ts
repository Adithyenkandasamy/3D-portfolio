import "server-only";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  saveDbMusicTrack,
  deleteDbMusicTrack,
  getDbMusicTracks,
  updateDbMusicTrackTitle,
  getDbMusicTrackById,
} from "@/lib/db";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface MusicAsset {
  id: string;
  publicId: string;
  filename: string;
  title: string;
  format: string;
  bytes: number;
  duration?: number;
  url: string;
  createdAt: string;
  provider: "cloudinary" | "local";
  resourceType: "video" | "raw";
}

export interface MusicLibraryResult {
  assets: MusicAsset[];
  totalCount: number;
  totalBytes: number;
  nextCursor?: string | null;
  provider: "cloudinary" | "local";
}

// Supported audio formats
const ALLOWED_AUDIO_EXTS = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"];
const ALLOWED_AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/flac",
  "audio/x-flac",
];
const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

// Cache for public playlist
let publicPlaylistCache: { timestamp: number; songs: MusicAsset[] } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function invalidateMusicCache() {
  publicPlaylistCache = null;
}

/**
 * Validates audio file extension, MIME type, and size
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const ext = path.extname(file.name).toLowerCase();
  const isValidExt = ALLOWED_AUDIO_EXTS.includes(ext);
  const isValidMime = ALLOWED_AUDIO_MIMES.includes(file.type.toLowerCase()) || file.type.startsWith("audio/");

  if (!isValidExt && !isValidMime) {
    return {
      valid: false,
      error: `Unsupported audio format "${file.name}". Supported: MP3, WAV, OGG, M4A, AAC, FLAC.`,
    };
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" exceeds 25MB limit (actual: ${sizeMb}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Lists all audio assets in folder portfolio/music with pagination
 */
export async function listMusicAssets(options?: {
  next_cursor?: string;
  max_results?: number;
}): Promise<MusicLibraryResult> {
  const maxResults = options?.max_results || 100;
  const cursor = options?.next_cursor || undefined;

  // 1. If Cloudinary is configured, query Cloudinary directly
  if (isCloudinaryConfigured) {
    try {
      // Audio in Cloudinary is stored under resource_type: "video"
      const res = await cloudinary.api.resources({
        type: "upload",
        resource_type: "video",
        prefix: "portfolio/music/",
        max_results: maxResults,
        next_cursor: cursor,
      });

      const rawResources = res.resources || [];
      const dbTracks = await getDbMusicTracks().catch(() => null);
      const dbMap = new Map((dbTracks || []).map((t) => [t.id, t.title]));
      const dbFilenameMap = new Map((dbTracks || []).map((t) => [t.filename, t.title]));

      const assets: MusicAsset[] = rawResources
        .filter((r: { public_id: string }) => r.public_id.startsWith("portfolio/music/"))
        .map((r: {
          asset_id: string;
          public_id: string;
          filename?: string;
          format: string;
          bytes: number;
          duration?: number;
          secure_url: string;
          created_at: string;
          resource_type: string;
        }) => {
          const filename = r.filename
            ? `${r.filename}.${r.format}`
            : path.basename(r.public_id) + `.${r.format}`;
          const cleanTitle = path
            .basename(filename, `.${r.format}`)
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          const title =
            dbMap.get(r.public_id) ||
            dbMap.get(r.asset_id) ||
            dbFilenameMap.get(filename) ||
            cleanTitle;

          return {
            id: r.public_id,
            publicId: r.public_id,
            filename,
            title,
            format: (r.format || "mp3").toUpperCase(),
            bytes: r.bytes || 0,
            duration: r.duration,
            url: r.secure_url,
            createdAt: r.created_at,
            provider: "cloudinary" as const,
            resourceType: (r.resource_type as "video" | "raw") || "video",
          };
        });

      if (assets.length > 0) {
        const totalBytes = assets.reduce((sum, a) => sum + a.bytes, 0);

        return {
          assets,
          totalCount: assets.length,
          totalBytes,
          nextCursor: res.next_cursor || null,
          provider: "cloudinary",
        };
      }
    } catch (err: unknown) {
      console.warn("Cloudinary music listing failed, checking fallback:", err);
    }
  }

  // 2. Local fallback if Cloudinary has 0 tracks or credentials offline
  return await listLocalMusicAssets();
}

/**
 * Local fallback music scanner in public/audio and public/uploads/music
 */
async function listLocalMusicAssets(): Promise<MusicLibraryResult> {
  const localMusicDir = path.join(process.cwd(), "public", "uploads", "music");
  const defaultAudioDir = path.join(process.cwd(), "public", "audio");

  const dbTracks = await getDbMusicTracks().catch(() => null);
  const dbMap = new Map((dbTracks || []).map((t) => [t.id, t.title]));
  const dbFilenameMap = new Map((dbTracks || []).map((t) => [t.filename, t.title]));

  const assets: MusicAsset[] = [];

  // Scan public/uploads/music
  try {
    const files = await fs.readdir(localMusicDir);
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (ALLOWED_AUDIO_EXTS.includes(ext)) {
        const stats = await fs.stat(path.join(localMusicDir, f));
        const cleanTitle = path
          .basename(f, ext)
          .replace(/[_-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const publicId = `portfolio/music/local_${f}`;
        const title = dbMap.get(publicId) || dbFilenameMap.get(f) || cleanTitle;

        assets.push({
          id: publicId,
          publicId,
          filename: f,
          title,
          format: ext.replace(".", "").toUpperCase(),
          bytes: stats.size,
          url: `/uploads/music/${f}`,
          createdAt: stats.birthtime.toISOString(),
          provider: "local",
          resourceType: "video",
        });
      }
    }
  } catch {
    // Directory might not exist yet
  }

  // Check default sakura.mp3
  try {
    const defaultFile = "sakura.mp3";
    const defaultPath = path.join(defaultAudioDir, defaultFile);
    const stats = await fs.stat(defaultPath);
    // Add default track if not already present
    if (!assets.some((a) => a.filename === defaultFile)) {
      const publicId = "portfolio/music/sakura_ambient";
      const title = dbMap.get(publicId) || dbFilenameMap.get(defaultFile) || "Sakura Ambient Harmony";
      assets.unshift({
        id: publicId,
        publicId,
        filename: "sakura.mp3",
        title,
        format: "MP3",
        bytes: stats.size,
        duration: 214,
        url: "/audio/sakura.mp3",
        createdAt: stats.birthtime.toISOString(),
        provider: "local",
        resourceType: "video",
      });
    }
  } catch {
    // Default audio not present
  }

  const totalBytes = assets.reduce((sum, a) => sum + a.bytes, 0);

  return {
    assets,
    totalCount: assets.length,
    totalBytes,
    nextCursor: null,
    provider: "local",
  };
}

/**
 * Uploads a single audio file to portfolio/music in Cloudinary (or local fallback).
 * Supports user-defined custom title saved to Neon database.
 */
export async function uploadMusicAsset(file: File, customTitle?: string): Promise<MusicAsset> {
  const validation = validateAudioFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. Upload to Cloudinary if configured
  if (isCloudinaryConfigured) {
    try {
      const asset = await new Promise<MusicAsset>((resolve, reject) => {
        // In Cloudinary, audio should be uploaded with resource_type: "video" (or "auto")
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "portfolio/music",
            resource_type: "auto",
            use_filename: true,
            unique_filename: true,
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              console.error("Cloudinary audio upload failed:", error);
              const errAny = error as any;
              if (
                errAny?.http_code === 403 ||
                errAny?.statusCode === 403 ||
                (typeof error?.message === "string" && error.message.includes("403"))
              ) {
                return reject(new Error("CLOUDINARY_403"));
              }
              let errorMsg = error?.message || "Failed to upload audio to Cloudinary.";
              if (errorMsg.includes("403")) {
                errorMsg = "Cloudinary rejected upload (HTTP 403): Verify that Cloudinary API credentials in .env.local have media upload permissions.";
              }
              reject(new Error(errorMsg));
              return;
            }

            invalidateMusicCache();

            const ext = result.format || path.extname(file.name).replace(".", "") || "mp3";
            const filename = result.original_filename
              ? `${result.original_filename}.${ext}`
              : file.name;
            const cleanTitle = path
              .basename(filename, `.${ext}`)
              .replace(/[_-]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const trackTitle = customTitle?.trim() || cleanTitle;

            const asset: MusicAsset = {
              id: result.public_id,
              publicId: result.public_id,
              filename,
              title: trackTitle,
              format: ext.toUpperCase(),
              bytes: result.bytes,
              duration: result.duration,
              url: result.secure_url,
              createdAt: result.created_at,
              provider: "cloudinary",
              resourceType: "video",
            };

            // Record in Neon Postgres database
            saveDbMusicTrack({
              id: asset.publicId,
              title: asset.title,
              filename: asset.filename,
              url: asset.url,
              duration: asset.duration,
              format: asset.format,
            }).catch((e) => console.warn("[Neon DB] Music track sync warning:", e));

            resolve(asset);
          }
        );

        uploadStream.end(buffer);
      });
      return asset;
    } catch (err: any) {
      if (err?.message === "CLOUDINARY_403") {
        // Fall through to local fallback
      } else {
        throw err;
      }
    }
  }

  // 2. Local fallback if Cloudinary is not configured
  const ext = path.extname(file.name) || ".mp3";
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const sanitizedBase = path
    .basename(file.name, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const localFileName = `${sanitizedBase}_${randomSuffix}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "music");

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, localFileName), buffer);

  invalidateMusicCache();

  const cleanTitle = sanitizedBase.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const trackTitle = customTitle?.trim() || cleanTitle;

  const localAsset: MusicAsset = {
    id: `portfolio/music/local_${localFileName}`,
    publicId: `portfolio/music/local_${localFileName}`,
    filename: file.name,
    title: trackTitle,
    format: ext.replace(".", "").toUpperCase(),
    bytes: file.size,
    url: `/uploads/music/${localFileName}`,
    createdAt: new Date().toISOString(),
    provider: "local",
    resourceType: "video",
  };

  saveDbMusicTrack({
    id: localAsset.publicId,
    title: localAsset.title,
    filename: localAsset.filename,
    url: localAsset.url,
    format: localAsset.format,
  }).catch((e) => console.warn("[Neon DB] Music track sync warning:", e));

  return localAsset;
}

/**
 * Updates a music track's title in Neon Postgres and invalidates cache
 */
export async function updateMusicAssetTitle(idOrPublicId: string, newTitle: string): Promise<boolean> {
  const clean = newTitle.trim();
  if (!clean) throw new Error("Title cannot be empty");

  let updated = await updateDbMusicTrackTitle(idOrPublicId, clean);
  if (!updated) {
    const { assets } = await listMusicAssets({ max_results: 100 });
    const target = assets.find((a) => a.id === idOrPublicId || a.publicId === idOrPublicId);
    if (target) {
      updated = await saveDbMusicTrack({
        id: target.publicId,
        title: clean,
        filename: target.filename,
        url: target.url,
        duration: target.duration,
        format: target.format,
      });
    }
  }

  invalidateMusicCache();
  return updated;
}

/**
 * Retrieves a music track by ID from Neon database or active asset list
 */
export async function getMusicTrackById(id: string): Promise<MusicAsset | null> {
  const dbTrack = await getDbMusicTrackById(id);
  if (dbTrack) {
    return {
      id: dbTrack.id,
      publicId: dbTrack.id,
      filename: dbTrack.filename,
      title: dbTrack.title,
      format: (dbTrack.format || "MP3").toUpperCase(),
      bytes: 0,
      duration: dbTrack.duration,
      url: dbTrack.url,
      createdAt: dbTrack.created_at || new Date().toISOString(),
      provider: dbTrack.url.includes("cloudinary") ? "cloudinary" : "local",
      resourceType: "video",
    };
  }

  const { assets } = await listMusicAssets({ max_results: 100 });
  return assets.find((a) => a.id === id || a.publicId === id) || null;
}

/**
 * Safely deletes an audio asset from portfolio/music.
 * Enforces strict folder verification: refuses to delete anything outside portfolio/music.
 */
export async function deleteMusicAsset(publicId: string): Promise<void> {
  if (!publicId || typeof publicId !== "string") {
    throw new Error("Invalid asset publicId provided.");
  }

  // STRICT SECURITY CHECK: publicId must strictly belong to portfolio/music
  const isAllowedFolder = publicId.startsWith("portfolio/music/") || publicId.startsWith("local_music_");
  if (!isAllowedFolder) {
    throw new Error("Security Violation: You are only permitted to delete assets within portfolio/music.");
  }

  // 1. Delete from Cloudinary if configured
  if (isCloudinaryConfigured && !publicId.startsWith("local_music_")) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
      if (res.result !== "ok" && res.result !== "not found") {
        // Try raw resource type if video failed
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cloudinary deletion error";
      throw new Error(`Failed to delete asset from Cloudinary: ${msg}`);
    }
  }

  // 2. Delete from local storage if local fallback
  if (publicId.includes("local_")) {
    const rawName = publicId.split("local_").pop();
    if (rawName) {
      const localFilePath = path.join(process.cwd(), "public", "uploads", "music", rawName);
      try {
        await fs.unlink(localFilePath);
      } catch {
        // Ignore if file doesn't exist
      }
    }
  }

  // Handle bundled default audio tracks (e.g. sakura.mp3 / sakura_ambient)
  if (
    publicId === "portfolio/music/sakura_ambient" ||
    publicId === "default_sakura" ||
    publicId.includes("sakura_ambient") ||
    publicId.includes("sakura.mp3")
  ) {
    const defaultSakuraPath = path.join(process.cwd(), "public", "audio", "sakura.mp3");
    try {
      await fs.unlink(defaultSakuraPath);
    } catch {
      // Ignore if file already deleted
    }
  }

  // Delete from Neon Postgres database
  await deleteDbMusicTrack(publicId).catch((e) => console.warn("[Neon DB] Music track delete warning:", e));

  invalidateMusicCache();
}

/**
 * Retrieves public songs for the portfolio music player with brief caching
 */
export async function getPublicSongs(): Promise<MusicAsset[]> {
  const now = Date.now();
  if (publicPlaylistCache && now - publicPlaylistCache.timestamp < CACHE_TTL_MS) {
    return publicPlaylistCache.songs;
  }

  const { assets } = await listMusicAssets({ max_results: 50 });
  publicPlaylistCache = {
    timestamp: now,
    songs: assets,
  };

  return assets;
}
