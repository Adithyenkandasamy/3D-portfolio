"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { getEducation } from "@/lib/content";
import { GraduationCap, Calendar, MapPin, BookOpen } from "lucide-react";

export function EducationSection() {
  const educationList = getEducation();

  return (
    <section id="education" className="section bg-background">
      <div className="container-wide">
        <SectionHeader
          label="Education"
          title="Academic foundation"
          description="Formal degree coursework and foundational engineering background."
        />

        <div className="max-w-3xl mx-auto space-y-6">
          {educationList.map((edu, index) => (
            <AnimateOnScroll key={edu.id} delay={index * 100}>
              <div className="card p-6 md:p-8 hover:border-foreground/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="heading-sm text-foreground">{edu.degree}</h3>
                      <p className="text-sm font-medium text-muted mt-0.5">
                        {edu.institution}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs font-mono text-muted shrink-0">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {edu.startDate} – {edu.endDate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {edu.location}
                    </span>
                  </div>
                </div>

                <p className="body-sm mb-5 text-muted-foreground">{edu.description}</p>

                {/* Key Coursework Tags */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    Key Focus Coursework
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {edu.courses.map((course) => (
                      <span
                        key={course}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-border-subtle border border-border text-foreground/80"
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
