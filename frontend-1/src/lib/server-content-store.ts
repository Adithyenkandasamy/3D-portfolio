import "server-only";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import {
  ProfileSchema,
  ProjectSchema,
  ExperienceSchema,
  EducationSchema,
  SkillsDataSchema,
  CertificateSchema,
  AchievementSchema,
  ResumeSchema,
  SocialLinkSchema,
  SiteSettingsSchema,
} from "@/lib/validations/content-schemas";
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

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  provider: "cloudinary" | "local";
  publicId?: string;
}

// Data directory resolution
const DATA_DIR = path.join(process.cwd(), "data");

// Mutex lock map to prevent concurrent writes to the same file
const fileLocks = new Map<string, Promise<void>>();

async function acquireLock(filePath: string): Promise<() => void> {
  while (fileLocks.has(filePath)) {
    await fileLocks.get(filePath);
  }
  let unlock: () => void = () => {};
  const lockPromise = new Promise<void>((resolve) => {
    unlock = () => {
      fileLocks.delete(filePath);
      resolve();
    };
  });
  fileLocks.set(filePath, lockPromise);
  return unlock;
}

/**
 * Safely reads and parses JSON from the /data directory
 */
export async function readDataFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read data file ${fileName}:`, error);
    throw new Error(`Data file ${fileName} could not be read or parsed.`);
  }
}

/**
 * Safely and atomically writes JSON to the /data directory with validation and locking
 */
export async function writeDataFile<T>(
  fileName: string,
  data: T,
  schema?: z.ZodType<T>
): Promise<void> {
  // 1. Validate data schema if provided
  if (schema) {
    const parseResult = schema.safeParse(data);
    if (!parseResult.success) {
      const issues = parseResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new Error(`Validation failed for ${fileName}: ${issues}`);
    }
  }

  const filePath = path.join(DATA_DIR, fileName);
  const tempPath = path.join(DATA_DIR, `${fileName}.${Date.now()}.tmp`);

  // 2. Acquire lock for atomic operation
  const unlock = await acquireLock(filePath);

  try {
    // 3. Serialize with formatting
    const serialized = JSON.stringify(data, null, 2);

    // 4. Write to temporary file first
    await fs.writeFile(tempPath, serialized, "utf-8");

    // 5. Atomic rename to target file
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // Clean up temp file on failure
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore if temp file doesn't exist
    }
    throw err;
  } finally {
    unlock();
  }
}

/* ========================================================
   CONTENT STORE HELPERS
   ======================================================== */

// Profile
export async function getServerProfile(): Promise<ProfileData> {
  return readDataFile<ProfileData>("profile.json");
}

export async function updateServerProfile(data: ProfileData): Promise<ProfileData> {
  await writeDataFile("profile.json", data, ProfileSchema);
  return data;
}

// Projects
export async function getServerProjects(): Promise<ProjectItem[]> {
  return readDataFile<ProjectItem[]>("projects.json");
}

export async function saveServerProject(project: ProjectItem): Promise<ProjectItem[]> {
  ProjectSchema.parse(project);
  const projects = await getServerProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  await writeDataFile("projects.json", projects, z.array(ProjectSchema));
  return projects;
}

export async function deleteServerProject(id: string): Promise<ProjectItem[]> {
  const projects = await getServerProjects();
  const filtered = projects.filter((p) => p.id !== id);
  await writeDataFile("projects.json", filtered, z.array(ProjectSchema));
  return filtered;
}

export async function reorderServerProjects(orderedIds: string[]): Promise<ProjectItem[]> {
  const projects = await getServerProjects();
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const reordered: ProjectItem[] = [];

  for (const id of orderedIds) {
    const item = projectMap.get(id);
    if (item) {
      reordered.push(item);
      projectMap.delete(id);
    }
  }

  // Append any items not explicitly mentioned in orderedIds
  for (const item of projectMap.values()) {
    reordered.push(item);
  }

  await writeDataFile("projects.json", reordered, z.array(ProjectSchema));
  return reordered;
}

// Experience
export async function getServerExperience(): Promise<ExperienceItem[]> {
  return readDataFile<ExperienceItem[]>("experience.json");
}

export async function saveServerExperience(item: ExperienceItem): Promise<ExperienceItem[]> {
  ExperienceSchema.parse(item);
  const list = await getServerExperience();
  const index = list.findIndex((e) => e.id === item.id);

  if (index >= 0) {
    list[index] = item;
  } else {
    list.unshift(item);
  }

  await writeDataFile("experience.json", list, z.array(ExperienceSchema));
  return list;
}

export async function deleteServerExperience(id: string): Promise<ExperienceItem[]> {
  const list = await getServerExperience();
  const filtered = list.filter((e) => e.id !== id);
  await writeDataFile("experience.json", filtered, z.array(ExperienceSchema));
  return filtered;
}

// Education
export async function getServerEducation(): Promise<EducationItem[]> {
  return readDataFile<EducationItem[]>("education.json");
}

export async function saveServerEducation(item: EducationItem): Promise<EducationItem[]> {
  EducationSchema.parse(item);
  const list = await getServerEducation();
  const index = list.findIndex((e) => e.id === item.id);

  if (index >= 0) {
    list[index] = item;
  } else {
    list.unshift(item);
  }

  await writeDataFile("education.json", list, z.array(EducationSchema));
  return list;
}

export async function deleteServerEducation(id: string): Promise<EducationItem[]> {
  const list = await getServerEducation();
  const filtered = list.filter((e) => e.id !== id);
  await writeDataFile("education.json", filtered, z.array(EducationSchema));
  return filtered;
}

// Skills
export async function getServerSkills(): Promise<SkillsData> {
  return readDataFile<SkillsData>("skills.json");
}

export async function updateServerSkills(data: SkillsData): Promise<SkillsData> {
  await writeDataFile("skills.json", data, SkillsDataSchema);
  return data;
}

// Certificates
export async function getServerCertificates(): Promise<CertificateItem[]> {
  return readDataFile<CertificateItem[]>("certificates.json");
}

export async function saveServerCertificate(item: CertificateItem): Promise<CertificateItem[]> {
  CertificateSchema.parse(item);
  const list = await getServerCertificates();
  const index = list.findIndex((c) => c.id === item.id);

  if (index >= 0) {
    list[index] = item;
  } else {
    list.push(item);
  }

  await writeDataFile("certificates.json", list, z.array(CertificateSchema));
  return list;
}

export async function deleteServerCertificate(id: string): Promise<CertificateItem[]> {
  const list = await getServerCertificates();
  const filtered = list.filter((c) => c.id !== id);
  await writeDataFile("certificates.json", filtered, z.array(CertificateSchema));
  return filtered;
}

// Achievements
export async function getServerAchievements(): Promise<AchievementItem[]> {
  return readDataFile<AchievementItem[]>("achievements.json");
}

export async function saveServerAchievement(item: AchievementItem): Promise<AchievementItem[]> {
  AchievementSchema.parse(item);
  const list = await getServerAchievements();
  const index = list.findIndex((a) => a.id === item.id);

  if (index >= 0) {
    list[index] = item;
  } else {
    list.push(item);
  }

  await writeDataFile("achievements.json", list, z.array(AchievementSchema));
  return list;
}

export async function deleteServerAchievement(id: string): Promise<AchievementItem[]> {
  const list = await getServerAchievements();
  const filtered = list.filter((a) => a.id !== id);
  await writeDataFile("achievements.json", filtered, z.array(AchievementSchema));
  return filtered;
}

// Resume
export async function getServerResume(): Promise<ResumeData> {
  return readDataFile<ResumeData>("resume.json");
}

export async function updateServerResume(data: ResumeData): Promise<ResumeData> {
  await writeDataFile("resume.json", data, ResumeSchema);
  return data;
}

// Social Links
export async function getServerSocialLinks(): Promise<SocialLinkItem[]> {
  return readDataFile<SocialLinkItem[]>("social-links.json");
}

export async function updateServerSocialLinks(links: SocialLinkItem[]): Promise<SocialLinkItem[]> {
  await writeDataFile("social-links.json", links, z.array(SocialLinkSchema));
  return links;
}

// Site Settings
export async function getServerSiteSettings(): Promise<SiteSettings> {
  return readDataFile<SiteSettings>("site-settings.json");
}

export async function updateServerSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  await writeDataFile("site-settings.json", settings, SiteSettingsSchema);
  return settings;
}

// Media
export async function getServerMediaList(): Promise<MediaItem[]> {
  try {
    return await readDataFile<MediaItem[]>("media.json");
  } catch {
    return [];
  }
}

export async function recordServerMedia(item: MediaItem): Promise<MediaItem[]> {
  const mediaList = await getServerMediaList();
  mediaList.unshift(item);
  await writeDataFile("media.json", mediaList);
  return mediaList;
}

export async function deleteServerMedia(id: string): Promise<MediaItem[]> {
  const mediaList = await getServerMediaList();
  const filtered = mediaList.filter((m) => m.id !== id);
  await writeDataFile("media.json", filtered);
  return filtered;
}
