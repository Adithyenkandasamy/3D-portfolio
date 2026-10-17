export interface ProfileStats {
  label: string;
  value: string;
}

export interface ProfileData {
  name: string;
  displayName: string;
  title: string;
  shortBio: string;
  about: string;
  location: string;
  email: string;
  availability: string;
  avatarUrl: string;
  resumePath: string;
  terminalIntro: string[];
  stats: ProfileStats[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  featured: boolean;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  highlights: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  highlights: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  courses: string[];
}

export interface SkillItem {
  name: string;
  level: string;
  category: string;
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: SkillItem[];
}

export interface SkillsData {
  categories: SkillCategory[];
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  verificationUrl: string;
  skills: string[];
}

export interface AchievementItem {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  impact: string;
}

export interface ResumeData {
  name: string;
  title: string;
  filePath: string;
  fileName: string;
  lastUpdated: string;
  summary: string;
  coreHighlights: string[];
}

export interface SocialLinkItem {
  platform: string;
  username: string;
  url: string;
  description: string;
  icon: string;
}

export interface SiteSettings {
  siteName: string;
  shortTitle: string;
  tagline: string;
  description: string;
  theme: string;
  audioTrack: {
    title: string;
    artist: string;
    src: string;
  };
  sections: Array<{
    id: string;
    label: string;
    enabled: boolean;
  }>;
}

export interface CodingPlatformItem {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  source: "live_api" | "verified_entry";
  stats: Record<string, string | number>;
  badges: string[];
  verified: boolean;
}

export interface CodingStatsData {
  lastUpdated: string;
  platforms: CodingPlatformItem[];
}
