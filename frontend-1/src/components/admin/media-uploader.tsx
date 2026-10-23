"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, FileText, Music } from "lucide-react";

interface MediaUploaderProps {
  onUploadSuccess: (url: string, asset: { name: string; url: string; size: number }) => void;
  folder?: string;
  accept?: string;
  currentUrl?: string;
  label?: string;
}

export function MediaUploader({
  onUploadSuccess,
  folder = "portfolio",
  accept = "image/*,application/pdf,audio/*",
  currentUrl,
  label = "Upload Media Asset",
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setProgress(20);

    try {
      // 1. Attempt direct signed Cloudinary upload (bypasses Vercel 4.5MB limit)
      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (signRes.ok) {
        const signData = await signRes.json();
        if (signData.signature && signData.uploadUrl) {
          setProgress(50);
          const cldData = new FormData();
          cldData.append("file", file);
          cldData.append("api_key", signData.apiKey);
          cldData.append("timestamp", String(signData.timestamp));
          cldData.append("signature", signData.signature);
          cldData.append("folder", signData.folder);

          const cldRes = await fetch(signData.uploadUrl, {
            method: "POST",
            body: cldData,
          });

          if (cldRes.ok) {
            const cldJson = await cldRes.json();
            const assetUrl = cldJson.secure_url || cldJson.url;
            setProgress(100);
            setPreviewUrl(assetUrl);
            onUploadSuccess(assetUrl, {
              name: file.name,
              url: assetUrl,
              size: file.size,
            });
            return;
          }
        }
      }

      // 2. Fallback to server route /api/admin/upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      setProgress(60);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(85);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      setProgress(100);
      setPreviewUrl(json.asset.url);
      onUploadSuccess(json.asset.url, json.asset);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const isImage = (url: string) => /\.(jpeg|jpg|png|webp|svg)($|\?)/i.test(url) || url.startsWith("/images/");
  const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);
  const isAudio = (url: string) => /\.(mp3|wav|ogg)($|\?)/i.test(url) || url.startsWith("/audio/");

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </label>

      <div className="border border-dashed border-border rounded-xl p-4 bg-background/50 hover:bg-background transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Asset Preview */}
          <div className="w-16 h-16 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
            {previewUrl ? (
              isImage(previewUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Asset Preview"
                  className="w-full h-full object-cover"
                />
              ) : isPdf(previewUrl) ? (
                <FileText className="w-7 h-7 text-accent" />
              ) : isAudio(previewUrl) ? (
                <Music className="w-7 h-7 text-accent" />
              ) : (
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              )
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Action & Status */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select File (Images, PDF, MP3)</span>
                  </>
                )}
              </button>

              {previewUrl && (
                <span className="text-[11px] font-mono text-muted truncate max-w-xs block">
                  {previewUrl}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="w-full bg-border-subtle h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Error banner */}
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
