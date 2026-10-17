"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { MapPin, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* Will be fetched from DB in Phase 2+ */
const EXPERIENCES = [
  {
    organization: "SNS Square Hub",
    role: "Software Intern",
    employmentType: "Internship",
    location: "Coimbatore",
    startDate: "Feb 2026",
    endDate: "Apr 2026",
    isCurrent: false,
    description:
      "Developed scalable web applications using Next.js and FastAPI, focusing on clean architecture, API design, and performance optimization.",
    responsibilities: [
      "Built web applications with Next.js and FastAPI for clean architecture and performance",
      "Worked with AI, Computer Vision, OCR, and multimodal models for intelligent document processing",
      "Gained hands-on experience with LLM concepts, tokenization, and prompt engineering",
    ],
    techTags: ["Next.js", "FastAPI", "AI", "Computer Vision", "OCR", "LLM"],
  },
  {
    organization: "Magizh Technologies",
    role: "AI/ML Engineering Intern",
    employmentType: "Internship",
    location: "Sathyamangalam",
    startDate: "Jul 2025",
    endDate: "Jul 2025",
    isCurrent: false,
    description:
      "Developed and integrated AI/ML models into Python web applications using Flask and FastAPI.",
    responsibilities: [
      "Developed and integrated AI/ML models into Python web applications",
      "Implemented computer vision and NLP solutions for real-world business applications",
      "Deployed scalable AI solutions with focus on model optimization and performance",
    ],
    techTags: ["Python", "Flask", "FastAPI", "ML", "Computer Vision", "NLP"],
  },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="section bg-surface">
      <div className="container-wide">
        <SectionHeader
          label="Experience"
          title="Professional journey"
          description="My career path in AI/ML and software development."
        />

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border" />

            {EXPERIENCES.map((exp, i) => (
              <AnimateOnScroll key={i} delay={i * 150}>
                <div className="relative pl-12 md:pl-16 pb-10 last:pb-0">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-2.5 md:left-4.5 top-1.5 w-3 h-3 rounded-full border-2",
                      exp.isCurrent
                        ? "bg-accent border-accent"
                        : "bg-surface border-muted-foreground"
                    )}
                  />

                  <div className="card p-5 md:p-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="heading-sm text-foreground">
                          {exp.role}
                        </h3>
                        <p className="text-sm font-medium text-accent-foreground mt-0.5">
                          {exp.organization}
                        </p>
                      </div>
                      <span className="badge-accent text-xs">
                        {exp.employmentType}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </span>
                    </div>

                    {/* Responsibilities */}
                    <ul className="space-y-1.5 mb-4">
                      {exp.responsibilities.map((r, ri) => (
                        <li
                          key={ri}
                          className="flex items-start gap-2 text-sm text-muted"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {exp.techTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs font-medium text-muted bg-border-subtle rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
