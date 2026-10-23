import { z } from "zod";
import type {
  GitHubContributionDay,
  GitHubContributionWeek,
  GitHubContributionsData,
} from "@/lib/github/contributions";
import { getCalendarAvailableYears } from "@/lib/github/contributions";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const DEFAULT_USERNAME = "Adithyenkandasamy";
const MIN_YEAR = 2008;
const CACHE_TTL_MS = 30 * 60 * 1000;
const STALE_TTL_MS = 24 * 60 * 60 * 1000;
const FAILURE_TTL_MS = 60 * 1000;
const FETCH_TIMEOUT_MS = 9000;

const CONTRIBUTIONS_QUERY = `
  query PortfolioContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      url
      createdAt
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const contributionLevelSchema = z.enum([
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
]);

const contributionDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  contributionCount: z.number().int().nonnegative(),
  contributionLevel: contributionLevelSchema,
});

const contributionWeekSchema = z.object({
  contributionDays: z.array(contributionDaySchema).min(1),
});

const contributionsResponseSchema = z.object({
  data: z
    .object({
      user: z
        .object({
          login: z.string().min(1),
          url: z.string().url(),
          createdAt: z.string().min(10),
          contributionsCollection: z.object({
            contributionCalendar: z.object({
              totalContributions: z.number().int().nonnegative(),
              weeks: z.array(contributionWeekSchema).min(1),
            }),
          }),
        })
        .nullable(),
    })
    .nullish(),
  errors: z
    .array(
      z.object({
        message: z.string(),
        type: z.string().optional(),
      })
    )
    .optional(),
});

const LEVEL_MAP: Record<z.infer<typeof contributionLevelSchema>, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

type ContributionsErrorCode =
  | "not_configured"
  | "rate_limited"
  | "invalid_response"
  | "invalid_year"
  | "unavailable";

export type GitHubContributionsResult =
  | {
      ok: true;
      data: GitHubContributionsData;
      cached: boolean;
      stale: boolean;
    }
  | {
      ok: false;
      error: string;
      code: ContributionsErrorCode;
      retryAfterSeconds?: number;
    };

interface CacheEntry {
  expiresAt: number;
  staleUntil: number;
  data: GitHubContributionsData;
}

class ContributionsError extends Error {
  code: ContributionsErrorCode;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    code: ContributionsErrorCode,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "ContributionsError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const memoryCache = new Map<number, CacheEntry>();
const failureCache = new Map<
  number,
  { expiresAt: number; result: GitHubContributionsResult }
>();

function getUsername(): string {
  return process.env.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME;
}

function rateLimitFromResponse(response: Response): number | undefined {
  const reset = response.headers.get("x-ratelimit-reset");
  if (!reset) return undefined;
  const resetAt = Number(reset);
  if (!Number.isFinite(resetAt)) return undefined;
  return Math.max(0, Math.ceil(resetAt - Date.now() / 1000));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildYearCalendar(
  year: number,
  apiWeeks: { contributionDays: z.infer<typeof contributionDaySchema>[] }[],
  todayIso: string
): {
  weeks: GitHubContributionWeek[];
  days: GitHubContributionDay[];
  incomplete: boolean;
} {
  const dayMap = new Map<
    string,
    z.infer<typeof contributionDaySchema>
  >();

  for (const week of apiWeeks) {
    for (const day of week.contributionDays) {
      if (day.date.startsWith(`${year}-`)) {
        dayMap.set(day.date, day);
      }
    }
  }

  const firstDay = new Date(Date.UTC(year, 0, 1));
  const lastDay = new Date(Date.UTC(year, 11, 31));
  const firstWeekday = firstDay.getUTCDay();
  const totalDays =
    Math.round((lastDay.getTime() - firstDay.getTime()) / 86_400_000) + 1;
  const weekCount = Math.ceil((firstWeekday + totalDays) / 7);
  const days: GitHubContributionDay[] = [];
  let incomplete = false;

  const weeks = Array.from({ length: weekCount }, (_, weekIndex) => {
    const weekDays = Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(
        Date.UTC(year, 0, 1 - firstWeekday + weekIndex * 7 + weekday)
      );

      if (date.getUTCFullYear() !== year) {
        return null;
      }

      const iso = toIsoDate(date);
      const source = dayMap.get(iso);

      if (!source) {
        incomplete = true;
        const unavailable: GitHubContributionDay = {
          date: iso,
          count: 0,
          level: 0,
          unavailable: true,
        };
        days.push(unavailable);
        return unavailable;
      }

      const day: GitHubContributionDay = {
        date: iso,
        count: source.contributionCount,
        level: LEVEL_MAP[source.contributionLevel],
        future: iso > todayIso,
      };
      days.push(day);
      return day;
    });

    return { days: weekDays };
  });

  return { weeks, days, incomplete };
}

async function fetchLiveContributions(
  year: number
): Promise<GitHubContributionsData> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    throw new ContributionsError(
      "GitHub contribution data is unavailable because no server token is configured.",
      "not_configured"
    );
  }

  const currentYear = new Date().getUTCFullYear();
  const username = getUsername();
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  let response: Response;
  try {
    response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": `${username}-portfolio-contributions`,
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: username, from, to },
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new ContributionsError(
      "GitHub's contribution service did not respond in time.",
      "unavailable"
    );
  }

  if (!response.ok) {
    const retryAfterSeconds = rateLimitFromResponse(response);
    if (response.status === 401 || response.status === 403 || response.status === 429) {
      throw new ContributionsError(
        "GitHub rate limit reached while loading contribution data.",
        "rate_limited",
        retryAfterSeconds
      );
    }
    throw new ContributionsError(
      "GitHub's contribution service is temporarily unavailable.",
      "unavailable",
      retryAfterSeconds
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ContributionsError(
      "GitHub returned an unreadable contribution response.",
      "invalid_response"
    );
  }

  const parsed = contributionsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ContributionsError(
      "GitHub returned contribution data in an unexpected format.",
      "invalid_response"
    );
  }

  if (parsed.data.errors?.length) {
    const rateLimited = parsed.data.errors.some(
      (error) =>
        error.type === "RATE_LIMITED" ||
        error.message.toLowerCase().includes("rate limit")
    );
    throw new ContributionsError(
      rateLimited
        ? "GitHub rate limit reached while loading contribution data."
        : "GitHub could not return contribution data for this account.",
      rateLimited ? "rate_limited" : "unavailable"
    );
  }

  const user = parsed.data.data?.user;
  if (!user) {
    throw new ContributionsError(
      `GitHub profile "${username}" could not be found.`,
      "invalid_response"
    );
  }

  const availableYears = getCalendarAvailableYears(user.createdAt, currentYear);
  if (!availableYears.includes(year)) {
    throw new ContributionsError(
      `Contribution data is only available from ${availableYears[availableYears.length - 1]} to ${currentYear} for this account.`,
      "invalid_year"
    );
  }

  const calendar = user.contributionsCollection.contributionCalendar;
  const todayIso = new Date().toISOString().slice(0, 10);
  const { weeks, days, incomplete } = buildYearCalendar(
    year,
    calendar.weeks,
    todayIso
  );

  let activeDays = 0;
  let maxCount = 0;
  let peakDay: GitHubContributionDay | null = null;

  for (const day of days) {
    if (day.unavailable || day.future) continue;
    if (day.count > 0) activeDays += 1;
    if (day.count > maxCount) {
      maxCount = day.count;
      peakDay = day;
    }
  }

  return {
    username: user.login,
    profileUrl: user.url,
    year,
    availableYears,
    totalContributions: calendar.totalContributions,
    activeDays,
    maxCount,
    peakDay: maxCount > 0 ? peakDay : null,
    weeks,
    rangeStart: `${year}-01-01`,
    rangeEnd: `${year}-12-31`,
    fetchedAt: new Date().toISOString(),
    incomplete,
  };
}

function toFailure(error: unknown): GitHubContributionsResult {
  if (error instanceof ContributionsError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      retryAfterSeconds: error.retryAfterSeconds,
    };
  }

  return {
    ok: false,
    error: "GitHub contribution data is temporarily unavailable.",
    code: "unavailable",
  };
}

export async function getGitHubContributions(
  requestedYear?: number
): Promise<GitHubContributionsResult> {
  const currentYear = new Date().getUTCFullYear();
  const year = requestedYear ?? currentYear;

  if (!Number.isInteger(year) || year < MIN_YEAR || year > currentYear) {
    return {
      ok: false,
      error: `Choose a contribution year between ${MIN_YEAR} and ${currentYear}.`,
      code: "invalid_year",
    };
  }

  const now = Date.now();
  const cached = memoryCache.get(year);

  if (cached && now < cached.expiresAt) {
    return {
      ok: true,
      data: cached.data,
      cached: true,
      stale: false,
    };
  }

  const failure = failureCache.get(year);
  if (failure && now < failure.expiresAt && !cached) {
    return failure.result;
  }

  try {
    const data = await fetchLiveContributions(year);
    const fetchedAt = Date.now();

    memoryCache.set(year, {
      data,
      expiresAt: fetchedAt + CACHE_TTL_MS,
      staleUntil: fetchedAt + STALE_TTL_MS,
    });
    failureCache.delete(year);

    return {
      ok: true,
      data,
      cached: false,
      stale: false,
    };
  } catch (error) {
    const stale = memoryCache.get(year);
    if (stale && now < stale.staleUntil) {
      return {
        ok: true,
        data: stale.data,
        cached: true,
        stale: true,
      };
    }

    const result = toFailure(error);
    failureCache.set(year, {
      expiresAt: now + FAILURE_TTL_MS,
      result,
    });
    return result;
  }
}
