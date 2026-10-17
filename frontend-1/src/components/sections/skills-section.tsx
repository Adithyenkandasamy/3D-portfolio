"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { cn } from "@/lib/utils";

/* Will be fetched from DB in Phase 2+ */
const SKILL_CATEGORIES = [
  {
    name: "Languages",
    skills: [
      { name: "Python", level: 95 },
      { name: "JavaScript", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "SQL", level: 80 },
    ],
  },
  {
    name: "Frontend",
    skills: [
      { name: "React", level: 90 },
      { name: "Next.js", level: 88 },
      { name: "Tailwind CSS", level: 92 },
      { name: "HTML/CSS", level: 95 },
    ],
  },
  {
    name: "Backend & AI/ML",
    skills: [
      { name: "FastAPI", level: 88 },
      { name: "Flask", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "TensorFlow", level: 82 },
    ],
  },
  {
    name: "Tools & Infrastructure",
    skills: [
      { name: "Git", level: 92 },
      { name: "Docker", level: 78 },
      { name: "MongoDB", level: 80 },
      { name: "PostgreSQL", level: 82 },
    ],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="section bg-surface">
      <div className="container-wide">
        <SectionHeader
          label="Skills"
          title="Technical expertise"
          description="Technologies and tools I use to bring ideas to life."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SKILL_CATEGORIES.map((category, ci) => (
            <AnimateOnScroll key={category.name} delay={ci * 100}>
              <div className="card p-6">
                <h3 className="heading-sm text-foreground mb-5">
                  {category.name}
                </h3>
                <div className="space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {skill.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out",
                            skill.level >= 90
                              ? "bg-accent"
                              : skill.level >= 80
                              ? "bg-foreground/70"
                              : "bg-muted-foreground"
                          )}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
