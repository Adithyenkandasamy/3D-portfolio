"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import type { GitHubContributionsData } from "@/lib/github/contributions";
import { getDayAriaLabel } from "@/lib/github/contributions";
import { ContributionInteraction } from "@/components/github/contribution-interaction";

type Point = [number, number];

const WEEKDAY_LABELS = [
  { label: "Mon", weekday: 1 },
  { label: "Wed", weekday: 3 },
  { label: "Fri", weekday: 5 },
];

function isoToDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function useMorph(active: boolean) {
  const [progress, setProgress] = React.useState(active ? 1 : 0);
  const current = React.useRef(progress);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const target = active && !reduceMotion ? 1 : 0;
    if (current.current === target) return;
    if (reduceMotion || target === 0) {
      current.current = target;
      const frame = requestAnimationFrame(() => setProgress(target));
      return () => cancelAnimationFrame(frame);
    }
    const from = current.current;
    const start = performance.now();
    let frame = 0;
    const step = (time: number) => {
      const elapsed = Math.min(1, (time - start) / 380);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      current.current = from + (target - from) * eased;
      setProgress(current.current);
      if (elapsed < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion) {
      current.current = 0;
      setProgress(0);
    }
  }, [reduceMotion]);

  return progress;
}

function project(x: number, y: number, z = 0, yaw: number): Point {
  return [
    x * Math.cos(yaw) - y * Math.sin(yaw),
    (x * Math.sin(yaw) + y * Math.cos(yaw)) * 0.46 - z,
  ];
}

function points(vertices: Point[]) {
  return vertices.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function lerpPoints(flat: Point[], city: Point[], progress: number): Point[] {
  return flat.map(([x, y], index) => [
    x + (city[index][0] - x) * progress,
    y + (city[index][1] - y) * progress,
  ]);
}

function buildGeometry(data: GitHubContributionsData, width: number, height: number, yaw: number) {
  const weeks = data.weeks.length;
  const maxCount = data.maxCount || 1;
  const size = 0.79;
  const blockData: Array<{
    weekIndex: number;
    weekday: number;
    date: string;
    count: number;
    level: number;
    future?: boolean;
    unavailable?: boolean;
    base: Point[];
    roof: Point[];
    depth: number;
  }> = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const week = data.weeks[weekIndex];
    for (let weekday = 0; weekday < 7; weekday++) {
      const day = week.days[weekday];
      if (!day) continue;
      const x = weekIndex;
      const y = weekday;
      const fraction = day.future || day.unavailable ? 0 : Math.max(0, day.count / maxCount);
      const z = fraction * 0.38;
      const base = [
        project(x, y, 0, yaw),
        project(x + size, y, 0, yaw),
        project(x + size, y + size, 0, yaw),
        project(x, y + size, 0, yaw),
      ];
      const roof = [
        project(x, y, z, yaw),
        project(x + size, y, z, yaw),
        project(x + size, y + size, z, yaw),
        project(x, y + size, z, yaw),
      ];
      blockData.push({
        weekIndex,
        weekday,
        date: day.date,
        count: day.count,
        level: day.level,
        future: day.future,
        unavailable: day.unavailable,
        base,
        roof,
        depth: x * Math.sin(yaw) + y * Math.cos(yaw),
      });
    }
  }
  blockData.sort((a, b) => a.depth - b.depth);

  const ground = [
    project(-0.32, -0.32, 0, yaw),
    project(weeks - 0.05, -0.32, 0, yaw),
    project(weeks - 0.05, 6.99, 0, yaw),
    project(-0.32, 6.99, 0, yaw),
  ];

  const vertices = [
    ...ground,
    ...blockData.flatMap((item) => [...item.base, ...item.roof]),
  ];
  const minX = Math.min(...vertices.map((p) => p[0]));
  const maxX = Math.max(...vertices.map((p) => p[0]));
  const minY = Math.min(...vertices.map((p) => p[1]));
  const maxY = Math.max(...vertices.map((p) => p[1]));
  const scale = Math.min((width - 40) / (maxX - minX || 1), (height - 48) / (maxY - minY || 1));
  const offsetX = (width - (maxX - minX) * scale) / 2;
  const offsetY = (height - (maxY - minY) * scale) / 2 - 4;

  const fit = ([x, y]: Point): Point => [(x - minX) * scale + offsetX, (y - minY) * scale + offsetY];

  const cell = Math.min(26, (width - 72) / weeks, (height - 72) / 7);
  const gap = Math.max(2, cell * 0.14);
  const flatX = (width - weeks * cell) / 2 + 14;
  const flatY = (height - 7 * cell) / 2 - 2;

  return {
    ground: ground.map(fit),
    flatX,
    flatY,
    cell,
    blocks: blockData.map((block) => {
      const x = flatX + block.weekIndex * cell;
      const y = flatY + block.weekday * cell;
      const flat: Point[] = [
        [x, y],
        [x + cell - gap, y],
        [x + cell - gap, y + cell - gap],
        [x, y + cell - gap],
      ];
      return {
        ...block,
        flat,
        base: block.base.map(fit),
        roof: block.roof.map(fit),
      };
    }),
  };
}

