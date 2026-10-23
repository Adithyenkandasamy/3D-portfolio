"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Briefcase,
  GraduationCap,
  Trophy,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import type { DbTimelineEntry } from "@/lib/db";

const DEFAULT_TIMELINE_ENTRIES: DbTimelineEntry[] = [
  {
    id: "exp-sns-square-hub",
    title: "AI/ML & Software Developer Intern",
    category: "internship",
    institution: "SNS Square Hub",
    role: "AI/ML Developer",
    start_date: "Feb 2026",
    end_date: "Present",
    is_current: true,
    description: "Developing multimodal computer vision systems, high-speed document OCR pipelines, and real-time backend microservices with FastAPI and Python.",
    responsibilities: [
      "Architecting low-latency OCR inference microservices processing complex document layouts",
      "Building real-time computer vision pipelines for touchless spatial interfaces",
      "Optimizing LLM agent tool calling protocols and structured JSON extraction"
    ],
    achievements: [
      "Deployed edge-optimized inference pipelines with sub-100ms latency",
      "Engineered production-grade FastAPI microservices with connection pooling"
    ],
    technologies: ["Python", "FastAPI", "OpenCV", "MediaPipe", "Docker", "PostgreSQL"],
    external_link: "https://www.linkedin.com/in/adithyen-k",
    order_index: 1,
    is_published: true
  },
  {
    id: "exp-magizh-technologies",
    title: "Full Stack & AI Developer Intern",
    category: "internship",
    institution: "Magizh Technologies",
    role: "Full-Stack & AI Intern",
    start_date: "Jun 2025",
    end_date: "Nov 2025",
    is_current: false,
    description: "Engineered scalable web applications, real-time dispatch systems, and conversational AI integrations with Next.js, FastAPI, and PostgreSQL.",
    responsibilities: [
      "Designed and implemented high-throughput REST APIs and WebSocket communication layers",
      "Built responsive web user interfaces using Next.js App Router and Tailwind CSS",
      "Integrated AI automation workflows using LangChain, Groq, and Redis caching"
    ],
    achievements: [
      "Improved API throughput by 35% with Redis session caching and query optimizations",
      "Delivered multi-tenant full-stack platforms with strict role-based access control"
    ],
    technologies: ["Next.js", "React", "TypeScript", "FastAPI", "PostgreSQL", "Redis"],
    external_link: "https://www.linkedin.com/in/adithyen-k",
    order_index: 2,
    is_published: true
  },
  {
    id: "milestone-cryptora-26",
    title: "1st Place Winner — Cryptora'26 National Hackathon",
    category: "milestone",
    institution: "National Technical Symposium",
    role: "Lead Architect & Developer",
    start_date: "Jan 2026",
    end_date: "Jan 2026",
    is_current: false,
    description: "Won 1st Place out of 100+ competing teams for RESQ, an autonomous emergency response and real-time coordination dispatch system.",
    responsibilities: [
      "Architected end-to-end incident dispatch routing using geospatial indexing",
      "Integrated real-time WebSocket vehicle telematics tracking and priority queueing"
    ],
    achievements: [
      "Secured 1st Prize with unanimous judge acclaim for practical real-world impact",
      "Demonstrated live failover and incident rerouting during final presentation"
    ],
    technologies: ["FastAPI", "Next.js", "WebSockets", "PostgreSQL", "Mapbox"],
    external_link: "https://github.com/Adithyenkandasamy",
    order_index: 3,
    is_published: true
  },
  {
    id: "milestone-code-cubicle",
    title: "Finalist — Code Cubicle 5.0 Hackathon",
    category: "milestone",
    institution: "Microsoft Office, Bengaluru",
    role: "Team Lead & System Architect",
    start_date: "Nov 2025",
    end_date: "Nov 2025",
    is_current: false,
    description: "Selected among top finalists nationwide to build and present intelligent developer tools at Microsoft Bengaluru headquarters.",
    responsibilities: [
      "Engineered an AST-based code analysis and visual execution tracer",
      "Presented system architecture to senior cloud architects at Microsoft"
    ],
    achievements: [
      "Top 10 Finalist nationally at Microsoft Bengaluru campus"
    ],
    technologies: ["TypeScript", "Next.js", "Python", "AST Parser", "FastAPI"],
    external_link: "https://github.com/Adithyenkandasamy",
    order_index: 4,
    is_published: true
  },
  {
    id: "edu-sns-college",
    title: "B.E. in Computer Science and Engineering",
    category: "college",
    institution: "SNS College of Technology",
    role: "Undergraduate Student",
    start_date: "2023",
    end_date: "2027",
    is_current: true,
    description: "Pursuing Bachelor of Engineering with strong focus on Distributed Systems, Artificial Intelligence, Database Management, and Object-Oriented Software Design.",
    responsibilities: [
      "Current CGPA: 7.31 / 10.0",
      "Coursework: Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, Machine Learning"
    ],
    achievements: [
      "Active member of Developer Student Clubs and Technical Organizing Committee",
      "Mentored junior students in full-stack web engineering and Python development"
    ],
    technologies: ["C", "C++", "Java", "Python", "SQL", "Data Structures"],
    external_link: "https://www.linkedin.com/in/adithyen-k",
    order_index: 5,
    is_published: true
  }
];

