"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle, ArrowUpRight, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic-button";

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

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormState("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    } finally {
      setTimeout(() => setFormState("idle"), 5000);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Monumental Headline */}
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-accent mb-4 inline-block">
            Initiate Collaboration &bull; Direct Channel
          </span>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            Let&apos;s talk.
          </h2>
          <div className="mt-6">
            <a
              href="mailto:adithyen1@gmail.com"
              className="inline-flex items-center gap-3 text-2xl sm:text-3xl lg:text-5xl font-medium text-foreground hover:text-accent transition-colors break-all group"
            >
              <span>adithyen1@gmail.com</span>
              <ArrowUpRight className="w-6 h-6 sm:w-10 sm:h-10 text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-6 border-t border-border">
          {/* Left Column: Status, Location & Magnetic Social Links */}
          <div className="lg:col-span-5 space-y-6 text-sm text-muted leading-relaxed">
            <p>
              Available for full-time AI/ML engineering roles, scalable backend architectures, and high-impact software systems.
            </p>
            <p>
              Based in Sathyamangalam / Coimbatore (Tamil Nadu, India). Open to on-site, hybrid, and remote engineering teams worldwide.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Magnetic strength={0.3}>
                <a
                  href="https://github.com/Adithyenkandasamy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground hover:border-accent hover:text-accent transition-colors text-xs font-medium"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3 text-muted" />
                </a>
              </Magnetic>

              <Magnetic strength={0.3}>
                <a
                  href="https://www.linkedin.com/in/adithyen-k"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground hover:border-accent hover:text-accent transition-colors text-xs font-medium"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 text-muted" />
                </a>
              </Magnetic>

              <Magnetic strength={0.3}>
                <a
                  href="mailto:adithyen1@gmail.com"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground hover:border-accent hover:text-accent transition-colors text-xs font-medium"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                  <ArrowUpRight className="w-3 h-3 text-muted" />
                </a>
              </Magnetic>
            </div>
          </div>

          {/* Right Column: Server-Validated Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="p-7 sm:p-8 rounded-xl bg-surface border border-border space-y-5 "
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-surface-elevated text-foreground focus:outline-none focus:border-accent transition-colors"
                    placeholder="Adithyen K"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-surface-elevated text-foreground focus:outline-none focus:border-accent transition-colors"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
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
                  className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-surface-elevated text-foreground focus:outline-none focus:border-accent transition-colors"
                  placeholder="Engineering collaboration or opportunity"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 text-sm rounded-xl resize-none border border-border bg-surface-elevated text-foreground focus:outline-none focus:border-accent transition-colors"
                  placeholder="Details regarding your project, architecture, or role..."
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                {formState === "success" && (
                  <p className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Transmission delivered successfully.
                  </p>
                )}
                {formState === "error" && (
                  <p className="flex items-center gap-2 text-sm text-rose-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Failed to send message. Please reach out via email directly.
                  </p>
                )}
                {formState !== "success" && formState !== "error" && <div />}

                <Magnetic strength={0.2}>
                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-foreground text-background hover:bg-neutral-200 transition-transform active:scale-98 disabled:opacity-50  w-full sm:w-auto"
                  >
                    {formState === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span>Sending Transmission...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Direct Message</span>
                      </>
                    )}
                  </button>
                </Magnetic>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
