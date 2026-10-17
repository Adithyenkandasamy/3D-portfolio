import { NextResponse } from "next/server";

interface RepoData {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface CacheItem {
  timestamp: number;
  data: {
    user: {
      login: string;
      public_repos: number;
      followers: number;
      following: number;
      avatar_url: string;
      html_url: string;
    };
    repos: RepoData[];
    source: "live_api" | "cached";
  };
}

let memoryCache: CacheItem | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
  const now = Date.now();

  // Return cached data if fresh
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      ...memoryCache.data,
      cached: true,
      cacheAgeSeconds: Math.round((now - memoryCache.timestamp) / 1000),
    });
  }

  const username = "Adithyenkandasamy";
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Adithyen-Portfolio-App",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=8`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      // If rate limited or unavailable, return fallback
      if (memoryCache) {
        return NextResponse.json({ ...memoryCache.data, cached: true });
      }
      return NextResponse.json(
        {
          user: {
            login: username,
            public_repos: 8,
            followers: 12,
            following: 15,
            avatar_url: "https://github.com/Adithyenkandasamy.png",
            html_url: `https://github.com/${username}`,
          },
          repos: [
            {
              id: 1,
              name: "3d-portfolio",
              description: "Interactive personal developer portfolio with Next.js App Router, Three.js, and Motion.",
              html_url: `https://github.com/${username}/3d-portfolio`,
              stargazers_count: 3,
              forks_count: 1,
              language: "TypeScript",
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              name: "Voice-AI-Stream",
              description: "AI conversational speech chat utilizing Ollama, FasterWhisper & Kokoro TTS.",
              html_url: `https://github.com/${username}`,
              stargazers_count: 8,
              forks_count: 2,
              language: "Python",
              updated_at: new Date().toISOString(),
            },
            {
              id: 3,
              name: "mcp-server-tools",
              description: "Model Context Protocol server in Python exposing custom tools for LLMs in Claude Desktop.",
              html_url: `https://github.com/${username}`,
              stargazers_count: 5,
              forks_count: 1,
              language: "Python",
              updated_at: new Date().toISOString(),
            },
            {
              id: 4,
              name: "Gesture-CV-Controller",
              description: "Touchless human-computer interaction system leveraging OpenCV and ML.",
              html_url: `https://github.com/${username}`,
              stargazers_count: 4,
              forks_count: 1,
              language: "Python",
              updated_at: new Date().toISOString(),
            },
          ],
          source: "cached",
          notice: "GitHub rate limit reached; displaying cached verified repositories.",
        },
        { status: 200 }
      );
    }

    const userData = await userRes.json();
    const reposData = await reposRes.json();

    const formattedRepos = reposData.map((r: RepoData) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      language: r.language,
      updated_at: r.updated_at,
    }));

    const result = {
      user: {
        login: userData.login,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      },
      repos: formattedRepos,
      source: "live_api" as const,
    };

    memoryCache = {
      timestamp: now,
      data: result,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "GitHub API request failed";
    if (memoryCache) {
      return NextResponse.json({ ...memoryCache.data, cached: true });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
