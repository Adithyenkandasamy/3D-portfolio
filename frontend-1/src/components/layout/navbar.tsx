"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Terminal, FileDown } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[60] transition-colors duration-200",
        scrolled
          ? "bg-surface/95 "
          : "bg-transparent"
      )}
    >
      <nav className="container-wide" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Home"
          >
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Terminal className="w-4 h-4 text-background" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight hidden sm:block">
              adithyen<span className="text-accent">.</span>dev
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 text-[0.8125rem] font-medium text-muted rounded-lg",
                  "hover:text-foreground hover:bg-border-subtle",
                  "transition-colors duration-200"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://github.com/Adithyenkandasamy"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-border-subtle"
              aria-label="GitHub profile"
            >
              <GithubIcon className="w-[18px] h-[18px]" />
            </a>
            <a
              href="https://www.linkedin.com/in/adithyen-k"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-border-subtle"
              aria-label="LinkedIn profile"
            >
              <LinkedinIcon className="w-[18px] h-[18px]" />
            </a>
            <Link
              href="#resume"
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5",
                "text-[0.8125rem] font-medium",
                "bg-foreground text-background rounded-lg",
                "hover:bg-foreground/90 transition-colors duration-200"
              )}
            >
              <FileDown className="w-3.5 h-3.5" />
              Resume
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted hover:text-foreground transition-colors rounded-lg"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-[max-height,padding] duration-300",
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-3 pt-3 mt-1">
              <a
                href="https://github.com/Adithyenkandasamy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted hover:text-foreground transition-colors rounded-lg"
                aria-label="GitHub"
              >
                <GithubIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="https://www.linkedin.com/in/adithyen-k"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted hover:text-foreground transition-colors rounded-lg"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-[18px] h-[18px]" />
              </a>
              <Link
                href="#resume"
                onClick={() => setIsOpen(false)}
                className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium bg-foreground text-background rounded-lg"
              >
                <FileDown className="w-3.5 h-3.5" />
                Resume
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
