# manueldavid.dev Renovation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild manueldavid.dev as a Configure-focused, F1-75 × Apple Liquid Glass portfolio with GSAP motion, a tree-style work page, a filterable URL-first projects wall, a rebuilt Claude chat, and a Gravity-style ghost-wordmark footer.

**Architecture:** Gut-and-rebuild inside the existing Next.js 15 App Router repo (Option A from spec). All content lives in one typed file (`lib/content.ts`); pages are thin renderers. Chat is one streaming API route (Firebase web-frameworks backend already enabled via `frameworksBackend` in firebase.json). Glass is a custom CSS/SVG-filter primitive unless the `liquid-glass-react` spike wins.

**Tech Stack:** Next.js 15.0.3, React 18, TypeScript, Tailwind 3.4, GSAP 3.13 (+ @gsap/react, ScrollTrigger, Flip, SplitText, Observer — all free since 3.13), @anthropic-ai/sdk (Haiku 4.5), Firebase Hosting web frameworks.

**Spec:** `docs/superpowers/specs/2026-07-22-portfolio-renovation-design.md`

**Standing rules:**
- Every piece of visible copy gets a `/humanizer` pass before commit (Task 12 is the sweep; write copy naturally as you go).
- Design-pass tasks consult: ui-ux-pro-max, /gsap (+gsap-react, gsap-scrolltrigger, gsap-plugins, gsap-performance), /animate, /motion-design, /ui-styling, typography.
- `prefers-reduced-motion` respected via `gsap.matchMedia()` in every animation.
- Commit after every task minimum. Never force-push. Branch: `renovation`.

---

### Task 0: Branch + dependency baseline

**Files:**
- Modify: `package.json`

- [ ] **Step 0.1:** `cd ~/Projects/manuel_david_new_portfolio && git checkout -b renovation`
- [ ] **Step 0.2:** Install new deps:
```bash
npm install @gsap/react @anthropic-ai/sdk
npm install -D playwright
```
- [ ] **Step 0.3:** `npm run dev` — confirm the OLD site still boots on :3000 (baseline sanity). Expected: compiles, old pages render.
- [ ] **Step 0.4:** Commit: `chore: add gsap react + anthropic sdk deps`

### Task 1: Content layer — `lib/content.ts`

Single source of truth. Draft copy now; humanizer sweep in Task 12; user fact-check gate before deploy.

**Files:**
- Create: `lib/content.ts`

- [ ] **Step 1.1:** Write the file:

