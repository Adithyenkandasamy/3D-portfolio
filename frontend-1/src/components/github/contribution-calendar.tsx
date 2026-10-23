"use client";

import {
  memo,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Box } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type {
  GitHubContributionDay,
  GitHubContributionsData,
} from "@/lib/github/contributions";
import {
  getCalendarMonthLabels,
  getDayAriaLabel,
} from "@/lib/github/contributions";
import {
  CONTRIBUTION_CLEAR_EVENT,
  ContributionInteraction,
} from "@/components/github/contribution-interaction";

const WEEKDAY_LABELS = [
  { label: "Mon", weekday: 1 },
  { label: "Wed", weekday: 3 },
  { label: "Fri", weekday: 5 },
];

type StageStyle = CSSProperties & Record<`--${string}`, string | number>;
type CellStyle = CSSProperties & Record<`--${string}`, string | number>;

function getStageStyle(weekCount: number): StageStyle {
  return {
    "--weeks": weekCount,
    "--gap": "clamp(2px, 0.36cqw, 4px)",
    "--grid-left": "clamp(26px, 2.8cqw, 32px)",
    "--cell": "calc((100cqw - var(--grid-left) - var(--weeks) * var(--gap)) / var(--weeks))",
    "--max-bar": "clamp(34px, 5.4cqw, 72px)",
  };
}

function getCellStyle(
  day: GitHubContributionDay,
  weekIndex: number,
  weekday: number,
  maxCount: number
): CellStyle {
  const fraction = maxCount > 0 ? day.count / maxCount : 0;

  return {
    gridColumn: weekIndex + 1,
    gridRow: weekday + 1,
    "--bar-h": `calc(var(--max-bar) * ${fraction})`,
    "--bar-scale": fraction,
  };
}

function firstTabbableDate(data: GitHubContributionsData): string | null {
  for (const week of data.weeks) {
    for (const day of week.days) {
      if (day && !day.future && !day.unavailable) return day.date;
    }
  }
  return null;
}

const ContributionCalendarGrid = memo(function ContributionCalendarGrid({
  data,
}: {
  data: GitHubContributionsData;
}) {
  const monthLabels = useMemo(
    () => getCalendarMonthLabels(data.weeks),
    [data.weeks]
  );
  const tabbableDate = useMemo(() => firstTabbableDate(data), [data]);

  return (
    <div className="contribution-calendar-shell">
      {monthLabels.map((month) => (
        <span
          key={month.key}
          className="contribution-month-label pointer-events-none text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          style={{ gridColumn: month.weekIndex + 2 }}
          aria-hidden="true"
        >
          {month.label}
        </span>
      ))}

      {WEEKDAY_LABELS.map((day) => (
        <span
          key={day.label}
          className="contribution-weekday-label pointer-events-none text-[8px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80"
          style={{ gridRow: day.weekday + 2 }}
          aria-hidden="true"
        >
          {day.label}
        </span>
      ))}

      <div className="contribution-scene">
        {data.weeks.map((week, weekIndex) =>
          week.days.map((day, weekday) => {
            if (!day) return null;

            const available = !day.future && !day.unavailable;
            const style = getCellStyle(day, weekIndex, weekday, data.maxCount);
            const common = {
              className: "contribution-cell",
              "data-contribution-day": true,
              "data-date": day.date,
              "data-count": day.count,
              "data-level": day.level,
              "data-contrib-level": day.level,
              "data-status": day.future
                ? "future"
                : day.unavailable
                  ? "unavailable"
                  : "available",
              "data-available": available ? "true" : "false",
              "data-week": weekIndex,
              "data-day": weekday,
              style,
            } as const;

            if (available) {
              return (
                <button
                  key={day.date}
                  {...common}
                  type="button"
                  tabIndex={day.date === tabbableDate ? 0 : -1}
                  aria-label={getDayAriaLabel(day, data.year)}
                >
                  <span className="contribution-cell-side" aria-hidden="true" />
                </button>
              );
            }

            return (
              <div
                key={day.date}
                {...common}
                role="img"
                aria-label={getDayAriaLabel(day, data.year)}
              >
                <span className="contribution-cell-side" aria-hidden="true" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export function ContributionStage({
  data,
}: {
  data: GitHubContributionsData;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [touchGraph, setTouchGraph] = useState(false);
  const stageStyle = useMemo(
    () => getStageStyle(data.weeks.length),
    [data.weeks.length]
  );

  const toggleTouchGraph = () => {
    stageRef.current?.dispatchEvent(new Event(CONTRIBUTION_CLEAR_EVENT));
    setTouchGraph((current) => !current);
  };

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface/60">
      <div
        data-contribution-scroll
        className="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="contribution-stage-container min-w-[560px]">
          <div
            ref={stageRef}
            className="contribution-stage relative"
            style={stageStyle}
            data-graph={touchGraph ? "true" : "false"}
            role="group"
            aria-label={`Contribution calendar for ${data.year}`}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(255,255,255,0.5),transparent_62%)]"
              aria-hidden="true"
            />
            <div
              className="contribution-ground pointer-events-none absolute left-[16%] right-[7%] top-[54%] h-20 -translate-y-1/2 rounded-[50%] bg-foreground/[0.07] blur-2xl"
              aria-hidden="true"
            />

            <ContributionCalendarGrid data={data} />
            <ContributionInteraction
              stageRef={stageRef}
              year={data.year}
              touchGraph={touchGraph}
              reducedMotion={reducedMotion}
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 md:p-4">
              <span className="rounded-full bg-background/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted backdrop-blur-sm">
                Contribution calendar
              </span>
              {!reducedMotion ? (
                <span className="hidden items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted backdrop-blur-sm [@media(hover:hover)]:inline-flex">
                  <span className="contribution-hint-calendar">Hover to lift</span>
                  <span className="contribution-hint-graph">3D view</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {!reducedMotion ? (
        <button
          type="button"
          onClick={toggleTouchGraph}
          aria-pressed={touchGraph}
          aria-label={
            touchGraph
              ? "Show 2D contribution calendar"
              : "Show 3D contribution graph"
          }
          className="absolute right-3 top-3 z-40 inline-flex items-center gap-1 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm [@media(hover:hover)]:hidden"
        >
          <Box className="h-3 w-3 text-accent" aria-hidden="true" />
          {touchGraph ? "2D" : "3D"}
        </button>
      ) : null}
    </div>
  );
}
