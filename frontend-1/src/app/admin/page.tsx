"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  Trophy,
  FileText,
  Image as ImageIcon,
  Share2,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Music,
} from "lucide-react";
import { MediaUploader } from "@/components/admin/media-uploader";
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
import type { MediaItem } from "@/lib/server-content-store";

type TabId =
  | "overview"
  | "profile"
  | "projects"
  | "experience"
  | "education"
  | "skills"
  | "certificates"
  | "achievements"
  | "resume"
  | "media"
  | "social"
  | "settings";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Content States
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skills, setSkills] = useState<SkillsData | null>(null);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // Modals & Forms
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<CertificateItem | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<AchievementItem | null>(null);

  // Check auth session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/session");
        const json = await res.json();
        setIsAuthenticated(Boolean(json.authenticated));
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch all content once authenticated
  const loadContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setProjects(data.projects || []);
        setExperience(data.experience || []);
        setEducation(data.education || []);
        setSkills(data.skills);
        setCertificates(data.certificates || []);
        setAchievements(data.achievements || []);
        setResume(data.resume);
        setSocialLinks(data.socialLinks || []);
        setSiteSettings(data.siteSettings);
        setMediaList(data.media || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin content:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isAuthenticated) {
      void (async () => {
        try {
          const res = await fetch("/api/admin/content");
          if (res.ok && !ignore) {
            const data = await res.json();
            setProfile(data.profile);
            setProjects(data.projects || []);
            setExperience(data.experience || []);
            setEducation(data.education || []);
            setSkills(data.skills);
            setCertificates(data.certificates || []);
            setAchievements(data.achievements || []);
            setResume(data.resume);
            setSocialLinks(data.socialLinks || []);
            setSiteSettings(data.siteSettings);
            setMediaList(data.media || []);
          }
        } catch (err) {
          console.error("Failed to fetch admin content:", err);
        }
      })();
    }
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  // Flash status message
  const flashStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Login failed");
      }

      setIsAuthenticated(true);
      flashStatus("success", "Welcome to Adithyen K Portfolio Admin Dashboard.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setProfile(null);
  };

  // Generic Save mutation
  const handleSaveContent = async (type: string, data: unknown) => {
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save content");

      flashStatus("success", `${type.toUpperCase()} saved successfully.`);
      await loadContent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save error";
      flashStatus("error", msg);
    }
  };

  // Generic Delete mutation
  const handleDeleteItem = async (type: string, id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/content?type=${type}&id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete item");

      flashStatus("success", `Deleted ${label}.`);
      await loadContent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete error";
      flashStatus("error", msg);
    }
  };

  // Reorder Projects
  const handleReorderProject = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === projects.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const orderedIds = reordered.map((p) => p.id);

    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "projects", ids: orderedIds }),
      });
      if (res.ok) {
        setProjects(reordered);
        flashStatus("success", "Projects reordered successfully.");
      }
    } catch {
      flashStatus("error", "Failed to reorder projects.");
    }
  };

  // Reorder Experience
  const handleReorderExperience = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === experience.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...experience];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const orderedIds = reordered.map((e) => e.id);

    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "experience", ids: orderedIds }),
      });
      if (res.ok) {
        setExperience(reordered);
        flashStatus("success", "Experience items reordered.");
      }
    } catch {
      flashStatus("error", "Failed to reorder experience.");
    }
  };

  // Reorder Certificates
  const handleReorderCertificate = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === certificates.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...certificates];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const orderedIds = reordered.map((c) => c.id);

    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "certificates", ids: orderedIds }),
      });
      if (res.ok) {
        setCertificates(reordered);
        flashStatus("success", "Certificates reordered.");
      }
    } catch {
      flashStatus("error", "Failed to reorder certificates.");
    }
  };

  /* -------------------------------------------------------------
     RENDER: Loading Check
     ------------------------------------------------------------- */
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  /* -------------------------------------------------------------
     RENDER: Login Screen (if unauthorized)
     ------------------------------------------------------------- */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-4 text-foreground">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-elevated p-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground text-background mx-auto mb-4">
            <Lock className="w-6 h-6 text-accent" />
          </div>

          <h1 className="text-xl font-bold text-center tracking-tight text-foreground">
            Adithyen K — Admin CMS
          </h1>
          <p className="text-xs text-muted text-center mt-1 mb-6">
            Enter your credentials to access the portfolio content management dashboard.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-sm"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted">
            <p>Protected by HMAC-SHA256 authenticated server session.</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Local Dev Default: admin / admin_portfolio_2026!
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     RENDER: Authenticated Dashboard Shell
     ------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-foreground flex flex-col">
      {/* Top Admin Navbar */}
      <header className="h-16 bg-surface border-b border-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight block">
              Adithyen K
            </span>
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider">
              Content Management System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-center gap-2 border-b ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Admin Layout: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-surface border-r border-border p-4 shrink-0">
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "profile", label: "Profile", icon: User },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "experience", label: "Experience", icon: Briefcase },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "skills", label: "Skills", icon: Sparkles },
              { id: "certificates", label: "Certificates", icon: Award },
              { id: "achievements", label: "Achievements", icon: Trophy },
              { id: "resume", label: "Resume", icon: FileText },
              { id: "media", label: "Media Library", icon: ImageIcon },
              { id: "social", label: "Social Links", icon: Share2 },
              { id: "settings", label: "Site Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabId)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                    isActive
                      ? "bg-foreground text-background font-semibold shadow-xs"
                      : "text-muted hover:text-foreground hover:bg-border-subtle"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-border/60">
              <Link
                href="/admin/music"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-foreground bg-border-subtle/60 hover:bg-border-subtle transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-semibold">Music Library</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/10 text-foreground">
                  New
                </span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-10 max-w-5xl">
          {/* ========================================================
              TAB: OVERVIEW
             ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-md text-foreground">Dashboard Overview</h2>
                <p className="body-sm text-muted">
                  System health, active content counts, and media integration status.
                </p>
              </div>

              {/* Quick Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-5">
                  <span className="text-xs text-muted font-medium">Projects</span>
                  <p className="text-2xl font-bold text-foreground mt-1">{projects.length}</p>
                </div>
                <div className="card p-5">
                  <span className="text-xs text-muted font-medium">Experience</span>
                  <p className="text-2xl font-bold text-foreground mt-1">{experience.length}</p>
                </div>
                <div className="card p-5">
                  <span className="text-xs text-muted font-medium">Certificates</span>
                  <p className="text-2xl font-bold text-foreground mt-1">{certificates.length}</p>
                </div>
                <div className="card p-5">
                  <span className="text-xs text-muted font-medium">Media Assets</span>
                  <p className="text-2xl font-bold text-foreground mt-1">{mediaList.length}</p>
                </div>
              </div>

              {/* Storage & Cloudinary Status Card */}
              <div className="card p-6 border-l-4 border-l-accent">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Storage & Deployment Architecture
                </h3>
                <div className="space-y-2 text-xs text-muted">
                  <p>
                    • <strong>Text Content:</strong> Saved to verified typed JSON records under{" "}
                    <code className="font-mono bg-border-subtle px-1.5 py-0.5 rounded">/data</code> with atomic file operations and Zod validation.
                  </p>
                  <p>
                    • <strong>Media & Cloudinary:</strong> Authenticated server-side uploads. If Cloudinary credentials (
                    <code className="font-mono">CLOUDINARY_CLOUD_NAME</code>, etc.) are present in <code className="font-mono">.env.local</code>, assets upload directly to Cloudinary; otherwise, local fallback is stored securely in <code className="font-mono">/public/uploads/</code>.
                  </p>
                  <p>
                    • <strong>Production Note:</strong> In production deployments (e.g. Vercel), local server filesystem writes do not persist across serverless instances; external database or Git-backed CMS should be used for multi-user production persistence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: PROFILE
             ======================================================== */}
          {activeTab === "profile" && profile && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-md text-foreground">Profile Information</h2>
                <p className="body-sm text-muted">
                  Manage personal bio, titles, availability, and avatar.
                </p>
              </div>

              <div className="card p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted block mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted block mb-1">
                    Short Bio (Hero)
                  </label>
                  <textarea
                    rows={2}
                    value={profile.shortBio}
                    onChange={(e) => setProfile({ ...profile, shortBio: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted block mb-1">
                    About Section Description
                  </label>
                  <textarea
                    rows={4}
                    value={profile.about}
                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted block mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted block mb-1">
                      Availability Status
                    </label>
                    <input
                      type="text"
                      value={profile.availability}
                      onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                </div>

                {/* Avatar Uploader */}
                <MediaUploader
                  label="Profile Avatar (Image / Cloudinary)"
                  currentUrl={profile.avatarUrl}
                  folder="portfolio/profile"
                  accept="image/*"
                  onUploadSuccess={(url) => setProfile({ ...profile, avatarUrl: url })}
                />

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleSaveContent("profile", profile)}
                    className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: PROJECTS
             ======================================================== */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-md text-foreground">Projects Management</h2>
                  <p className="body-sm text-muted">
                    Create, edit, delete, and reorder showcased projects.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingProject({
                      id: `project-${Date.now()}`,
                      title: "New Project",
                      description: "Project description goes here.",
                      category: "AI & Systems",
                      featured: true,
                      tags: ["Python", "FastAPI"],
                      githubUrl: "https://github.com/Adithyenkandasamy",
                      liveUrl: "",
                      highlights: ["Key feature highlight"],
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects List */}
              <div className="space-y-3">
                {projects.map((p, index) => (
                  <div
                    key={p.id}
                    className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-accent text-[10px]">{p.category}</span>
                        {p.featured && (
                          <span className="text-[10px] font-mono uppercase bg-neutral-200 dark:bg-neutral-800 text-foreground px-2 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {p.title}
                      </h4>
                      <p className="text-xs text-muted line-clamp-1 mt-0.5">
                        {p.description}
                      </p>
                    </div>

                    {/* Actions: Reorder & Edit/Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleReorderProject(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-border-subtle"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorderProject(index, "down")}
                        disabled={index === projects.length - 1}
                        className="p-1.5 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-border-subtle"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingProject(p)}
                        className="p-1.5 text-muted hover:text-foreground rounded hover:bg-border-subtle ml-2"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem("project", p.id, p.title)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded ml-1"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Add Project Modal Form */}
              {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-fade-in">
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-elevated">
                    <h3 className="heading-sm text-foreground mb-4">
                      {editingProject.id ? "Edit Project" : "New Project"}
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">
                          Project Title
                        </label>
                        <input
                          type="text"
                          value={editingProject.title}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, title: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={editingProject.category}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, category: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editingProject.description}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, description: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={editingProject.tags.join(", ")}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold uppercase text-muted block mb-1">
                            GitHub URL
                          </label>
                          <input
                            type="text"
                            value={editingProject.githubUrl}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, githubUrl: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="font-semibold uppercase text-muted block mb-1">
                            Live Demo URL
                          </label>
                          <input
                            type="text"
                            value={editingProject.liveUrl}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, liveUrl: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="featuredProj"
                          checked={editingProject.featured}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, featured: e.target.checked })
                          }
                          className="rounded border-border"
                        />
                        <label htmlFor="featuredProj" className="font-medium text-foreground">
                          Mark as Featured Project on Homepage
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                      <button
                        onClick={() => setEditingProject(null)}
                        className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveContent("project", editingProject);
                          setEditingProject(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                      >
                        Save Project
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: EXPERIENCE
             ======================================================== */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-md text-foreground">Experience</h2>
                  <p className="body-sm text-muted">
                    Manage professional work positions, internships, and key contributions.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingExperience({
                      id: `exp-${Date.now()}`,
                      role: "Software Intern",
                      organization: "Company Name",
                      location: "City, State",
                      startDate: "Month Year",
                      endDate: "Present",
                      isCurrent: true,
                      description: "Role overview...",
                      highlights: ["Key contribution item"],
                      technologies: ["Python", "FastAPI"],
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={exp.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-base font-semibold text-foreground">
                          {exp.role} @ {exp.organization}
                        </h4>
                        <p className="text-xs text-muted font-mono mt-0.5">
                          {exp.startDate} – {exp.endDate} • {exp.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleReorderExperience(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-border-subtle"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReorderExperience(index, "down")}
                          disabled={index === experience.length - 1}
                          className="p-1.5 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-border-subtle"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingExperience(exp)}
                          className="p-1.5 text-muted hover:text-foreground rounded hover:bg-border-subtle ml-2"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("experience", exp.id, exp.role)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="body-sm text-muted-foreground mb-3">{exp.description}</p>

                    <div className="space-y-1 mb-3">
                      {exp.highlights.map((h, i) => (
                        <div key={i} className="text-xs text-muted flex items-start gap-1.5">
                          <span className="text-accent">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[11px] rounded bg-border-subtle text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Add Experience Modal */}
              {editingExperience && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-fade-in">
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-elevated space-y-4 text-xs">
                    <h3 className="heading-sm text-foreground">
                      {editingExperience.id ? "Edit Experience" : "New Experience"}
                    </h3>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Role Title</label>
                      <input
                        type="text"
                        value={editingExperience.role}
                        onChange={(e) =>
                          setEditingExperience({ ...editingExperience, role: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Organization</label>
                      <input
                        type="text"
                        value={editingExperience.organization}
                        onChange={(e) =>
                          setEditingExperience({ ...editingExperience, organization: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">Start Date</label>
                        <input
                          type="text"
                          value={editingExperience.startDate}
                          onChange={(e) =>
                            setEditingExperience({ ...editingExperience, startDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">End Date</label>
                        <input
                          type="text"
                          value={editingExperience.endDate}
                          onChange={(e) =>
                            setEditingExperience({ ...editingExperience, endDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Location</label>
                      <input
                        type="text"
                        value={editingExperience.location}
                        onChange={(e) =>
                          setEditingExperience({ ...editingExperience, location: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Summary</label>
                      <textarea
                        rows={3}
                        value={editingExperience.description}
                        onChange={(e) =>
                          setEditingExperience({ ...editingExperience, description: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">
                        Bullet Points (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={editingExperience.highlights.join("\n")}
                        onChange={(e) =>
                          setEditingExperience({
                            ...editingExperience,
                            highlights: e.target.value.split("\n").filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">
                        Technologies (comma separated)
                      </label>
                      <input
                        type="text"
                        value={editingExperience.technologies.join(", ")}
                        onChange={(e) =>
                          setEditingExperience({
                            ...editingExperience,
                            technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => setEditingExperience(null)}
                        className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveContent("experience", editingExperience);
                          setEditingExperience(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                      >
                        Save Experience
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: EDUCATION
             ======================================================== */}
          {activeTab === "education" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-md text-foreground">Education</h2>
                  <p className="body-sm text-muted">Academic credentials and coursework.</p>
                </div>

                <button
                  onClick={() =>
                    setEditingEducation({
                      id: `edu-${Date.now()}`,
                      degree: "Degree Title",
                      institution: "University / Institute",
                      location: "Location",
                      startDate: "2022",
                      endDate: "2026",
                      status: "Undergraduate",
                      description: "Curriculum overview...",
                      courses: ["Data Structures", "Algorithms"],
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{edu.degree}</h4>
                        <p className="text-xs text-muted font-mono mt-0.5">
                          {edu.institution} • {edu.startDate} – {edu.endDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingEducation(edu)}
                          className="p-1.5 text-muted hover:text-foreground rounded hover:bg-border-subtle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("education", edu.id, edu.degree)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="body-sm text-muted-foreground mb-3">{edu.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {edu.courses.map((c) => (
                        <span key={c} className="px-2 py-0.5 text-[11px] rounded bg-border-subtle text-muted">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Add Education Modal */}
              {editingEducation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-fade-in">
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-elevated space-y-4 text-xs">
                    <h3 className="heading-sm text-foreground">
                      {editingEducation.id ? "Edit Education" : "New Education"}
                    </h3>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Degree</label>
                      <input
                        type="text"
                        value={editingEducation.degree}
                        onChange={(e) =>
                          setEditingEducation({ ...editingEducation, degree: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Institution</label>
                      <input
                        type="text"
                        value={editingEducation.institution}
                        onChange={(e) =>
                          setEditingEducation({ ...editingEducation, institution: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">Start Date</label>
                        <input
                          type="text"
                          value={editingEducation.startDate}
                          onChange={(e) =>
                            setEditingEducation({ ...editingEducation, startDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">End Date</label>
                        <input
                          type="text"
                          value={editingEducation.endDate}
                          onChange={(e) =>
                            setEditingEducation({ ...editingEducation, endDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">
                        Coursework (comma separated)
                      </label>
                      <input
                        type="text"
                        value={editingEducation.courses.join(", ")}
                        onChange={(e) =>
                          setEditingEducation({
                            ...editingEducation,
                            courses: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => setEditingEducation(null)}
                        className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveContent("education", editingEducation);
                          setEditingEducation(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                      >
                        Save Education
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: SKILLS
             ======================================================== */}
          {activeTab === "skills" && skills && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-md text-foreground">Skills & Technical Proficiencies</h2>
                <p className="body-sm text-muted">
                  Update grouped skills and proficiency levels.
                </p>
              </div>

              <div className="space-y-6">
                {skills.categories.map((cat, catIdx) => (
                  <div key={cat.name} className="card p-6">
                    <h3 className="heading-sm text-foreground mb-1">{cat.name}</h3>
                    <p className="text-xs text-muted mb-4">{cat.description}</p>

                    <div className="space-y-3">
                      {cat.skills.map((skill, skillIdx) => (
                        <div key={skillIdx} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => {
                              const updated = { ...skills };
                              updated.categories[catIdx].skills[skillIdx].name = e.target.value;
                              setSkills(updated);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                          />
                          <input
                            type="text"
                            value={skill.level}
                            onChange={(e) => {
                              const updated = { ...skills };
                              updated.categories[catIdx].skills[skillIdx].level = e.target.value;
                              setSkills(updated);
                            }}
                            className="w-28 px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                          />
                          <button
                            onClick={() => {
                              const updated = { ...skills };
                              updated.categories[catIdx].skills.splice(skillIdx, 1);
                              setSkills(updated);
                            }}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const updated = { ...skills };
                          updated.categories[catIdx].skills.push({
                            name: "New Skill",
                            level: "Proficient",
                            category: cat.name,
                          });
                          setSkills(updated);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-accent font-semibold hover:underline mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Skill to {cat.name}</span>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleSaveContent("skills", skills)}
                    className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                  >
                    Save All Skills
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: CERTIFICATES
             ======================================================== */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-md text-foreground">Certifications</h2>
                  <p className="body-sm text-muted">
                    Manage verified course credentials and verification links.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingCertificate({
                      id: `cert-${Date.now()}`,
                      title: "New Certification",
                      issuer: "Issuer Name",
                      issueDate: "2025",
                      credentialId: "CERT-ID-1234",
                      verificationUrl: "https://example.com/verify",
                      skills: ["Skill 1", "Skill 2"],
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manually</span>
                </button>
              </div>

              {/* Direct Certificate Upload Dropzone */}
              <div className="card p-5 border border-dashed border-border bg-surface/50">
                <MediaUploader
                  label="Quick Upload Certificate (PDF or Image)"
                  folder="portfolio/certificates"
                  accept="application/pdf,image/*"
                  onUploadSuccess={async (url, asset) => {
                    const cleanTitle = asset.name
                      .replace(/\.[^/.]+$/, "")
                      .replace(/[-_]/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    const newCert: CertificateItem = {
                      id: `cert-${Date.now()}`,
                      title: cleanTitle || "Verified Certificate",
                      issuer: "Verified Credential",
                      issueDate: String(new Date().getFullYear()),
                      credentialId: `ID-${Date.now().toString().slice(-6)}`,
                      verificationUrl: url,
                      skills: [],
                    };
                    await handleSaveContent("certificate", newCert);
                    setStatusMessage({
                      type: "success",
                      text: `Certificate "${newCert.title}" uploaded and added to portfolio!`,
                    });
                  }}
                />
              </div>

              <div className="space-y-4">
                {certificates.map((cert, index) => (
                  <div key={cert.id} className="card p-5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{cert.title}</h4>
                      <p className="text-xs text-muted font-mono mt-0.5">
                        {cert.issuer} • {cert.issueDate} • ID: {cert.credentialId}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleReorderCertificate(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-border-subtle"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorderCertificate(index, "down")}
                        disabled={index === certificates.length - 1}
                        className="p-1.5 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-border-subtle"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCertificate(cert)}
                        className="p-1.5 text-muted hover:text-foreground rounded hover:bg-border-subtle ml-2"
                        title="Edit Certificate"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem("certificate", cert.id, cert.title)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                        title="Delete Certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Add Certificate Modal */}
              {editingCertificate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-fade-in">
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-elevated space-y-4 text-xs">
                    <h3 className="heading-sm text-foreground">
                      {editingCertificate.id ? "Edit Certificate" : "New Certificate"}
                    </h3>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Title</label>
                      <input
                        type="text"
                        value={editingCertificate.title}
                        onChange={(e) =>
                          setEditingCertificate({ ...editingCertificate, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Issuer</label>
                      <input
                        type="text"
                        value={editingCertificate.issuer}
                        onChange={(e) =>
                          setEditingCertificate({ ...editingCertificate, issuer: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">Issue Date</label>
                        <input
                          type="text"
                          value={editingCertificate.issueDate}
                          onChange={(e) =>
                            setEditingCertificate({ ...editingCertificate, issueDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">Credential ID</label>
                        <input
                          type="text"
                          value={editingCertificate.credentialId}
                          onChange={(e) =>
                            setEditingCertificate({
                              ...editingCertificate,
                              credentialId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Verification URL</label>
                      <input
                        type="text"
                        value={editingCertificate.verificationUrl}
                        onChange={(e) =>
                          setEditingCertificate({
                            ...editingCertificate,
                            verificationUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    {/* Certificate Media Uploader */}
                    <MediaUploader
                      label="Certificate PDF / Image"
                      folder="portfolio/certificates"
                      accept="image/*,application/pdf"
                      onUploadSuccess={(url) =>
                        setEditingCertificate({ ...editingCertificate, verificationUrl: url })
                      }
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => setEditingCertificate(null)}
                        className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveContent("certificate", editingCertificate);
                          setEditingCertificate(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                      >
                        Save Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: ACHIEVEMENTS
             ======================================================== */}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-md text-foreground">Achievements</h2>
                  <p className="body-sm text-muted">
                    Record milestone breakthroughs, hackathons, and systems achievements.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingAchievement({
                      id: `ach-${Date.now()}`,
                      title: "Achievement Title",
                      category: "Systems & Optimization",
                      date: "2025",
                      description: "Milestone description...",
                      impact: "Impact description...",
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Achievement</span>
                </button>
              </div>

              <div className="space-y-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="card p-5 flex items-start justify-between gap-4">
                    <div>
                      <span className="badge-accent text-[10px] mb-1">{ach.category}</span>
                      <h4 className="text-sm font-semibold text-foreground">{ach.title}</h4>
                      <p className="text-xs text-muted mt-1">{ach.description}</p>
                      <p className="text-xs font-medium text-foreground/80 mt-2 font-mono">
                        Impact: {ach.impact}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingAchievement(ach)}
                        className="p-1.5 text-muted hover:text-foreground rounded hover:bg-border-subtle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem("achievement", ach.id, ach.title)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Add Achievement Modal */}
              {editingAchievement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-fade-in">
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-elevated space-y-4 text-xs">
                    <h3 className="heading-sm text-foreground">
                      {editingAchievement.id ? "Edit Achievement" : "New Achievement"}
                    </h3>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Title</label>
                      <input
                        type="text"
                        value={editingAchievement.title}
                        onChange={(e) =>
                          setEditingAchievement({ ...editingAchievement, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">Category</label>
                        <input
                          type="text"
                          value={editingAchievement.category}
                          onChange={(e) =>
                            setEditingAchievement({ ...editingAchievement, category: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="font-semibold uppercase text-muted block mb-1">Date</label>
                        <input
                          type="text"
                          value={editingAchievement.date}
                          onChange={(e) =>
                            setEditingAchievement({ ...editingAchievement, date: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingAchievement.description}
                        onChange={(e) =>
                          setEditingAchievement({
                            ...editingAchievement,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase text-muted block mb-1">Impact</label>
                      <input
                        type="text"
                        value={editingAchievement.impact}
                        onChange={(e) =>
                          setEditingAchievement({ ...editingAchievement, impact: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => setEditingAchievement(null)}
                        className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveContent("achievement", editingAchievement);
                          setEditingAchievement(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                      >
                        Save Achievement
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: RESUME
             ======================================================== */}
          {activeTab === "resume" && resume && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-md text-foreground">Resume Management</h2>
                <p className="body-sm text-muted">
                  Update resume metadata and upload replacement PDF files securely.
                </p>
              </div>

              <div className="card p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted block mb-1">
                      Candidate Name
                    </label>
                    <input
                      type="text"
                      value={resume.name}
                      onChange={(e) => setResume({ ...resume, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted block mb-1">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={resume.title}
                      onChange={(e) => setResume({ ...resume, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted block mb-1">
                    Resume Summary
                  </label>
                  <textarea
                    rows={3}
                    value={resume.summary}
                    onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                  />
                </div>

                {/* Cloudinary Resume PDF Uploader */}
                <MediaUploader
                  label="Upload New Resume (PDF / Cloudinary)"
                  currentUrl={resume.filePath}
                  folder="portfolio/resume"
                  accept="application/pdf"
                  onUploadSuccess={(url, asset) => {
                    setResume({
                      ...resume,
                      filePath: url,
                      fileName: asset.name,
                      lastUpdated: new Date().toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      }),
                    });
                  }}
                />

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleSaveContent("resume", resume)}
                    className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                  >
                    Save Resume Metadata
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: MEDIA LIBRARY
             ======================================================== */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-md text-foreground">Media Library</h2>
                  <p className="body-sm text-muted">
                    Browse and upload Cloudinary and local assets with instant URLs.
                  </p>
                </div>
              </div>

              {/* Upload New Asset Directly */}
              <div className="card p-6">
                <MediaUploader
                  label="Upload Asset to Library"
                  onUploadSuccess={() => {
                    flashStatus("success", "Asset uploaded to media library.");
                    loadContent();
                  }}
                />
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mediaList.map((asset) => (
                  <div key={asset.id} className="card p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-full h-32 rounded-lg bg-border-subtle flex items-center justify-center overflow-hidden mb-3">
                        {asset.type.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : asset.type === "application/pdf" ? (
                          <FileText className="w-10 h-10 text-accent" />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-muted" />
                        )}
                      </div>

                      <p className="text-xs font-semibold text-foreground truncate">{asset.name}</p>
                      <p className="text-[11px] text-muted font-mono">
                        {(asset.size / 1024).toFixed(0)} KB • {asset.provider}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2 mt-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(asset.url);
                          flashStatus("success", "Copied asset URL to clipboard!");
                        }}
                        className="text-[11px] font-mono text-muted hover:text-foreground underline"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => handleDeleteItem("media", asset.id, asset.name)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: SOCIAL LINKS
             ======================================================== */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-md text-foreground">Social Links</h2>
                <p className="body-sm text-muted">Manage profile links across web platforms.</p>
              </div>

              <div className="card p-6 space-y-4">
                {socialLinks.map((link, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => {
                        const copy = [...socialLinks];
                        copy[idx].platform = e.target.value;
                        setSocialLinks(copy);
                      }}
                      className="w-full sm:w-36 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        const copy = [...socialLinks];
                        copy[idx].url = e.target.value;
                        setSocialLinks(copy);
                      }}
                      className="flex-1 w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                    />
                    <button
                      onClick={() => {
                        const copy = [...socialLinks];
                        copy.splice(idx, 1);
                        setSocialLinks(copy);
                      }}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setSocialLinks([
                      ...socialLinks,
                      { platform: "Platform", username: "username", url: "https://", description: "", icon: "link" },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs text-accent font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Social Link</span>
                </button>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleSaveContent("socialLinks", socialLinks)}
                    className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                  >
                    Save Social Links
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: SITE SETTINGS
             ======================================================== */}
          {activeTab === "settings" && siteSettings && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-md text-foreground">Site Settings</h2>
                <p className="body-sm text-muted">
                  Global site title, description, and music player audio track config.
                </p>
              </div>

              <div className="card p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted block mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, siteName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted block mb-1">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    value={siteSettings.tagline}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, tagline: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted block mb-1">
                    Site Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={siteSettings.description}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                  />
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Ambient Audio Track Configuration
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted block mb-1">Track Title</label>
                      <input
                        type="text"
                        value={siteSettings.audioTrack.title}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            audioTrack: { ...siteSettings.audioTrack, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted block mb-1">Audio Source URL</label>
                      <input
                        type="text"
                        value={siteSettings.audioTrack.src}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            audioTrack: { ...siteSettings.audioTrack, src: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleSaveContent("siteSettings", siteSettings)}
                    className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-800"
                  >
                    Save Site Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
