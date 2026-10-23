export interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
  future?: boolean;
  unavailable?: boolean;
}

export interface GitHubContributionWeek {
  days: Array<GitHubContributionDay | null>;
}

export interface GitHubContributionsData {
  username: string;
  profileUrl: string;
  year: number;
  availableYears: number[];
  totalContributions: number;
  activeDays: number;
  maxCount: number;
  peakDay: GitHubContributionDay | null;
  weeks: GitHubContributionWeek[];
  rangeStart: string;
  rangeEnd: string;
  fetchedAt: string;
  incomplete: boolean;
}

export interface CalendarMonthLabel {
  key: string;
  label: string;
  weekIndex: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

function parseDate(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

export function formatContributionDate(value: string): string {
  return dateFormatter.format(parseDate(value));
}

export function formatContributionMonth(value: string): string {
  return monthFormatter.format(parseDate(value));
}

export function formatContributionMonthShort(value: string): string {
  return shortMonthFormatter.format(parseDate(value));
}

export function formatContributionRange(start: string, end: string): string {
  return `${formatContributionDate(start)} – ${formatContributionDate(end)}`;
}

export function formatContributionCount(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}

export function getDayAriaLabel(day: GitHubContributionDay, year: number): string {
  const date = formatContributionDate(day.date);

  if (day.future) {
    return `${date}: not yet available`;
  }

  if (day.unavailable) {
    return `${date}: contribution data unavailable`;
  }

  const count = `${formatContributionCount(day.count)} contribution${day.count === 1 ? "" : "s"}`;
  return `${date}: ${count} in ${year}`;
}

export function getCalendarMonthLabels(
  weeks: GitHubContributionWeek[]
): CalendarMonthLabel[] {
  const labels: CalendarMonthLabel[] = [];
  let lastMonth = "";

  weeks.forEach((week, weekIndex) => {
    for (const day of week.days) {
      if (!day || day.unavailable) continue;
      const month = day.date.slice(0, 7);
      if (month === lastMonth) continue;
      lastMonth = month;
      labels.push({
        key: `${month}-${weekIndex}`,
        label: formatContributionMonthShort(day.date),
        weekIndex,
      });
      break;
    }
  });

  return labels;
}

export function getCalendarAvailableYears(
  createdAt: string,
  currentYear: number
): number[] {
  const createdYear = Number(createdAt.slice(0, 4));
  if (!Number.isFinite(createdYear)) return [currentYear];
  const firstYear = Math.min(createdYear, currentYear);
  const years: number[] = [];
  for (let year = currentYear; year >= firstYear; year -= 1) {
    years.push(year);
  }
  return years;
}
