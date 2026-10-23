"use client";

import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const SKILL_DOMAINS = [
  {
    name: "Languages & Core",
    description: "Foundational programming languages and computational problem solving",
    items: [
      { name: "Python", context: "FastAPI, PyTorch, AST Tracing, Automation" },
      { name: "Java, C & C++", context: "OOP, Data Structures & Algorithms" },
      { name: "SQL", context: "PostgreSQL, MySQL, SQLite, Complex Queries" },
      { name: "TypeScript & JavaScript", context: "Next.js App Router, React, Node.js" },
    ],
  },
  {
    name: "AI, Vision & Agent Protocols",
    description: "Computer vision, multimodal models, OCR, and agentic integrations",
    items: [
      { name: "Computer Vision & OCR", context: "OpenCV, Document Processing, Inspection" },
      { name: "LLMs & Multimodal Models", context: "Llama 3.3, Groq, Gemini, Prompt Engineering" },
      { name: "Model Context Protocol (MCP)", context: "Developer Tooling, Google Sheets MCP" },
      { name: "AI Automation & Workflows", context: "n8n, Make.com, WebSockets, Live Streaming" },
    ],
  },
  {
    name: "Backend & Web Architectures",
    description: "High-performance asynchronous frameworks and responsive interfaces",
    items: [
      { name: "FastAPI, Flask & Django", context: "Modular Python Endpoints & Microservices" },
      { name: "Next.js & React", context: "Modern App Router, Server Components" },
      { name: "React Native", context: "Cross-Platform Mobile Application Systems" },
      { name: "REST APIs & WebSockets", context: "Real-time Event Ingestion & Socket.IO" },
    ],
  },
  {
    name: "Databases, Cloud & DevOps",
    description: "Distributed data stores, containerization, and automated CI/CD",
    items: [
      { name: "PostgreSQL, MongoDB & Redis", context: "Relational Persistence & Token Bucket Caching" },
      { name: "SQLAlchemy & Supabase", context: "Python ORM, JWT Authentication & RBAC" },
      { name: "Docker & Linux", context: "Containerized Services & Server Management" },
      { name: "Git & GitHub Actions", context: "Automated Testing, pytest & CI/CD Gates" },
    ],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Technical capabilities and toolchains."
          description="A production-focused stack built for machine learning research, distributed APIs, and performant web systems."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {SKILL_DOMAINS.map((domain, idx) => (
            <AnimateOnScroll key={domain.name} delay={idx * 60}>
              <div className="p-7 rounded-2xl bg-background h-full flex flex-col justify-between hover:bg-surface-elevated transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {domain.name}
                  </h3>
                  <p className="text-sm text-muted mb-6">
                    {domain.description}
                  </p>

                  <div className="space-y-3">
                    {domain.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex flex-col sm:flex-row sm:items-baseline justify-between p-2.5 rounded-lg bg-surface hover:bg-surface-elevated transition-colors gap-1"
                      >
                        <span className="text-sm font-semibold text-foreground">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted">
                          {item.context}
                        </span>
                      </div>
                    ))}
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
