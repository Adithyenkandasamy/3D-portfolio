"use client";

import { useState } from "react";
import { getResume } from "@/lib/content";
import { FileDown, X, CheckCircle, ExternalLink } from "lucide-react";

export function ResumeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const resume = getResume();
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloadStarted(true);
    // Trigger download or opening of resume.pdf
    const link = document.createElement("a");
    link.href = resume.filePath;
    link.download = resume.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl shadow-elevated w-full max-w-lg p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-muted hover:text-foreground hover:bg-border-subtle transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
            <FileDown className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="heading-sm text-foreground">{resume.name} — Resume</h3>
            <p className="text-xs text-muted font-mono">Last updated: {resume.lastUpdated}</p>
          </div>
        </div>

        <p className="body-sm mb-6 text-foreground/80">{resume.summary}</p>

        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Core Competency Highlights
          </h4>
          {resume.coreHighlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-muted">
              <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>{downloadStarted ? "Downloading..." : "Download Resume (PDF)"}</span>
          </button>
          <a
            href={resume.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-medium text-muted hover:text-foreground hover:bg-border-subtle transition-colors"
          >
            <span>Preview in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
