"use client";

import { useCallback, useEffect, useState } from "react";
import type { GitHubContributionsData } from "@/lib/github/contributions";

type ContributionsErrorCode =
  | "not_configured"
  | "rate_limited"
  | "invalid_response"
  | "invalid_year"
  | "unavailable"
  | "network";

export type GitHubContributionsState =
  | { status: "loading" }
  | {
      status: "ready";
      data: GitHubContributionsData;
      cached: boolean;
      stale: boolean;
    }
  | {
      status: "unavailable";
      error: string;
      code: ContributionsErrorCode;
    };

interface ContributionsResponse {
  ok?: boolean;
  data?: GitHubContributionsData;
  cached?: boolean;
  stale?: boolean;
  error?: string;
  code?: ContributionsErrorCode;
}

const REQUEST_TIMEOUT_MS = 12000;

function sameYears(current: number[], next: number[]): boolean {
  return (
    current.length === next.length &&
    current.every((year, index) => year === next[index])
  );
}

const DEFAULT_YEAR = new Date().getFullYear();
const yearCache = new Map<
  number,
  { data: GitHubContributionsData; cached: boolean; stale: boolean }
>();

export function useGitHubContributions(
  year: number,
  onInvalidYear?: (fallbackYear: number) => void
) {
  const currentYear = DEFAULT_YEAR;
  const cachedYear = yearCache.get(year);
  const [state, setState] = useState<GitHubContributionsState>(() =>
    cachedYear
      ? {
          status: "ready",
          data: cachedYear.data,
          cached: cachedYear.cached,
          stale: cachedYear.stale,
        }
      : { status: "loading" }
  );
  const [availableYears, setAvailableYears] = useState<number[]>(() =>
    cachedYear ? cachedYear.data.availableYears : [DEFAULT_YEAR]
  );
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    yearCache.delete(year);
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, [year]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/github/contributions?year=${encodeURIComponent(String(year))}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );

        let payload: ContributionsResponse | null = null;
        try {
          payload = (await response.json()) as ContributionsResponse;
        } catch {
          payload = null;
        }

        if (cancelled) return;

        if (!response.ok || !payload?.ok || !payload.data) {
          if (
            payload?.code === "invalid_year" &&
            year !== currentYear &&
            onInvalidYear
          ) {
            onInvalidYear(currentYear);
            return;
          }

          setState({
            status: "unavailable",
            error:
              payload?.error ??
              "GitHub contribution data is temporarily unavailable.",
            code: payload?.code ?? "unavailable",
          });
          return;
        }

        setAvailableYears((current) =>
          sameYears(current, payload.data!.availableYears)
            ? current
            : payload.data!.availableYears
        );
        yearCache.set(year, {
          data: payload.data,
          cached: Boolean(payload.cached),
          stale: Boolean(payload.stale),
        });
        setState({
          status: "ready",
          data: payload.data,
          cached: Boolean(payload.cached),
          stale: Boolean(payload.stale),
        });
      } catch {
        if (cancelled) return;
        const timedOut = controller.signal.aborted;
        setState({
          status: "unavailable",
          error: timedOut
            ? "GitHub took too long to respond. Please try again."
            : "Unable to reach GitHub contribution data right now.",
          code: "network",
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    load();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt, currentYear, onInvalidYear, year]);

  return { state, retry, availableYears };
}
