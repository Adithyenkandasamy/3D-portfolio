"use client";

import { useState, useEffect } from "react";
import { CinematicIntro } from "@/components/intro/cinematic-intro";
import { TerminalHero } from "@/components/terminal/terminal-hero";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { CertificatesSection } from "@/components/sections/certificates-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { GithubActivitySection } from "@/components/sections/github-activity-section";
import { TimelineSection } from "@/components/sections/timeline-section";
import { VisitorCommentsSection } from "@/components/sections/visitor-comments-section";
import { ContactSection } from "@/components/sections/contact-section";
import { FloatingDock } from "@/components/dock/floating-dock";
import { ResumeModal } from "@/components/ui/resume-modal";

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  // Check URL hash for #resume
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#resume") {
        setResumeOpen(true);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <>
      {/* Cinematic Intro Screen */}
      {!introFinished && (
        <CinematicIntro onComplete={() => setIntroFinished(true)} />
      )}

      {/* Main Portfolio Flow */}
      <main className="w-full">
        {/* Hero with interactive terminal */}
        <TerminalHero />

        {/* About */}
        <AboutSection />

        {/* Skills */}
        <SkillsSection />

        {/* Projects */}
        <ProjectsSection />

        {/* Dynamic Career & Education Timeline */}
        <TimelineSection />

        {/* Certificates */}
        <CertificatesSection />

        {/* Achievements */}
        <AchievementsSection />

        {/* GitHub & Coding Activity */}
        <GithubActivitySection />

        {/* Visitor Notes: HEY THERE! */}
        <VisitorCommentsSection />

        {/* Contact */}
        <ContactSection />
      </main>

      {/* Unified Floating Dock (AI Assistant + Music Player) */}
      <FloatingDock />

      {/* Resume Modal */}
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
