# manueldavid.dev — Redesign Brief (anti-slop)

Date: 2026-07-29
Trigger: external feedback that the site "looks vibe coded." Audit confirms it.

## Diagnosis: what the current site does wrong

Scored against documented AI-generated-design tells, the current espresso build hits:

1. Permanent forced dark mode
2. All-caps monospace micro-labels on every section (`SAN FRANCISCO`, `WHERE I'VE PUT THE HOURS`)
3. Numbered section sequences (01 / 02 / 03 ghost numerals)
4. Stat banner row (`15` / `04`)
5. Colored glows and blooms (tan node glow, amber radial)
6. Gradient-clipped display text (ghost wordmarks)
7. Icon-topped cards (project favicon tiles, uniform)
8. Uniform `rounded-2xl` + glassmorphism on every surface

Individually defensible. Together they are the recognizable 2026 AI house style: dark + one warm accent + glass + huge display face + tiny caps mono labels + ghost numerals. The whole system has to go, not be tuned.

## Banned list (applies to every hero and every future page)

- No glassmorphism / `backdrop-blur` cards. No frosted panels.
- No ghost/oversized section numerals as decoration. No `01 —— ABOUT` labels.
- No all-caps monospace micro-labels used as the default labeling device.
- No stat rows / metric banners.
- No gradient-filled text. No colored glows, blooms, or `box-shadow` halos.
- No uniform border radius on everything (especially not `rounded-2xl` on every surface).
- No centered hero column with a badge above the H1.
- No icon-topped feature cards, no bento grid.
- No Inter. No Space Grotesk. No Geist. No lucide icons used decoratively.
- No purple/violet, no blue-purple gradient, no "SaaS blue."
- No fade-up-on-scroll applied uniformly to every element.
- No em-dashes in copy (standing rule).

## What replaces it

Each hero must be driven by a **thesis** — one idea the design argues, expressed in layout, type, color, and interaction together. Not decoration applied to a template.

Requirements shared by all three:
- **Content is fixed.** Read from `lib/content.ts` (`profile`, `work`, `projects`). Do not invent facts. Copy may be trimmed or re-voiced but the facts stand.
- **Perf budget:** first load under ~250 kB JS for the route, interactive in under 2s on a normal laptop. Any 3D must be procedural (primitives, shaders, instancing). No GLTF/texture downloads. No loading spinner that lasts.
- **Motion:** must be integral to the thesis, never generic. Respect `prefers-reduced-motion` with a genuinely usable static state.
- **Accessible:** real text in the DOM (not only in canvas), keyboard reachable, AA contrast on body copy.
- **Distinct typefaces per hero.** Each hero defines its own fonts locally; do not share one type system across the three.
- **Mobile must work.** No horizontal scroll at 390px. 3D degrades or is replaced gracefully.

## The three directions

Built in parallel at `/1`, `/2`, `/3` so they can be compared side by side.

### /1 — CONTEXT FIELD (WebGL, atmospheric, conceptual)
The thesis is his actual work made visible: context as an invisible layer that lets agents recognize you. The page is that layer. A GPU particle field where points near the cursor recognize each other, link, and forget. Restrained editorial type sits quietly on top. The field argues the idea; the type does not shout it.

### /2 — THE SPEC SHEET (no 3D, dense print/terminal editorial)
The thesis is proof over polish: a founding engineer's homepage as a technical specification document. Information density, hairline rules, tabular data, hard corners, asymmetric grid, a light paper ground instead of dark. AI generates airy and centered; this is dense, ruled, and off-balance on purpose.

### /3 — PLAYGROUND (3D physics, playful, Bruno Simon energy)
The thesis is that he builds things you can touch. You land in a small physical scene and can throw his name around. Procedural rigid bodies only. Personality-forward, memorable, zero download weight.

## How the winner gets used

The chosen direction becomes the design system for the whole site (home, work, projects, about, chat drawer). The other two are deleted.
