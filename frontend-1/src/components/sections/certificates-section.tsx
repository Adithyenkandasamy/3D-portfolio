"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { getCertificates } from "@/lib/content";
import {
  Award,
  ExternalLink,
  CheckCircle2,
  Eye,
  FileDown,
  X,
  FileText,
} from "lucide-react";
import type { CertificateItem } from "@/types/portfolio";

export function CertificatesSection() {
  const certificates = getCertificates();
  const [viewingCert, setViewingCert] = useState<CertificateItem | null>(null);

  const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);
  const isImage = (url: string) =>
    /\.(jpeg|jpg|png|webp|svg)($|\?)/i.test(url) || url.startsWith("/images/");

  return (
    <section
      id="certificates"
      className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface scroll-mt-20 md:scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Verified Credentials & Technical Proficiencies"
          description="Industry coursework, verified certificates, and cloud credentials backed by Cloudinary storage."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certificates.map((cert, index) => {
            const hasMedia =
              cert.verificationUrl &&
              (isPdf(cert.verificationUrl) || isImage(cert.verificationUrl));

            return (
              <AnimateOnScroll key={cert.id} delay={index * 70}>
                <div className="p-6 rounded-2xl bg-background border border-border/80 flex flex-col justify-between h-full hover:border-accent/40 transition-colors group">
                  <div>
                    {/* Top Row: Icon & Issue Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                        {isPdf(cert.verificationUrl) ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Award className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-muted bg-surface px-2.5 py-1 rounded-md font-mono border border-border/60">
                        {cert.issueDate}
                      </span>
                    </div>

                    {/* Title & Issuer */}
                    <h3 className="text-base font-bold text-foreground mb-1 leading-snug group-hover:text-accent transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-semibold text-muted mb-4 font-mono">
                      {cert.issuer}
                    </p>

                    {/* Skill Tags */}
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {cert.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-[11px] font-mono rounded bg-surface border border-border/60 text-foreground/80"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                      <span>{cert.credentialId}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {hasMedia && (
                        <button
                          type="button"
                          onClick={() => setViewingCert(cert)}
                          className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-accent transition-colors p-1"
                          title="Preview document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="sr-only">Preview</span>
                        </button>
                      )}

                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-accent transition-colors p-1"
                          title={
                            isPdf(cert.verificationUrl)
                              ? "Download / View PDF"
                              : "Verify Credential"
                          }
                        >
                          {isPdf(cert.verificationUrl) ? (
                            <FileDown className="w-3.5 h-3.5" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5" />
                          )}
                          <span className="sr-only">Open document</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>

      {/* Certificate Modal Viewer */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80  animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden ">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-surface shrink-0">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {viewingCert.title}
                </h3>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {viewingCert.issuer} &bull; ID: {viewingCert.credentialId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={viewingCert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingCert(null)}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Media Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-background/50 min-h-[400px]">
              {isPdf(viewingCert.verificationUrl) ? (
                <iframe
                  src={`${viewingCert.verificationUrl}#toolbar=0`}
                  title={viewingCert.title}
                  className="w-full h-[600px] rounded-xl border border-border"
                />
              ) : isImage(viewingCert.verificationUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewingCert.verificationUrl}
                  alt={viewingCert.title}
                  className="max-h-[600px] w-auto rounded-xl object-contain  border border-border"
                />
              ) : (
                <div className="text-center p-8">
                  <Award className="w-12 h-12 text-accent mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    External Credential
                  </p>
                  <a
                    href={viewingCert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold"
                  >
                    <span>Open Verification URL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
