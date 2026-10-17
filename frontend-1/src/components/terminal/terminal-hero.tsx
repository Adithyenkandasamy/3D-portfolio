"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { RotateCcw, Mail, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================
   CONFIGURABLE PROFILE — will come from DB
   ========================================= */
const PROFILE = {
  name_pronunciation: "Ah-dith-yen",
  display_name: "Adithyen K",
  role: "AI/ML Engineer & Full-Stack Developer",
  location: "India 🇮🇳",
  mission: "Building intelligent systems that solve real problems",
  obsession: "Turning complex ML models into production-ready products",
  current_status: "Open to opportunities",
  contact_link: "#contact",
};

/* =========================================
   TYPE-WRITER LINE
   ========================================= */
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
    text: `  Obsession     ${PROFILE.obsession}`,
  },
  {
    type: "output",
    text: `  Status        🟢 ${PROFILE.current_status}`,
  },
  { type: "blank", text: "" },
  { type: "prompt", text: 'echo "Welcome to my portfolio"', delay: 40 },
  { type: "output", text: "  Welcome to my portfolio" },
  { type: "blank", text: "" },
  { type: "output", text: '  Type "help" for available commands.' },
];

/* =========================================
   COMMANDS
   ========================================= */
function getCommandOutput(cmd: string): string[] {
  const c = cmd.trim().toLowerCase();

  switch (c) {
    case "help":
      return [
        "",
        "  Available commands:",
        "",
        "  whoami      — Learn about me",
        "  skills      — View my tech stack",
        "  projects    — Browse my work",
        "  github      — View my GitHub",
        "  contact     — Get in touch",
        "  clear       — Clear the terminal",
        "",
      ];
    case "whoami":
      return [
        "",
        `  Name          ${PROFILE.display_name} (${PROFILE.name_pronunciation})`,
        `  Role          ${PROFILE.role}`,
        `  Location      ${PROFILE.location}`,
        `  Mission       ${PROFILE.mission}`,
        `  Obsession     ${PROFILE.obsession}`,
        `  Status        🟢 ${PROFILE.current_status}`,
        "",
      ];
    case "skills":
      return [
        "",
        "  Languages     Python · JavaScript · TypeScript · SQL",
        "  Frontend      React · Next.js · Tailwind CSS",
        "  Backend       FastAPI · Flask · Node.js",
        "  AI/ML         TensorFlow · PyTorch · OpenCV · NLP",
        "  Database      PostgreSQL · MongoDB",
        "  DevOps        Docker · Git · GitHub Actions",
        "  Tools         VS Code · Jupyter · Postman",
        "",
      ];
    case "projects":
      return [
        "",
        "  → Real-Time Voice Chat Web App",
        "  → Hand Gesture Control System",
        "  → Image Classification System",
        "  → JARVIS-MARK_1 AI Assistant",
        "  → MCP Server for LLMs",
        "  → Subscription Manager (React Native)",
        "",
        '  Scroll down or type "github" for more.',
        "",
      ];
    case "github":
      return [
        "",
        "  GitHub: github.com/Adithyenkandasamy",
        "",
        "  → View repositories below in the GitHub section.",
        "",
      ];
    case "contact":
      return [
        "",
        "  📧  Scroll to the contact section below",
        "  🔗  linkedin.com/in/adithyen-k",
        "  🐙  github.com/Adithyenkandasamy",
        "",
      ];
    case "clear":
      return ["__CLEAR__"];
    case "":
      return [];
    default:
      return [
        "",
        `  Command not found: ${cmd}`,
        '  Type "help" to see available commands.',
        "",
      ];
  }
}

/* =========================================
   TERMINAL HERO COMPONENT
   ========================================= */
