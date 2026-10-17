"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "section-header",
        align === "center" && "text-center",
        visible ? "animate-fade-in-up" : "opacity-0",
        className
      )}
    >
      {label && (
        <span className="badge-accent mb-3 inline-block">{label}</span>
      )}
      <h2 className="heading-lg text-foreground">{title}</h2>
      {description && (
        <p className="body-lg mt-3 max-w-2xl mx-auto">{description}</p>
      )}
    </div>
  );
}
