/**
 * THE MIND
 *
 * Manuel's life as a connected graph. Not a stack, not a skill cloud: real
 * decisions, real beliefs, real companies, real things he shipped, wired
 * together by the relationships that actually caused each other.
 *
 * Every line of every story below is drawn from lib/content.ts (profile.about,
 * work[].story, projects[].blurb). Nothing here is invented. lib/content.ts is
 * read only for this route, so the graph is authored here instead.
 *
 * Positions are hand placed in a normalised brain volume:
 *   x  -1 (far left lobe) .. +1 (far right lobe), with a fissure around |x|<0.12
 *   y  -1 (bottom) .. +1 (crown), up is positive
 *   z  -1 (back) .. +1 (front)
 *
 * The two lobes are not decoration. The left lobe is where he came from: faith,
 * leaving school, the rejection that started the studio, the things he made for
 * other people. The right lobe is where he is going: Paradigm, the wall he hit,
 * Configure, and the agent tooling that fell out of it. The edges that cross the
 * middle are the ones that changed the direction of his life.
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
  /* Left lobe: where he came from                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "faith",
    label: "faith",
    kind: "belief",
    rank: 0,
    x: -0.42,
    y: 0.74,
    z: -0.1,
    story:
      "I am a believer, and I stay faithful to God. That is the foundation the rest of my life is built on top of. When I look at how every single piece has fallen into place to get me here, I have no doubt there is a plan for it.",
  },
  {
    id: "dropped-out",
    label: "dropped out",
    kind: "decision",
    rank: 0,
    x: -0.72,
    y: 0.32,
    z: 0.22,
    story:
      "I left college. The lecture halls were not the fastest road to where I wanted to go, so I stopped waiting for a future to be handed to me. There is too much happening right now to sit still.",
  },
  {
    id: "moved-to-sf",
    label: "moved to San Francisco",
    kind: "decision",
    rank: 0,
    x: -0.24,
    y: 0.46,
    z: 0.3,
    story:
      "I moved to a city I had never once set foot in. Not because I was lost, but because I could see where everything was heading and I refused to miss it. I came out here to grab it with my own hands.",
  },
  {
    id: "no-internship",
    label: "no internship offer",
    kind: "turn",
    rank: 1,
    x: -0.86,
    y: 0.1,
    z: -0.26,
    story:
      "I applied for tech internships and did not get one. When I looked at the people who did land those roles, a lot of them already had a clean personal site backing them up. I could not stop thinking about how unfair that gap is.",
  },
  {
    id: "imposter",
    label: "imposter syndrome",
    kind: "turn",
    rank: 1,
    x: -0.2,
    y: 0.06,
    z: -0.34,
    story:
      "My biggest early mistake was not technical. I second-guessed my own system instead of believing in it and telling people out loud what I had built. That is the only kind of mistake that ever actually cost me.",
  },
  {
    id: "nouvo",
    label: "Nouvo",
    kind: "company",
    rank: 0,
    x: -0.56,
    y: -0.06,
    z: 0.12,
    story:
      "My web studio. Athletic portfolios, business sites, resume pages, all built to order for real clients and eventually productized so it earns on its own. It is where I learned to ship fast for people who are counting on it.",
    link: { label: "nouvo.dev", href: "https://nouvo.dev" },
  },
  {
    id: "break-fast",
    label: "break fast, fix fast",
    kind: "belief",
    rank: 0,
    x: -0.24,
    y: -0.3,
    z: 0.34,
    story:
      "Break fast, fix fast, learn fast. That is the whole loop. Ship it, watch what breaks, fix it, go again. I have made just about every mistake there is and none of it scared me off.",
  },
  {
    id: "resume-sites",
    label: "resume sites for students",
    kind: "build",
    rank: 1,
    x: -0.78,
    y: -0.34,
    z: 0.18,
    story:
      "I started building the thing those students were missing. Resume and portfolio sites for people who were never plugged into tech, so anyone walking into an application has a real shot at the job they actually want.",
  },
  {
    id: "ats",
    label: "ATS Resume Optimizer",
    kind: "build",
    rank: 2,
    x: -0.72,
    y: -0.6,
    z: -0.14,
    story:
      "My resume ATS breaker. It reads your resume against a job post, finds what the tracker will trip on, and rewrites it to get through. Same idea as the resume sites, aimed at the machine instead of the human.",
    link: {
      label: "ats-resume-optimizer.vercel.app",
      href: "https://ats-resume-optimizer.vercel.app",
    },
  },
  {
    id: "nouvo-clients",
    label: "Nouvo clients",
    kind: "build",
    rank: 2,
    x: -0.44,
    y: -0.72,
    z: 0.22,
    story:
      "Real people with real sites. Dance portfolios, resume pages, a mobile detailing business. Six of them are live right now, and every one of them was somebody counting on me to finish.",
  },
  {
    id: "bad-email",
    label: "$200 of bad email",
    kind: "turn",
    rank: 2,
    x: -0.18,
    y: -0.62,
    z: -0.2,
    story:
      "I burned 200 dollars sending a batch of genuinely terrible emails before I caught it. It did not scare me off. A mistake you learn from is just tuition.",
  },

  /* ---------------------------------------------------------------- */
  /* Right lobe: where he is going                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "agents",
    label: "agents talking to agents",
    kind: "belief",
    rank: 0,
    x: 0.3,
    y: 0.76,
    z: 0.14,
    story:
      "We are walking into a world run by agents. A buyer’s agent and a seller’s agent talking directly, our attention filtered for us before we ever see it, whole workflows handled while we sleep. Someone has to build the layer underneath all of it.",
  },
  {
    id: "future-focused",
    label: "future focused",
    kind: "belief",
    rank: 0,
    x: 0.16,
    y: 0.56,
    z: -0.26,
    story:
      "I am future-focused to a fault. I move fast, I work harder than I probably should, and I would rather grind my way to something real than coast the safe, slow route to something ordinary.",
  },
  {
    id: "configure",
    label: "Configure",
    kind: "company",
    rank: 0,
    x: 0.44,
    y: 0.4,
    z: 0.28,
    story:
      "Context infrastructure for AI agents, and the reason I am here. One profile you own that travels with you, so any agent can recognize you instead of starting from zero. I am the founding engineer.",
    link: { label: "configure.dev", href: "https://configure.dev" },
  },
  {
    id: "customer-first",
    label: "was a customer first",
    kind: "turn",
    rank: 1,
    x: 0.72,
    y: 0.16,
    z: -0.18,
    story:
      "I was a Configure customer before I was ever on the team. I found it while running Paradigm, and the first time I plugged it in I could feel where this was going.",
  },
  {
    id: "paradigm",
    label: "Paradigm",
    kind: "company",
    rank: 0,
    x: 0.26,
    y: 0.02,
    z: 0.2,
    story:
      "The first agentic voice-powered growth engine. It finds prospects, calls and emails them, handles the replies, and books the meeting. I ran it until it paid for itself without me.",
    link: { label: "paradigmoutreach.com", href: "https://paradigmoutreach.com" },
  },
  {
    id: "context-wall",
    label: "the context wall",
    kind: "turn",
    rank: 0,
    x: 0.58,
    y: -0.16,
    z: 0.3,
    story:
      "Every agent I built started from zero. No memory of the user, no idea who it was even working for. I spent more time re-feeding context than building anything new, and I solved it badly a dozen different ways before I stopped patching it.",
  },
  {
    id: "ultron",
    label: "Ultron",
    kind: "build",
    rank: 2,
    x: 0.9,
    y: -0.34,
    z: -0.24,
    story:
      "A hosted MCP server with 26 tools, bridged live into DevCore OS. My agents’ home base, and one of my own answers to the same context problem.",
    link: { label: "ultron-omega.vercel.app", href: "https://ultron-omega.vercel.app" },
  },
  {
    id: "gideon",
    label: "Gideon",
    kind: "build",
    rank: 1,
    x: 0.18,
    y: -0.2,
    z: -0.4,
    story:
      "I left the lecture halls, not the learning. Talk to Gideon and it draws a live visual map of whatever you are studying, while you say it.",
    link: { label: "github.com/Manueldav2/VisboardAI", href: "https://github.com/Manueldav2/VisboardAI" },
  },
  {
    id: "works-harder",
    label: "works harder than I should",
    kind: "belief",
    rank: 1,
    x: 0.22,
    y: -0.44,
    z: -0.3,
    story:
      "I work harder than I probably should. I would rather grind my way to something real than coast the safe, slow route to something ordinary. The length of this map is what that looks like.",
  },
  {
    id: "launch-control",
    label: "Launch Control",
    kind: "build",
    rank: 2,
    x: 0.5,
    y: -0.52,
    z: 0.1,
    story:
      "One idea in, a week of on-brand launch content out. A swarm of Claude agents plans it, makes it, grades its own work, and ships it. Built for Claude Build Day.",
    link: { label: "github.com/Manueldav2/launch-control", href: "https://github.com/Manueldav2/launch-control" },
  },
  {
    id: "idex",
    label: "IDEX",
    kind: "build",
    rank: 1,
    x: 0.8,
    y: -0.46,
    z: 0.26,
    story:
      "The IDE that watches the wait. A free, open-source cockpit for coding agents with a contextual scroll feed, so the minutes you spend waiting on a model are not dead minutes.",
    link: { label: "idex.dev", href: "https://idex.dev" },
  },
  {
    id: "classroom",
    label: "Claude Classroom",
    kind: "build",
    rank: 2,
    x: 0.34,
    y: -0.74,
    z: -0.08,
    story:
      "Makes many Claude Code sessions work as one team, with a shared board, file claims, and negotiation between agents instead of three of them editing the same file.",
    link: { label: "github.com/Manueldav2/claude-classroom", href: "https://github.com/Manueldav2/claude-classroom" },
  },
  {
    id: "sovereign",
    label: "SOVEREIGN",
    kind: "build",
    rank: 2,
    x: 0.62,
    y: -0.76,
    z: 0.3,
    story:
      "A 3D real-time strategy game that runs in a browser tab. Command the army from above, or possess a single unit and fight it out from inside the battle. This one is purely for fun.",
    link: { label: "github.com/Manueldav2/sovereign", href: "https://github.com/Manueldav2/sovereign" },
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
  ["faith", "moved-to-sf"],
  ["future-focused", "dropped-out"],
  ["future-focused", "moved-to-sf"],
  ["dropped-out", "moved-to-sf"],
  ["dropped-out", "gideon"],

  // The rejection, and the studio it turned into
  ["no-internship", "nouvo"],
  ["no-internship", "resume-sites"],
  ["resume-sites", "nouvo"],
  ["resume-sites", "ats"],
  ["nouvo", "nouvo-clients"],
  ["nouvo", "break-fast"],
  ["nouvo", "paradigm"],

  // The company he built out here
  ["moved-to-sf", "paradigm"],
  ["paradigm", "break-fast"],
  ["paradigm", "imposter"],
  ["paradigm", "context-wall"],
  ["paradigm", "agents"],
  ["paradigm", "customer-first"],
  ["paradigm", "launch-control"],
  ["break-fast", "bad-email"],
  ["imposter", "break-fast"],

  // The wall, and what he did about it
  ["context-wall", "configure"],
  ["context-wall", "ultron"],
  ["customer-first", "configure"],
  ["configure", "agents"],
  ["future-focused", "configure"],
  ["future-focused", "agents"],

  // The nights and weekends
  ["future-focused", "works-harder"],
  ["works-harder", "idex"],
  ["works-harder", "classroom"],
  ["works-harder", "sovereign"],
  ["break-fast", "idex"],
  ["break-fast", "classroom"],
];

export const nodeById = new Map(nodes.map((n) => [n.id, n]));

/** Adjacency, built once. Used for the highlight subgraph and the panel. */
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
 * the mind draws itself outward from the moment he left school rather than
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
