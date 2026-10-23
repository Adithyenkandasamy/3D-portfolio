# Adithyen K Portfolio: Master Project Description

A complete brief for building an animation-rich, pro-level developer portfolio. Hand this to your coding agent (Claude Code or similar) and have it work phase by phase.

## 1. Project overview

Build a premium, highly animated personal developer portfolio for **Adithyen K**. It is a production-oriented web application, not a static page. It combines:

1. A cinematic public portfolio with agency-level motion.
2. A protected admin dashboard for managing content.
3. Cloudinary-backed media (images, certificates, resume, music).
4. A Neon (hosted Postgres) database for text content.
5. A Groq-powered chatbot that answers from published portfolio data.
6. A floating dock button that opens an AI assistant and a music player.
7. Real GitHub data where reliable.

The public site, admin, dock, and chatbot must feel like one product with one visual identity.

**Primary goals**

- Make a memorable first impression with an animated name intro.
- Present projects with a showpiece pinned, scroll-driven showcase.
- Use motion with purpose throughout, never as noise.
- Let the administrator manage content without editing source code.
- Stay fast, accessible, secure, and responsive on mobile.
- Deploy cleanly on Vercel.

**Honesty rule (applies everywhere):** never fabricate personal information, experience, qualifications, achievements, project metrics, or coding statistics. Use verified content or clearly marked placeholders until real details are supplied.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Style | Dark, bold, highly animated, explicitly not minimalist |
| Accent | Electric violet (default; swappable through design tokens) |
| Name intro | Letter flip-in with a quick scramble-decode on re-hover (default) |
| Text content storage | **Neon** (hosted Postgres) with **Drizzle ORM** |
| Media storage | **Cloudinary** (audio is the source of truth there) |
| Rate limiting | Upstash Redis |
| Floating UI | One round dock button at bottom-right (AI and Music) |
| Hosting | Vercel |

## 3. Technology stack

### Frontend

- Next.js (App Router), React, TypeScript
- Tailwind CSS and shadcn/ui
- Lucide React icons
- **GSAP** with ScrollTrigger and SplitText for choreographed scroll and text animation
- **Lenis** for smooth scrolling, synced to GSAP
- **Motion for React** for interface state animation (dock, panels, modals, `layoutId` morphs)
- **React Three Fiber, drei, and postprocessing** for one or two hero moments only, loaded with dynamic imports
- Custom GLSL shaders where they add real value

### Backend

- Next.js Route Handlers and server logic
- Zod validation on every input
- Drizzle ORM with Neon (pooled connection or Neon serverless driver)
- Secure admin authentication
- Upstash Redis with `@upstash/ratelimit`

### Services

- Cloudinary (images, PDFs, audio)
- Groq API (chatbot)
- GitHub API (public repos and supported stats)

### Supporting libraries

Sonner (toasts), cmdk (Cmd+K palette), Vaul (mobile drawers), react-hook-form, dnd-kit (reordering), TanStack Table, react-markdown with remark-gfm, Vitest, Playwright, ESLint, Prettier.

Do not add a separate backend framework.

## 4. Visual identity and design system

**Direction:** dark, rich, cinematic, typography-led, interactive. Large, tight display type. Motion is the main source of visual interest.

**Default palette (tokens, easy to change)**

| Token | Value | Use |
|---|---|---|
| Background | `#0A0A0F` | Page |
| Surface | `#12121A` | Cards, panels |
| Border | `#23232F` | Hairlines |
| Text | `#F4F4F6` | Primary text |
| Muted | `#8B8B9A` | Secondary text |
| Accent | `#7C5CFF` | Highlights, focus, active states |
| Accent 2 | `#22D3EE` | Secondary highlights |

**Typography:** a bold display face (Clash Display, Satoshi, or Space Grotesk), a clean body face (Inter or Geist), and Geist Mono for terminal elements and metadata. Load with `next/font`.

