import { NextRequest, NextResponse } from "next/server";
import { buildPortfolioKnowledge } from "@/lib/chatbot/knowledge";

// In-memory rate limiting map: ip -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25;

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

const GROQ_CANDIDATE_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "allam-2-7b",
];

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

    const groqApiKey = process.env.GROQ_API_KEY;
    const xaiApiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

    // 4. If Groq API Key is present, call Groq using available models
    if (groqApiKey) {
      for (const model of GROQ_CANDIDATE_MODELS) {
        try {
          const payload = {
            model,
            messages: [{ role: "system", content: systemPrompt }, ...trimmedHistory],
            temperature: 0.4,
            max_tokens: 650,
            stream,
          };

          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify(payload),
          });

          if (!groqRes.ok) {
            const errorText = await groqRes.text();
            console.warn(`Groq model ${model} failed (${groqRes.status}):`, errorText);
            continue;
          }

          if (stream) {
            return new Response(groqRes.body, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            });
          }

          const data = await groqRes.json();
          const content =
            data.choices?.[0]?.message?.content ||
            data.choices?.[0]?.message?.reasoning ||
            "";

          if (content && content.trim()) {
            return NextResponse.json({ role: "assistant", content: content.trim() });
          }
        } catch (fetchErr) {
          console.warn(`Groq fetch error with model ${model}:`, fetchErr);
        }
      }
    }

    // 5. If xAI Grok API Key is present, call xAI
    if (xaiApiKey) {
      try {
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
            Authorization: `Bearer ${xaiApiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (xaiRes.ok) {
          if (stream) {
            return new Response(xaiRes.body, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            });
          }

          const data = await xaiRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim()) {
            return NextResponse.json({ role: "assistant", content: content.trim() });
          }
        }
      } catch (xaiErr) {
        console.warn("xAI call error:", xaiErr);
      }
    }

    // 6. Intelligent Ground Truth Fallback when remote LLMs are offline
    return handleKnowledgeFallback(trimmedHistory);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process chat query.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Intelligent deterministic knowledge search engine when remote LLM is offline or in dev mode.
 */
function handleKnowledgeFallback(history: ChatMessage[]) {
  const lastUserMsg = (history[history.length - 1]?.content || "").toLowerCase();

  let answer = "";

  if (
    lastUserMsg.includes("how good") ||
    lastUserMsg.includes("evaluate") ||
    lastUserMsg.includes("rating") ||
    lastUserMsg.includes("why hire") ||
    lastUserMsg.includes("competenc") ||
    lastUserMsg.includes("strength")
  ) {
    answer = `Adithyen K is an exceptionally high-caliber **AI/ML Engineer and Full-Stack Developer** with proven competitive execution:

1. **Proven Hackathon Winner**: Won **1st Place at Cryptora'26** with **[RESQ](#projects)**, an autonomous emergency incident response platform built under intense competitive constraints.
2. **Production Systems & Cutting-Edge Architectures**:
   - Built a **Real-Time Voice Conversational AI** achieving **<200ms end-to-end latency** with FasterWhisper, Ollama & Kokoro TTS.
   - Built **[OneForAll AI](#projects)** implementing the **Model Context Protocol (MCP)** with Llama 3.3 70B for automated Google Sheets workflows.
   - Built computer vision pipelines with **92%+ accuracy across 10+ gestures** using OpenCV & MediaPipe.
3. **Real Engineering Internships**:
   - **Software Intern at SNS Square Hub** (2026): Multimodal document intelligence, Next.js architectures, and OCR pipelines.
   - **AI/ML Intern at Magizh Technologies** (2025): Optimized model inference on FastAPI microservices.
4. **Algorithmic Rigor**: 185+ problems solved on LeetCode (Top 18%) and completed the NeetCode 150 core algorithms curriculum.

He brings rare full-stack depth—capable of training or integrating ML models, writing robust FastAPI backends, and crafting high-performance Next.js interfaces. Explore his work in the **[Projects Section](#projects)**!`;
  } else if (
    lastUserMsg.includes("who is") ||
    lastUserMsg.includes("tell me about") ||
    lastUserMsg.includes("about him") ||
    lastUserMsg.includes("intro")
  ) {
    answer = `**Adithyen K** is an AI/ML engineer and full-stack developer based in Sathyamangalam, Tamil Nadu, India. 

- **Focus**: Scalable backend architectures, real-time computer vision, low-latency LLM voice systems, and modern web platforms.
- **Education**: B.E. in Computer Science and Engineering @ SNS College of Technology (CGPA: 7.31).
- **Current Status**: Active and available for engineering roles & technical collaborations.
- **Quick Links**: [Projects](#projects) • [Experience](#experience) • [Resume](#resume) • [Contact](#contact)`;
  } else if (
    lastUserMsg.includes("project") ||
    lastUserMsg.includes("built") ||
    lastUserMsg.includes("work")
  ) {
    answer = `Adithyen has built notable production-grade systems:
- **[RESQ](#projects)** (Cryptora'26 1st Place): Emergency incident response platform with real-time routing.
- **[Real-Time Voice Chat](#projects)**: Sub-200ms latency voice pipeline with FasterWhisper and Kokoro TTS.
- **[OneForAll AI](#projects)**: Google Sheets automation powered by Llama 3.3 70B and MCP agent tools.
- **[Hand Gesture Control](#projects)**: Touchless interface using OpenCV & MediaPipe (92% accuracy).
- **[MagizhCode](#projects)**: Interactive DSA visualizer and code tracer.

You can inspect the source code and details in the [Projects Section](#projects).`;
  } else if (
    lastUserMsg.includes("skill") ||
    lastUserMsg.includes("tech") ||
    lastUserMsg.includes("stack") ||
    lastUserMsg.includes("python")
  ) {
    answer = `Adithyen's core technical stack spans:
- **Languages**: Python (Advanced), TypeScript, JavaScript (ES6+), SQL, Java, C/C++
- **AI & ML**: Computer Vision (OpenCV), FasterWhisper, LLM Prompting & Orchestration, MCP Protocol, MediaPipe
- **Frontend & 3D**: React 19, Next.js (App Router), Tailwind CSS v4, Three.js, Motion
- **Backend & Cloud**: FastAPI, Flask, Node.js, PostgreSQL (Neon), Docker, Git

Explore all categories and proficiency levels in the [Skills Section](#skills).`;
  } else if (
    lastUserMsg.includes("experience") ||
    lastUserMsg.includes("intern") ||
    lastUserMsg.includes("company")
  ) {
    answer = `Adithyen has completed two engineering internships:
1. **Software Intern at SNS Square Hub** (Coimbatore, 2026): Architected Next.js and FastAPI applications, computer vision document extraction, OCR, and multimodal LLM workflows.
2. **AI/ML Engineering Intern at Magizh Technologies** (Sathyamangalam, 2025): Deployed custom CV and NLP models into FastAPI microservices with optimized inference latency.

See the complete timeline in the [Experience Section](#experience).`;
  } else if (
    lastUserMsg.includes("resume") ||
    lastUserMsg.includes("cv") ||
    lastUserMsg.includes("download")
  ) {
    answer = `You can preview and download Adithyen K's latest verified resume directly:
- **Format**: PDF Document
- **Updated**: October 2026
- Click here to open: **[Download Resume](#resume)**`;
  } else if (
    lastUserMsg.includes("contact") ||
    lastUserMsg.includes("email") ||
    lastUserMsg.includes("hire") ||
    lastUserMsg.includes("reach")
  ) {
    answer = `Adithyen is currently **available for engineering roles and impactful collaborations**!
- **Email**: [adithyen.k@example.com](mailto:adithyen.k@example.com)
- **LinkedIn**: [linkedin.com/in/adithyen-k](https://www.linkedin.com/in/adithyen-k)
- **GitHub**: [github.com/Adithyenkandasamy](https://github.com/Adithyenkandasamy)

You can also send a direct message via the **[Contact Form](#contact)**.`;
  } else if (
    lastUserMsg.includes("certificate") ||
    lastUserMsg.includes("credential")
  ) {
    answer = `Adithyen holds verified credentials including:
- **Machine Learning & Neural Networks Specialization** (DeepLearning.AI)
- **Computer Vision & Image Processing** (OpenCV University / Kaggle)
- **Modern Full-Stack Web Development** (FreeCodeCamp)

Verify these in the **[Certificates Section](#certificates)**.`;
  } else if (
    lastUserMsg.includes("leetcode") ||
    lastUserMsg.includes("coding") ||
    lastUserMsg.includes("problem")
  ) {
    answer = `Adithyen actively practices algorithms and systems problem solving:
- **LeetCode**: 185+ problems solved (88 Medium, 15 Hard) — Top 18% ranking.
- **NeetCode**: Completed NeetCode 150 Core Data Structures & Algorithms.
- Check the full stats in the **[GitHub & Coding Section](#github)**!`;
  } else {
    answer = `Hello! I am Adithyen K's interactive AI assistant powered by real-time portfolio knowledge. I can answer questions about his:
- **[Production Projects](#projects)** (e.g. sub-200ms Voice Chat AI, Hand Gesture CV, MCP Server)
- **[Technical Skills](#skills)** (Python, Next.js, OpenCV, LLMs, FastAPI)
- **[Engineering Experience](#experience)** (SNS Square Hub & Magizh Technologies)
- **[Resume & Contact](#resume)**

Feel free to ask anything specific about his background, code, or engineering experience!`;
  }

  return NextResponse.json({
    role: "assistant",
    content: answer,
  });
}
