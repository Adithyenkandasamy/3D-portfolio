import "server-only";
import { getDb, getDbContent, setDbContent } from "@/lib/db";
import { readDataFile, writeDataFile } from "@/lib/server-content-store";
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
} from "@/types/portfolio";

export interface ContentRepository {
  getProfile(): Promise<ProfileData>;
  getProjects(publishedOnly?: boolean): Promise<ProjectItem[]>;
  getExperience(publishedOnly?: boolean): Promise<ExperienceItem[]>;
  getEducation(publishedOnly?: boolean): Promise<EducationItem[]>;
  getSkills(): Promise<SkillsData>;
  getCertificates(publishedOnly?: boolean): Promise<CertificateItem[]>;
  getAchievements(publishedOnly?: boolean): Promise<AchievementItem[]>;
  getResume(): Promise<ResumeData>;
  getSocialLinks(): Promise<SocialLinkItem[]>;
  getSiteSettings(): Promise<SiteSettings>;
  updateSection<T>(key: string, data: T): Promise<boolean>;
}

export class SqlContentRepository implements ContentRepository {
  async getProfile(): Promise<ProfileData> {
    return readDataFile<ProfileData>("profile.json");
  }

  async getProjects(publishedOnly = true): Promise<ProjectItem[]> {
    const projects = await readDataFile<ProjectItem[]>("projects.json");
    if (!publishedOnly) return projects;
    // Projects without an explicit published: false are considered published
    return projects.filter((p) => (p as unknown as { published?: boolean }).published !== false);
  }

  async getExperience(publishedOnly = true): Promise<ExperienceItem[]> {
    const list = await readDataFile<ExperienceItem[]>("experience.json");
    if (!publishedOnly) return list;
    return list.filter((e) => (e as unknown as { published?: boolean }).published !== false);
  }

  async getEducation(publishedOnly = true): Promise<EducationItem[]> {
    const list = await readDataFile<EducationItem[]>("education.json");
    if (!publishedOnly) return list;
    return list.filter((e) => (e as unknown as { published?: boolean }).published !== false);
  }

  async getSkills(): Promise<SkillsData> {
    return readDataFile<SkillsData>("skills.json");
  }

  async getCertificates(publishedOnly = true): Promise<CertificateItem[]> {
    const list = await readDataFile<CertificateItem[]>("certificates.json");
    if (!publishedOnly) return list;
    return list.filter((c) => (c as unknown as { published?: boolean }).published !== false);
  }

  async getAchievements(publishedOnly = true): Promise<AchievementItem[]> {
    const list = await readDataFile<AchievementItem[]>("achievements.json");
    if (!publishedOnly) return list;
    return list.filter((a) => (a as unknown as { published?: boolean }).published !== false);
  }

  async getResume(): Promise<ResumeData> {
    return readDataFile<ResumeData>("resume.json");
  }

  async getSocialLinks(): Promise<SocialLinkItem[]> {
    return readDataFile<SocialLinkItem[]>("social-links.json");
  }

  async getSiteSettings(): Promise<SiteSettings> {
    return readDataFile<SiteSettings>("site-settings.json");
  }

  async updateSection<T>(key: string, data: T): Promise<boolean> {
    const fileName = `${key.replace(/_/g, "-")}.json`;
    try {
      await writeDataFile(fileName, data);
      return true;
    } catch (err) {
      console.error(`[ContentRepository] Failed to update section ${key}:`, err);
      return false;
    }
  }
}

// Global singleton instance
export const contentRepository: ContentRepository = new SqlContentRepository();
