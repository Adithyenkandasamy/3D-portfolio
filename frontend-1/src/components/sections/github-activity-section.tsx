"use client";

import { Suspense, useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { GithubIcon, LeetCodeIcon } from "@/components/ui/icons";
import { getCodingStats } from "@/lib/content";
import {
  ContributionSkeleton,
  ContributionVisualizer,
} from "@/components/github/contribution-visualizer";
import {
  GitPullRequest,
  GitFork,
  ExternalLink,
  Code2,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";

interface RepoItem {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

export function GithubActivitySection() {
  const [repos, setRepos] = useState<RepoItem[]>([
    {
      id: 1,
      name: "3d-portfolio",
      description: "Interactive personal developer portfolio with Next.js App Router, Three.js, and Motion.",
      html_url: "https://github.com/Adithyenkandasamy",
      stargazers_count: 3,
      forks_count: 1,
      language: "TypeScript",
    },
    {
      id: 2,
      name: "Voice-AI-Stream",
      description: "Low latency bidirectional speech chat using FasterWhisper, Ollama & Kokoro TTS.",
      html_url: "https://github.com/Adithyenkandasamy",
      stargazers_count: 8,
      forks_count: 2,
      language: "Python",
    },
    {
      id: 3,
      name: "mcp-server-tools",
      description: "Standardized Model Context Protocol server exposing custom tools for LLMs in Claude Desktop.",
      html_url: "https://github.com/Adithyenkandasamy",
      stargazers_count: 5,
      forks_count: 1,
      language: "Python",
    },
    {
      id: 4,
      name: "Gesture-CV-Controller",
      description: "Real-time hand gesture recognition system for touchless interaction using OpenCV.",
      html_url: "https://github.com/Adithyenkandasamy",
      stargazers_count: 4,
      forks_count: 1,
      language: "Python",
    },
  ]);
  const [isLive, setIsLive] = useState(false);
  const codingData = getCodingStats();

  useEffect(() => {
    let ignore = false;
    async function fetchGithub() {
      try {
        const res = await fetch("/api/github");
        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.repos && json.repos.length > 0) {
            setRepos(json.repos);
            setIsLive(json.source === "live_api");
          }
        }
      } catch {
        // Fallback silently to initial verified repositories
      }
    }
    fetchGithub();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section id="github" className="section bg-surface">
      <div className="container-wide">
        <SectionHeader
          label="Open Source & Practice"
          title="GitHub & Coding Activity"
          description="Verified repositories, algorithmic problem-solving, and continuous engineering cadence."
        />

        <div className="space-y-10">
          {/* GitHub Header Card */}
          <AnimateOnScroll>
            <div className="p-7 md:p-8 rounded-xl bg-background">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0">
                    <GithubIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-foreground flex flex-wrap items-center gap-2">
                      <span className="break-words">Adithyenkandasamy</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface text-foreground shrink-0">
                        {isLive ? "Live API" : "Verified Source"}
                      </span>
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      Full-Stack &amp; AI/ML Engineer &bull; Open-source repositories and research
                    </p>
                  </div>
                </div>

                <a
                  href="https://github.com/Adithyenkandasamy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-transform active:scale-98"
                >
                  <span>View GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3D GitHub Activity Visualizer */}
              <div className="pt-6" data-ui="true">
                <Suspense fallback={<ContributionSkeleton />}>
                  <ContributionVisualizer />
                </Suspense>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Featured Repositories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {repos.slice(0, 4).map((repo, i) => (
              <AnimateOnScroll key={repo.name} delay={i * 70}>
                <a
                  href={repo.html_url || "https://github.com/Adithyenkandasamy"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card card-interactive p-6 flex flex-col justify-between h-full group block"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                        <span className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                          {repo.name}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>

                    <p className="body-sm text-muted-foreground mb-4 line-clamp-2">
                      {repo.description || "Public repository and code exploration."}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted pt-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      {repo.language || "TypeScript"}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitPullRequest className="w-3.5 h-3.5" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks_count}
                    </span>
                  </div>
                </a>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Coding Statistics Platforms Grid */}
          <div className="pt-6">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              <span>Algorithmic Problem Solving &amp; Platform Metrics</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {codingData.platforms.map((p, idx) => (
                <AnimateOnScroll key={p.id} delay={idx * 80}>
                  <div className="p-6 rounded-xl bg-background flex flex-col justify-between h-full hover:bg-surface-elevated transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {p.id === "leetcode" ? (
                            <LeetCodeIcon className="w-5 h-5 text-amber-600" />
                          ) : p.id === "neetcode" ? (
                            <Layers className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Terminal className="w-5 h-5 text-accent" />
                          )}
                          <span className="font-bold text-base text-foreground">{p.platform}</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface text-foreground">
                          {p.source === "live_api" ? "Live API" : "Verified Entry"}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted mb-4 tabular-nums">
                        {Object.entries(p.stats).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                            <span className="font-semibold text-foreground">{String(v)}</span>
                          </div>
                        ))}
                      </div>

                      {p.badges && p.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {p.badges.map((b) => (
                            <span
                              key={b}
                              className="px-2 py-0.5 text-xs rounded bg-border-subtle font-medium text-foreground/80 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-accent" />
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <a
                      href={p.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between text-xs font-semibold text-foreground hover:text-accent pt-2 transition-colors"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
