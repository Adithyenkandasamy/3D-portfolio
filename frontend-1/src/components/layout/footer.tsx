"use client";

import { usePathname } from "next/navigation";
import { Mail, Heart, ArrowUp } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";

const footerLinks = [
  {
    title: "Navigate",
    links: [
      { label: "About", href: "#about" },
      { label: "Projects", href: "#projects" },
      { label: "Experience", href: "#experience" },
      { label: "Skills", href: "#skills" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Connect",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Adithyenkandasamy",
        external: true,
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/adithyen-k",
        external: true,
      },
      { label: "Email", href: "mailto:contact@adithyen.dev", external: true },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const year = 2026;

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <div className="container-wide">
        {/* Main Footer */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background text-sm font-bold">A</span>
              </div>
              <span className="text-[0.9375rem] font-semibold tracking-tight">
                adithyen<span className="text-accent">.</span>dev
              </span>
            </div>
            <p className="body-sm max-w-xs mb-5">
              AI/ML engineer & full-stack developer building intelligent systems
              and scalable applications.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Adithyenkandasamy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-border-subtle"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/adithyen-k"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-border-subtle"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@adithyen.dev"
                className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-border-subtle"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title} className="md:col-span-2">
              <h3 className="label mb-4">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Status */}
          <div className="md:col-span-3">
            <h3 className="label mb-4">Status</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
              <span className="text-sm text-muted">
                Open to opportunities
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Based in India 🇮🇳
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © {year} Adithyen K. Built with
            <Heart className="w-3 h-3 text-destructive inline" />
            and lots of coffee.
          </p>
          <a
            href="#"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            aria-label="Back to top"
          >
            Back to top
            <ArrowUp className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
