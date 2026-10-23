"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot, User, Trash2, Loader2, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What AI/ML models has Adithyen worked with?",
  "Tell me about the sub-200ms voice pipeline",
  "What is his full-stack engineering experience?",
  "How can I download his resume or contact him?",
];

export function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am Adithyen K's AI Portfolio Assistant powered by Grok knowledge. Ask me anything about his projects, experience, skills, or resume!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const idCounter = useRef(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    idCounter.current += 1;
    const userMessage: Message = {
      id: `usr-${idCounter.current}`,
      role: "user",
      content: trimmed,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to reach assistant service.");
      }

      const data = await res.json();
      idCounter.current += 1;
      const currentId = idCounter.current;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${currentId}`,
          role: "assistant",
          content: data.content || "Sorry, I could not generate an answer.",
        },
      ]);
    } catch {
      idCounter.current += 1;
      const currentId = idCounter.current;
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${currentId}`,
          role: "assistant",
          content:
            "I encountered a temporary connection issue. You can still explore the [Projects Section](#projects) or reach Adithyen directly via [Contact](#contact).",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Conversation history cleared. What else would you like to know about Adithyen's work?",
      },
    ]);
  };

  // Helper to format basic markdown links and bold text
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const text = match[1];
        const href = match[2];
        const isInternalAnchor = href.startsWith("#");
        return (
          <a
            key={index}
            href={href}
            onClick={() => {
              if (isInternalAnchor) {
                setIsOpen(false);
              }
            }}
            className="text-accent hover:underline font-semibold"
            {...(!isInternalAnchor ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {text}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom-Left) */}
      <div className="fixed bottom-18 left-4 sm:bottom-6 sm:left-6 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-foreground text-background shadow-elevated hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95"
            aria-label="Open Grok AI Chat"
          >
            <div className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold tracking-tight">Ask Grok AI</span>
          </button>
        ) : null}
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div data-ui="chat-assistant" className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[80vh] flex flex-col bg-surface rounded-2xl shadow-float overflow-hidden animate-fade-in text-foreground">
          {/* Header */}
          <div className="px-4 py-3 bg-surface border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-none flex items-center gap-1.5">
                  Grok Portfolio AI
                  <span className="badge-accent text-[9px] py-0 px-1.5">Online</span>
                </h3>
                <span className="text-[10px] text-muted font-mono">
                  Ground Truth Context
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser
                        ? "bg-accent-muted text-accent-foreground"
                        : "bg-foreground text-background"
                    }`}
                  >
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-accent" />}
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                      isUser
                        ? "bg-foreground text-background rounded-tr-xs"
                        : "bg-background border border-border text-foreground rounded-tl-xs whitespace-pre-wrap"
                    }`}
                  >
                    {renderFormattedContent(m.content)}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted text-xs p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                <span>Grok is reasoning...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Pills */}
          {messages.length <= 2 && (
            <div className="p-3 bg-background/50 border-t border-border/60 shrink-0">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
                Suggested Questions
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left text-[11px] text-muted hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:border-foreground/30 transition-all flex items-center justify-between group"
                  >
                    <span className="truncate">{q}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-border bg-surface flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about projects, skills, ML work..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-foreground text-background hover:bg-neutral-800 disabled:opacity-40 transition-colors shrink-0 shadow-xs"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
