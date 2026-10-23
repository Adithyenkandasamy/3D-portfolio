"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Send, Loader2, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react";
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
      setTimeout(() => setFormState("idle"), 4000);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#1a1918] text-[#eeecea]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.05]">
            Let&apos;s build together.
          </h2>
          <div className="mt-8">
            <a
              href="mailto:adithyen1@gmail.com"
              className="inline-flex items-center gap-2 text-xl sm:text-2xl lg:text-4xl font-semibold text-[#eeecea] hover:text-[#84a98c] transition-colors break-all"
            >
              <span>adithyen1@gmail.com</span>
              <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-8">
          <div className="lg:col-span-5 space-y-4 text-sm text-[#b5b1aa] leading-relaxed">
            <p>
              Available for full-time software engineering roles, AI/ML research projects, and scalable backend implementations.
            </p>
            <p>
              Based in Sathyamangalam, Erode (Tamil Nadu, India). Open to local, hybrid, and remote distributed teams.
            </p>
            <div className="pt-4 flex gap-4 text-sm font-semibold text-white">
              <a
                href="https://github.com/Adithyenkandasamy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#84a98c] transition-colors"
              >
                GitHub &rarr;
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#84a98c] transition-colors"
              >
                LinkedIn &rarr;
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="p-7 sm:p-8 rounded-2xl bg-[#242220] space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-[#eeecea] mb-2"
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
                    className="w-full px-4 py-3 text-sm rounded-lg border border-[#3e3b38] bg-[#1a1918] text-white focus:outline-hidden focus:border-[#84a98c] transition-colors"
                    placeholder="Adithyen K"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-[#eeecea] mb-2"
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
                    className="w-full px-4 py-3 text-sm rounded-lg border border-[#3e3b38] bg-[#1a1918] text-white focus:outline-hidden focus:border-[#84a98c] transition-colors"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold text-[#eeecea] mb-2"
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
                  className="w-full px-4 py-3 text-sm rounded-lg border border-[#3e3b38] bg-[#1a1918] text-white focus:outline-hidden focus:border-[#84a98c] transition-colors"
                  placeholder="Engineering collaboration or opportunity"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-[#eeecea] mb-2"
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
                  className="w-full px-4 py-3 text-sm rounded-lg resize-none border border-[#3e3b38] bg-[#1a1918] text-white focus:outline-hidden focus:border-[#84a98c] transition-colors"
                  placeholder="Details regarding your project, architecture, or timeline..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {formState === "success" && (
                  <p className="flex items-center gap-2 text-sm text-[#84a98c] font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Message delivered successfully.
                  </p>
                )}
                {formState === "error" && (
                  <p className="flex items-center gap-2 text-sm text-red-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Transmission failed. Please reach out via email.
                  </p>
                )}
                {formState !== "success" && formState !== "error" && <div />}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-white text-[#1a1918] hover:bg-neutral-200 transition-transform active:scale-98 disabled:opacity-50"
                >
                  {formState === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Direct Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
