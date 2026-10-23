"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { getCertificates } from "@/lib/content";
import { Award, ExternalLink, CheckCircle2 } from "lucide-react";

export function CertificatesSection() {
  const certificates = getCertificates();

  return (
    <section id="certificates" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Verified credentials and technical proficiencies."
          description="Industry coursework and certifications in machine learning, algorithms, and cloud tools."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certificates.map((cert, index) => (
            <AnimateOnScroll key={cert.id} delay={index * 80}>
              <div className="p-7 rounded-2xl bg-background flex flex-col justify-between h-full hover:bg-surface-elevated transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs font-semibold text-muted bg-surface px-2.5 py-1 rounded">
                      {cert.issueDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1">{cert.title}</h3>
                  <p className="text-sm font-semibold text-accent mb-4">{cert.issuer}</p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cert.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-xs font-medium rounded bg-surface text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>ID: {cert.credentialId}</span>
                  </span>
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-accent transition-colors"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
