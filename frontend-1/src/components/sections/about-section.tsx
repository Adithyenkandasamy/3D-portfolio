"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Code2, Brain, Rocket, Users } from "lucide-react";

/* Will be fetched from DB in Phase 2+ */
const ABOUT = {
  description: `I'm an AI/ML engineer and full-stack developer passionate about turning complex machine learning models into production-ready products. With hands-on experience in computer vision, NLP, and web development, I bridge the gap between research and real-world applications.

I specialize in Python, Next.js, and building intelligent systems — from voice-powered AI assistants to gesture recognition engines. I believe great software is both powerful and elegant.`,
  highlights: [
    {
      icon: Brain,
      title: "AI/ML Focus",
      description:
        "Computer vision, NLP, and model optimization for production deployment",
    },
    {
      icon: Code2,
      title: "Full-Stack",
      description:
        "End-to-end development with Python, React, Next.js, and modern cloud tools",
    },
    {
      icon: Rocket,
      title: "Ship Fast",
      description:
        "From prototype to production — clean architecture with rapid iteration",
    },
    {
      icon: Users,
      title: "Collaborative",
      description:
        "Cross-functional teamwork, clear communication, and agile mindset",
    },
  ],
};

export function AboutSection() {
  return (
    <section id="about" className="section">
      <div className="container-wide">
        <SectionHeader
          label="About"
          title="Crafting intelligent software"
          description="Building at the intersection of artificial intelligence and modern web development."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Text */}
          <AnimateOnScroll>
            <div className="space-y-4">
              {ABOUT.description.split("\n\n").map((p, i) => (
                <p key={i} className="body-md leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ABOUT.highlights.map((item, i) => (
              <AnimateOnScroll key={item.title} delay={i * 100}>
                <div className="card p-5 h-full">
                  <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[0.8125rem] text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
