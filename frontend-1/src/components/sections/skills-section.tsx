"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Sparkles, Terminal } from "lucide-react";

const SKILL_DOMAINS = [
  {
    name: "Full-Stack Engineering",
    description: "Production web applications, async backend services, and type-safe systems",
    accent: "text-accent",
    items: [
      { name: "Next.js & React 19", context: "App Router, SSR, Server Components", project: "Portfolio & RESQ" },
      { name: "FastAPI & Python", context: "High-throughput async REST endpoints", project: "OneForAll & MediCare" },
      { name: "TypeScript & JavaScript", context: "Strict contracts, React Native, UI state", project: "MagizhCode" },
      { name: "REST APIs & WebSockets", context: "Real-time dispatch & Socket.IO streams", project: "RESQ" },
    ],
  },
  {
    name: "AI & Machine Learning",
    description: "Computer vision, multimodal LLM pipelines, and Model Context Protocol",
    accent: "text-accent-blue",
    items: [
      { name: "Computer Vision & OCR", context: "OpenCV, contour detection, damage assessment", project: "Auto-Insurance CV" },
      { name: "LLMs & Multimodal Models", context: "Groq Llama 3.3 70B, Google Gemini", project: "OneForAll AI" },
      { name: "Model Context Protocol (MCP)", context: "Tool agents & Google Sheets automation", project: "OneForAll AI" },
      { name: "Voice & Speech Engines", context: "FasterWhisper, Kokoro TTS, Live Audio", project: "Voice Assistant" },
    ],
  },
  {
    name: "Infrastructure & Deployment",
    description: "Containerization, cloud infrastructure, and automated quality gates",
    accent: "text-foreground",
    items: [
      { name: "Docker Containerization", context: "Isolated microservice environments", project: "Production Stacks" },
      { name: "Linux Administration", context: "Systemd services, bash automation, permissions", project: "Server Ops" },
      { name: "GitHub Actions CI/CD", context: "Automated linting, pytest & quality gates", project: "All Repos" },
      { name: "Cloud Platforms", context: "Vercel, GCP, DigitalOcean, Supabase", project: "Cloud Deployments" },
    ],
  },
  {
    name: "Data & Streaming Systems",
    description: "Relational persistence, event-driven streaming, and caching layers",
    accent: "text-accent-red",
    items: [
      { name: "PostgreSQL & Supabase", context: "Neon serverless DB, relations & auth", project: "Portfolio & RESQ" },
      { name: "Redis Caching & Limits", context: "Distributed token bucket rate limiting", project: "MediCareAI" },
      { name: "Real-Time Streaming", context: "Pathway reactive engine & telemetry", project: "Microsoft Finalist" },
      { name: "SQLAlchemy & ORMs", context: "Schema modeling, migrations, session pooling", project: "MagizhCode" },
    ],
  },
];

const MARQUEE_ROW_1 = [
  "Python (Advanced)",
  "FastAPI Microservices",
  "Next.js 16 App Router",
  "React 19",
  "Computer Vision & OpenCV",
  "MediaPipe Gesture Tracking",
  "Model Context Protocol (MCP)",
  "Groq Llama 3.3 70B",
  "PyTorch Deep Learning",
  "PostgreSQL (Neon Serverless)",
];

const MARQUEE_ROW_2 = [
  "Docker Containerization",
  "TypeScript",
  "Linux Server Administration",
  "Redis Token Rate Limiting",
  "Google Cloud Platform",
  "GitHub Actions CI/CD",
  "Tailwind CSS v4",
  "Socket.IO Real-Time",
  "FasterWhisper Voice Pipeline",
  "Kokoro Neural TTS",
];

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface/50 scroll-mt-20 border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Technical capabilities and toolchains."
          description="A production-focused stack built for machine learning systems, distributed APIs, and performant web applications."
        />

        {/* Grouped Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12 mb-16">
          {SKILL_DOMAINS.map((domain, idx) => (
            <AnimateOnScroll key={domain.name} delay={idx * 60}>
              <div className="p-7 sm:p-8 rounded-xl bg-surface border border-border h-full flex flex-col justify-between hover:border-accent/40 transition-colors  group">
                <div>
                  <h3 className={`text-xl font-bold text-foreground mb-1 group-hover:${domain.accent} transition-colors flex items-center justify-between`}>
                    <span>{domain.name}</span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-border-subtle text-muted">
                      {domain.items.length} toolchains
                    </span>
                  </h3>
                  <p className="text-sm text-muted mb-6">
                    {domain.description}
                  </p>

                  <div className="space-y-2.5">
                    {domain.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface-elevated/70 border border-border/60 hover:border-accent/40 transition-colors gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {item.name}
                            </span>
                            {item.project && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-border text-foreground/80">
                                {item.project}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-muted block sm:inline">
                            {item.context}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Opposing Infinite Marquee Rows */}
        <div className="space-y-4 pt-6 border-t border-border/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-accent" />
              Verified Stack Stream &bull; Real Toolchains
            </span>
            <span className="text-[11px] font-mono text-muted hidden sm:inline">Hover to pause</span>
          </div>

          {/* Masked Marquee Container */}
          <div className="relative overflow-hidden py-1">
            {/* Gradient edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 from-surface via-surface/80 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 from-surface via-surface/80 to-transparent z-10" />

            {/* Row 1: Leftward Marquee */}
            <div className="animate-marquee-left flex gap-3 mb-3">
              {[...MARQUEE_ROW_1, ...MARQUEE_ROW_1].map((tech, i) => (
                <div
                  key={`r1-${i}`}
                  className="px-4 py-2 rounded-xl bg-surface-elevated border border-border hover:border-accent/60 text-xs font-mono text-foreground whitespace-nowrap  hover:-translate-y-1 transition-transform cursor-default flex items-center gap-2 group"
                >
                  <Sparkles className="w-3 h-3 text-accent group-hover:rotate-45 transition-transform" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>

            {/* Row 2: Rightward Marquee */}
            <div className="animate-marquee-right flex gap-3">
              {[...MARQUEE_ROW_2, ...MARQUEE_ROW_2].map((tech, i) => (
                <div
                  key={`r2-${i}`}
                  className="px-4 py-2 rounded-xl bg-surface-elevated border border-border hover:border-accent/60 text-xs font-mono text-foreground whitespace-nowrap  hover:-translate-y-1 transition-transform cursor-default flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
