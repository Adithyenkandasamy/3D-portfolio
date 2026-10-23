"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
  ArrowLeft,
  Lock,
  Clock,
  Filter,
  ShieldAlert,
} from "lucide-react";
import type { DbVisitorComment } from "@/lib/db";

export default function AdminCommentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [comments, setComments] = useState<DbVisitorComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check auth session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      const data = await res.json();
      setIsAuthenticated(Boolean(data?.authenticated));
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      if (data.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load visitor comments" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchComments();
    }
  }, [isAuthenticated, fetchComments]);

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
        setLoginError(data.error || "Invalid username or password");
      }
    } catch {
      setLoginError("Login connection failed");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleUpdateStatus(id: number, status: "approved" | "rejected") {
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMessage({ type: "success", text: `Comment #${id} marked as ${status}` });
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status, reviewed_at: new Date().toISOString() } : c))
        );
      } else {
        setStatusMessage({ type: "error", text: data.error || "Update failed" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to update comment" });
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(`Are you sure you want to delete comment #${id}?`)) return;

    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMessage({ type: "success", text: `Comment #${id} deleted` });
        setComments((prev) => prev.filter((c) => c.id !== id));
      } else {
        setStatusMessage({ type: "error", text: data.error || "Delete failed" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to delete comment" });
    }
  }

  // Login view if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Moderation</h1>
              <p className="text-xs text-muted">Visitor comments queue</p>
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
              {isLoggingIn ? "Authenticating..." : "Sign In to Moderation"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredComments = comments.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = comments.filter((c) => c.status === "pending").length;
  const approvedCount = comments.filter((c) => c.status === "approved").length;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Top Header */}
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
              <MessageSquare className="w-6 h-6 text-accent" />
              <span>Visitor Comments Moderation</span>
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Review and moderate public notes submitted by portfolio visitors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/music"
            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated text-xs font-medium text-foreground border border-border transition-colors"
          >
            Music Library
          </Link>
          <button
            onClick={fetchComments}
            className="p-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-muted hover:text-foreground border border-border transition-colors"
            title="Refresh comments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`my-6 p-4 rounded-xl text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-muted">Total Notes</span>
          <p className="text-2xl font-bold mt-1 text-foreground">{comments.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-amber-400 font-medium">Pending Moderation</span>
          <p className="text-2xl font-bold mt-1 text-amber-400">{pendingCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-emerald-400 font-medium">Published Live</span>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{approvedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? "bg-foreground text-background"
                  : "bg-surface hover:bg-surface-elevated text-muted border border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visitor notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="p-16 rounded-2xl bg-surface/40 border border-dashed border-border text-center">
          <MessageSquare className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold text-foreground">No notes found</p>
          <p className="text-xs text-muted mt-1">There are no visitor notes matching the current filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-base text-foreground">{comment.name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                      comment.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : comment.status === "pending"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-destructive/15 text-destructive border-destructive/30"
                    }`}
                  >
                    {comment.status}
                  </span>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-surface-elevated/60 p-4 rounded-xl border border-border-subtle">
                  {comment.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                {comment.status !== "approved" && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, "approved")}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {comment.status !== "rejected" && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, "rejected")}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(comment.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold border border-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
