"use client";

import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const FEATURED_PROJECTS = [
  {
    title: "RESQ – Emergency Coordination",
    metric: "Cryptora’26 Winner",
    image: "/images/editorial/cybernetics-library-book-scanner.jpg",
    description:
      "Hackathon-winning emergency platform connecting response crews, hospitals, and dispatchers via real-time coordination, concurrency-safe bed reservations, and AI triage handovers.",
    techStack: ["FastAPI", "React", "PostgreSQL", "Socket.IO", "Groq AI"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "Real-Time & AI Systems",
  },
  {
    title: "OneForAll AI – Inventory Intelligence Service",
    metric: "Google Sheets MCP",
    image: "/images/editorial/cybernetics-library-unknown-sittable-objects.jpg",
    description:
      "AI backend using Model Context Protocol (MCP) to turn Google Sheets into an intelligent inventory assistant with proactive procurement insights and stock risk alerts via Llama 3.3 70B.",
    techStack: ["FastAPI", "Python", "Groq (Llama 3.3)", "MCP", "Supabase"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "Agent Protocols & MCP",
  },
  {
    title: "MagizhCode – DSA Learning Platform",
    metric: "AST Execution Engine",
    image: "/images/editorial/mount-pleasant-radio-telescope.jpg",
    description:
      "Full-stack DSA learning platform with structured roadmaps, progress tracking, and a custom Python execution engine using AST validation and sys.settrace for dynamic code visualization.",
    techStack: ["FastAPI", "React", "TypeScript", "SQLAlchemy", "Python"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "Developer Tools",
  },
  {
    title: "MediCareAI / MediGuide AI",
    metric: "Clinical LLM Analysis",
    image: "/images/editorial/griffith-observatory-2006-architecture-closeup.jpg",
    description:
      "Intelligent healthcare assistant featuring LLM conversational analysis, Redis token-bucket rate limiting, symptom pre-screening, and automated Google Calendar scheduling.",
    techStack: ["FastAPI", "React", "Gemini", "MongoDB", "Redis"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "Healthcare & AI",
  },
];

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Selected production projects and research."
          description="System architectures, computer vision models, and full-stack software built for speed and reliability."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURED_PROJECTS.map((project, i) => (
            <AnimateOnScroll key={project.title} delay={i * 70}>
              <div className="p-7 rounded-2xl bg-surface h-full flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[16/10] mb-6 bg-surface-elevated">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover grayscale contrast-105 group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted mb-3 font-medium">
                    <span>{project.category}</span>
                    <span className="text-foreground font-semibold px-2.5 py-0.5 rounded bg-background">
                      {project.metric}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3 leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-base text-foreground/90 leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-medium text-foreground bg-background rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 text-sm">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-muted hover:text-foreground font-medium transition-colors"
                      >
                        <GithubIcon className="w-4 h-4" />
                        <span>Source Code</span>
                      </a>
                    )}
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-foreground font-semibold hover:text-accent transition-colors ml-auto"
                    >
                      <span>Explore Repository</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
