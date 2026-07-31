/**
 * THE CONTEXT MAP
 *
 * Manuel's life as a connected web. Not a stack, not a skill cloud: real
 * decisions, real beliefs, real companies, real things he shipped, strung
 * together by the relationships that actually caused each other.
 *
 * Every story below is drawn from lib/content.ts (profile.about, work[].story,
 * projects[].blurb). Nothing here is invented. lib/content.ts is read only for
 * this route, so the graph is authored here instead.
 *
 * Labels are deliberately short: crisp nouns and two-word phrases, lowercase.
 * The label names the node; the story carries the weight. The hover card is
 * where the narrative lives.
 *
 * Positions are hand placed in a normalised volume that spans the viewport:
 *   x  -1 (left edge) .. +1 (right edge)
 *   y  -1 (bottom) .. +1 (top), up is positive
 *   z  -1 (back) .. +1 (front)
 *
 * Composition. The intro type owns the middle of the left half, so the web
 * is built around it as one organism instead of a ring:
 *
 *   - The leap reads left to right along the top: faith, dropped out,
 *     san francisco, with future focused and agents carrying the band on
 *     to the right edge.
 *   - The spine then dives to paradigm at the centre and climbs back up
 *     through context to configure in the upper right: the present.
 *   - The studio years (rejection, resume sites, nouvo, ats, client sites)
 *     run along the lower left strip beneath the intro, the only ground
 *     the type leaves open on that side.
 *   - The nights-and-weekends builds cluster in the lower right, and
 *     mistakes / self-doubt bridge the two eras at the bottom centre.
 *
 * A screen-space keep-out in Mind.tsx still nudges any node that would
 * drift behind the type on narrower viewports.
 */

export type NodeKind = "belief" | "decision" | "turn" | "company" | "build";

export type MindNode = {
  id: string;
  label: string;
  kind: NodeKind;
  /** 0 = anchor (largest, always legible), 1 = major, 2 = supporting. */
  rank: 0 | 1 | 2;
  x: number;
  y: number;
  z: number;
  story: string;
  link?: { label: string; href: string };
};

export const KIND_LABEL: Record<NodeKind, string> = {
  belief: "what I believe",
  decision: "a decision",
  turn: "a turn",
  company: "a company",
  build: "something I built",
};

