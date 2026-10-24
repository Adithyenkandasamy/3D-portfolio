"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SectionHeader } from "@/components/ui/section-header";
import { MapPin, Calendar, Briefcase, CheckCircle2 } from "lucide-react";
import { defaultSpring, easeOutExpo } from "@/lib/motion";

const EXPERIENCES = [
  {
    organization: "SNS Square Hub",
    role: "Software Engineering Intern",
    employmentType: "Internship",
    location: "Coimbatore, India",
    startDate: "Feb 2026",
    endDate: "Apr 2026",
    description:
      "Engineered full-stack and machine learning platforms with Next.js App Router and FastAPI, focusing on multimodal AI and low-latency API architecture.",
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.6"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="experience"
      className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface/40 scroll-mt-20 border-y border-border/50"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Professional engineering experience."
          description="Verified industry internships focused on artificial intelligence, backend microservices, and production software."
        />

        {/* Timeline Container */}
        <div ref={containerRef} className="relative mt-16 max-w-5xl mx-auto">
          {/* Static Background Guideline */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] -translate-x-1/2 bg-border/60" />

          {/* Dynamic Scroll-Drawn Timeline Line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-4 md:left-1/2 top-4 w-[2px] -translate-x-1/2 from-accent via-accent to-accent/20 rounded-full"
          />

          <div className="space-y-12 md:space-y-16">
            {EXPERIENCES.map((exp, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={exp.organization}
                  className="relative flex flex-col md:flex-row items-start md:items-center w-full"
                >
                  {/* Central Timeline Node Indicator */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-accent flex items-center justify-center z-10 [0_0_16px_rgba(124,92,255,0.4)]">
                    <Briefcase className="w-3.5 h-3.5 text-accent" />
                  </div>

                  {/* Alternating Content Layout */}
                  <div
                    className={`w-full md:w-1/2 pl-12 md:pl-0 ${
                      isEven ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12"
                    }`}
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: isEven ? -40 : 40,
                        scale: 0.96,
                      }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                      }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.65, ease: easeOutExpo }}
                      className="p-6 sm:p-8 rounded-xl bg-surface border border-border hover:border-accent/40  transition-colors text-left group"
                    >
                      {/* Meta header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold text-accent capitalize px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/25">
                          {exp.employmentType}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          <span>
                            {exp.startDate} &ndash; {exp.endDate}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-foreground">
                        {exp.role}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium mt-1 mb-4">
                        <span className="font-semibold text-accent">{exp.organization}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <MapPin className="w-3 h-3" />
                          {exp.location}
                        </span>
                      </div>

                      <p className="text-sm text-muted leading-relaxed mb-5">
                        {exp.description}
                      </p>

                      {/* Responsibilities */}
                      <ul className="space-y-2 mb-6 text-xs text-foreground/90">
                        {exp.responsibilities.map((r, ri) => (
                          <li key={ri} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                            <span className="leading-relaxed">{r}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Tech stack badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                        {exp.techTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 text-[11px] font-medium text-foreground bg-surface-elevated border border-border rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
