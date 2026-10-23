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
    <section id="achievements" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Technical milestones and tangible impact."
          description="Key breakthroughs, latency optimizations, and recognized engineering implementations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item, index) => (
            <AnimateOnScroll key={item.id} delay={index * 80}>
              <div className="p-7 rounded-2xl bg-surface h-full flex flex-col justify-between hover:bg-surface-elevated transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                      {getIcon(item.category)}
                    </div>
                    <span className="text-xs font-semibold text-muted bg-background px-2.5 py-1 rounded">
                      {item.date}
                    </span>
                  </div>

                  <span className="text-xs font-medium text-muted block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-6">{item.description}</p>
                </div>

                <div className="pt-4 flex items-start gap-2.5 bg-background/50 p-3 rounded-xl">
                  <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-foreground">{item.impact}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
