"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { RotateCcw, Mail, FileDown, Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PROFILE = {
  name_pronunciation: "Ah-dith-yen",
  display_name: "Adithyen K",
  role: "AI/ML Engineer & Full-Stack Developer",
  location: "Sathyamangalam, Erode, India",
  mission: "Building scalable backend architectures, real-time systems, and practical AI solutions",
  obsession: "Turning complex ML models and agent protocols into production-ready software",
  current_status: "Open to engineering roles & collaborations",
  contact_link: "#contact",
};

interface TypedLine {
  type: "prompt" | "output" | "blank";
  text: string;
  delay?: number;
}

const introSequence: TypedLine[] = [
  { type: "prompt", text: "whoami", delay: 60 },
  { type: "blank", text: "" },
  {
    type: "output",
    text: `  Name          ${PROFILE.display_name} (${PROFILE.name_pronunciation})`,
  },
  { type: "output", text: `  Role          ${PROFILE.role}` },
  { type: "output", text: `  Location      ${PROFILE.location}` },
  {
    type: "output",
    text: `  Mission       ${PROFILE.mission}`,
  },
  {
    type: "output",
    text: `  Status        Active — ${PROFILE.current_status}`,
  },
  { type: "blank", text: "" },
  { type: "prompt", text: 'echo "Ready for production deployments"', delay: 40 },
  { type: "output", text: "  Ready for production deployments." },
  { type: "blank", text: "" },
  { type: "output", text: '  Type "help" for available commands.' },
];

function getCommandOutput(cmd: string): string[] {
  const c = cmd.trim().toLowerCase();

  switch (c) {
    case "help":
      return [
        "",
        "  Available commands:",
        "",
        "  whoami      - Developer profile & focus",
        "  skills      - Machine learning & full-stack toolchain",
        "  projects    - Production systems & hackathon winners",
        "  github      - Repository statistics & cadence",
        "  contact     - Direct communication channels",
        "  clear       - Reset console view",
        "",
      ];
    case "whoami":
      return [
        "",
        `  Name          ${PROFILE.display_name} (${PROFILE.name_pronunciation})`,
        `  Role          ${PROFILE.role}`,
        `  Location      ${PROFILE.location}`,
        `  Education     B.E. CSE @ SNS College of Technology (CGPA: 7.31)`,
        `  Experience    SNS Square Hub & Magizh Technologies`,
        `  Status        Active - ${PROFILE.current_status}`,
        "",
      ];
    case "skills":
      return [
        "",
        "  Languages     Python, Java, C, C++, SQL, TypeScript, JavaScript",
        "  Backend & Web FastAPI, Flask, Django, React, Next.js, REST APIs",
        "  Databases     PostgreSQL, MySQL, SQLite, MongoDB, Redis, Supabase",
        "  AI & ML       Computer Vision, OCR, LLMs, MCP, Prompt Engineering",
        "  Cloud/DevOps  Docker, Git, GitHub Actions, GCP, DigitalOcean, Linux",
        "",
      ];
    case "projects":
      return [
        "",
        "  1. RESQ - Emergency Response Platform (Cryptora'26 1st Place Winner)",
        "  2. OneForAll AI - Google Sheets MCP Inventory Assistant (Llama 3.3 70B)",
        "  3. MagizhCode - DSA Learning Platform & AST Code Tracer",
        "  4. MediCareAI - Medical Assistant with Gemini & Redis Rate Limiting",
        "",
      ];
    case "contact":
      return [
        "",
        "  Email         adithyen1@gmail.com",
        "  GitHub        github.com/Adithyenkandasamy",
        "  LinkedIn      linkedin.com/in/adithyen-k",
        "  Location      Sathyamangalam, Erode, Tamil Nadu",
        "",
      ];
    default:
      return [
        "",
        `  command not found: ${cmd}`,
        '  Type "help" for a list of commands.',
        "",
      ];
  }
}

