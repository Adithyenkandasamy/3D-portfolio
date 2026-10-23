"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "section-header mb-10 md:mb-14",
        align === "center" && "text-center mx-auto",
        className
      )}
    >
      <h2 className="relative z-10 text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.08]">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-base md:text-lg text-foreground/90 mt-3 leading-relaxed max-w-2xl",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