**The design system must define:** color tokens, type scale, spacing grid, border radii, shadows and glows, button variants, card variants (including glass), navigation styles, animation timing and easing, and responsive breakpoints.

**Effects allowed:** subtle grain overlay, bloom on emissive elements, glass cards with blur, magnetic cursor, 3D hover tilt. Use them with intent. Every effect must earn its place.

The admin dashboard uses the same tokens but is denser, calmer, and nearly motionless. Clarity first.

## 5. Animation system

Create **one shared animation module** (`lib/motion.ts`) with reusable variants, one easing curve, one spring preset, and GSAP defaults. Components import from it and do not invent their own timing.

**Rules**

- Animate only `transform` and `opacity` wherever possible.
- One `gsap.context` (or `useGSAP`) per section, with cleanup on unmount.
- Scroll effects use ScrollTrigger or Motion's `useScroll`, never raw scroll listeners.
- Lenis runs globally and is disabled for reduced-motion users.
- Only one heavy 3D moment on the public site. Dynamic-import it.
- Every animation has a static fallback under `prefers-reduced-motion`.
- Real HTML text stays in the DOM under all effects, so SEO and assistive technology still work.

**Signature techniques**

- Masked line reveals for headlines
- Staggered letter and word reveals (SplitText)
- Pinned, scrubbed sections
- Horizontal scroll sections and opposing marquee rows
- Clip-path image reveals
- 3D tilt on cards toward the cursor
- Magnetic buttons and a context-aware custom cursor (labels such as View and Play)
- Shared-element expansion (`layoutId`)
- Page transitions (curtain or wipe)
- Scroll progress indicator

## 6. Name loading animation (intro)

A full-screen intro that establishes identity.

**Sequence**

1. Dark clean background.
2. "ADITHYEN K" appears at the middle-left in very large type.
3. Each letter rotates in on the X axis with perspective, staggered from a masked line, with smooth easing and convincing depth.
4. A small terminal-style status panel sits near the bottom with lines tied to **real events** (fonts ready, content loaded, canvas ready). No simulated progress, no fake network completion.
5. The screen splits like curtains and slides away to reveal the hero.
6. After the intro, hovering the name triggers a brief scramble-decode effect.

**Engineering requirements**

- Short total duration (about 2 to 3 seconds).
- Never block the site while optional assets load.
- Remember completion for the browser session (`sessionStorage`).
- Provide a focusable, accessible skip control.
- Support reduced motion (simple fade).
- Lighter mobile version.
- If the animation fails or times out, main content must remain usable.
- Load Three.js only if the hero scene needs it.

## 7. Public portfolio sections

### Hero

Name, professional headline, short introduction, three magnetic buttons (Projects, Resume, Contact), selected technical highlights, and an interactive terminal card driven by real data (`whoami`, `ls projects`, and similar). The headline reacts to the mouse with slight tilt and parallax. One optional hero visual: a floating 3D element or shader blob, dynamically imported with a mobile fallback.

### About

A large statement that fills or highlights word by word on scroll, plus a short facts column.

### Skills and technologies

Grouped categories (languages, frontend, backend, databases, AI/ML, DevOps, tools). Horizontal-scroll or marquee presentation with hover lift. Verified skills only. No fake percentage bars.

### Projects (the showpiece)

- **Pinned showcase:** projects stack as full-screen cards. As you scroll, each card scales down and tilts back while the next slides up over it.
- **Hover:** 3D tilt toward the cursor, clip-path image reveal, cursor becomes "View".
- **Click:** the card expands to fill the screen via shared-element transition, then details stagger in.
- **List mode:** large project titles where hovering a title shows a preview that follows the cursor.
- Each project supports: name, description, technologies, image or preview, GitHub URL, live URL, featured flag, and display order.

### Experience and education

Animated timeline whose line draws on scroll, entries entering from alternating sides. Show only real data.

### Certificates

Grid or masonry with thumbnails, a modal viewer for PDFs and images, a view action, and a download action. Discoverable from Cloudinary-backed records.

