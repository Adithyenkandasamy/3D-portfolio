"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/* Will be fetched from DB in Phase 2+ */
const FEATURED_PROJECTS = [
  {
    title: "Real-Time Voice Chat Web App",
    description:
      "AI-powered voice chat using Ollama, FasterWhisper & Kokoro with WebSocket — achieved <200ms latency with 95% accuracy.",
    techStack: ["Python", "WebSocket", "Ollama", "FastAPI"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "AI/ML",
  },
  {
    title: "Hand Gesture Control System",
    description:
      "Computer vision system using OpenCV and ML for touchless human-computer interaction via gesture recognition. Recognized 10+ gestures with 92% accuracy.",
    techStack: ["Python", "OpenCV", "TensorFlow", "ML"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "Computer Vision",
  },
  {
    title: "JARVIS-MARK_1",
    description:
      "Personal AI assistant prototype showcasing automation and AI integrations — voice commands, task execution, and smart responses.",
    techStack: ["Python", "AI", "Automation", "NLP"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "AI Assistant",
  },
  {
    title: "MCP Server",
    description:
      "Implemented a stdio-based MCP server in Python, exposing custom tools for LLMs through Claude Desktop.",
    techStack: ["Python", "MCP", "Claude", "LLM"],
    githubUrl: "https://github.com/Adithyenkandasamy",
    category: "Developer Tools",
  },
];

export function ProjectsSection() {
  return (
    <section id="projects" className="section">
      <div className="container-wide">
        <SectionHeader
          label="Projects"
          title="Featured work"
          description="A selection of projects that showcase my skills and interests."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURED_PROJECTS.map((project, i) => (
            <AnimateOnScroll key={project.title} delay={i * 80}>
              <div className="card card-interactive p-6 h-full flex flex-col">
                {/* Category */}
                <span className="badge-accent self-start mb-3">
                  {project.category}
                </span>

                {/* Title */}
                <h3 className="heading-sm text-foreground mb-2">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="body-sm flex-1 mb-4">{project.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs font-medium text-muted bg-border-subtle rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 text-sm text-muted",
                        "hover:text-foreground transition-colors"
                      )}
                    >
                      <GithubIcon className="w-4 h-4" />
                      Source
                    </a>
                  )}
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm text-muted",
                      "hover:text-foreground transition-colors ml-auto"
                    )}
                  >
                    View
                    <ExternalLink className="w-3.5 h-3.5" />
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
