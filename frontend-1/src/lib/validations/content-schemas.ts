import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  title: z.string().min(1, "Title is required"),
  shortBio: z.string().min(1, "Short bio is required"),
  about: z.string().min(1, "About text is required"),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Invalid email format"),
  availability: z.string().min(1, "Availability status is required"),
  avatarUrl: z.string().min(1, "Avatar URL is required"),
  resumePath: z.string().min(1, "Resume path is required"),
  terminalIntro: z.array(z.string()),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

export const ProjectSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  liveUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  highlights: z.array(z.string()).default([]),
});

export const ExperienceSchema = z.object({
  id: z.string().min(1, "ID is required"),
  role: z.string().min(1, "Role is required"),
  organization: z.string().min(1, "Organization is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isCurrent: z.boolean().default(false),
  description: z.string().min(1, "Description is required"),
  highlights: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  id: z.string().min(1, "ID is required"),
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.string().min(1, "Status is required"),
  description: z.string().min(1, "Description is required"),
  courses: z.array(z.string()).default([]),
});

export const SkillItemSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.string().min(1, "Skill level is required"),
  category: z.string().min(1, "Category is required"),
});

export const SkillCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().default(""),
  skills: z.array(SkillItemSchema),
});

export const SkillsDataSchema = z.object({
  categories: z.array(SkillCategorySchema),
});

export const CertificateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  credentialId: z.string().min(1, "Credential ID is required"),
  verificationUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  skills: z.array(z.string()).default([]),
});

export const AchievementSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  impact: z.string().min(1, "Impact statement is required"),
});

export const ResumeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  filePath: z.string().min(1, "File path is required"),
  fileName: z.string().min(1, "File name is required"),
  lastUpdated: z.string().min(1, "Last updated is required"),
  summary: z.string().min(1, "Summary is required"),
  coreHighlights: z.array(z.string()).default([]),
});

export const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  username: z.string().min(1, "Username is required"),
  url: z.string().min(1, "URL is required"),
  description: z.string().default(""),
  icon: z.string().default("link"),
});

export const SiteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  shortTitle: z.string().min(1, "Short title is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  theme: z.string().default("light"),
  audioTrack: z.object({
    title: z.string(),
    artist: z.string(),
    src: z.string(),
  }),
  sections: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      enabled: z.boolean(),
    })
  ),
});

export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