### Achievements

Verified achievements only. No animated counters for numbers that are not real.

### GitHub and coding statistics

Real public repo data, languages, and contribution activity only where reliable data exists. Manually maintained stats must be clearly labeled. Never scrape restricted sites or fabricate contribution graphs.

### Contact

Large "Let's talk" typography, social links, magnetic icons, and a server-validated contact form with clear success and error states.

### Resume

A button that opens or downloads the latest resume from Cloudinary, read from the current resume record rather than a hardcoded URL.

## 8. Floating dock (AI and Music)

One round button at the bottom-right is the only floating control.

| State | Behavior |
|---|---|
| Idle | Round button with an AI icon inside. |
| Hover, focus, or tap | Two options spring out upward with stagger and tooltips: Music and AI. Touch devices open the options on first tap. |
| Click Music | Options fold away and a compact bar grows out of the button: play/pause, previous/next, marquee title, seek bar, and an expand control for playlist and volume. |
| Click AI | The button morphs into the chat panel (bottom sheet on mobile). Closing it shrinks back into the button. |
| Song playing, bar closed | The music icon stays out as a satellite bubble with equalizer bars rising one by one. Click to reopen the bar. |
| Paused or stopped | The satellite bubble slides back into the button and the bars shrink away. |

The AI icon always stays inside the main button.

**Engineering**

- Motion for React with shared `layoutId` so button, bar, and panel feel like one morphing object. Spring around `stiffness 400, damping 30`.
- `AnimatePresence` for pop-outs and the satellite.
- A single global `AudioProvider` in the root layout (one `<audio>` element, state for `isPlaying`, `currentTrack`, `time`) so playback continues across navigation.
- Keyboard access, `aria-expanded`, Esc to close, and focus management.
- Safe-area bottom offset for phones.
- If the AI panel opens on mobile, collapse the music bar to its satellite to avoid overlap.
- Equalizer bars are decorative unless driven by a real Web Audio `AnalyserNode`; never claim decorative bars represent real frequencies. Static bars under reduced motion.
- No autoplay with sound. Never more than one simultaneous stream.

## 9. Music system (Cloudinary)

Cloudinary is the **source of truth** for audio. No duplicate song list in the database.

**Admin Music Library (`/admin/music`)**

- List audio in the designated folder (`portfolio/music`) with filename, format, size, and upload date.
- Upload one or more files with progress, validation, and clear errors.
- Preview, search, refresh, and delete selected songs.
- Loading, empty, success, and error states.

**Critical implementation notes**

- Cloudinary stores audio as `resource_type: "video"`. Listing and deleting must use that type or deletes fail silently.
- Use the Admin API with a folder prefix and follow `next_cursor` for pagination.
- Deletion verifies admin authorization, resource type, and that the asset's `public_id` starts with `portfolio/music/`, then calls Cloudinary's destroy. It must remove the real asset, not just hide it.
- **Uploads go directly from the browser to Cloudinary using server-signed parameters.** Vercel's request body limit (about 4.5 MB) would block songs sent through the server. The server only issues signatures after verifying admin auth, and scopes them to allowed folders, types, and sizes.

**Public player**

Play/pause, previous/next, playlist, volume, seek, current time and duration, song selection, loading and error states. The playlist refreshes after uploads and deletions. Handles unavailable audio gracefully.

## 10. Groq-powered AI assistant

Available from the dock throughout the public site.

**Visitor experience:** open and close, suggested question chips, session-only message history, loading indicators, streaming, markdown rendering, links to relevant sections and projects, error and retry states, mobile-friendly bottom sheet.

**Context:** build a compact context from **published** content only: profile, projects, experience, education, skills, certificates, achievements, resume link, public social links, and available stats. Cache it and rebuild when content changes. Never send drafts, admin settings, credentials, or secrets to the model.

**Server-side rules**