export function TerminalHero() {
  const [displayedLines, setDisplayedLines] = useState<TypedLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showConsole, setShowConsole] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLPreElement>(null);

  // Play intro sequence
  const showInput = currentLineIndex >= introSequence.length;

  const runIntro = useCallback(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
  }, []);

  useEffect(() => {
    if (currentLineIndex >= introSequence.length) {
      return;
    }

    const line = introSequence[currentLineIndex];
    const delay = line.delay ?? 20;

    const timer = setTimeout(() => {
      setDisplayedLines((prev) => [...prev, line]);
      setCurrentLineIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentLineIndex]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cmd = inputValue.trim();

      const newLines: TypedLine[] = [
        ...displayedLines,
        { type: "prompt", text: cmd },
      ];

      if (cmd.toLowerCase() === "clear") {
        setDisplayedLines([]);
      } else {
        const outputLines = getCommandOutput(cmd);
        outputLines.forEach((text) => {
          newLines.push({ type: "output", text });
        });
        setDisplayedLines(newLines);
      }

      if (cmd) {
        setCommandHistory((prev) => [cmd, ...prev]);
        setHistoryIndex(-1);
      }

      setInputValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputValue(commandHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputValue(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue("");
      }
    }
  };

  const replay = () => {
    runIntro();
    setCommandHistory([]);
  };

  return (
    <section
      id="hero"
      className="min-h-[92svh] flex flex-col justify-between max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 pt-28 pb-16"
    >
      {/* Monumental Headline Block */}
      <div className="my-6 md:my-10 space-y-4">
        <h1 className="text-[clamp(3.5rem,11.5vw,9.5rem)] font-bold tracking-tight text-foreground leading-[0.9] select-none break-words">
          ADITHYEN K
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground max-w-4xl leading-snug">
          AI/ML Engineer &amp; Full-Stack Developer designing and deploying autonomous models, real-time computer vision, and resilient web platforms.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-medium text-foreground">Available for engineering roles</span>
          </div>
          <span>&bull;</span>
          <span>FastAPI &bull; Next.js &bull; AI/ML Systems &bull; 2026</span>
        </div>
      </div>

      {/* Bottom Hero Split: Actions + Integrated Console & Architectural Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Actions & Core Claims */}
        <div className="lg:col-span-5 space-y-6">
          <p className="text-base text-foreground/90 leading-relaxed">
            Building scalable backend architectures, real-time systems, and practical AI solutions. Specializing in Python, FastAPI, Next.js, Computer Vision, and MCP agent workflows.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#projects"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-98"
            >
              View Selected Works
            </a>
            <a
              href="#resume"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg bg-surface hover:bg-surface-elevated text-foreground transition-colors"
            >
              <FileDown className="w-4 h-4 text-accent" />
              Download Resume
            </a>
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-muted hover:text-foreground transition-colors"
            >
              <TerminalIcon className="w-4 h-4" />
              <span>{showConsole ? "Show Visual Plate" : "Open Terminal"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Terminal Console Window or Editorial Visual */}
        <div className="lg:col-span-7 w-full">
          {showConsole ? (
            <div data-ui="terminal" className="w-full rounded-2xl bg-[#181716] text-[#e8e6e3] overflow-hidden">
              {/* Terminal Top bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#242220] text-sm select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="text-[#c2beb6] ml-2 font-medium">adithyen@console ~ %</span>
                </div>
                <button
                  onClick={replay}
                  className="p-1 text-[#c2beb6] hover:text-white transition-colors"
                  title="Replay intro output"
                  aria-label="Replay intro output"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Terminal Body */}
              <pre
                ref={bodyRef}
                className="p-6 font-mono text-sm leading-relaxed max-h-72 sm:max-h-80 overflow-y-auto space-y-1.5"
                onClick={() => inputRef.current?.focus()}
                role="log"
                aria-live="polite"
                aria-label="Interactive developer console"
              >
                {displayedLines.map((line, i) => (
                  <div key={i} className="min-h-[1.4em]">
                    {line.type === "prompt" ? (
                      <div className="text-white font-semibold">
                        <span className="text-[#a09c96] mr-1.5">&gt;</span>
                        <span>{line.text}</span>
                      </div>
                    ) : line.type === "blank" ? (
                      <div className="h-1.5" />
                    ) : (
                      <div className="text-[#e0dcd5] whitespace-pre-wrap">
                        {line.text}
                      </div>
                    )}
                  </div>
                ))}

                {/* Live Input Prompt */}
                {showInput && (
                  <div className="flex items-center pt-1 text-white">
                    <span className="text-[#a09c96] mr-1.5 font-bold">&gt;</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                      aria-label="Terminal command input"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {!inputValue && (
                      <span className="w-1.5 h-4 bg-accent inline-block ml-0.5" />
                    )}
                  </div>
                )}
              </pre>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-surface group">
              <Image
                src="/images/editorial/the-wonderful-universe-explorer-the-great-36.jpg"
                alt="Great 36-inch Equatorial Telescope, Lick Observatory, 1902 scientific instrument"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
                className="object-cover grayscale contrast-105 group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-surface-elevated/95 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground flex items-center gap-2">
                <span>Lick Observatory 36-inch Telescope (1902) &bull; CC0 Public Domain</span>
                <button
                  onClick={() => setShowConsole(true)}
                  className="underline hover:text-accent font-semibold ml-2"
                >
                  Switch to Terminal &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
