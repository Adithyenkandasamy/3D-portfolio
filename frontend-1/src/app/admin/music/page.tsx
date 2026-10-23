"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Music,
  Upload,
  RefreshCw,
  Search,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  FileAudio,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Lock,
  X,
} from "lucide-react";

interface MusicAsset {
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
}

export default function AdminMusicPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Music library state
  const [assets, setAssets] = useState<MusicAsset[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [provider, setProvider] = useState<string>("cloudinary");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadResults, setUploadResults] = useState<{
    uploaded: string[];
    errors: { filename: string; error: string }[];
  } | null>(null);

  // Delete dialog state
  const [songToDelete, setSongToDelete] = useState<MusicAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Audio preview state - ensures ONLY ONE audio preview plays at a time
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewErrorId, setPreviewErrorId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/session");
        const json = await res.json();
        setIsAuthenticated(Boolean(json.authenticated));
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch music library
  const loadMusicLibrary = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      const res = await fetch("/api/admin/music");
      if (!res.ok) {
        throw new Error(`Failed to load music (HTTP ${res.status})`);
      }
      const data = await res.json();
      setAssets(data.assets || []);
      setTotalCount(data.totalCount || 0);
      setTotalBytes(data.totalBytes || 0);
      setProvider(data.provider || "cloudinary");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching songs";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isAuthenticated) {
      void (async () => {
        try {
          const res = await fetch("/api/admin/music");
          if (!res.ok) return;
          const data = await res.json();
          if (!ignore) {
            setAssets(data.assets || []);
            setTotalCount(data.totalCount || 0);
            setTotalBytes(data.totalBytes || 0);
            setProvider(data.provider || "cloudinary");
            setIsLoading(false);
          }
        } catch {
          if (!ignore) setIsLoading(false);
        }
      })();
    }
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  // Audio preview playback handler
  const handleTogglePreview = (asset: MusicAsset) => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    if (activePreviewId === asset.id) {
      // Toggle current preview
      if (isPlayingPreview) {
        audio.pause();
        setIsPlayingPreview(false);
      } else {
        audio
          .play()
          .then(() => setIsPlayingPreview(true))
          .catch(() => {
            setPreviewErrorId(asset.id);
            setIsPlayingPreview(false);
          });
      }
    } else {
      // Switch to new song: stop current and switch source
      audio.pause();
      audio.src = asset.url;
      audio.load();
      setActivePreviewId(asset.id);
      setPreviewCurrentTime(0);
      setPreviewDuration(asset.duration || 0);
      setPreviewErrorId(null);

      audio
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => {
          setPreviewErrorId(asset.id);
          setIsPlayingPreview(false);
        });
    }
  };

  // Audio element listeners
  useEffect(() => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setPreviewCurrentTime(audio.currentTime || 0);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setPreviewDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlayingPreview(false);
      setPreviewCurrentTime(0);
    };

    const onError = () => {
      if (activePreviewId) {
        setPreviewErrorId(activePreviewId);
      }
      setIsPlayingPreview(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [activePreviewId]);

  // Handle seek on active preview
  const handleSeek = (newTime: number) => {
    const audio = audioPreviewRef.current;
    if (audio) {
      audio.currentTime = newTime;
      setPreviewCurrentTime(newTime);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Invalid username or password.");
      }
    } catch {
      setLoginError("Login connection failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Multi-file upload submit handler (Direct Cloudinary upload with serverless fallback)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadResults(null);

    try {
      // 1. Attempt direct signed Cloudinary uploads (bypasses Vercel 4.5MB payload limit)
      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "portfolio/music" }),
      });

      if (signRes.ok) {
        const signData = await signRes.json();
        if (signData.signature && signData.uploadUrl) {
          const uploadedNames: string[] = [];
          const uploadErrors: { filename: string; error: string }[] = [];

          for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            setUploadProgress(Math.round(20 + ((i + 1) / selectedFiles.length) * 70));

            const cldData = new FormData();
            cldData.append("file", file);
            cldData.append("api_key", signData.apiKey);
            cldData.append("timestamp", String(signData.timestamp));
            cldData.append("signature", signData.signature);
            cldData.append("folder", signData.folder);

            try {
              const cldRes = await fetch(signData.uploadUrl, {
                method: "POST",
                body: cldData,
              });
              if (cldRes.ok) {
                uploadedNames.push(file.name);
              } else {
                const errData = await cldRes.json().catch(() => ({}));
                uploadErrors.push({
                  filename: file.name,
                  error: errData.error?.message || "Cloudinary direct upload rejected.",
                });
              }
            } catch (uErr: unknown) {
              uploadErrors.push({
                filename: file.name,
                error: uErr instanceof Error ? uErr.message : "Network error during upload.",
              });
            }
          }

          setUploadProgress(100);
          setUploadResults({ uploaded: uploadedNames, errors: uploadErrors });
          if (uploadedNames.length > 0) {
            setStatusMessage({
              type: "success",
              text: `Successfully uploaded ${uploadedNames.length} song(s) directly to Cloudinary.`,
            });
            setSelectedFiles([]);
            loadMusicLibrary();
          } else {
            setStatusMessage({
              type: "error",
              text: "Upload failed. Please check file format and sizes.",
            });
          }
          return;
        }
      }

      // 2. Fallback to server route /api/admin/music/upload
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      setUploadProgress(40);

      const res = await fetch("/api/admin/music/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(85);

      const data = await res.json();

      if (res.ok && data.success) {
        setUploadProgress(100);
        setUploadResults({
          uploaded: data.uploaded.map((a: MusicAsset) => a.filename),
          errors: data.errors || [],
        });
        setStatusMessage({
          type: "success",
          text: `Successfully uploaded ${data.totalUploaded} song(s).`,
        });
        setSelectedFiles([]);
        loadMusicLibrary();
      } else {
        setUploadResults({
          uploaded: data.uploaded ? data.uploaded.map((a: MusicAsset) => a.filename) : [],
          errors: data.errors || [{ filename: "Upload", error: data.error || "Upload rejected." }],
        });
        setStatusMessage({
          type: "error",
          text: data.error || "Upload failed. Please check file format and sizes.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload network error";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsUploading(false);
    }
  };

  // Safe delete handler
  const handleConfirmDelete = async () => {
    if (!songToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      // If currently playing the deleted song, stop preview
      if (activePreviewId === songToDelete.id) {
        if (audioPreviewRef.current) {
          audioPreviewRef.current.pause();
        }
        setIsPlayingPreview(false);
        setActivePreviewId(null);
      }

      const res = await fetch("/api/admin/music", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: songToDelete.publicId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: `Deleted "${songToDelete.filename}" successfully from portfolio/music.`,
        });
        setSongToDelete(null);
        loadMusicLibrary();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to delete audio file from Cloudinary.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion network error";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper formatters
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatSeconds = (sec?: number) => {
    if (!sec || isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Filter songs based on search query
  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase();
    return (
      asset.filename.toLowerCase().includes(q) ||
      asset.title.toLowerCase().includes(q) ||
      asset.format.toLowerCase().includes(q)
    );
  });

  // 1. Loading Authentication check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
          <p className="text-xs text-muted font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  // 2. Login Prompt if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-elevated">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Access</h1>
              <p className="text-xs text-muted">Authenticate to access Music Library</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:border-foreground focus:outline-hidden"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:border-foreground focus:outline-hidden"
                placeholder="••••••••••••"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign In to Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Authenticated Music Library UI
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hidden single shared audio element for preview control */}
      <audio ref={audioPreviewRef} preload="none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors py-1 px-2.5 rounded-lg hover:bg-border-subtle"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Music className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-sm font-bold text-foreground">Music Library</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-border-subtle text-muted">
              {provider}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-border-subtle"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Global Status Banner */}
      {statusMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:opacity-75"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Music Library
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Manage the music available on your portfolio. Assets are stored in{" "}
              <code className="text-xs bg-border-subtle px-1.5 py-0.5 rounded text-foreground font-mono">
                portfolio/music
              </code>
              .
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadMusicLibrary(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-border-subtle transition-colors disabled:opacity-50"
              title="Refresh audio list"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                setIsUploadOpen(true);
                setUploadResults(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all shadow-xs active:scale-98"
            >
              <Upload className="w-3.5 h-3.5 text-accent" />
              <span>Upload Songs</span>
            </button>
          </div>
        </div>

        {/* Real Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-medium text-muted">Total Audio Files</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {isLoading ? "..." : totalCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-border-subtle flex items-center justify-center text-muted">
              <FileAudio className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-medium text-muted">Total Storage Used</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {isLoading ? "..." : formatBytes(totalBytes)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-border-subtle flex items-center justify-center text-muted">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-medium text-muted">Storage Folder</p>
              <p className="text-sm font-semibold text-foreground mt-2 font-mono">
                portfolio/music
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs by filename, title, or format..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-surface text-xs focus:border-foreground focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-muted flex items-center gap-1.5 self-end sm:self-center">
            <span>Showing:</span>
            <span className="font-semibold text-foreground">
              {filteredAssets.length}
            </span>
            <span>of {totalCount}</span>
          </div>
        </div>

        {/* Audio File Listing: Table for Desktop & Cards for Mobile */}
        {isLoading ? (
          /* Loading Skeleton */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-surface border border-border rounded-2xl animate-pulse flex items-center px-6 justify-between"
              >
                <div className="w-48 h-4 bg-border rounded" />
                <div className="w-32 h-4 bg-border rounded hidden md:block" />
                <div className="w-20 h-8 bg-border rounded" />
              </div>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl bg-surface border border-dashed border-border flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-border-subtle flex items-center justify-center text-muted mb-3">
              <FileAudio className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {searchQuery ? "No matching songs found" : "No audio files uploaded yet"}
            </h3>
            <p className="text-xs text-muted max-w-sm mt-1 mb-4">
              {searchQuery
                ? `No songs matched "${searchQuery}". Try a different keyword.`
                : "Upload audio tracks (MP3, WAV, OGG, M4A) to portfolio/music to make them available in your public portfolio player."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all"
              >
                Upload Your First Song
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-border-subtle/50 border-b border-border text-muted font-medium">
                  <tr>
                    <th className="py-3 px-5">Track</th>
                    <th className="py-3 px-4">Preview Player</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredAssets.map((asset) => {
                    const isCurrent = activePreviewId === asset.id;
                    const isPlayingThis = isCurrent && isPlayingPreview;
                    const hasErrorThis = previewErrorId === asset.id;

                    return (
                      <tr
                        key={asset.id}
                        className={`hover:bg-border-subtle/30 transition-colors ${
                          isCurrent ? "bg-accent/5" : ""
                        }`}
                      >
                        {/* Track Info */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleTogglePreview(asset)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs ${
                                isPlayingThis
                                  ? "bg-foreground text-background"
                                  : "bg-border-subtle text-foreground hover:bg-foreground hover:text-background"
                              }`}
                              aria-label={isPlayingThis ? "Pause preview" : "Play preview"}
                            >
                              {isPlayingThis ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current translate-x-0.5" />
                              )}
                            </button>

                            <div className="min-w-0 max-w-[240px]">
                              <p className="font-semibold text-foreground truncate">
                                {asset.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-border text-muted">
                                  {asset.format}
                                </span>
                                <span className="text-[11px] text-muted truncate">
                                  {asset.filename}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Interactive Preview Bar */}
                        <td className="py-3.5 px-4 min-w-[240px]">
                          {isCurrent ? (
                            <div className="space-y-1">
                              <input
                                type="range"
                                min="0"
                                max={previewDuration || 100}
                                step="0.5"
                                value={previewCurrentTime}
                                onChange={(e) => handleSeek(Number(e.target.value))}
                                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                              />
                              <div className="flex justify-between text-[10px] font-mono text-muted">
                                <span>{formatSeconds(previewCurrentTime)}</span>
                                <span>{formatSeconds(previewDuration || asset.duration)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted text-[11px] font-mono">
                              {asset.duration ? formatSeconds(asset.duration) : "Click play to preview"}
                            </span>
                          )}

                          {hasErrorThis && (
                            <p className="text-[10px] text-destructive mt-0.5">
                              Audio failed to stream.
                            </p>
                          )}
                        </td>

                        {/* Size */}
                        <td className="py-3.5 px-4 font-mono text-muted">
                          {formatBytes(asset.bytes)}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-muted">
                          {formatDate(asset.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => setSongToDelete(asset)}
                            className="p-2 text-muted hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                            title="Delete audio asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Visible on mobile only) */}
            <div className="md:hidden space-y-3">
              {filteredAssets.map((asset) => {
                const isCurrent = activePreviewId === asset.id;
                const isPlayingThis = isCurrent && isPlayingPreview;
                const hasErrorThis = previewErrorId === asset.id;

                return (
                  <div
                    key={asset.id}
                    className={`p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3 ${
                      isCurrent ? "border-foreground/30 ring-1 ring-foreground/10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleTogglePreview(asset)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                            isPlayingThis
                              ? "bg-foreground text-background"
                              : "bg-border-subtle text-foreground"
                          }`}
                        >
                          {isPlayingThis ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {asset.title}
                          </p>
                          <p className="text-[11px] text-muted truncate mt-0.5">
                            {asset.filename}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSongToDelete(asset)}
                        className="p-2 text-muted hover:text-destructive rounded-lg hover:bg-destructive/10 shrink-0"
                        title="Delete song"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Scrubber if active preview */}
                    {isCurrent && (
                      <div className="pt-1 space-y-1">
                        <input
                          type="range"
                          min="0"
                          max={previewDuration || 100}
                          step="0.5"
                          value={previewCurrentTime}
                          onChange={(e) => handleSeek(Number(e.target.value))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-muted">
                          <span>{formatSeconds(previewCurrentTime)}</span>
                          <span>{formatSeconds(previewDuration || asset.duration)}</span>
                        </div>
                      </div>
                    )}

                    {hasErrorThis && (
                      <p className="text-[10px] text-destructive">
                        Audio stream unavailable.
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted font-mono">
                      <span className="uppercase px-1.5 py-0.5 rounded bg-border-subtle">
                        {asset.format} • {formatBytes(asset.bytes)}
                      </span>
                      <span>{formatDate(asset.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          UPLOAD MODAL DIALOG
         ======================================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-elevated space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
                  <Upload className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Upload Songs
                  </h3>
                  <p className="text-xs text-muted">
                    Files will be securely stored in Cloudinary folder{" "}
                    <code className="text-[11px] font-mono">portfolio/music</code>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isUploading) setIsUploadOpen(false);
                }}
                disabled={isUploading}
                className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drop / Picker Zone */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-foreground/40 transition-colors bg-border-subtle/20">
                <FileAudio className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">
                  Select one or multiple audio files
                </p>
                <p className="text-[11px] text-muted mt-1">
                  Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC (Max: 25MB each)
                </p>

                <input
                  type="file"
                  id="music-upload-input"
                  multiple
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/aac,audio/flac,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                  disabled={isUploading}
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                  className="mt-3 block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-foreground file:text-background hover:file:bg-foreground/90 file:cursor-pointer"
                />
              </div>

              {/* Selected Files Preview List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  <p className="text-xs font-semibold text-foreground">
                    Selected Files ({selectedFiles.length}):
                  </p>
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-border-subtle/50 border border-border"
                    >
                      <span className="truncate max-w-[280px] text-foreground font-mono">
                        {file.name}
                      </span>
                      <span className="text-muted font-mono shrink-0">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress bar during upload */}
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted font-mono">
                    <span>Uploading audio to Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Individual Upload Results Feedback */}
              {uploadResults && (
                <div className="space-y-2 p-3 rounded-xl bg-border-subtle/40 border border-border text-xs">
                  {uploadResults.uploaded.length > 0 && (
                    <div className="text-emerald-700">
                      <p className="font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Uploaded successfully:
                      </p>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                        {uploadResults.uploaded.map((f, i) => (
                          <li key={i} className="truncate">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {uploadResults.errors.length > 0 && (
                    <div className="text-destructive mt-1">
                      <p className="font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Upload errors:
                      </p>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                        {uploadResults.errors.map((err, i) => (
                          <li key={i} className="truncate">
                            <span className="font-medium">{err.filename}:</span>{" "}
                            {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-border-subtle transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || selectedFiles.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all disabled:opacity-50"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? "Uploading..." : "Start Upload"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION DIALOG (Safe Deletion)
         ======================================================== */}
      {songToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-elevated space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                Delete Audio File
              </h3>
            </div>

            <div className="space-y-2 text-xs text-foreground">
              <p>
                Are you sure you want to delete this song?
              </p>
              <div className="p-3 rounded-xl bg-border-subtle font-mono text-[11px] text-foreground break-all border border-border">
                {songToDelete.filename}
              </div>
              <p className="text-muted leading-relaxed">
                This action will permanently remove the asset from Cloudinary
                and may stop playback anywhere it is used.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSongToDelete(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-border-subtle transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-white text-xs font-semibold hover:bg-destructive/90 transition-all disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Delete Song"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
