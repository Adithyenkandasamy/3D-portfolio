import profileJson from "@/data/profile.json";
import projectsJson from "@/data/projects.json";
import experienceJson from "@/data/experience.json";
import educationJson from "@/data/education.json";
import skillsJson from "@/data/skills.json";
import certificatesJson from "@/data/certificates.json";
import achievementsJson from "@/data/achievements.json";
import resumeJson from "@/data/resume.json";
import socialLinksJson from "@/data/social-links.json";
import siteSettingsJson from "@/data/site-settings.json";
import codingStatsJson from "@/data/coding-stats.json";

import type {
  ProfileData,
  ProjectItem,
  ExperienceItem,
  EducationItem,
  SkillsData,
  CertificateItem,
  AchievementItem,
  ResumeData,
  SocialLinkItem,
  SiteSettings,
  CodingStatsData,
} from "@/types/portfolio";

export function getProfile(): ProfileData {
  return profileJson as ProfileData;
}

export function getProjects(): ProjectItem[] {
  return projectsJson as ProjectItem[];
}

export function getFeaturedProjects(): ProjectItem[] {
  return (projectsJson as ProjectItem[]).filter((p) => p.featured);
}

export function getExperience(): ExperienceItem[] {
  return experienceJson as ExperienceItem[];
}

export function getEducation(): EducationItem[] {
  return educationJson as EducationItem[];
}

export function getSkills(): SkillsData {
  return skillsJson as SkillsData;
}

export function getCertificates(): CertificateItem[] {
  return certificatesJson as CertificateItem[];
}

export function getAchievements(): AchievementItem[] {
  return achievementsJson as AchievementItem[];
}

export function getResume(): ResumeData {
  return resumeJson as ResumeData;
}

export function getSocialLinks(): SocialLinkItem[] {
  return socialLinksJson as SocialLinkItem[];
}

export function getSiteSettings(): SiteSettings {
  return siteSettingsJson as SiteSettings;
}

export function getCodingStats(): CodingStatsData {
  return codingStatsJson as unknown as CodingStatsData;
}

export function getAllPortfolioData() {
  return {
    profile: getProfile(),
    projects: getProjects(),
    experience: getExperience(),
    education: getEducation(),
    skills: getSkills(),
    certificates: getCertificates(),
    achievements: getAchievements(),
    resume: getResume(),
    socialLinks: getSocialLinks(),
    siteSettings: getSiteSettings(),
    codingStats: getCodingStats(),
  };
}