- Groq is called only from a server endpoint using `GROQ_API_KEY` and `GROQ_MODEL`. Use a model ID available to the configured account.
- Validate requests with Zod, cap message length and history length, and rate limit per IP using Upstash.
- The assistant must not invent facts. If information is missing, it says so.
- Treat visitor input and content as untrusted. Ignore instructions that try to reveal secrets or override rules (prompt-injection resistant).

## 11. GitHub integration

- `GITHUB_USERNAME` required. Optional server-side token for authenticated access (needed for contribution graphs through GraphQL).
- Server-side fetch with brief caching (about 1 hour revalidation).
- Loading skeletons, error handling, and a quiet fallback.
- The site must keep working if GitHub is down.
- Omit contribution graphs if no token is configured. Never fabricate.

## 12. Content storage (Neon + Drizzle)

Text content lives in Neon. Cloudinary stores only files; the database stores their URLs and `public_id`s.

**Tables**

```
profile        single row: name, headline, intro, photo_public_id, ...
projects       id, name, description, tech[], image_public_id, github_url,
               live_url, featured, sort_order, published
experience     id, org, role, start, end, bullets[], tech[], sort_order, published
education      id, school, degree, start, end, details, sort_order, published
skills         id, category, name, sort_order
certificates   id, title, asset_public_id, resource_type, url, sort_order, published
achievements   id, title, description, date, sort_order, published
social_links   id, label, url, sort_order
resume         single row: asset_public_id, url, updated_at
site_settings  single row
```

Every list table has `published` and `sort_order`. Public pages and the chatbot read only published rows.

**Architecture**

- A `ContentRepository` interface (list, get, create, update, remove, reorder) with a `SqlContentRepository` implementation (Drizzle). Components, the chatbot, and the admin only talk to the interface.
- Public reads use Next.js caching with tags. After an admin save, call `revalidateTag` so the site and chatbot context update without a redeploy.
- A one-time **seed script** loads initial verified content (placeholders clearly marked).
- Use a separate Neon branch (or local Postgres) for development so production data is never edited while testing.
- Use Neon's pooled connection or serverless driver on Vercel.
- Keep `DATABASE_URL` server-only. Document backup and export steps (for example `pg_dump`).

Zod schemas and TypeScript types are shared by the forms, API handlers, and repository.

## 13. Cloudinary media management

Suggested folders: `portfolio/profile`, `portfolio/projects`, `portfolio/certificates`, `portfolio/resume`, `portfolio/music`.

- Server-side-only privileged operations. Never expose the API secret to the browser.
- Validate file type and size, show upload progress, handle failures, prevent duplicate submissions, and show previews.
- Preserve existing media until a replacement uploads successfully. Delete old assets only after verifying the replacement and authorization.
- Use `f_auto,q_auto` and responsive transformations.

**Certificates:** select a PDF or image and upload. The filename becomes the default title, with no required metadata. After upload it appears in the public gallery. Optional metadata editing comes later. PDFs get a thumbnail preview and a download option.

**Resume:** upload a replacement. After success, the public button points to the newest resume.

## 14. Admin dashboard and security

Route: `/admin`. Sections: Overview, Profile, Projects, Experience, Education, Skills, Certificates, Resume, Music Library, Media Library, Social Links, GitHub and Stats, AI Assistant Settings, Site Settings. Implement only settings with a defined purpose. No fake switches.

**Capabilities:** create, edit, delete, reorder (drag and drop), publish or unpublish, preview, and upload media, using validated forms, clear errors, and confirmation dialogs. Overview numbers come from real data.

**Security**

- Credentials login with a bcrypt or argon2 hash and signed, httpOnly, secure, sameSite session cookies.
- Every admin page and every mutation endpoint checks the session on the server. Hiding buttons is never protection.
- Origin checks against CSRF, login rate limiting, and Zod validation on all inputs.
- Never expose secrets or unpublished data through public endpoints.
- Security headers in `next.config`. Never commit `.env.local`.

## 15. Performance and accessibility

