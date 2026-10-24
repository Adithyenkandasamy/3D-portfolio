"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { SectionHeader } from "@/components/ui/section-header";
import { Brain, Code2, Cpu, Terminal, Sparkles, MapPin, Award } from "lucide-react";

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.35, 1]);
  const color = useTransform(progress, range, ["#A1A1AA", "#F5F5F7"]);

  return (
    <>
      <motion.span
        style={{ opacity, color }}
        className="inline-block transition-colors duration-150"
      >
        {children}
      </motion.span>{" "}
    </>
  );
}

const STATEMENT =
  "I engineer practical AI systems, high-throughput backend microservices, and latency-critical computer vision pipelines. I view machine learning not as isolated research prototypes, but as production-ready software that runs predictably, securely, and with measurable real-world performance.";

const FACTS = [
  {
    icon: Brain,
    label: "Core Specialization",
    value: "AI/ML Systems & Computer Vision",
    detail: "FastAPI, OpenCV, MediaPipe, LLM MCP",
  },
  {
    icon: Code2,
    label: "Full-Stack Architecture",
    value: "Next.js 16, React 19, TypeScript",
    detail: "App Router, SSR, Turbopack, Tailwind CSS",
  },
  {
    icon: Award,
    label: "Competitive Distinction",
    value: "Cryptora'26 1st Place Winner",
    detail: "Emergency incident response platform (RESQ)",
  },
  {
    icon: MapPin,
    label: "Location & Status",
    value: "Sathyamangalam / Coimbatore, India",
    detail: "Available for engineering roles & collaborations",
  },
];

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.4"],
  });

  const words = STATEMENT.split(" ");

  return (
    <section id="about" className="pt-10 sm:pt-14 lg:pt-16 pb-24 sm:pb-32 px-6 sm:px-10 lg:px-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Engineering intelligence at scale."
          description="A systematic discipline for building autonomous systems and resilient web architectures."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-10">
          {/* Left Column: Monumental Scroll-Filled Statement */}
          <div className="lg:col-span-7 space-y-10">
            <div ref={containerRef} className="py-4">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-medium leading-[1.4] tracking-tight select-none">
                {words.map((word, i) => {
                  const start = i / words.length;
                  const end = start + 1 / words.length;
                  return (
                    <Word key={i} progress={scrollYProgress} range={[start, end]}>
                      {word}
                    </Word>
                  );
                })}
              </p>
            </div>

            <p className="text-base sm:text-lg text-muted leading-relaxed">
              Currently completing my B.E. in Computer Science and Engineering at SNS College of
              Technology. Through internships at SNS Square Hub and Magizh Technologies, I have
              designed multimodal OCR extraction engines, touchless computer vision interfaces, and
              concurrency-safe dispatch architectures deployed across cloud environments.
            </p>

            {/* Editorial Visual with Subtle Depth */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-surface border border-border group">
              <Image
                src="/images/editorial/griffith-observatory-2006-architecture-closeup.jpg"
                alt="Architectural precision geometry"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 from-background/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/90 border border-border text-xs font-medium text-muted">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Form &bull; Precision &bull; Architectural Structure</span>
              </div>
            </div>
          </div>

          {/* Right Column: Verified Facts Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="px-4 py-2.5 rounded-xl bg-surface border border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Technical Highlights &amp; Core Focus
              </span>
              <span className="text-xs text-muted">4 pillars</span>
            </div>

            <div className="space-y-3.5">
              {FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="p-5 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border/80 flex items-center justify-center text-accent">
                      <fact.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <span className="text-xs text-muted block">
                        {fact.label}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground leading-snug">
                        {fact.value}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-muted pl-11">{fact.detail}</p>
                </div>
              ))}
            </div>

            {/* Quick highlight block */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <Terminal className="w-4 h-4" />
                <span>Autonomous Agent Readiness</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Proficient in modern agent paradigms including the Model Context Protocol (MCP),
                tool-calling protocols, streaming responses, and low-latency local inference with
                Ollama.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