```ts
export type Status = "current" | "earning" | "shipped" | "open-source" | "exploration" | "archived" | "prior";

export const profile = {
  name: "Manuel David",
  role: "Founding Engineer",
  company: "Configure",
  companyUrl: "https://configure.dev",
  location: "San Francisco, CA",
  email: "manuel@configure.dev",
  calendar: "https://calendar.app.google/JKgCXGsa3r6Ar7uU6",
  github: "https://github.com/Manueldav2",
  linkedin: "https://www.linkedin.com/in/manuel-david-3b6245328/",
  x: "https://x.com/manny2techy",
  xHandle: "@manny2techy",
  headline: "Building context infrastructure for AI agents.",
  bio: [
    "I build agent infrastructure at Configure — the user-owned system of record that lets AI agents recognize you and share context across platforms. Think Plaid, but for personal context.",
    "Before that I founded Paradigm, an AI cold-outreach platform, and ran it to the point where it paid for itself without me. I became a Configure customer through Paradigm, saw where agents were heading, and joined as founding engineer.",
  ],
  stats: [
    { label: "Projects shipped", value: 15 },
    { label: "Years building", value: 4 },
  ],
  skills: [
    "TypeScript", "Python", "Next.js", "React", "Node.js",
    "AI agents", "MCP", "Claude API", "Gemini API", "GSAP",
    "Firebase / GCP", "Supabase", "Stripe", "Three.js",
  ],
};

export type WorkEntry = {
  company: string; role: string; status: Status; dates: string;
  blurb: string; url?: string;
};

export const work: WorkEntry[] = [
  {
    company: "Configure", role: "Founding Engineer", status: "current",
    dates: "2026 — now",
    blurb: "Context infrastructure for AI agents — one profile that travels with you across every agent you use. I was a customer first. Then I joined to build it.",
    url: "https://configure.dev",
  },
  {
    company: "Paradigm", role: "Founder & CEO", status: "earning",
    dates: "2025 — now",
    blurb: "AI cold outreach, end to end: finds prospects, researches them, writes the emails, handles replies, books the meetings. Built it to self-sufficiency — it earns while I work on Configure.",
    url: "https://paradigmoutreach.com",
  },
  {
    company: "Freelance", role: "Web Engineer", status: "prior",
    dates: "2024 — 2025",
    blurb: "Client sites and tools: portfolios for dancers and athletes, a detailing company's storefront, resume platforms. Where I learned to ship fast and alone.",
  },
];

export type Project = {
  slug: string; name: string; status: Status; year: string;
  blurb: string; url?: string; github?: string; favicon?: string;
};

export const projects: Project[] = [
  { slug: "idex", name: "IDEX", status: "current", year: "2026",
    blurb: "The IDE that watches the wait. A free, open-source cockpit for coding agents with a contextual scroll feed.",
    url: "https://idex.dev", github: "https://github.com/Manueldav2/idex" },
  { slug: "ultron", name: "Ultron", status: "current", year: "2026",
    blurb: "Hosted MCP server with 26 tools, bridged live into DevCore OS. My agents' home base.",
    url: "https://ultron-omega.vercel.app" },
  { slug: "launch-control", name: "Launch Control", status: "shipped", year: "2026",
    blurb: "One idea in, a week of on-brand launch content out — planned, made, self-graded, and shipped by a swarm of Claude agents. Built for Claude Build Day.",
    github: "https://github.com/Manueldav2/launch-control" },
  { slug: "gideon", name: "Gideon", status: "shipped", year: "2026",
    blurb: "AI study platform (a.k.a. VisboardAI / ThoughtPlot): talk to it, and it maps what you're learning visually.",
    github: "https://github.com/Manueldav2/VisboardAI" },
  { slug: "claude-classroom", name: "Claude Classroom", status: "open-source", year: "2026",
    blurb: "Makes many Claude Code sessions work as one team — shared board, file claims, negotiation, live dashboard.",
    github: "https://github.com/Manueldav2/claude-classroom" },
  { slug: "claude-skills-sync", name: "claude-skills-sync", status: "shipped", year: "2026",
    blurb: "npx claude-skills-sync — sync your Claude skills across machines with one token.",
    url: "https://www.npmjs.com/package/claude-skills-sync" },
  { slug: "tripfund", name: "TripFund", status: "shipped", year: "2026",
    blurb: "Trip savings tracker with live flight search, an AI assistant, and Stripe group contributions.",
    url: "https://tripfund-mocha.vercel.app", github: "https://github.com/Manueldav2/destino" },
  { slug: "satisfying-video-generator", name: "Satisfying Video Generator", status: "shipped", year: "2026",
    blurb: "Gemini + Veo 3.1 pipeline that generates satisfying TikToks and posts them itself.",
    url: "https://satisfying-video-gen.web.app", github: "https://github.com/Manueldav2/satisfying-video-generator" },
  { slug: "sovereign", name: "SOVEREIGN", status: "exploration", year: "2026",
    blurb: "Browser 3D RTS in Three.js — command armies, or possess a single unit and fight first-person.",
    github: "https://github.com/Manueldav2/sovereign" },
  { slug: "zantana", name: "Zantana", status: "exploration", year: "2026",
    blurb: "Quiplash-style party game in a single HTML file. No backend, no build, just open it and play.",
    github: "https://github.com/Manueldav2/zantana" },
  { slug: "revive-rides", name: "Revive Rides", status: "shipped", year: "2026",
    blurb: "Client work: a mobile detailing company's site, built and shipped on Firebase.",
    url: "https://revive-rides.web.app" },
];
```

