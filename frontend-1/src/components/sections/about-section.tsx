"use client";

import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Code2, Brain, Rocket, Users } from "lucide-react";

const ABOUT = {
  description: [
    "Computer Science and Engineering student at SNS College of Technology with internship experience in AI/ML and software development. Experienced in building full-stack applications, real-time systems, AI-powered automation, computer vision, OCR, and LLM integrations using Python, FastAPI, React, and Next.js.",
    "Passionate about scalable backend engineering, developer tools, and practical AI solutions. Whether developing emergency response platforms, model context protocol servers, or Python code visualization engines, I focus on clean system design, API performance, and tangible real-world impact.",
  ],
  highlights: [
    {
      icon: Brain,
      title: "Machine Learning & CV",
      description:
        "Computer vision, NLP pipelines, and latency optimization for real-time edge and server deployments.",
    },
    {
      icon: Code2,
      title: "Full-Stack Architecture",
      description:
        "End-to-end web engineering with TypeScript, Next.js App Router, Python FastAPI, and cloud data stores.",
    },
    {
      icon: Rocket,
      title: "Production Velocity",
      description:
        "From mathematical formulation to tested codebases: modular components, type safety, and automated builds.",
    },
    {
      icon: Users,
      title: "Engineering Rigor",
      description:
        "Thorough testing, clear technical documentation, API design, and cross-disciplinary collaboration.",
    },
  ],
};

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Engineering intelligence at scale."
          description="A systematic approach to building intelligent software systems that run reliably in production environments."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Narrative & Image */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4 text-base sm:text-lg text-foreground/90 leading-relaxed">
              {ABOUT.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Editorial Architectural Visual */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-surface">
              <Image
                src="/images/editorial/griffith-observatory-2006-architecture-closeup.jpg"
                alt="Architectural precision geometry"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale contrast-105 hover:grayscale-0 transition-transform duration-500 hover:scale-[1.02]"
              />
              <div className="absolute bottom-3 left-3 bg-surface-elevated px-2.5 py-1 rounded text-xs text-muted">
                Architectural Form &bull; Precision &bull; Structure
              </div>
            </div>
          </div>

          {/* Right Column: Highlights Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ABOUT.highlights.map((item, i) => (
              <AnimateOnScroll key={item.title} delay={i * 80}>
                <div className="p-6 rounded-xl bg-surface h-full flex flex-col justify-between hover:bg-surface-elevated transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {item.description}
                    </p>
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