export const nodes: readonly MindNode[] = [
  /* ---------------------------------------------------------------- */
  /* The top band: the foundation and the leap, left to right          */
  /* ---------------------------------------------------------------- */
  {
    id: "faith",
    label: "faith",
    kind: "belief",
    rank: 0,
    x: -0.82,
    y: 0.84,
    z: -0.06,
    story:
      "I am a believer, and I stay faithful to God. That is the foundation the rest of this map is built on top of. When I look at how every single piece has fallen into place to get me here, I have no doubt there is a plan for it.",
  },
  {
    id: "dropped-out",
    label: "dropped out",
    kind: "decision",
    rank: 0,
    x: -0.42,
    y: 0.86,
    z: 0.18,
    story:
      "I left college. The lecture halls were not the fastest road to where I wanted to go, so I stopped waiting for a future to be handed to me. There is too much happening right now to sit still.",
  },
  {
    id: "san-francisco",
    label: "san francisco",
    kind: "decision",
    rank: 0,
    x: -0.04,
    y: 0.7,
    z: 0.3,
    story:
      "I moved to a city I had never once set foot in. Not because I was lost, but because I could see where everything was heading and I refused to miss it. I came out here to grab it with my own hands.",
  },
  {
    id: "future-focused",
    label: "future focused",
    kind: "belief",
    rank: 1,
    x: 0.3,
    y: 0.88,
    z: -0.22,
    story:
      "I am future-focused to a fault. I move fast, I work harder than I probably should, and I would rather grind my way to something real than coast the safe, slow route to something ordinary.",
  },
  {
    id: "agents",
    label: "agents",
    kind: "belief",
    rank: 1,
    x: 0.76,
    y: 0.78,
    z: 0.08,
    story:
      "We are walking into a world run by agents. A buyer’s agent and a seller’s agent talking directly, our attention filtered for us before we ever see it, whole workflows handled while we sleep. Someone has to build the layer underneath all of it.",
  },

  /* ---------------------------------------------------------------- */
  /* The upper right: the present, where the spine climbs to           */
  /* ---------------------------------------------------------------- */
  {
    id: "configure",
    label: "configure",
    kind: "company",
    rank: 0,
    x: 0.7,
    y: 0.44,
    z: 0.3,
    story:
      "Context infrastructure for AI agents, and the reason I am here. One profile you own that travels with you, so any agent can recognize you instead of starting from zero. I am the founding engineer.",
    link: { label: "configure.dev", href: "https://configure.dev" },
  },
  {
    id: "customer-first",
    label: "customer first",
    kind: "turn",
    rank: 1,
    x: 0.92,
    y: 0.18,
    z: -0.16,
    story:
      "I was a Configure customer before I was ever on the team. I found it while running Paradigm, and the first time I plugged it in I could feel where this was going.",
  },
  {
    id: "context",
    label: "context",
    kind: "turn",
    rank: 0,
    x: 0.46,
    y: 0.22,
    z: 0.12,
    story:
      "The wall I kept hitting. Every agent I built started from zero: no memory of the user, no idea who it was even working for. I spent more time re-feeding context than building anything new, and I solved it badly a dozen different ways before I stopped patching it. This web is what I wanted my agents to have, one map of who I am.",
  },
  {
    id: "paradigm",
    label: "paradigm",
    kind: "company",
    rank: 0,
    x: 0.26,
    y: 0.0,
    z: 0.24,
    story:
      "The first agentic voice-powered growth engine. It finds prospects, calls and emails them, handles the replies, and books the meeting. I ran it until it paid for itself without me.",
    link: { label: "paradigmoutreach.com", href: "https://paradigmoutreach.com" },
  },
  {
    id: "ultron",
    label: "ultron",
    kind: "build",
    rank: 2,
    x: 0.84,
    y: -0.08,
    z: -0.3,
    story:
      "A hosted MCP server with 26 tools, bridged live into DevCore OS. My agents’ home base, and one of my own answers to the same context problem.",
    link: { label: "ultron-omega.vercel.app", href: "https://ultron-omega.vercel.app" },
  },

  /* ---------------------------------------------------------------- */
  /* The lower right: nights and weekends                              */
  /* ---------------------------------------------------------------- */
  {
    id: "gideon",
    label: "gideon",
    kind: "build",
    rank: 1,
    x: 0.24,
    y: -0.6,
    z: -0.28,
    story:
      "I left the lecture halls, not the learning. Talk to Gideon and it draws a live visual map of whatever you are studying, while you say it.",
    link: { label: "github.com/Manueldav2/VisboardAI", href: "https://github.com/Manueldav2/VisboardAI" },
  },
  {
    id: "late-nights",
    label: "late nights",
    kind: "belief",
    rank: 1,
    x: 0.48,
    y: -0.5,
    z: -0.04,
    story:
      "Everything on the lower half of this map is nights and weekends. I work harder than I probably should, and I would rather grind my way to something real than coast the safe, slow route to something ordinary.",
  },
  {
    id: "launch-control",
    label: "launch control",
    kind: "build",
    rank: 2,
    x: 0.34,
    y: -0.32,
    z: 0.12,
    story:
      "One idea in, a week of on-brand launch content out. A swarm of Claude agents plans it, makes it, grades its own work, and ships it. Built for Claude Build Day.",
    link: { label: "github.com/Manueldav2/launch-control", href: "https://github.com/Manueldav2/launch-control" },
  },
  {
    id: "idex",
    label: "idex",
    kind: "build",
    rank: 1,
    x: 0.74,
    y: -0.62,
    z: 0.22,
    story:
      "The IDE that watches the wait. A free, open-source cockpit for coding agents with a contextual scroll feed, so the minutes you spend waiting on a model are not dead minutes.",
    link: { label: "idex.dev", href: "https://idex.dev" },
  },
  {
    id: "classroom",
    label: "claude classroom",
    kind: "build",
    rank: 2,
    x: 0.56,
    y: -0.78,
    z: -0.08,
    story:
      "Makes many Claude Code sessions work as one team, with a shared board, file claims, and negotiation between agents instead of three of them editing the same file.",
    link: { label: "github.com/Manueldav2/claude-classroom", href: "https://github.com/Manueldav2/claude-classroom" },
  },
  {
    id: "sovereign",
    label: "sovereign",
    kind: "build",
    rank: 2,
    x: 0.86,
    y: -0.44,
    z: 0.02,
    story:
      "A 3D real-time strategy game that runs in a browser tab. Command the army from above, or possess a single unit and fight it out from inside the battle. This one is purely for fun.",
    link: { label: "github.com/Manueldav2/sovereign", href: "https://github.com/Manueldav2/sovereign" },
  },

  /* ---------------------------------------------------------------- */
  /* The bottom centre: the bridge between the eras                    */
  /* ---------------------------------------------------------------- */
  {
    id: "mistakes",
    label: "mistakes",
    kind: "belief",
    rank: 1,
    x: 0.04,
    y: -0.4,
    z: 0.1,
    story:
      "Break fast, fix fast, learn fast. That is the whole loop. Ship it, watch what breaks, fix it, go again. I once burned 200 dollars on a batch of genuinely terrible emails before I caught it. A mistake you learn from is just tuition.",
  },
  {
    id: "self-doubt",
    label: "self-doubt",
    kind: "turn",
    rank: 2,
    x: 0.02,
    y: -0.62,
    z: -0.2,
    story:
      "My biggest early mistake was not technical. I second-guessed my own system instead of believing in it and telling people out loud what I had built. That is the only kind of mistake that ever actually cost me.",
  },

  /* ---------------------------------------------------------------- */
  /* The lower left strip: the studio years                            */
  /* ---------------------------------------------------------------- */
  {
    id: "nouvo",
    label: "nouvo",
    kind: "company",
    rank: 0,
    x: -0.34,
    y: -0.76,
    z: 0.18,
    story:
      "My web studio. Athletic portfolios, business sites, resume pages, all built to order for real clients and eventually productized so it earns on its own. It is where I learned to ship fast for people who are counting on it.",
    link: { label: "nouvo.dev", href: "https://nouvo.dev" },
  },
  {
    id: "client-sites",
    label: "client sites",
    kind: "build",
    rank: 2,
    x: 0.1,
    y: -0.74,
    z: 0.2,
    story:
      "Real people with real sites. Dance portfolios, resume pages, a mobile detailing business. Every one of them was somebody counting on me to finish. Check them out.",
    link: { label: "nouvo.dev", href: "https://nouvo.dev" },
  },
  {
    id: "ats",
    label: "ats optimizer",
    kind: "build",
    rank: 2,
    x: -0.15,
    y: -0.88,
    z: -0.12,
    story:
      "My resume ATS breaker. It reads your resume against a job post, finds what the tracker will trip on, and rewrites it to get through. Same idea as the resume sites, aimed at the machine instead of the human.",
    link: {
      label: "ats-resume-optimizer.vercel.app",
      href: "https://ats-resume-optimizer.vercel.app",
    },
  },
  {
    id: "resume-sites",
    label: "resume sites",
    kind: "build",
    rank: 1,
    x: -0.58,
    y: -0.88,
    z: -0.05,
    story:
      "I started building the thing those students were missing, right on my own campus. Resume sites for classmates, portfolios for dancers and athletes, real web presence for people applying to the things they actually wanted. Watching someone I helped get their shot is still one of the best things I have gotten out of building anything.",
  },
  {
    id: "rejection",
    label: "rejection",
    kind: "turn",
    rank: 1,
    x: -0.86,
    y: -0.78,
    z: -0.1,
    story:
      "I applied for tech internships and did not get one. The people who did land those roles usually had a clean personal site backing them up. I could not stop thinking about how unfair that gap is, so I started building the missing piece myself.",
  },
];