- [ ] **Step 1.2:** `npx tsc --noEmit` scoped check passes (repo has `ignoreBuildErrors`, so run tsc directly). Expected: no errors in `lib/content.ts`.
- [ ] **Step 1.3:** Commit: `feat: typed content layer — profile, work, projects`

### Task 2: Fonts + design tokens

**Files:**
- Create: `lib/fonts.ts`
- Modify: `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`

- [ ] **Step 2.1:** `lib/fonts.ts` with next/font (candidates per spec; final call in Task 6 design pass):
```ts
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";

export const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
export const body = Archivo({ subsets: ["latin"], variable: "--font-body" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```
- [ ] **Step 2.2:** Token layer in `globals.css` (replace shadcn default palette values, keep the CSS-var structure): near-black base `#0a0a0c`, glass tints, one hot accent (start `#ff2d2d` F1-red family; ui-ux-pro-max pass may swap), `--glass-blur`, `--glass-edge` vars. Wire `fontFamily.display/body/mono` into `tailwind.config.ts` from the CSS vars. Apply font variables + dark class on `<html>` in `layout.tsx`; update `metadata` (title "Manuel David — Founding Engineer at Configure", description from profile.headline) and favicon.
- [ ] **Step 2.3:** Visual check on dev server; commit: `feat: fonts + dark token system`

### Task 3: Glass primitive (+ liquid-glass spike)

**Files:**
- Create: `components/glass/Glass.tsx`, `app/glass-lab/page.tsx` (temporary)

- [ ] **Step 3.1 (spike, timeboxed 20 min):** `npm install liquid-glass-react`, render one card in `/glass-lab`. Judge: perf (60fps scroll), SSR safety, look. If it stutters or fights SSR, uninstall and go custom.
- [ ] **Step 3.2 (custom fallback, expected winner):** `Glass.tsx` — a polymorphic wrapper div: `backdrop-filter: blur(18px) saturate(160%)`, layered inset box-shadows for the specular edge, SVG displacement filter (`<feTurbulence>` + `<feDisplacementMap>` defined once in layout) for the liquid refraction, 1px gradient border via mask. Props: `as`, `className`, `interactive` (adds pointer-tracked specular highlight via GSAP quickTo).
- [ ] **Step 3.3:** Verify in `/glass-lab` over an image background (refraction visible), then over flat dark (still reads as glass). Delete `/glass-lab` in Task 11.
- [ ] **Step 3.4:** Commit: `feat: liquid glass primitive` (note spike verdict in commit body).

### Task 4: Nav + Footer (Gravity-style ghost wordmark, brand-logo socials)

**Files:**
- Create: `components/site/Nav.tsx`, `components/site/Footer.tsx`, `components/site/BrandIcon.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 4.1:** `Nav.tsx` — fixed top glass bar (uses `Glass`): wordmark "manuel david", links work / projects / chat, theme toggle (next-themes already installed). Active link = accent underline slide (GSAP Flip on an indicator span).
- [ ] **Step 4.2:** `BrandIcon.tsx` — inline official SVG paths (real marks, not lucide approximations) for `x`, `linkedin`, `github`, sized via props. Use the official X logo path, LinkedIn "in" glyph, GitHub octocat mark. Fill `currentColor`.
- [ ] **Step 4.3:** `Footer.tsx` — top row: email (mailto), calendar ("book time →"), socials with BrandIcon (X @manny2techy, LinkedIn, GitHub). Bottom: the ghost wordmark, adapted from the user-provided Gravity recipe:
```tsx
<div
  aria-hidden="true"
  className="-mb-[0.26em] select-none text-center font-display font-bold leading-none tracking-tight"
  style={{
    fontSize: "clamp(86px, 18vw, 300px)",
    backgroundImage: "linear-gradient(rgb(22,22,25) 0%, rgb(31,31,35) 42%, rgb(43,43,48) 74%, rgb(58,58,64) 100%)",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    maskImage: "linear-gradient(rgb(0,0,0) 0%, rgb(0,0,0) 58%, rgba(0,0,0,0.45) 84%, transparent 100%)",
  }}