export function GitHubSkyline({
  data,
  year,
  touchGraph = false,
}: {
  data: GitHubContributionsData;
  year: number;
  touchGraph?: boolean;
}) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const active = touchGraph && !reduceMotion;
  const progress = useMorph(active);
  const [width, setWidth] = React.useState(640);
  const [yaw, setYaw] = React.useState(Math.PI / 6);
  const [hover, setHover] = React.useState<{ date: string; x: number; y: number } | null>(null);
  const plotRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const height = width < 520 ? 230 : 258;

  React.useEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const measure = () => {
      setWidth(Math.max(320, element.getBoundingClientRect().width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = React.useMemo(() => buildGeometry(data, width, height, yaw), [data, width, height, yaw]);
  const hoveredBlock = React.useMemo(() => layout.blocks.find((b) => b.date === hover?.date), [layout.blocks, hover?.date]);

  const pointerPosition = (event: React.PointerEvent) => {
    const rect = plotRef.current!.getBoundingClientRect();
    return {
      x: Math.max(8, Math.min(width - 190, event.clientX - rect.left + 12)),
      y: Math.max(4, Math.min(height - 76, event.clientY - rect.top - 60)),
    };
  };

  return (
    <div className="relative mt-6">
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/60">
        <div ref={plotRef} className="relative w-full" style={{ minWidth: 320 }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            role="img"
            aria-labelledby={`${id}-title ${id}-desc`}
            className="block overflow-visible"
            onPointerLeave={() => setHover(null)}
          >
            <title id={`${id}-title`}>GitHub contribution skyline for {year}</title>
            <desc id={`${id}-desc`}>
              {data.totalContributions.toLocaleString()} contributions in {year}. Isometric view of daily activity.
            </desc>
            <polygon points={points(layout.ground)} fill="rgba(31,30,29,0.06)" opacity={progress} />
            {layout.blocks.map((block) => {
              const roof = lerpPoints(block.flat, block.roof, progress);
              const base = lerpPoints(block.flat, block.base, progress);
              const isFuture = block.future;
              const isUnavailable = block.unavailable;
              const available = !isFuture && !isUnavailable;
              if (isUnavailable || isFuture) {
                return (
                  <g key={block.date} opacity={0.18}>
                    <polygon points={points(block.flat)} fill="rgba(148,163,184,0.25)" />
                  </g>
                );
              }
              return (
                <g
                  key={block.date}
                  data-contribution-day
                  data-date={block.date}
                  data-count={block.count}
                  data-level={block.level}
                  data-week={block.weekIndex}
                  data-day={block.weekday}
                  data-status="available"
                  data-available="true"
                  className="contribution-cell"
                  style={{ cursor: "pointer" }}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return;
                    setHover({ date: block.date, ...pointerPosition(event) });
                  }}
                  onPointerMove={(event) => {
                    if (event.pointerType === "touch") return;
                    setHover({ date: block.date, ...pointerPosition(event) });
                  }}
                >
                  <polygon className="fc-face fc-left" points={points([roof[3], roof[2], base[2], base[3]])} fill="color-mix(in srgb, var(--contrib-front) 80%, #1f1e1d 20%)" />
                  <polygon className="fc-face fc-right" points={points([roof[1], roof[2], base[2], base[1]])} fill="color-mix(in srgb, var(--contrib-side) 78%, #1f1e1d 22%)" />
                  <polygon className="fc-face fc-roof" points={points(roof)} fill="var(--contrib-top)" style={{ filter: "brightness(0.98)" }} />
                </g>
              );
            })}
            <g className="fc-axis" opacity={1 - progress} aria-hidden="true">
              {WEEKDAY_LABELS.map((d) => (
                <text
                  key={d.label}
                  x={layout.flatX - 10}
                  y={layout.flatY + d.weekday * layout.cell + layout.cell * 0.56}
                  textAnchor="end"
                  style={{ fill: "rgba(125,121,116,0.9)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  {d.label}
                </text>
              ))}
            </g>
          </svg>
          {hover && hoveredBlock && !hoveredBlock.future && !hoveredBlock.unavailable && (
            <div
              className="pointer-events-none absolute z-30 max-w-[220px] rounded-lg border border-white/10 bg-foreground px-3 py-2 text-background "
              style={{ left: hover.x, top: hover.y, transform: "translate(-50%, -100%)" }}
              role="tooltip"
            >
              <div className="text-[10px] uppercase tracking-[0.12em] text-background/70">
                {new Date(`${hoveredBlock.date}T00:00:00.000Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </div>
              <div className="mt-1 text-sm font-semibold">
                {hoveredBlock.count.toLocaleString()} contribution{hoveredBlock.count === 1 ? "" : "s"}
              </div>
              <div className="text-[10px] text-background/70">in {year}</div>
            </div>
          )}
        </div>
      </div>
      <div ref={stageRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      <ContributionInteraction stageRef={stageRef} year={year} touchGraph={touchGraph} reducedMotion={reduceMotion} />
    </div>
  );
}
