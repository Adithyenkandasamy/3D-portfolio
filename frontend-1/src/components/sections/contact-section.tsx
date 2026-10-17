"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");

    // TODO: Replace with server action in Phase 2+
    await new Promise((r) => setTimeout(r, 1500));

    setFormState("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setFormState("idle"), 4000);
  };

  return (
    <section id="contact" className="section">
      <div className="container-narrow">
        <SectionHeader
          label="Contact"
          title="Let's work together"
          description="Have a project in mind or want to collaborate? Send me a message."
        />

        <AnimateOnScroll>
          <form
            onSubmit={handleSubmit}
            className="card p-6 md:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={cn(
                    "w-full px-3.5 py-2.5 text-sm rounded-lg",
                    "border border-border bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                    "placeholder:text-muted-foreground transition-colors"
                  )}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={cn(
                    "w-full px-3.5 py-2.5 text-sm rounded-lg",
                    "border border-border bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                    "placeholder:text-muted-foreground transition-colors"
                  )}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className={cn(
                  "w-full px-3.5 py-2.5 text-sm rounded-lg",
                  "border border-border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                  "placeholder:text-muted-foreground transition-colors"
                )}
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className={cn(
                  "w-full px-3.5 py-2.5 text-sm rounded-lg resize-none",
                  "border border-border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                  "placeholder:text-muted-foreground transition-colors"
                )}
                placeholder="Tell me about your project..."
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              {formState === "success" && (
                <p className="flex items-center gap-1.5 text-sm text-accent-foreground">
                  <CheckCircle className="w-4 h-4" />
                  Message sent successfully!
                </p>
              )}
              {formState === "error" && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  Something went wrong. Please try again.
                </p>
              )}
              {(formState === "idle" || formState === "submitting") && (
                <div />
              )}

              <button
                type="submit"
                disabled={formState === "submitting"}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5",
                  "text-sm font-medium rounded-lg",
                  "bg-foreground text-background",
                  "hover:bg-foreground/90 transition-all duration-200",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "active:scale-[0.98]"
                )}
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