const CATEGORIES = [
  { id: "all", label: "All Milestones" },
  { id: "internship", label: "Internships & Work" },
  { id: "milestone", label: "Awards & Hackathons" },
  { id: "college", label: "Education" },
];

export function TimelineSection() {
  const [entries, setEntries] = useState<DbTimelineEntry[]>(DEFAULT_TIMELINE_ENTRIES);
  const [activeFilter, setActiveFilter] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);

  // Progressive drawing line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.5"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Fetch live from Neon DB
  useEffect(() => {
    fetch("/api/timeline")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        }
      })
      .catch(() => {});
  }, []);

  const filteredEntries = entries.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "internship") return item.category === "internship" || item.category === "employment";
    if (activeFilter === "milestone") return item.category === "milestone";
    if (activeFilter === "college") return item.category === "college" || item.category === "school";
    return true;
  });

  return (
    <section
      id="timeline"
      className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface/30 scroll-mt-20 border-y border-border relative"
    >
      <div id="experience" className="absolute -top-20" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10">
          <SectionHeader
            title="Education & career timeline."
            description="A chronological record of engineering internships, academic rigor, and competitive achievements."
          />

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === cat.id
                    ? "bg-foreground text-background font-semibold"
                    : "bg-surface hover:bg-surface-elevated text-muted border border-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Track & Cards */}
        <div ref={containerRef} className="relative mt-8">
          {/* Static Background Rail Line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-0.5 bg-border -translate-x-1/2" />

          {/* Dynamic Progress Draw Line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-4 sm:left-1/2 top-4 w-0.5 bg-gradient-to-b from-accent via-accent-blue to-accent-red -translate-x-1/2 origin-top"
          />

          <div className="space-y-12 sm:space-y-16">
            {filteredEntries.map((entry, index) => {
              const isEven = index % 2 === 0;
              const isMilestone = entry.category === "milestone";
              const isEducation = entry.category === "college" || entry.category === "school";

              let markerColor = "bg-accent border-accent/40";
              let badgeColor = "bg-accent/15 text-accent border-accent/30";
              let icon = <Briefcase className="w-3.5 h-3.5" />;

              if (isMilestone) {
                markerColor = "bg-accent-red border-accent-red/40";
                badgeColor = "bg-accent-red/15 text-accent-red border-accent-red/30";
                icon = <Trophy className="w-3.5 h-3.5" />;
              } else if (isEducation) {
                markerColor = "bg-accent-blue border-accent-blue/40";
                badgeColor = "bg-accent-blue/15 text-accent-blue border-accent-blue/30";
                icon = <GraduationCap className="w-3.5 h-3.5" />;
              }

              return (
                <div
                  key={entry.id}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Timeline Center Node */}
                  <div
                    className={`absolute left-4 sm:left-1/2 top-6 -translate-x-1/2 w-8 h-8 rounded-full bg-surface border-2 ${markerColor} flex items-center justify-center text-foreground z-10 shadow-lg`}
                  >
                    {icon}
                  </div>

                  {/* Date Flag for Opposite Side on Desktop */}
                  <div
                    className={`hidden sm:flex sm:w-1/2 px-8 pt-6 ${
                      isEven ? "justify-end text-right" : "justify-start text-left"
                    }`}
                  >
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{entry.start_date} – {entry.end_date}</span>
                      {entry.is_current && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="w-full sm:w-1/2 pl-12 sm:pl-0 sm:px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.5 }}
                      className="p-6 sm:p-7 rounded-2xl bg-surface border border-border hover:border-border/80 transition-colors"
                    >
                      {/* Mobile Date Header */}
                      <div className="flex sm:hidden items-center gap-2 text-xs font-mono text-muted mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{entry.start_date} – {entry.end_date}</span>
                        {entry.is_current && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Header with Role & Category Badge */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground tracking-tight">
                            {entry.title}
                          </h3>
                          <p className="text-sm font-medium text-accent pt-0.5">
                            {entry.institution} &bull; <span className="text-muted">{entry.role}</span>
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${badgeColor}`}
                        >
                          {entry.category}
                        </span>
                      </div>

                      {/* Description Narrative */}
                      <p className="text-sm text-foreground/90 leading-relaxed my-3.5">
                        {entry.description}
                      </p>

                      {/* Responsibilities & Achievements */}
                      {entry.responsibilities && entry.responsibilities.length > 0 && (
                        <div className="space-y-1.5 py-2 border-t border-border/60">
                          {entry.responsibilities.map((resp, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-muted leading-relaxed">
                              <ChevronRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                              <span>{resp}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tech Stack Pills */}
                      {entry.technologies && entry.technologies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-3.5 border-t border-border/60">
                          {entry.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 rounded-md bg-surface-elevated text-xs font-mono text-muted border border-border-subtle"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* External Link */}
                      {entry.external_link && (
                        <div className="pt-3 flex justify-end">
                          <a
                            href={entry.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                          >
                            <span>Verify credential</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
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