>
  MANUEL
</div>
```
(Light-theme gradient variant via CSS vars.)
- [ ] **Step 4.4:** Mount Nav + Footer in `layout.tsx`. Verify all links (correct handles/URLs from `profile`). Commit: `feat: glass nav + ghost-wordmark footer with brand socials`

### Task 5: Home page — F1-75 hero + arc bio + skills strip

**Files:**
- Rewrite: `app/page.tsx`
- Create: `components/home/Hero.tsx`, `components/home/SkillsStrip.tsx`

- [ ] **Step 5.1:** `Hero.tsx` (client): layered composition — back layer giant ghosted "MD" numeral-style monogram (same gradient-text technique as footer), mid layer abstract glass shape (Glass with heavy displacement), front layer display-type name at `clamp(64px, 12vw, 220px)`, metadata labels top-left ("San Francisco" + 🇺🇸-free plain text, "Founding Engineer @ Configure") in mono font, and a right-aligned stat stack (profile.stats) rendered like F1 season points — big tabular numerals, accent on the last.
- [ ] **Step 5.2:** GSAP load sequence with `useGSAP`: SplitText char-stagger on the name (chars fly up with `back.out(1.7)`), labels fade-slide in, stat numerals count up (`gsap.to` with `snap: 1`), Observer pointer-parallax on the three layers (±12px, quickTo). All inside `gsap.matchMedia()` with a reduced-motion branch that just fades.
- [ ] **Step 5.3:** Below hero: arc bio (two paragraphs from `profile.bio`, line-reveal on scroll) and `SkillsStrip.tsx` — single-row marquee of `profile.skills` chips (Glass pills, GSAP horizontal loop, pause on hover, static grid under reduced motion).
- [ ] **Step 5.4:** Entry links to /work /projects /chat as three glass tiles with magnetic hover.
- [ ] **Step 5.5:** Design pass with ui-ux-pro-max + motion-design skills; Lighthouse spot check ≥90 perf. Commit: `feat: F1-style hero home page`

### Task 6: Work page — tree/timeline

**Files:**
- Create: `app/work/page.tsx`, `components/work/WorkTree.tsx`, `components/work/StatusTag.tsx`
- Delete (Task 11 actually removes): `app/experience/`

- [ ] **Step 6.1:** `StatusTag.tsx` — mono uppercase pill; color by status (current=accent, earning=green, prior=neutral). Reused by projects.
- [ ] **Step 6.2:** `WorkTree.tsx` — vertical line (SVG path, `drawSVG`-style via strokeDashoffset tween on ScrollTrigger scrub), nodes alternating compact rows: StatusTag, company (display font), role + dates (mono), one-line blurb, `site →` link. Node pop-in with `back.out` as each crosses 80% viewport.
- [ ] **Step 6.3:** `app/work/page.tsx` renders header ("work", entry count — Myles-style) + `<WorkTree entries={work} />`.
- [ ] **Step 6.4:** Commit: `feat: work timeline tree`

### Task 7: Projects wall — search + Flip filtering

**Files:**
- Create: `app/projects/page.tsx` (thin server wrapper), `components/projects/ProjectsWall.tsx`, `components/projects/ProjectCard.tsx`

- [ ] **Step 7.1:** `ProjectsWall.tsx` (client): search input (glass), filter pills ALL/CURRENT/SHIPPED/OPEN-SOURCE/EXPLORATION/ARCHIVED. Filtering logic:
```tsx
const visible = projects.filter(p =>
  (filter === "all" || p.status === filter) &&
  (q === "" || (p.name + " " + p.blurb).toLowerCase().includes(q.toLowerCase()))
);
```
- [ ] **Step 7.2:** Flip re-layout on filter/search change:
```tsx
const state = Flip.getState(gridRef.current!.children);
setFilter(next); // then in useLayoutEffect after render:
Flip.from(state, { duration: 0.5, ease: "power3.inOut", stagger: 0.02, absolute: true, onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1 }), onLeave: els => gsap.to(els, { opacity: 0, scale: 0.92 }) });
```
- [ ] **Step 7.3:** `ProjectCard.tsx` — Glass card: favicon tile (from `p.favicon`, fallback glass monogram of first letter), StatusTag + year (mono, right), name, blurb, links row (`site →`, GitHub mark via BrandIcon). Tilt-on-hover (GSAP quickTo rotateX/Y ±6°, disabled touch/reduced-motion).
- [ ] **Step 7.4:** Commit: `feat: filterable projects wall with Flip animations`

### Task 8: Favicons + URL resolution

**Files:**
- Create: `scripts/fetch-favicons.mjs`, `public/favicons/*`
- Modify: `lib/content.ts` (favicon paths + resolved URLs)

- [ ] **Step 8.1:** Resolve open URLs: check Launch Control and Gideon/VisboardAI repos + Vercel/Firebase deploy lists for live URLs (`gh api repos/.../deployments`, `vercel ls` if authed, repo READMEs). Update `content.ts` if found; otherwise GitHub link only.
- [ ] **Step 8.2:** `scripts/fetch-favicons.mjs` — for each project with `url`: fetch `https://www.google.com/s2/favicons?domain=<host>&sz=128` to `public/favicons/<slug>.png`; skip on 404/generic-globe (byte-compare against known default). Set `favicon` field in content.ts for successes.
- [ ] **Step 8.3:** Run it, eyeball the PNGs, commit assets: `feat: project favicons`

### Task 9: Chat — streaming Claude route + glass UI

**Files:**
- Create: `app/api/chat/route.ts`, `lib/chat-system-prompt.ts`
- Rewrite: `app/chat/page.tsx`, create `components/chat/Chat.tsx`

- [ ] **Step 9.1:** `lib/chat-system-prompt.ts` — builds the system prompt from `profile`, `work`, `projects` (serialize the content file; instruct: answer as Manuel's site assistant, be direct and warm, redirect job/collab talk to email/calendar, refuse off-topic deep dives politely).
- [ ] **Step 9.2:** `app/api/chat/route.ts`:
```ts
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/chat-system-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json(); // [{role:"user"|"assistant", content:string}]
  if (!Array.isArray(messages) || messages.length > 40) return new Response("Bad request", { status: 400 });
  const client = new Anthropic(); // ANTHROPIC_API_KEY from env
  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 700,
    system: buildSystemPrompt(),
    messages: messages.slice(-12).map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
  });
  return new Response(stream.toReadableStream(), { headers: { "Content-Type": "text/event-stream" } });
}
```
- [ ] **Step 9.3:** `Chat.tsx` — glass panel, message list (user right / assistant left), suggested-prompt chips ("What is Configure?", "Tell me about Paradigm", "What's IDEX?"), streaming reader parsing the SDK's event stream, GSAP spring entrance per message, typing shimmer while streaming.
- [ ] **Step 9.4:** Local test with `ANTHROPIC_API_KEY` in `.env.local` (git-ignored). Ask "What is Configure?" — expect streamed on-message answer. Commit: `feat: rebuilt streaming Claude chat`

### Task 10: Redirects + metadata

**Files:**
- Modify: `next.config.mjs`, `app/layout.tsx`
- Create: `app/opengraph-image.tsx` (or static `public/og.png`)

- [ ] **Step 10.1:** Redirects in `next.config.mjs`: `/experience → /work`, `/education → /`, `/summary → /`, `/skills → /` (301s).
- [ ] **Step 10.2:** OG image: dark card, display-type name + "Founding Engineer @ Configure" (static PNG generated once is fine). Full metadata: title template, description, OG/Twitter tags with @manny2techy.
- [ ] **Step 10.3:** Commit: `feat: redirects + og/social metadata`

### Task 11: Demolition

**Files:**
- Delete: `app/education/`, `app/experience/`, `app/skills/`, `app/summary/`, `app/glass-lab/`, `app.py`, `portfolio-chatbot-backend/`, `public/manuel-resume.pdf` (outdated), placeholder assets, unused old components.

- [ ] **Step 11.1:** Delete the directories/files above. Grep for dangling imports/links (`grep -rn "education\|summary\|experience\|resume" app components lib`). Fix hits.
- [ ] **Step 11.2:** Prune package.json: remove now-unused deps (recharts, embla, react-day-picker, input-otp, vaul, cmdk, react-resizable-panels, unused radix packages — verify each with grep before removing).
- [ ] **Step 11.3:** `npm run build` passes. Commit: `chore: remove education/old pages, flask chat, dead deps`

### Task 12: Copy sweep — /humanizer

- [ ] **Step 12.1:** Collect every visible string (content.ts, hero labels, chat suggested prompts, empty states, footer, metadata descriptions).
- [ ] **Step 12.2:** Run the humanizer skill over the full set; apply edits. Watch for: AI-isms, promotional fluff, rule-of-three, em-dash overuse.
- [ ] **Step 12.3:** Commit: `polish: humanizer pass on all copy`

### Task 13: Verification

- [ ] **Step 13.1:** Playwright smoke (playwright-skill): every route renders, zero console errors, filter pills re-layout correctly, search narrows, chat streams a reply, all external links resolve (HEAD 200/301), mobile 390px clean, `prefers-reduced-motion` shows static variants.
- [ ] **Step 13.2:** Lighthouse on / and /projects: perf ≥90, a11y ≥95.
- [ ] **Step 13.3:** **User content fact-check gate:** present work dates/titles + project statuses table to user; apply corrections.
- [ ] **Step 13.4:** Design audit pass (design-audit skill): motion gaps, contrast, spacing rhythm.

### Task 14: Review + deploy

- [ ] **Step 14.1:** PR review stack per standing rule: pr-review-expert + superpowers:code-reviewer + vibe-security lens (API key exposure, chat route abuse limits). Fix findings.
- [ ] **Step 14.2:** Merge `renovation` → `main` (no force-push; fetch+rebase first per multi-session rule).
- [ ] **Step 14.3:** Set `ANTHROPIC_API_KEY` for the Firebase frameworks backend (`firebase functions:secrets:set` / apphosting env per what the CLI generates). Deploy: `firebase deploy`. Verify https://manueldavid.dev live: hero, filters, chat streams in prod.
- [ ] **Step 14.4:** Post-deploy smoke on the live domain; update memory file for the project.

---

## Self-review notes

- Spec coverage: identity block (T1), removals (T10/T11), home (T5), work tree (T6), projects wall + URL-first + favicons (T7/T8), chat rebuild (T9), footer/socials/ghost wordmark (T4), fonts/tokens (T2), glass (T3), GSAP arsenal (T5–T7), humanizer (T12), Playwright/Lighthouse/review stack (T13/T14). Education/calendar removals: old calendar link lives in deleted pages; grep in 11.1 catches strays.
- Types consistent: `Status` union shared by StatusTag, WorkEntry, Project. `profile` fields referenced in T4/T5/T9/T10 all exist in T1.
- Open items from spec mapped: URLs (8.1), fonts/accent finalization (2.2/5.5), glass spike (3.1).
