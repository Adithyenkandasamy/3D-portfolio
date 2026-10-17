"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { getAchievements } from "@/lib/content";
import { Trophy, Zap, Terminal, Sparkles } from "lucide-react";

export function AchievementsSection() {
  const achievements = getAchievements();

  const getIcon = (category: string) => {
    if (category.toLowerCase().includes("optimization")) {
      return <Zap className="w-5 h-5 text-accent" />;
    }
    if (category.toLowerCase().includes("systems") || category.toLowerCase().includes("protocol")) {
      return <Terminal className="w-5 h-5 text-accent" />;
    }
    return <Trophy className="w-5 h-5 text-accent" />;
  };

  return (
    <section id="achievements" className="section bg-background">
      <div className="container-wide">
        <SectionHeader
          label="Achievements"
          title="Milestones & Impact"
          description="Key technical breakthroughs, system optimizations, and competitive recognitions."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((item, index) => (
            <AnimateOnScroll key={item.id} delay={index * 100}>
              <div className="card p-6 h-full flex flex-col justify-between hover:border-foreground/30 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                      {getIcon(item.category)}
                    </div>
                    <span className="badge-accent text-[11px]">{item.date}</span>
                  </div>

                  <span className="text-xs font-mono uppercase text-muted tracking-wider block mb-1.5">
                    {item.category}
                  </span>
                  <h3 className="heading-sm text-foreground mb-3">{item.title}</h3>
                  <p className="body-sm text-muted mb-4">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-border flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-foreground/80">{item.impact}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
