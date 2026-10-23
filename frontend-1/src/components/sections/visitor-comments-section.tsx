"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

interface PublicComment {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export function VisitorCommentsSection() {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      if (data.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Please provide both your name and a note." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setFeedback({
          type: "success",
          text: data.message || "Thank you! Your note has been submitted for review and will appear once approved.",
        });
        setName("");
        setMessage("");
      } else {
        setFeedback({
          type: "error",
          text: data.error || "Failed to submit comment. Please try again shortly.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Network error occurred while submitting your note. Please check your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="comments"
      className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface/20 scroll-mt-20 border-t border-border"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="HEY THERE!"
          description="Have we worked together, built something interesting, or connected through my work? Leave me a note."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mt-10">
          {/* Left Column: Submission Form */}
          <div className="lg:col-span-5 p-7 rounded-2xl bg-surface border border-border">
            <div className="flex items-center gap-2 mb-6 text-foreground font-semibold text-base">
              <MessageSquare className="w-4 h-4 text-accent" />
              <span>Leave a Visitor Note</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="visitor-name" className="block text-xs font-medium text-muted mb-1.5">
                  Your Name or Handle
                </label>
                <input
                  id="visitor-name"
                  type="text"
                  required
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="visitor-message" className="block text-xs font-medium text-muted mb-1.5">
                  Message
                </label>
                <textarea
                  id="visitor-message"
                  required
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a quick note, feedback on a project, or a friendly hello..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* Feedback Alert */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                      feedback.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{feedback.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-neutral-200 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {submitting ? (
                  <span>Sending note...</span>
                ) : (
                  <>
                    <span>Post Note</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-muted text-center pt-1">
                Moderated guestbook policy: Maximum 2 notes per visitor. Approved notes display publicly.
              </p>
            </form>
          </div>

          {/* Right Column: Community Guestbook Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Approved Notes ({comments.length})
              </span>
              <span className="text-xs text-muted">All notes verified</span>
            </div>

            {loading ? (
              <div className="space-y-3 pt-2">
                {[1, 2].map((i) => (
                  <div key={i} className="p-5 rounded-xl bg-surface border border-border animate-pulse space-y-2">
                    <div className="h-4 w-32 bg-surface-elevated rounded" />
                    <div className="h-3 w-3/4 bg-surface-elevated rounded" />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="p-10 rounded-2xl bg-surface/60 border border-dashed border-border text-center">
                <Clock className="w-8 h-8 text-muted mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-foreground">No notes published yet.</p>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  Be the first person to leave a note or say hello through the guestbook!
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {comments.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 sm:p-6 rounded-2xl bg-surface border border-border hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground tracking-tight">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
