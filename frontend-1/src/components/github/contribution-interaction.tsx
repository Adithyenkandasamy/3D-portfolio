"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  formatContributionCount,
  formatContributionDate,
} from "@/lib/github/contributions";

export const CONTRIBUTION_CLEAR_EVENT = "contribution:clear-tooltip";

type CellStatus = "available" | "future" | "unavailable";
type TooltipPlacement = "top" | "bottom";

interface ActiveCell {
  date: string;
  count: number;
  level: number;
  status: CellStatus;
  x: number;
  y: number;
  placement: TooltipPlacement;
}

interface ContributionInteractionProps {
  stageRef: RefObject<HTMLDivElement | null>;
  year: number;
  touchGraph: boolean;
  reducedMotion: boolean;
}

function findKeyboardTarget(
  stage: HTMLElement,
  week: number,
  weekday: number
): HTMLButtonElement | null {
  if (week < 0 || weekday < 0 || weekday > 6) return null;
  return stage.querySelector<HTMLButtonElement>(
    `button[data-contribution-day][data-week="${week}"][data-day="${weekday}"]`
  );
}

export function ContributionInteraction({
  stageRef,
  year,
  touchGraph,
  reducedMotion,
}: ContributionInteractionProps) {
  const [active, setActive] = useState<ActiveCell | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const pinnedElementRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scroller = stage.closest<HTMLElement>("[data-contribution-scroll]");
    let hovering = false;
    let graphApplied: boolean | null = null;
    let raf = 0;
    let trackingRaf = 0;
    let trackUntil = 0;
    let pendingCell: HTMLElement | null = null;

    const applyGraph = () => {
      const graph = !reducedMotion && (hovering || touchGraph);
      if (graphApplied === graph) return;
      graphApplied = graph;
      stage.dataset.graph = graph ? "true" : "false";
    };

    const highlight = (element: HTMLElement | null) => {
      if (activeElementRef.current === element) return;
      activeElementRef.current?.removeAttribute("data-active");
      activeElementRef.current = element;
      if (element) element.setAttribute("data-active", "true");
    };

    const cancelPending = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (trackingRaf) {
        cancelAnimationFrame(trackingRaf);
        trackingRaf = 0;
      }
      pendingCell = null;
    };

    const clear = () => {
      cancelPending();
      pinnedElementRef.current = null;
      highlight(null);
      setActive(null);
    };

    const updateTooltipPos = (cell: HTMLElement) => {
      const tooltip = tooltipRef.current;
      if (!stage || !tooltip || !cell.isConnected) return;

      const stageRect = stage.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      if (cellRect.width === 0 || cellRect.height === 0) return;

      const half = Math.min(104, Math.max(60, stageRect.width / 2 - 4));
      const rawX = cellRect.left - stageRect.left + cellRect.width / 2;
      const x = Math.min(Math.max(rawX, half), Math.max(half, stageRect.width - half));
      const above = cellRect.top - stageRect.top;
      const placement: TooltipPlacement = above < 84 ? "bottom" : "top";
      const y =
        placement === "top"
          ? above - 10
          : cellRect.bottom - stageRect.top + 10;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.transform = `translate(-50%, ${placement === "top" ? "-100%" : "0"})`;
    };

    const startTracking = () => {
      trackUntil = performance.now() + 650;
      if (trackingRaf) return;

      const tick = () => {
        if (!activeElementRef.current || performance.now() > trackUntil) {
          if (activeElementRef.current) {
            updateTooltipPos(activeElementRef.current);
          }
          trackingRaf = 0;
          return;
        }
        updateTooltipPos(activeElementRef.current);
        trackingRaf = requestAnimationFrame(tick);
      };
      trackingRaf = requestAnimationFrame(tick);
    };

    const renderActive = () => {
      raf = 0;
      const cell = pendingCell;
      pendingCell = null;
      if (!cell || !cell.isConnected) return;

      const stageRect = stage.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      const half = Math.min(104, Math.max(60, stageRect.width / 2 - 4));
      const rawX = cellRect.left - stageRect.left + cellRect.width / 2;
      const x = Math.min(Math.max(rawX, half), Math.max(half, stageRect.width - half));
      const above = cellRect.top - stageRect.top;
      const placement: TooltipPlacement = above < 84 ? "bottom" : "top";
      const y =
        placement === "top"
          ? above - 10
          : cellRect.bottom - stageRect.top + 10;

      setActive({
        date: cell.dataset.date ?? "",
        count: Number(cell.dataset.count ?? 0),
        level: Number(cell.dataset.level ?? 0),
        status: (cell.dataset.status as CellStatus) ?? "available",
        x,
        y,
        placement,
      });

      startTracking();
    };

    const show = (cell: HTMLElement) => {
      if (cell === activeElementRef.current && pendingCell === null) {
        updateTooltipPos(cell);
        return;
      }
      highlight(cell);
      pendingCell = cell;
      if (!raf) raf = requestAnimationFrame(renderActive);
      startTracking();
    };

    const cellFromEvent = (event: Event): HTMLElement | null => {
      const target = event.target as Element | null;
      return target?.closest<HTMLElement>("[data-contribution-day]") ?? null;
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hovering = true;
      applyGraph();

      const cell = cellFromEvent(event);
      if (!cell) {
        const inScene = Boolean((event.target as Element | null)?.closest(".contribution-scene"));
        if (!inScene && !pinnedElementRef.current && !stage.contains(document.activeElement)) {
          cancelPending();
          highlight(null);
          setActive(null);
        }
        return;
      }

      show(cell);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const cell = cellFromEvent(event);
      if (cell) return;
      if (activeElementRef.current) activeElementRef.current.blur();
      clear();
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hovering = false;
      applyGraph();

      if (!pinnedElementRef.current && !stage.contains(document.activeElement)) {
        cancelPending();
        highlight(null);
        setActive(null);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      const cell = cellFromEvent(event);

      if (!cell) {
        if (pinnedElementRef.current) clear();
        return;
      }

      if (pinnedElementRef.current === cell) {
        clear();
        return;
      }

      pinnedElementRef.current = cell;
      show(cell);
    };

    const onFocusIn = (event: FocusEvent) => {
      const cell = cellFromEvent(event);
      if (!cell) return;

      if (cell.tagName === "BUTTON") {
        stage
          .querySelectorAll<HTMLElement>('[data-contribution-day][tabindex="0"]')
          .forEach((element) => element.setAttribute("tabindex", "-1"));
        cell.setAttribute("tabindex", "0");
      }

      show(cell);
    };

    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && stage.contains(next)) return;
      if (pinnedElementRef.current) return;
      cancelPending();
      highlight(null);
      setActive(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches("[data-contribution-day]")) return;

      if (event.key === "Escape") {
        clear();
        return;
      }

      const week = Number(target.dataset.week ?? 0);
      const weekday = Number(target.dataset.day ?? 0);
      const buttons = Array.from(
        stage.querySelectorAll<HTMLButtonElement>("button[data-contribution-day]")
      );
      let next: HTMLButtonElement | null = null;

      if (event.key === "ArrowLeft") {
        next = findKeyboardTarget(stage, week - 1, weekday);
      } else if (event.key === "ArrowRight") {
        next = findKeyboardTarget(stage, week + 1, weekday);
      } else if (event.key === "ArrowUp") {
        next = findKeyboardTarget(stage, week, weekday - 1);
      } else if (event.key === "ArrowDown") {
        next = findKeyboardTarget(stage, week, weekday + 1);
      } else if (event.key === "Home") {
        next = buttons[0] ?? null;
      } else if (event.key === "End") {
        next = buttons[buttons.length - 1] ?? null;
      }

      if (!next) return;
      event.preventDefault();
      target.setAttribute("tabindex", "-1");
      next.setAttribute("tabindex", "0");
      next.focus();
    };

    const onScroll = () => {
      if (pinnedElementRef.current || activeElementRef.current) clear();
    };

    const onClearEvent = () => clear();

    const onDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && stage.contains(target)) return;
      if (!pinnedElementRef.current && !stage.contains(document.activeElement)) return;
      if (activeElementRef.current) activeElementRef.current.blur();
      clear();
    };

    applyGraph();
    stage.addEventListener("pointerover", onPointerOver);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("focusin", onFocusIn);
    stage.addEventListener("focusout", onFocusOut);
    stage.addEventListener("keydown", onKeyDown);
    stage.addEventListener(CONTRIBUTION_CLEAR_EVENT, onClearEvent);
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onDocumentPointerDown, true);

    return () => {
      cancelPending();
      stage.removeEventListener("pointerover", onPointerOver);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("focusin", onFocusIn);
      stage.removeEventListener("focusout", onFocusOut);
      stage.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener(CONTRIBUTION_CLEAR_EVENT, onClearEvent);
      scroller?.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onDocumentPointerDown, true);
    };
  }, [reducedMotion, stageRef, touchGraph]);

  if (!active) return null;

  const date = formatContributionDate(active.date);
  const count = formatContributionCount(active.count);

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      className="pointer-events-none absolute z-30"
      style={{
        left: active.x,
        top: active.y,
        transform: `translate(-50%, ${active.placement === "top" ? "-100%" : "0"})`,
      }}
    >
      <div className="max-w-[220px] rounded-lg border border-white/10 bg-foreground px-3 py-2 text-background shadow-elevated">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span
            data-contrib-level={active.status === "available" ? active.level : 0}
            className="contribution-swatch h-1.5 w-1.5 shrink-0 rounded-full"
            aria-hidden="true"
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-background/60">
            {date}
          </span>
        </div>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-background">
          {active.status === "future"
            ? "Not yet available"
            : active.status === "unavailable"
              ? "Daily data unavailable"
              : `${count} contribution${active.count === 1 ? "" : "s"} in ${year}`}
        </p>
      </div>
    </div>
  );
}
