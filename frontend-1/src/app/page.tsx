"use client";

import { useState, useEffect } from "react";
import { CinematicIntro } from "@/components/intro/cinematic-intro";
import { TerminalHero } from "@/components/terminal/terminal-hero";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { EducationSection } from "@/components/sections/education-section";
import { CertificatesSection } from "@/components/sections/certificates-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { GithubActivitySection } from "@/components/sections/github-activity-section";
import { ContactSection } from "@/components/sections/contact-section";
import { FloatingMusicPlayer } from "@/components/music/floating-music-player";
import { PortfolioChat } from "@/components/chat/portfolio-chat";
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
      {/* 1. Cinematic 3D Block Letter Intro Overlay */}
      {!introFinished && (
        <CinematicIntro onComplete={() => setIntroFinished(true)} />
      )}

      {/* 2. Main Portfolio Flow */}
      <div className={introFinished ? "opacity-100 transition-opacity duration-700" : "opacity-0"}>
        {/* Hero with interactive terminal */}
        <TerminalHero />

        {/* About */}
        <AboutSection />

        {/* Skills */}
        <SkillsSection />

        {/* Projects */}
        <ProjectsSection />

        {/* Experience Timeline */}
        <ExperienceSection />

        {/* Education */}
        <EducationSection />

        {/* Certificates */}
        <CertificatesSection />

        {/* Achievements */}
        <AchievementsSection />

        {/* GitHub & Coding Activity */}
        <GithubActivitySection />

        {/* Contact */}
        <ContactSection />
      </div>

      {/* Floating Functional Music Player (Bottom-Right) */}
      <FloatingMusicPlayer />

      {/* Interactive Grok AI Assistant (Bottom-Left) */}
      <PortfolioChat />

      {/* Resume Modal */}
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