- `next/image` with Cloudinary transformations, lazy loading for non-critical media, and stable layouts to minimize layout shift.
- Dynamic imports for 3D and heavy panels. Do not load a 3D scene or large asset merely because an element could use one.
- **Device tiers:** high-end devices get the full scene and post-processing. Low-end and mobile get a simplified scene or a static poster with CSS animation. Cap pixel ratio at about 1.5 to 2.
- Pause rendering when the tab is hidden or the canvas is off-screen.
- Semantic HTML, keyboard navigation, visible focus indicators, 4.5:1 text contrast, accessible labels, and reduced-motion support.
- Animations never block navigation, forms, or assistive technologies. The HTML layer must work even if WebGL fails.

## 16. SEO and deployment

Titles, descriptions, Open Graph metadata and image, sitemap, robots, canonical URLs, favicon and app metadata, error pages, and a verified production build.

**Environment variables (only those actually used)**

```
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
GROQ_MODEL=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
AUTH_SECRET=
GITHUB_USERNAME=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Document each one, keep secrets server-side, and run database migrations in the build or release step.

## 17. Required development process

Do not build everything in one uncontrolled pass.

**First**, inspect the existing repository (dependencies, structure, routes, working features) and preserve what works. **Then** produce: an architecture summary, design system proposal, animation strategy, component structure, content model, phased plan, and a list of security and deployment constraints.

**Phases**

| Phase | Scope |
|---|---|
| 1 | Foundation, design tokens, shared motion module, Lenis and GSAP setup, name intro, hero, layout shell |
| 2 | Neon and Drizzle schema, migrations, seed script, repository layer, all public sections reading from the database, pinned project showcase |
| 3 | Admin auth, dashboard, CRUD with reorder and publish, Cloudinary signed uploads, certificates and resume flows |
| 4 | Music library (admin), AudioProvider, the dock (button, music bar, satellite bubble) |
| 5 | Groq chatbot and API, GitHub integration |
| 6 | Accessibility, performance audit, tests, SEO, security review, README and deployment guide |

After each phase: run relevant tests, TypeScript checks, linting, and a production build where appropriate. Fix errors before moving on, then summarize what is complete and what is limited. Do not rewrite working features unnecessarily, do not silently replace existing integrations, and do not leave core functionality as nonfunctional mock interfaces.

## 18. Testing and verification

Test public navigation, responsive layouts, the intro and reduced motion, project rendering and showcase animation, certificate upload and preview, resume replacement, music upload, listing, preview, and **real deletion**, folder restriction (deleting outside `portfolio/music` must fail), admin authorization (unauthenticated mutations must fail), chatbot answers and its "I don't have that information" behavior, prompt-injection attempts, rate limiting, API failure handling, GitHub failure fallback, TypeScript, linting, and the production build.

Use real integrations where credentials exist. Where credentials are missing, document configuration steps instead of claiming the integration was tested.

## 19. Final acceptance criteria

1. A distinctive, polished, animation-rich visual identity.
2. An animated, responsive, accessible, and performant name intro.
3. A pinned, scroll-driven project showcase with hover and expand interactions.
4. Portfolio sections read centralized, validated content from Neon.
5. The administrator manages content through a protected dashboard, and edits persist in production.
6. Cloudinary stores and serves all media.
7. The Music Library lists, uploads, previews, and deletes real audio assets.
8. The dock opens the music bar and the AI panel as described, and the satellite bubble appears only while a song plays.
9. The Groq assistant answers only from published portfolio information.
10. GitHub data is genuine and degrades gracefully.
11. The site stays usable on mobile and with reduced motion.
12. Secrets are protected and admin operations are authorized on the server.
13. No fabricated content anywhere.
14. Tests, linting, and the production build pass, or remaining failures are explicitly reported.

**Final instruction:** treat this as one cohesive product, not a set of demos. Prioritize visual quality, thoughtful motion, maintainable architecture, real functionality, security, and performance. Inspect first. Plan carefully. Implement incrementally. Verify every major feature.
