# Adithyen K — Dynamic 3D Developer Portfolio & Platform

A cinematic, typography-led, animation-rich developer portfolio and content management platform for **Adithyen K** (AI/ML Engineer & Full-Stack Developer). Built with Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Motion v14, Lenis smooth scrolling, Three.js, Neon PostgreSQL, and Cloudinary.

---

## 🌟 Architecture & Key Features

### 1. Cinematic Visual Identity & Motion Engine
- **Dark Cinematic Palette**: Grounded in deep near-black tokens (`#0A0A0F`, `#12121A`, `#23232F`, `#F4F4F6`, `#7C5CFF`).
- **Global Lenis Smooth Scrolling**: Silk-smooth inertia scrolling powered by `lenis/react` with automatic `(prefers-reduced-motion: reduce)` fallbacks.
- **Cinematic Preflight Intro**: 3D perspective letter entrance rotating on the X axis, real preflight diagnostics checklist (fonts, content, WebGL context), and an award-level curtain split reveal with session persistence (`portfolio:intro-viewed`).
- **Scramble-Decode Headline**: Monumental `ADITHYEN K` typography featuring a matrix cipher decoding effect on cursor hover.

### 2. Dual-Layer Content Repository & Neon Database
- **Neon PostgreSQL**: Production-grade serverless database hosting `portfolio_content`, `projects`, `experience`, `education`, `achievements`, `certificates`, `music_tracks`, and `contact_messages`.
- **Repository Pattern**: `ContentRepository` interface with `SqlContentRepository` and local JSON fallback in `/data`.
- **On-Demand Cache Revalidation**: Every admin mutation triggers automatic Next.js ISR revalidation (`revalidatePath("/")`, `revalidatePath("/admin")`).

### 3. Pinned Scroll-Driven Projects Showcase
- Full-screen stacked cards with 3D mouse tilt and dynamic perspective.
- Dual view modes: **Showcase Stack** and **Index Table** with cursor-following thumbnail preview.
- Shared-element expansion into an architectural blueprint modal.
- Authentic editorial photography in `public/images/editorial/`.

### 4. Interactive 3D GitHub Activity Visualizer
- 3D contribution matrix with dynamic tilt tracking (`requestAnimationFrame`).
- Extruded 3D bars on hover (`translateZ`) with gap-tolerant hitboxes and flickering-free tooltip tracking.
- Instantaneous in-memory year caching across 2026, 2025, and 2024.

### 5. Unified Floating Dock (AI + Music)
- **Idle State**: Minimalist 56px floating trigger at the bottom-right.
- **Spring Out**: Quick access to **Interactive AI Assistant** and **Audio Player**.
- **Global Audio Context**: `AudioProvider` managing playlist queue, seek, volume, and playback across routes.
- **Satellite Bubble**: Equalizer animation orbiting the dock only while audio plays and player is collapsed.
- **Groq AI Assistant**: Llama 3.3 70B grounded strictly in Adithyen's published resume and portfolio facts with prompt-injection defense.

### 6. Protected Admin Dashboard & Media Management
- Server-authenticated dashboard at `/admin` (HTTP-only signed cookies).
- Drag-and-drop / Arrow reordering for Projects, Experience, and Certificates.
- **Cloudinary Integration**: Signed uploads for media assets and PDF certificates with strict server-side folder restrictions (`portfolio/music/` and `portfolio/certificates/`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.4.2 (Turbopack, App Router, React 19)
- **Styling**: Tailwind CSS v4, Vanilla CSS tokens
- **Animations**: Motion v14 (`motion/react`), Lenis 1.3
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Media CDN**: Cloudinary (`cloudinary`)
- **AI/LLM**: Groq Cloud (`llama-3.3-70b-versatile`)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ (recommended 22+)
- npm or pnpm

### 2. Environment Setup
Create a `.env.local` file in `frontend-1/` with the following keys:

```bash
# Neon PostgreSQL Database
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require"

# Cloudinary Media Management
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Admin Authentication
ADMIN_PASSWORD="your_secure_admin_password"
SESSION_SECRET="your_32_character_session_secret_key"

# Groq AI Assistant (Optional - includes local fallback)
GROQ_API_KEY="your_groq_api_key"

# GitHub API Token (Optional - for high-rate live activity)
GITHUB_TOKEN="your_github_personal_access_token"
```

### 3. Database Migration & Seeding
To initialize the tables in your Neon PostgreSQL database and seed them with verified portfolio data:

```bash
node --env-file=.env.local src/scripts/migrate-to-neon.mjs
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
Access the admin portal at [http://localhost:3000/admin](http://localhost:3000/admin).
### 5. Verification Suite
Run the automated test and integrity suite to verify database connection, folder restrictions, security endpoints, and asset integrity:

```bash
npm test
```

### 6. Production Build
```bash
npm run build
npm start
```

---

## ☁️ Deployment Guide (Vercel)

1. **Connect GitHub Repository**:
   - Push your changes to GitHub.
   - Import the repository in [Vercel](https://vercel.com).
   - Set the Root Directory to `frontend-1` if deploying as a monorepo subfolder.

2. **Configure Environment Variables in Vercel**:
   Add the following variables in **Project Settings > Environment Variables**:
   - `DATABASE_URL`: Your pooled Neon connection string (`postgres://...pooler...neon.tech/neondb?sslmode=require`).
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key.
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.
   - `ADMIN_PASSWORD`: Your secure admin panel password.
   - `SESSION_SECRET`: Random 32+ character string for HMAC cookies.
   - `GROQ_API_KEY`: Your Groq Cloud API key.
   - `NEXT_PUBLIC_SITE_URL`: Your production URL (`https://your-domain.vercel.app`).
   - `GITHUB_TOKEN`: (Optional) GitHub Personal Access Token for rate-limit-free contributions.

3. **Deploy**:
   - Click **Deploy**. Vercel will build with Turbopack and generate all static pages and dynamic route handlers.
   - Verify that `/sitemap.xml` and `/robots.txt` resolve with your production domain.

---

## 🔒 Security & Performance Features

- **Direct Signed Cloudinary Uploads**: Media and audio files up to 100MB are signed by `/api/admin/cloudinary-sign` and sent directly from the client to Cloudinary, completely bypassing Vercel's 4.5MB serverless payload limit.
- **Admin Mutations**: Unauthenticated requests to `/api/admin/*` reject immediately with `401 Unauthorized`.
- **Cloudinary Deletion Guard**: Deletions through `/api/admin/music` are strictly validated on the server. Deletions targeting public IDs outside `portfolio/music/` return `403 Forbidden`.
- **AI Assistant Guardrails**: Multi-model failover (`qwen/qwen3.8-27b` $\to$ `openai/gpt-oss-120b`) operates with strict negative constraints against revealing hidden prompts, passwords, or fabricating personal claims.
- **Search Engine Optimization**: Fully automated `sitemap.ts`, `robots.ts`, OpenGraph / Twitter tags, and JSON-LD `Person` / `WebSite` Schema.org graphs.

---

## 📄 License
MIT © Adithyen K
