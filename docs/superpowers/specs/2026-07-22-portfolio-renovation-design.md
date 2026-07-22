# manueldavid.dev — Full Renovation Design Spec

Date: 2026-07-22
Status: Approved approach (Option A — gut-and-rebuild in existing repo)
Repo: `Manueldav2/manuel_david_new_portfolio` → deploys to Firebase Hosting at https://manueldavid.dev

## Goal

Replace the outdated portfolio with a modern, Configure-focused site that presents Manuel David as Founding Engineer at Configure (SF), Founder & CEO of Paradigm (self-sufficient, passive revenue), and a prolific builder — with a projects wall in the spirit of mylesiyabor.com/work (status filters, live URLs, favicons) and a bold F1-75 × Apple Liquid Glass visual identity driven by GSAP.

## Sources of truth for content

- Meeting transcript (Jul 20, 2026) — Configure positioning ("Plaid for context", context infrastructure for AI agents), the Paradigm → client → founding engineer arc, go-to-market narrative.
- GitHub (`Manueldav2`) — project inventory, dates, descriptions, languages, public URLs.
- Session memory — Ultron, IDEX, Launch Control, Vector Agents, SOVEREIGN, etc.
- LinkedIn (`linkedin.com/in/manuel-david-3b6245328`) — blocked to anonymous fetch (HTTP 999); user fact-checks titles/dates at content review. If the user pastes their experience section, it supersedes drafted dates.
- configure.dev and paradigmoutreach.com — live copy for company one-liners.

## Identity block (used site-wide)

- Name: Manuel David
- Role: Founding Engineer at Configure — context infrastructure for AI agents ("Plaid for context")
- Location: San Francisco, CA
- Email: manuel@configure.dev
- Booking: https://calendar.app.google/JKgCXGsa3r6Ar7uU6 (replaces old calendar everywhere)
- GitHub: https://github.com/Manueldav2
- LinkedIn: https://www.linkedin.com/in/manuel-david-3b6245328/

## Removals (hard deletes)

- Education page and every education reference.
- Old experience "huge cards" page.
- Old calendar link.
- Old AI chat page + retirement of the Flask backend (`app.py`, `portfolio-chatbot-backend/`) — replaced by new chat (below).
- Standalone projects: Therapist AI, Smart Email Assistant, Social Media Auto Content (the latter two narratively folded into the Paradigm work entry).
- Standalone skills page — skills become a compact strip on Home (tech + focus areas), not a page.

## Site structure

### Home `/`
- Cinematic hero, F1-75 style: oversized display type ("Manuel David"), layered depth (giant ghosted numeral/monogram behind, portrait or abstract glass shape mid, type front), small metadata labels ("San Francisco", "Founding Engineer @ Configure") placed like the reference's "Silverstone England" tags, and a large accent stat treatment (e.g. years building / projects shipped rendered like season points).
- Short arc bio: built Paradigm to self-sufficiency as Founder & CEO → became a Configure client through it → joined as founding engineer.
- Compact skills strip (marquee or staggered chips): TypeScript, Python, Next.js, AI agents/MCP, GSAP, Firebase/GCP, Supabase, Claude/Gemini APIs, etc. (final list drafted from repos, user fact-checks).
- Entry points to Work, Projects, Chat. Global footer: email, GitHub, LinkedIn, calendar.

### Work `/work`
- Vertical tree/timeline (NOT cards): connecting line drawn on scroll, compact nodes.
- Node fields: status tag (`current` / `earning` / `prior`), company, role, one honest punchy sentence, `site →` link, dates.
- Entries:
  1. **Configure** — `current` — Founding Engineer — context infrastructure for AI agents; joined after being a client via Paradigm — configure.dev — 2026–present.
  2. **Paradigm** — `earning` — Founder & CEO — AI cold-outreach platform (lead discovery → personalized sequences → autoresponder → booked meetings); ran it to self-sufficient passive revenue; email-assistant + social-content products folded in — paradigmoutreach.com.
  3. Earlier entries (freelance/client web builds: dance portfolios, resume sites, Revive Rides, nouvo.dev, etc.) drafted from repos as one or two consolidated nodes; user fact-checks.

### Projects `/projects`
- Filterable wall, mylesiyabor.com style: search box + filter pills `ALL / CURRENT / SHIPPED / OPEN-SOURCE / EXPLORATION / ARCHIVED`.
- Card fields: favicon/thumbnail (liquid-glass tile), status tag, year, name, one-liner, live URL + GitHub link when public.
- URL-first rule: projects with live URLs headline the wall; URL-less ones only if notable (open-source counts as having a URL via GitHub).
- Roster (statuses drafted, user fact-checks):
  - **IDEX** — idex.dev — coding-agent cockpit ("the IDE that watches the wait") — current, open-source.
  - **Ultron** — ultron-omega.vercel.app — hosted MCP (26 tools) + DevCore OS bridge — current.
  - **Launch Control** — Claude Build Day: one idea in → a week of on-brand launch content out, made by an Opus agent swarm — shipped (URL resolved at build; GitHub public).
  - **Gideon (VisboardAI / ThoughtPlot)** — AI study platform: voice interaction + visual mapping — shipped (URL resolved at build).
  - **claude-classroom** — open-source — multi-session Claude Code coordination (shared board, file claims, worktrees).
  - **claude-skills-sync** — open-source/shipped — `npx claude-skills-sync` skill syncing.
  - **Destino / TripFund** — tripfund-mocha.vercel.app — trip savings + live flight search + Stripe — shipped.
  - **Satisfying Video Generator** — satisfying-video-gen.web.app — Gemini + Veo 3.1 pipeline with TikTok auto-posting — shipped.
  - **SOVEREIGN** — browser 3D RTS (Three.js) — exploration.
  - **Zantana** — Quiplash-style party game, single HTML file — exploration.
  - **Revive Rides** — revive-rides.web.app — client detailing site — shipped (client work).