export function TerminalHero() {
  const [displayedLines, setDisplayedLines] = useState<
    { type: string; text: string }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  /* Scroll to bottom */
  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, []);

  /* Run intro animation */
  const runIntro = useCallback(() => {
    let interval: NodeJS.Timeout | null = null;
    const timer = setTimeout(() => {
      setDisplayedLines([]);
      setShowInput(false);
      setIsTyping(true);

      if (reducedMotion) {
        const all = introSequence.map((l) => ({
          type: l.type,
          text: l.text,
        }));
        setDisplayedLines(all);
        setIsTyping(false);
        setShowInput(true);
        return;
      }

      let i = 0;
      interval = setInterval(() => {
        if (i < introSequence.length) {
          const line = introSequence[i];
          setDisplayedLines((prev) => [
            ...prev,
            { type: line.type, text: line.text },
          ]);
          i++;
        } else {
          if (interval) clearInterval(interval);
          setIsTyping(false);
          setShowInput(true);
        }
      }, 80);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const cleanup = runIntro();
    return cleanup;
  }, [runIntro]);

  useEffect(() => {
    scrollToBottom();
  }, [displayedLines, scrollToBottom]);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  /* Handle command */
  const handleCommand = useCallback(
    (cmd: string) => {
      const output = getCommandOutput(cmd);

      if (output[0] === "__CLEAR__") {
        setDisplayedLines([]);
        return;
      }

      const newLines = [
        { type: "prompt", text: cmd },
        ...output.map((text) => ({ type: "output", text })),
      ];

      setDisplayedLines((prev) => [...prev, ...newLines]);

      if (cmd.trim()) {
        setCommandHistory((prev) => [cmd, ...prev]);
      }
      setHistoryIndex(-1);
    },
    []
  );

  const handleSubmit = () => {
    handleCommand(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(
          historyIndex + 1,
          commandHistory.length - 1
        );
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      } else {
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
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-12"
    >
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* Terminal Window */}
        <div className="terminal-window">
          {/* Header */}
          <div className="terminal-header">
            <div className="flex items-center gap-2">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
            </div>
            <span className="flex-1 text-center text-xs text-[#8E8E93] font-mono select-none">
              adithyen@portfolio ~ %
            </span>
            <button
              onClick={replay}
              className="p-1 text-[#8E8E93] hover:text-white transition-colors rounded"
              aria-label="Replay terminal animation"
              title="Replay"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            className="terminal-body"
            onClick={() => inputRef.current?.focus()}
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
          >
            {displayedLines.map((line, i) => (
              <div key={i} className="min-h-[1.5em]">
                {line.type === "prompt" ? (
                  <div>
                    <span className="terminal-prompt">❯ </span>
                    <span className="terminal-command">{line.text}</span>
                  </div>
                ) : line.type === "blank" ? (
                  <br />
                ) : (
                  <div className="terminal-output whitespace-pre-wrap">
                    {line.text}
                  </div>
                )}
              </div>
            ))}

            {/* Input line */}
            {showInput && (
              <div className="flex items-center mt-1">
                <span className="terminal-prompt">❯ </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm caret-accent ml-1"
                  aria-label="Terminal command input"
                  autoComplete="off"
                  spellCheck={false}
                />
                {!inputValue && <span className="terminal-cursor" />}
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && !showInput && (
              <div className="flex items-center mt-1">
                <span className="terminal-prompt">❯ </span>
                <span className="terminal-cursor" />
              </div>
            )}
          </div>
        </div>

        {/* Actions below terminal */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <a
            href={PROFILE.contact_link}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5",
              "text-sm font-medium rounded-lg",
              "bg-foreground text-background",
              "hover:bg-foreground/90 transition-all duration-200",
              "hover:shadow-lg active:scale-[0.98]"
            )}
          >
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
          <a
            href="#resume"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5",
              "text-sm font-medium rounded-lg",
              "border border-border text-foreground bg-surface",
              "hover:bg-border-subtle hover:border-muted-foreground",
              "transition-all duration-200",
              "hover:shadow-md active:scale-[0.98]"
            )}
          >
            <FileDown className="w-4 h-4" />
            Download Resume
          </a>
        </div>

        {/* Subtle scroll indicator */}
        <div className="flex justify-center mt-10 animate-fade-in" style={{ animationDelay: "1.5s" }}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs">Scroll to explore</span>
            <div className="w-5 h-8 border-2 border-muted-foreground/40 rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
