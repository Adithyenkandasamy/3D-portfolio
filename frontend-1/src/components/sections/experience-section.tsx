"use client";

import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { MapPin, Calendar } from "lucide-react";

const EXPERIENCES = [
  {
    organization: "SNS Square Hub",
    role: "Software Engineering Intern",
    employmentType: "Internship",
    location: "Coimbatore, India",
    startDate: "Feb 2026",
    endDate: "Apr 2026",
    description:
      "Developed scalable web applications using Next.js and FastAPI, focusing on clean architecture, API design, and performance optimization.",
    responsibilities: [
      "Engineered full-stack applications with Next.js App Router and FastAPI backend services.",
      "Integrated computer vision, OCR, and multimodal models for high-accuracy document processing pipelines.",
      "Implemented LLM prompting workflows, token streaming, and low-latency API wrappers.",
    ],
    techTags: ["Next.js", "FastAPI", "Computer Vision", "OCR", "LLM APIs", "Python"],
  },
  {
    organization: "Magizh Technologies",
    role: "AI & ML Engineering Intern",
    employmentType: "Internship",
    location: "Sathyamangalam, India",
    startDate: "Jul 2025",
    endDate: "Jul 2025",
    description:
      "Developed and integrated AI/ML models into Python web applications using Flask and FastAPI.",
    responsibilities: [
      "Engineered machine learning pipelines and integrated trained models into web applications.",
      "Implemented computer vision and NLP solutions for real-time document analysis.",
      "Deployed and tested containerized services with focused profiling on model inference times.",
    ],
    techTags: ["Python", "Flask", "FastAPI", "Machine Learning", "NLP", "OpenCV"],
  },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Professional engineering experience."
          description="Internships and industry roles focused on artificial intelligence, systems development, and production software."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {EXPERIENCES.map((exp, i) => (
              <AnimateOnScroll key={i} delay={i * 90}>
                <div className="p-7 sm:p-8 rounded-2xl bg-background hover:bg-surface-elevated transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {exp.role}
                      </h3>
                      <p className="text-base font-semibold text-accent mt-0.5">
                        {exp.organization}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {exp.startDate} - {exp.endDate}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  <p className="text-base text-foreground/90 leading-relaxed mb-6">
                    {exp.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {exp.responsibilities.map((r, ri) => (
                      <li
                        key={ri}
                        className="text-base text-foreground/90 flex items-start gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {exp.techTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs font-medium text-foreground bg-surface rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Right Column: Observational Engineering Plate */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-background">
              <Image
                src="/images/editorial/mount-pleasant-radio-telescope.jpg"
                alt="Mount Pleasant Radio Telescope archival plate"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover grayscale contrast-105 hover:grayscale-0 transition-transform duration-500 hover:scale-[1.02]"
              />
              <div className="absolute bottom-3 left-3 bg-surface-elevated/95 px-3 py-1.5 rounded text-xs text-foreground font-medium">
                Radio Observatory &bull; Telemetry &bull; Systems
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
