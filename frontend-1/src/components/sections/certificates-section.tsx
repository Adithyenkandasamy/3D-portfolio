"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { getCertificates } from "@/lib/content";
import { Award, ExternalLink, CheckCircle2 } from "lucide-react";

export function CertificatesSection() {
  const certificates = getCertificates();

  return (
    <section id="certificates" className="section bg-surface">
      <div className="container-wide">
        <SectionHeader
          label="Certificates"
          title="Verified credentials"
          description="Specialized industry courses and validated technical proficiencies."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <AnimateOnScroll key={cert.id} delay={index * 100}>
              <div className="card card-interactive p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-muted text-accent-foreground flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs font-mono text-muted bg-border-subtle px-2 py-0.5 rounded">
                      {cert.issueDate}
                    </span>
                  </div>

                  <h3 className="heading-sm text-foreground mb-1.5">{cert.title}</h3>
                  <p className="text-xs font-medium text-muted mb-4">{cert.issuer}</p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cert.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-[11px] font-medium rounded bg-border-subtle text-muted"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    ID: {cert.credentialId}
                  </span>
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-foreground hover:text-accent transition-colors"
                  >
                    Verify
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