/**
 * Real relationships. Every pair below is something one thing did to another,
 * written down in his own words somewhere in lib/content.ts. Read left to
 * right: A led to B, or A is why B exists.
 */
export const edges: readonly (readonly [string, string])[] = [
  // The foundation, and the leap
  ["faith", "dropped-out"],
  ["faith", "san-francisco"],
  ["future-focused", "dropped-out"],
  ["dropped-out", "san-francisco"],
  ["dropped-out", "gideon"],

  // The rejection, and the studio it turned into
  ["rejection", "nouvo"],
  ["rejection", "resume-sites"],
  ["resume-sites", "nouvo"],
  ["resume-sites", "ats"],
  ["nouvo", "client-sites"],
  ["nouvo", "mistakes"],
  ["nouvo", "paradigm"],

  // The company he built out here
  ["san-francisco", "paradigm"],
  ["paradigm", "mistakes"],
  ["paradigm", "self-doubt"],
  ["paradigm", "context"],
  ["paradigm", "agents"],
  ["paradigm", "customer-first"],
  ["paradigm", "launch-control"],
  ["mistakes", "self-doubt"],

  // The wall, and what he did about it
  ["context", "configure"],
  ["context", "ultron"],
  ["customer-first", "configure"],
  ["configure", "agents"],
  ["future-focused", "configure"],
  ["future-focused", "agents"],

  // The nights and weekends
  ["future-focused", "late-nights"],
  ["late-nights", "idex"],
  ["late-nights", "classroom"],
  ["late-nights", "sovereign"],
  ["mistakes", "idex"],
  ["mistakes", "classroom"],
];

export const nodeById = new Map(nodes.map((n) => [n.id, n]));

/** Adjacency, built once. Used for the highlight subgraph and the card. */
export const neighbours = (() => {
  const m = new Map<string, string[]>();
  for (const n of nodes) m.set(n.id, []);
  for (const [a, b] of edges) {
    m.get(a)?.push(b);
    m.get(b)?.push(a);
  }
  return m;
})();

/**
 * Reveal order: breadth first from the decision everything else hangs off, so
 * the web draws itself outward from the moment he left school rather than
 * fading up as one undifferentiated block.
 */
export const revealOrder = (() => {
  const order = new Map<string, number>();
  const queue = ["dropped-out"];
  order.set("dropped-out", 0);
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    const d = order.get(id) ?? 0;
    for (const next of neighbours.get(id) ?? []) {
      if (order.has(next)) continue;
      order.set(next, d + 1);
      queue.push(next);
    }
  }
  let i = 0;
  for (const n of nodes) if (!order.has(n.id)) order.set(n.id, 6 + i++);
  return order;
})();