- Favicons: fetched at build time from each live URL into `public/favicons/`; GitHub-only projects use repo owner avatar or a generated glass monogram.

### Chat `/chat`
- Rebuilt modern chat: liquid-glass panel, streaming responses, suggested prompts ("What is Configure?", "Tell me about Paradigm", "What's IDEX?").
- Backend: single serverless function calling Claude (Haiku 4.5 for cost) with a system prompt containing the identity block, work entries, and project roster (generated from the same content file). No RAG, no DB.
- Old Flask backend fully retired.

## Footer & socials (site-wide)

- Socials live in the footer only (no dedicated page): X (`@manny2techy`, https://x.com/manny2techy), LinkedIn, GitHub, email, calendar link.
- Real brand logos (official X / LinkedIn / GitHub marks as SVGs, self-hosted in `public/brand/`), not generic icon-font approximations.
- Footer signature: Gravity-style giant ghosted wordmark — "MANUEL DAVID" (or "MANUEL") at `clamp(86px, 18vw, 300px)`, dark metallic vertical gradient via `background-clip: text`, fading out at the bottom with a `mask-image` linear gradient (recipe provided by user from trygravity.ai footer, adapted to our palette/fonts).

## Design language

- **Aesthetic:** F1-75 cinematic boldness × Apple Liquid Glass. Dark-first with theme toggle. One hot accent (F1-red family or electric alternative — finalized in ui-ux-pro-max pass). Giant ghosted numerals/type as depth layers; glass surfaces (refraction, specular edge highlight, subtle chromatic aberration) for cards, nav, chat panel, filter pills.
- **Liquid glass implementation:** evaluate `rdev/liquid-glass-react` (the known Apple Liquid Glass React port) at build time; if too heavy/buggy, fall back to a custom CSS/SVG-filter glass system reproducing the look (backdrop-filter + displacement). Decision documented in the plan.
- **Fonts (updated):** big condensed/heavy grotesk display face for hero + numerals (candidates: Archivo Expanded/Black, Clash Display), clean body sans (Inter/Geist), mono accent for tags/dates/labels (Geist Mono/JetBrains Mono). Final pairing chosen in ui-ux-pro-max pass; loaded via next/font, self-hosted.
- **Typography rules:** proper quotes/dashes, tight display tracking, tabular numerals for stats.

## Motion spec (GSAP — full arsenal, not just scroll)

- Hero: SplitText-style character/line reveal on load; parallax depth layers via Observer/pointer; giant numeral counter roll-in.
- Work tree: ScrollTrigger-drawn timeline line; nodes pop with back/elastic easing; status tags flip in.
- Projects: Flip plugin for filter re-layout animations (cards fluidly reflow when a filter pill is toggled); staggered entrance; magnetic/tilt hover on glass cards.
- Chat: message entrance springs; typing indicator.
- Page transitions: brief glass wipe/blur transition between routes.
- Restraint rules: `prefers-reduced-motion` respected via `gsap.matchMedia()`; 60fps budget (transforms/opacity only, no layout thrash); motion serves hierarchy, no gratuitous loops.
- Skills consulted at implementation: `/gsap` (+ gsap-react, gsap-scrolltrigger, gsap-plugins, gsap-performance), `/animate`, `/motion-design`, `/ui-styling`, ui-ux-pro-max.

## Tech & code layout

- Next.js 15 (App Router) + TypeScript + Tailwind, existing repo, deps upgraded.
- `lib/content.ts` — single typed content file: profile, work entries, projects `{name, status, year, blurb, url, github, favicon}`. Pages are thin renderers.
- GSAP via `@gsap/react` `useGSAP`; all GSAP plugins are free since v3.13 (Webflow acquisition) — SplitText/Flip/Observer usable.
- Chat route: `app/api/chat/route.ts` (Edge/streaming) with `ANTHROPIC_API_KEY` server-side only.
- Build-time favicon fetch script (`scripts/fetch-favicons.mjs`) run manually, results committed.

## Deploy

- Same Firebase project + domain (manueldavid.dev).
- If current hosting is static-only: use Firebase web frameworks support (or Firebase Functions) for the chat route; everything else stays static. Verified during implementation; DNS untouched.

## Testing / acceptance

- Playwright smoke pass (playwright-skill): all routes render, filters work, chat streams, no console errors, mobile viewport (390px) clean, reduced-motion honored.
- Lighthouse: 90+ performance on Home with animations active.
- Content review gate: user fact-checks work dates/titles and project statuses before deploy.
- PR review stack per user's standing rule (pr-review-expert + code-reviewer + security lens) before merge/deploy.

## Out of scope

- Blog, /now page, inspiration page (future).
- CMS — content stays in-code.
- Custom Claude agent beyond simple system-prompted chat.

## Open items (resolved during implementation, not blockers)

1. Launch Control + Gideon live URLs — resolve from repos/deploys at build.
2. Exact earlier-career nodes + dates — user fact-check at content review.
3. Final font pairing + accent color — ui-ux-pro-max design pass.
4. liquid-glass-react vs custom glass — spike at build start.
