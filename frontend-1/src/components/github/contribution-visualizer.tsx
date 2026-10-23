"use client";

import {
  useCallback,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { ContributionStage } from "@/components/github/contribution-calendar";
import {
  useGitHubContributions,
  type GitHubContributionsState,
} from "@/hooks/use-github-contributions";
import type { GitHubContributionsData } from "@/lib/github/contributions";
import {
  formatContributionCount,
  formatContributionDate,
  formatContributionRange,
} from "@/lib/github/contributions";
import { cn } from "@/lib/utils";

const DEFAULT_PROFILE_URL = "https://github.com/Adithyenkandasamy";
const CONTRIBUTION_LEVELS = [0, 1, 2, 3, 4];

function ContributionLegend() {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
      <span>Less</span>
      {CONTRIBUTION_LEVELS.map((level) => (
        <span
          key={level}
          data-contrib-level={level}
          className="contribution-swatch h-2.5 w-2.5 rounded-[2px]"
          aria-hidden="true"
        />
      ))}
      <span>More</span>
    </div>
  );
}

function ContributionChartSkeleton() {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface/60">
      <div className="relative h-[180px] sm:h-[240px] lg:h-[260px]">
        <div className="absolute inset-0 flex animate-pulse items-center justify-center">
          <div className="grid w-[calc(100%-2.5rem)] grid-cols-[repeat(53,minmax(0,1fr))] gap-1 opacity-60">
            {Array.from({ length: 53 * 7 }, (_, index) => (
              <span
                key={index}
                className="aspect-square rounded-[2px] bg-border-subtle"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContributionSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-3 w-36 animate-pulse rounded bg-surface" />
          <div className="mt-3 h-9 w-28 animate-pulse rounded bg-surface" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-surface" />
      </div>
      <ContributionChartSkeleton />
      <p className="mt-4 text-xs text-muted-foreground">
        Loading live contribution data from GitHub…
      </p>
      <span className="sr-only">Loading GitHub contribution data</span>
    </div>
  );
}

function ContributionUnavailable({
  error,
  onRetry,
  profileUrl,
  yearControl,
}: {
  error: string;
  onRetry: () => void;
  profileUrl: string;
  yearControl?: ReactNode;
}) {
  return (
    <div>
      {yearControl ? (
        <div className="mb-4 flex justify-end">{yearControl}</div>
      ) : null}
      <div className="rounded-2xl border border-border-subtle bg-surface/50 px-6 py-10 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted">
          <GithubIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          Contribution data unavailable
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted">
          {error}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-[11px] font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface"
          >
            <GithubIcon className="h-3.5 w-3.5" aria-hidden="true" />
            View GitHub profile
          </a>
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          No placeholder contribution data is displayed
        </p>
      </div>
    </div>
  );
}

function YearSelector({
  year,
  years,
  onChange,
}: {
  year: number;
  years: number[];
  onChange: (year: number) => void;
}) {
  if (years.length <= 1) return null;

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Contribution year</span>
      <CalendarDays
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted"
        aria-hidden="true"
      />
      <select
        value={year}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 appearance-none rounded-lg border border-border bg-background pl-8 pr-8 text-[11px] font-semibold tabular-nums text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted"
        aria-hidden="true"
      />
    </label>
  );
}

function getDisplayRangeEnd(data: GitHubContributionsData): string {
  for (let weekIndex = data.weeks.length - 1; weekIndex >= 0; weekIndex -= 1) {
    const days = data.weeks[weekIndex].days;
    for (let dayIndex = days.length - 1; dayIndex >= 0; dayIndex -= 1) {
      const day = days[dayIndex];
      if (day && !day.future && !day.unavailable) return day.date;
    }
  }
  return data.rangeEnd;
}

function getInitialYear(): number {
  return new Date().getFullYear();
}

export function ContributionVisualizer() {
  const [year, setYear] = useState(getInitialYear);

  const handleInvalidYear = useCallback((fallbackYear: number) => {
    setYear(fallbackYear);
  }, []);

  const { state, retry, availableYears } = useGitHubContributions(
    year,
    handleInvalidYear
  );

  const stateData = state.status === "ready" ? state.data : null;
  const data = stateData?.year === year ? stateData : null;
  const isSwitching = stateData !== null && stateData.year !== year;
  const hasFutureDays =
    data?.weeks.some((week) => week.days.some((day) => day?.future)) ?? false;
  const yearControl = (
    <YearSelector year={year} years={availableYears} onChange={setYear} />
  );

  if (state.status === "loading") {
    return <ContributionSkeleton />;
  }

  if (state.status === "unavailable") {
    return (
      <ContributionUnavailable
        error={state.error}
        onRetry={retry}
        profileUrl={DEFAULT_PROFILE_URL}
        yearControl={availableYears.length > 1 ? yearControl : undefined}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            <Activity className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Contribution activity</span>
            <StatusPill state={state} switching={isSwitching} />
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
            {data ? (
              <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground md:text-4xl">
                {formatContributionCount(data.totalContributions)}
              </span>
            ) : (
              <span
                className="mt-1 inline-block h-8 w-24 animate-pulse rounded bg-surface"
                aria-hidden="true"
              />
            )}
            <span className="text-sm text-muted">contributions</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {data ? (
              <>
                {formatContributionRange(data.rangeStart, getDisplayRangeEnd(data))}
                <span className="mx-1.5 text-border" aria-hidden="true">
                  ·
                </span>
                {data.activeDays} active days
              </>
            ) : (
              <>Loading {year} contributions…</>
            )}
          </p>
        </div>

        {yearControl}
      </div>

      {data ? (
        <ContributionStage key={data.year} data={data} />
      ) : (
        <ContributionChartSkeleton />
      )}

      {data ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ContributionLegend />
            {data.peakDay ? (
              <span className="text-[10px] font-medium text-muted-foreground">
                Peak {formatContributionCount(data.maxCount)} on{" "}
                {formatContributionDate(data.peakDay.date)}
              </span>
            ) : null}
            {data.incomplete ? (
              <span className="text-[10px] font-medium text-muted-foreground">
                Some days could not be loaded
              </span>
            ) : null}
            {hasFutureDays ? (
              <span className="text-[10px] font-medium text-muted-foreground">
                Future dates not yet counted
              </span>
            ) : null}
          </div>
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground transition-colors hover:text-accent"
          >
            @{data.username}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({
  state,
  switching,
}: {
  state: Extract<GitHubContributionsState, { status: "ready" }>;
  switching: boolean;
}) {
  const label = switching ? "Updating" : state.stale ? "Cached" : state.cached ? "Synced" : "Live";
  const muted = switching || state.stale;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em]",
        muted ? "bg-surface text-muted" : "bg-accent-muted text-accent"
      )}
    >
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          muted ? "bg-muted-foreground" : "bg-accent"
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
