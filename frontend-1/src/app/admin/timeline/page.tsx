"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Lock,
  Briefcase,
  GraduationCap,
  Trophy,
  ExternalLink,
  CheckCircle2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
} from "lucide-react";
import type { DbTimelineEntry } from "@/lib/db";

export default function AdminTimelinePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [entries, setEntries] = useState<DbTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<Partial<DbTimelineEntry> | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      const data = await res.json();
      setIsAuthenticated(Boolean(data?.authenticated));
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/timeline");
      const data = await res.json();
      if (data.ok && Array.isArray(data.entries)) {
        setEntries(data.entries);
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load timeline entries" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [isAuthenticated, fetchEntries]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Invalid credentials");
      }
    } catch {
      setLoginError("Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleSaveEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEntry?.title || !editingEntry?.institution) {
      setStatusMessage({ type: "error", text: "Title and Institution are required." });
      return;
    }

    const payload: DbTimelineEntry = {
      id: editingEntry.id || `timeline-${Date.now()}`,
      title: editingEntry.title,
      category: (editingEntry.category as any) || "internship",
      institution: editingEntry.institution,
      role: editingEntry.role || "",
      start_date: editingEntry.start_date || "2026",
      end_date: editingEntry.end_date || "Present",
      is_current: editingEntry.is_current ?? false,
      description: editingEntry.description || "",
      responsibilities: Array.isArray(editingEntry.responsibilities)
        ? editingEntry.responsibilities
        : typeof editingEntry.responsibilities === "string"
        ? (editingEntry.responsibilities as string).split("\n").filter(Boolean)
        : [],
      achievements: Array.isArray(editingEntry.achievements)
        ? editingEntry.achievements
        : typeof editingEntry.achievements === "string"
        ? (editingEntry.achievements as string).split("\n").filter(Boolean)
        : [],
      technologies: Array.isArray(editingEntry.technologies)
        ? editingEntry.technologies
        : typeof editingEntry.technologies === "string"
        ? (editingEntry.technologies as string).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      external_link: editingEntry.external_link || "",
      order_index: editingEntry.order_index ?? entries.length + 1,
      is_published: editingEntry.is_published ?? true,
    };

    try {
      const res = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMessage({ type: "success", text: "Timeline entry saved successfully" });
        setEditingEntry(null);
        fetchEntries();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error saving timeline entry" });
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!window.confirm("Are you sure you want to delete this timeline entry?")) return;

    try {
      const res = await fetch(`/api/admin/timeline?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMessage({ type: "success", text: "Entry deleted" });
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } else {
        setStatusMessage({ type: "error", text: data.error || "Delete failed" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error deleting entry" });
    }
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Timeline Manager</h1>
              <p className="text-xs text-muted">Admin access required</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Username</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            {loginError && <p className="text-xs text-destructive">{loginError}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? "Signing in..." : "Sign In to Timeline"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-surface hover:bg-surface-elevated text-muted hover:text-foreground border border-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-accent" />
              <span>Career & Education Timeline</span>
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Manage chronological records of internships, university, and competitive milestones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setEditingEntry({
                id: `timeline-${Date.now()}`,
                title: "",
                category: "internship",
                institution: "",
                role: "",
                start_date: "2026",
                end_date: "Present",
                is_current: false,
                description: "",
                responsibilities: [],
                achievements: [],
                technologies: [],
                is_published: true,
                order_index: entries.length + 1,
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Timeline Entry</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`my-6 p-4 rounded-xl text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-5 my-8">
            <h2 className="text-lg font-bold text-foreground">
              {editingEntry.id?.startsWith("timeline-") ? "New Timeline Milestone" : "Edit Milestone"}
            </h2>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.title || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                    placeholder="e.g. AI/ML Software Developer Intern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1 font-medium">Category</label>
                  <select
                    value={editingEntry.category || "internship"}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground"
                  >
                    <option value="internship">Internship & Employment</option>
                    <option value="milestone">Award & Hackathon</option>
                    <option value="college">University & College</option>
                    <option value="school">School</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted mb-1 font-medium">Institution / Organization</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.institution || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, institution: e.target.value })}
                    placeholder="e.g. SNS Square Hub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1 font-medium">Role / Qualification</label>
                  <input
                    type="text"
                    value={editingEntry.role || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, role: e.target.value })}
                    placeholder="e.g. AI/ML Developer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-muted mb-1 font-medium">Start Date</label>
                  <input
                    type="text"
                    value={editingEntry.start_date || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, start_date: e.target.value })}
                    placeholder="e.g. Feb 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1 font-medium">End Date</label>
                  <input
                    type="text"
                    value={editingEntry.end_date || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, end_date: e.target.value })}
                    placeholder="e.g. Present"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={editingEntry.is_current ?? false}
                    onChange={(e) => setEditingEntry({ ...editingEntry, is_current: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="is_current" className="text-muted font-medium">Current Position</label>
                </div>
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">Narrative Description</label>
                <textarea
                  rows={3}
                  value={editingEntry.description || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  placeholder="Summary of engineering work and impact..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground resize-none"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">Responsibilities (one per line)</label>
                <textarea
                  rows={3}
                  value={
                    Array.isArray(editingEntry.responsibilities)
                      ? editingEntry.responsibilities.join("\n")
                      : editingEntry.responsibilities || ""
                  }
                  onChange={(e) => setEditingEntry({ ...editingEntry, responsibilities: e.target.value as any })}
                  placeholder="Architecting low-latency OCR inference microservices&#10;Building computer vision pipelines"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground font-mono resize-none"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingEntry.technologies)
                      ? editingEntry.technologies.join(", ")
                      : editingEntry.technologies || ""
                  }
                  onChange={(e) => setEditingEntry({ ...editingEntry, technologies: e.target.value as any })}
                  placeholder="FastAPI, OpenCV, Python, Next.js"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-muted border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-foreground text-background font-semibold hover:bg-neutral-200"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4 my-8">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-foreground">{entry.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/20 uppercase font-semibold">
                  {entry.category}
                </span>
                {entry.is_current && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                {entry.institution} &bull; {entry.role} &bull; {entry.start_date} – {entry.end_date}
              </p>
              <p className="text-xs text-foreground/80 max-w-3xl pt-1 line-clamp-2">
                {entry.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditingEntry(entry)}
                className="p-2 rounded-xl bg-surface hover:bg-surface-elevated text-muted hover:text-foreground border border-border"
                title="Edit entry"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteEntry(entry.id)}
                className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
