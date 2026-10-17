import { NextRequest, NextResponse } from "next/server";
import { buildPortfolioKnowledge } from "@/lib/chatbot/knowledge";

// In-memory rate limiting map: ip -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "local_user";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a minute before asking more questions.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, stream = false } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Array of messages is required." },
        { status: 400 }
      );
    }

    // 2. Token / Cost Controls: Cap history to last 6 messages
    const trimmedHistory: ChatMessage[] = messages.slice(-6).map((m: ChatMessage) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 1000), // sanitize max length
    }));

    // 3. Compile Ground Truth Knowledge
    const systemPrompt = buildPortfolioKnowledge();

    const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

    // 4. If xAI Grok API Key is present, call Grok API
    if (apiKey) {
      const payload = {
        model: "grok-2-latest",
        messages: [{ role: "system", content: systemPrompt }, ...trimmedHistory],
        temperature: 0.3,
        max_tokens: 600,
        stream,
      };

      const xaiRes = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!xaiRes.ok) {
        const errorText = await xaiRes.text();
        console.error("Grok API error:", errorText);
        // Fallback to local response if xAI returns quota or auth error
        return handleKnowledgeFallback(trimmedHistory);
      }

      if (stream) {
        // Forward the stream directly
        return new Response(xaiRes.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      const data = await xaiRes.json();
      const content = data.choices?.[0]?.message?.content || "No response received.";
      return NextResponse.json({ role: "assistant", content });
    }

    // 5. Intelligent Fallback when XAI_API_KEY is not yet configured in local environment
    return handleKnowledgeFallback(trimmedHistory);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process chat query.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Intelligent deterministic knowledge search engine when XAI_API_KEY is offline or in dev mode.
 */
function handleKnowledgeFallback(history: ChatMessage[]) {
  const lastUserMsg = (history[history.length - 1]?.content || "").toLowerCase();

  let answer = "";

  if (lastUserMsg.includes("project") || lastUserMsg.includes("built") || lastUserMsg.includes("work")) {
    answer = `Adithyen has built 8 production-grade projects. Key highlights include:
- **[Real-Time Voice Chat Web App](#projects)**: AI conversational voice pipeline with FasterWhisper, Ollama & Kokoro TTS (<200ms latency).
- **[Hand Gesture Control System](#projects)**: Touchless interface using OpenCV & MediaPipe (92% accuracy across 10+ gestures).
- **[MCP Server Tools](#projects)**: Standardized Model Context Protocol server exposing custom tools for LLMs in Claude Desktop.
- **[JARVIS-MARK_1](#projects)**: Personal AI automation assistant.

You can inspect the source code and details in the [Projects Section](#projects).`;
  } else if (lastUserMsg.includes("skill") || lastUserMsg.includes("tech") || lastUserMsg.includes("stack") || lastUserMsg.includes("python")) {
    answer = `Adithyen's core technical stack spans:
- **Languages**: Python (Advanced), TypeScript, JavaScript (ES6+), SQL
- **AI & ML**: Computer Vision (OpenCV), TensorFlow/Keras, FasterWhisper, LLM Prompting & Orchestration, MCP Protocol
- **Frontend & 3D**: React 19, Next.js (App Router), Tailwind CSS, Three.js, Motion
- **Backend & Cloud**: FastAPI, Flask, Node.js, PostgreSQL, Docker, Git

Explore all categories and proficiency levels in the [Skills Section](#skills).`;
  } else if (lastUserMsg.includes("experience") || lastUserMsg.includes("intern") || lastUserMsg.includes("company")) {
    answer = `Adithyen has completed two notable engineering internships:
1. **Software Intern at SNS Square Hub** (Coimbatore, 2026): Architected Next.js and FastAPI applications, computer vision document extraction, OCR, and multimodal LLM workflows.
2. **AI/ML Engineering Intern at Magizh Technologies** (Sathyamangalam, 2025): Deployed custom CV and NLP models into FastAPI microservices with optimized inference latency.

See the complete timeline in the [Experience Section](#experience).`;
  } else if (lastUserMsg.includes("resume") || lastUserMsg.includes("cv") || lastUserMsg.includes("download")) {
    answer = `You can preview and download Adithyen K's latest verified resume directly:
- **Format**: PDF Document
- **Updated**: October 2026
- Click here to open: **[Download Resume](#resume)**`;
  } else if (lastUserMsg.includes("contact") || lastUserMsg.includes("email") || lastUserMsg.includes("hire") || lastUserMsg.includes("reach")) {
    answer = `Adithyen is currently **available for engineering roles and impactful collaborations**!
- **Email**: [adithyen.k@example.com](mailto:adithyen.k@example.com)
- **LinkedIn**: [linkedin.com/in/adithyen-k](https://www.linkedin.com/in/adithyen-k)
- **GitHub**: [github.com/Adithyenkandasamy](https://github.com/Adithyenkandasamy)

You can also send a direct message via the **[Contact Form](#contact)**.`;
  } else if (lastUserMsg.includes("certificate") || lastUserMsg.includes("credential")) {
    answer = `Adithyen holds verified credentials including:
- **Machine Learning & Neural Networks Specialization** (DeepLearning.AI)
- **Computer Vision & Image Processing** (OpenCV University / Kaggle)
- **Modern Full-Stack Web Development** (FreeCodeCamp)

Verify these in the **[Certificates Section](#certificates)**.`;
  } else if (lastUserMsg.includes("leetcode") || lastUserMsg.includes("coding") || lastUserMsg.includes("problem")) {
    answer = `Adithyen actively practices algorithms and systems problem solving:
- **LeetCode**: 185+ problems solved (88 Medium, 15 Hard) — Top 18% ranking.
- **NeetCode**: Completed NeetCode 150 Core Data Structures & Algorithms.
- Check the full stats in the **[GitHub & Coding Section](#github)**!`;
  } else {
    answer = `Hello! I am Adithyen K's interactive AI assistant. I can answer questions about his:
- **[Production Projects](#projects)** (e.g. sub-200ms Voice Chat AI, Hand Gesture CV, MCP Server)
- **[Technical Skills](#skills)** (Python, Next.js, OpenCV, LLMs, FastAPI)
- **[Engineering Experience](#experience)** (SNS Square Hub & Magizh Technologies)
- **[Resume & Contact](#resume)**

What would you like to know?`;
  }

  return NextResponse.json({
    role: "assistant",
    content: answer,
  });
}
