"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ExternalLink,
  Layers,
  List,
  Sparkles,
  X,
  Code2,
  CheckCircle2,
  Terminal,
  ArrowUpRight,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { SectionHeader } from "@/components/ui/section-header";
import { getProjects } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/types/portfolio";

const PROJECT_EDITORIAL_IMAGES: Record<string, string> = {
  "resq-emergency": "/images/editorial/cybernetics-library-book-scanner.jpg",
  "oneforall-ai": "/images/editorial/cybernetics-library-unknown-sittable-objects.jpg",
  "magizhcode-dsa": "/images/editorial/mount-pleasant-radio-telescope.jpg",
  "medicare-ai": "/images/editorial/griffith-observatory-2006-architecture-closeup.jpg",
  "satellite-thermal": "/images/editorial/the-wonderful-universe-explorer-the-great-36.jpg",
};

const DEFAULT_IMAGE = "/images/editorial/cybernetics-library-book-scanner.jpg";

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  total: number;
  onSelect: (project: ProjectItem) => void;
}

function PinnedProjectCard({
  project,
  index,
  total,
  onSelect,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const imageSrc = PROJECT_EDITORIAL_IMAGES[project.id] || DEFAULT_IMAGE;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="sticky w-full transition-transform duration-300"
      style={{
        top: `calc(5.5rem + ${index * 24}px)`,
        zIndex: index + 1,
      }}
    >
      <motion.div
        style={{
          transform: !reducedMotion
            ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : "none",
          transition: "transform 150ms ease-out",
        }}
        className={cn(
          "w-full rounded-xl bg-surface border border-border/80 p-6 md:p-10 ",
          "hover:border-accent/40 transition-colors duration-300 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between",
          "min-h-[500px] md:min-h-[540px] relative overflow-hidden group cursor-pointer"
        )}
        onClick={() => onSelect(project)}
      >
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-colors" />

        {/* Left Column: Details */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between h-full z-10">
          <div>
            {/* Top Meta */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-background border border-border text-foreground">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <span className="text-xs font-semibold text-accent tracking-wide uppercase">
                {project.category}
              </span>
              {project.featured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors leading-tight mb-4">
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-sm md:text-base text-muted leading-relaxed mb-6 line-clamp-3">
              {project.description}
            </p>

            {/* Highlights bullets preview */}
            {project.highlights && project.highlights.length > 0 && (
              <ul className="space-y-2 mb-6 hidden sm:block">
                {project.highlights.slice(0, 2).map((highlight, hIdx) => (
                  <li key={hIdx} className="text-xs text-foreground/80 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-background border border-border/80 text-foreground/90 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onSelect(project)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-transform active:scale-95"
              >
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-border bg-background text-foreground hover:bg-surface hover:text-accent transition-colors"
                  aria-label="View GitHub Repository"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
              {project.liveUrl && project.liveUrl !== project.githubUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-border bg-background text-foreground hover:bg-surface hover:text-accent transition-colors"
                  aria-label="View Live Project"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Photo Showcase */}
        <div className="w-full lg:w-1/2 h-64 md:h-80 lg:h-96 relative rounded-xl overflow-hidden bg-surface-elevated border border-border/60 group/image">
          <Image
            src={imageSrc}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover grayscale contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 from-background/80 via-transparent to-transparent opacity-60" />

          {/* Hover overlay hint */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/90  border border-border text-[11px] font-semibold text-foreground flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Explore Architecture</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ProjectsSection() {
  const projects = getProjects();
  const [viewMode, setViewMode] = useState<"showcase" | "list">("showcase");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // List mode mouse tracking for thumbnail preview
  const [hoveredProject, setHoveredProject] = useState<ProjectItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleListMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section id="projects" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 scroll-mt-20 md:scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            title="Selected Production Projects & Systems"
            description="Engineering architectures, concurrency-safe coordination platforms, and low-latency AI agents."
          />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("showcase")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                viewMode === "showcase"
                  ? "bg-foreground text-background "
                  : "text-muted hover:text-foreground"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Showcase</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                viewMode === "list"
                  ? "bg-foreground text-background "
                  : "text-muted hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Index</span>
            </button>
          </div>
        </div>

        {/* 1. PINNED SHOWCASE + ARCHIVE GRID VIEW */}
        {viewMode === "showcase" && (
          <div className="space-y-16">
            {/* Flagship Pinned Projects */}
            <div className="relative space-y-12 pb-8">
              {projects
                .filter((p) => p.featured)
                .map((project, idx, arr) => (
                  <PinnedProjectCard
                    key={project.id}
                    project={project}
                    index={idx}
                    total={arr.length}
                    onSelect={setSelectedProject}
                  />
                ))}
            </div>

            {/* Engineering Archive & Hackathon Deployments */}
            {projects.some((p) => !p.featured) && (
              <div className="pt-10 border-t border-border/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-blue">
                      Engineering Archive &amp; Hackathons
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                      Specialized Prototypes &amp; Competitive Systems
                    </h3>
                  </div>
                  <p className="text-xs text-muted max-w-md">
                    Targeted hackathon builds, computer vision models, and low-latency streaming pipelines developed under competitive constraints.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects
                    .filter((p) => !p.featured)
                    .map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="p-6 rounded-xl bg-surface border border-border hover:border-accent-blue/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-border-subtle text-foreground/80">
                              {project.category}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent-blue transition-colors" />
                          </div>

                          <h4 className="text-lg font-bold text-foreground group-hover:text-accent-blue transition-colors mb-2">
                            {project.title}
                          </h4>

                          <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">
                            {project.description}
                          </p>

                          {project.highlights && project.highlights.length > 0 && (
                            <div className="space-y-1.5 mb-4">
                              {project.highlights.slice(0, 2).map((h, hIdx) => (
                                <div key={hIdx} className="text-[11px] text-foreground/80 flex items-start gap-2">
                                  <span className="text-accent-blue font-mono font-bold">›</span>
                                  <span className="line-clamp-1">{h}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
                            {project.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] font-mono rounded bg-background border border-border/60 text-foreground/70"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. INTERACTIVE LIST INDEX VIEW */}
        {viewMode === "list" && (
          <div
            className="border-t border-border divide-y divide-border relative"
            onMouseMove={handleListMouseMove}
          >
            {projects.map((project, idx) => (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredProject(project)}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() => setSelectedProject(project)}
                className="py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer hover:bg-surface/50 px-4 -mx-4 rounded-xl transition-colors"
              >
                <div className="flex items-start md:items-center gap-4 md:gap-6">
                  <span className="text-xs font-mono text-muted shrink-0 mt-1 md:mt-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
                      {project.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-muted mt-1 max-w-xl truncate">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  <span className="text-xs font-mono text-muted">{project.category}</span>
                  <div className="flex gap-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-background border border-border text-foreground/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Floating Image Preview that follows the cursor in List mode */}
            {hoveredProject && (
              <div
                className="pointer-events-none fixed z-50 w-64 h-40 rounded-xl overflow-hidden border border-border  -translate-x-1/2 -translate-y-1/2 hidden md:block"
                style={{
                  left: mousePos.x,
                  top: mousePos.y,
                }}
              >
                <Image
                  src={PROJECT_EDITORIAL_IMAGES[hoveredProject.id] || DEFAULT_IMAGE}
                  alt={hoveredProject.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. EXPANDED PROJECT ARCHITECTURE MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-background/80 ">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-3xl max-h-[90vh] bg-surface border border-border rounded-xl  overflow-hidden flex flex-col text-foreground relative"
            >
              {/* Modal Top Bar */}
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-border-subtle transition-colors"
                  aria-label="Close project modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                {/* Image Banner */}
                <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden border border-border">
                  <Image
                    src={PROJECT_EDITORIAL_IMAGES[selectedProject.id] || DEFAULT_IMAGE}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-2">
                    Architecture &amp; Overview
                  </h4>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Highlights */}
                {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">
                      Key Engineering Accomplishments
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedProject.highlights.map((h, i) => (
                        <li key={i} className="text-xs sm:text-sm text-foreground flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-2.5">
                    Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-mono font-medium rounded-lg bg-background border border-border text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 border-t border-border bg-background/50 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <span className="text-xs text-muted font-mono">
                  Verified open-source repository
                </span>
                <div className="flex items-center gap-3">
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold hover:bg-surface transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {selectedProject.liveUrl && selectedProject.liveUrl !== selectedProject.githubUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-transform active:scale-95"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
