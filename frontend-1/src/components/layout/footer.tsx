"use client";

import { usePathname } from "next/navigation";
import { Mail, ArrowUp } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic-button";

const footerLinks = [
  {
    title: "Navigation",
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
      { label: "Direct Email", href: "mailto:adithyen1@gmail.com", external: true },
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
    <footer className="bg-surface border-t border-border text-foreground" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Main Footer */}
        <div className="py-14 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          {/* Brand & Wordmark */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold tracking-tight text-foreground">
                ADITHYEN K
              </span>
            </div>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              AI/ML engineer and full-stack developer building scalable backend architectures, real-time systems, and practical AI solutions.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Magnetic strength={0.25}>
                <a
                  href="https://github.com/Adithyenkandasamy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-muted hover:text-foreground transition-colors rounded-xl bg-surface-elevated border border-border flex items-center justify-center"
                  aria-label="GitHub Profile"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a
                  href="https://www.linkedin.com/in/adithyen-k"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-muted hover:text-foreground transition-colors rounded-xl bg-surface-elevated border border-border flex items-center justify-center"
                  aria-label="LinkedIn Profile"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a
                  href="mailto:adithyen1@gmail.com"
                  className="p-2.5 text-muted hover:text-foreground transition-colors rounded-xl bg-surface-elevated border border-border flex items-center justify-center"
                  aria-label="Email Address"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </Magnetic>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title} className="md:col-span-2">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {group.title}
              </h3>
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

          {/* Status & Credits */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Availability
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm font-medium text-foreground">
                Available for Engineering Roles
              </span>
            </div>
            <p className="text-xs text-muted">
              Operating from India across global distributed timezones.
            </p>
          </div>
        </div>

        {/* Image Credits & Copyright */}
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted">
          <p>
            &copy; {year} Adithyen K. All technical rights reserved. Imagery courtesy of Wikimedia Commons &amp; Public Domain archives.
          </p>
          <a
            href="#hero"
            className="flex items-center gap-1.5 text-foreground hover:text-accent font-semibold transition-colors"
            aria-label="Return to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
