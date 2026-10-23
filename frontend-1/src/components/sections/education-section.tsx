"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { getEducation } from "@/lib/content";
import { GraduationCap, Calendar, MapPin, BookOpen } from "lucide-react";

export function EducationSection() {
  const educationList = getEducation();

  return (
    <section id="education" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Academic foundation."
          description="Formal degree coursework and foundational engineering background."
        />

        <div className="max-w-4xl space-y-6">
          {educationList.map((edu, index) => (
            <AnimateOnScroll key={edu.id} delay={index * 80}>
              <div className="p-7 sm:p-8 rounded-2xl bg-surface hover:bg-surface-elevated transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{edu.degree}</h3>
                      <p className="text-base font-semibold text-accent mt-0.5">
                        {edu.institution}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-1.5 text-xs text-muted font-medium shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {edu.startDate} - {edu.endDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {edu.location}
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
                  {edu.description}
                </p>

                <div>
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    <span>Relevant Coursework & Studies</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {edu.courses.map((course) => (
                      <span
                        key={course}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-background text-foreground"
                      >
                        {course}
                      </span>
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
