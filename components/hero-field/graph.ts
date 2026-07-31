/**
 * THE CONTEXT MAP
 *
 * Manuel's life as a connected web. Not a stack, not a skill cloud: real
 * decisions, real beliefs, real companies, real things he shipped, strung
 * together by the relationships that actually caused each other.
 *
 * THE NO-VERBATIM RULE. Every story below is written for the hover card and
 * appears nowhere else on the page. The About paragraphs, the work stories
 * and the project blurbs (all from lib/content.ts, read only) carry the
 * long-form telling below the fold; these cards carry the details those
 * paragraphs leave out. If a sentence exists in lib/content.ts, it must not
 * exist here. The facts are the same facts; the telling is never shared.
 *
 * Labels are deliberately short: crisp nouns and two-word phrases, lowercase.
 * The label names the node; the story carries the weight. The hover card is
 * where the narrative lives.
 *
 * EVERY node is hoverable. There is no texture class any more: the page
 * promises that any word will tell its story, so any word has one.
 *
 * Positions are hand placed in a normalised volume that spans the viewport
 * (kept for tooling and possible future layouts; the field currently places
 * words by rejection sampling around the hero type):
 *   x  -1 (left edge) .. +1 (right edge)
 *   y  -1 (bottom) .. +1 (top), up is positive
 *   z  -1 (back) .. +1 (front)
 */

export type NodeKind = "belief" | "decision" | "turn" | "company" | "build" | "door";

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
  door: "an open door",
};

export const nodes: readonly MindNode[] = [
  /* ---------------------------------------------------------------- */
  /* The foundation and the leap                                       */
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
      "Every decision on this map looked reckless on paper: leave school, cross the country, bet on myself. None of it ever felt like gambling, because I have never once believed I was doing this alone.",
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
      "The real trade was four more semesters against four more shipped products, and I picked the products. School was the only thing in my life moving slower than I was.",
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
      "The first time I ever saw this city was through the window of the plane that moved me here. Everyone building what I wanted to build was already in one place, and the risk of coming felt smaller than the risk of staying home.",
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
      "My default question is not what exists, it is what is about to exist. I have been early to things that went nowhere, but early is the only position where being right actually pays.",
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
      "I have shipped agents that cold call, agents that write code, and agents that book meetings while I sleep. Once you have watched one work through the night, the question stops being whether that world arrives and becomes who builds its plumbing.",
  },
  {
    id: "break-fast",
    label: "break fast, fix fast",
    kind: "belief",
    rank: 1,
    x: 0.05,
    y: 0.5,
    z: -0.15,
    story:
      "I get a build breaking in front of me as fast as I possibly can, because a bug I can see is already halfway fixed. Slow and careful does not avoid the mistakes, it just schedules them for later.",
  },

  /* ---------------------------------------------------------------- */
  /* The present                                                       */
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
      "Founding engineer means nobody is upstream of me: the schema, the deploy, and the 2 a.m. page are all mine. That is exactly the amount of responsibility I came out here to find.",
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
      "Configure showed up in my life as a line item on Paradigm’s books, not a job posting. By the time we ever talked about me joining, I was less a candidate and more a very opinionated user.",
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
      "The tell was my clipboard: the same three paragraphs about who I am and what I do, pasted into every new agent, every day. When you catch yourself working as your own database, you have found a missing piece of infrastructure.",
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
      "The first meeting it booked while I was asleep, I read the email thread twice before I believed it. That morning changed how I think about agents: not a feature you add, a workforce you run.",
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
      "Before I ever worked on context infrastructure I was hosting my own: one server that every agent I run calls home. Building the scrappy version is how I learned what the real one needed.",
    link: { label: "ultron-omega.vercel.app", href: "https://ultron-omega.vercel.app" },
  },
  {
    id: "18vc",
    label: "the podcast",
    kind: "turn",
    rank: 2,
    x: -0.62,
    y: 0.4,
    z: -0.1,
    story:
      "I sat down on the 18VC podcast and told the whole arc out loud: rejected everywhere, building for classmates, the studio, the company, the move. Hearing it back was the first time it sounded like a plan instead of a scramble.",
    link: { label: "watch the episode", href: "https://youtu.be/sbacIYWPbSM" },
  },

  /* ---------------------------------------------------------------- */
  /* Nights and weekends                                               */
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
      "I quit school and then immediately built a study tool, which tells you what I actually left: the format, not the learning. This one listens while you talk and sketches the diagram you would have doodled in the margin.",
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
      "Most of what I have shipped went out after midnight. The night hours are the only ones where nothing needs me except the build.",
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
      "I typed in one idea and watched a swarm of agents plan the launch, write every asset, and grade each other’s drafts. The unsettling part was how little of it needed me.",
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
      "Working with coding agents means waiting on them, and I watched too many of those minutes die. So I built the cockpit I now sit in all day, and gave it away for free.",
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
      "It exists because I ran three coding agents on one repo and watched them trample each other’s files. The fix turned out to be social, not technical: make the agents claim their work and negotiate like coworkers.",
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
      "A strategy game where you command the whole army from above, or drop down and fight as one soldier inside it. No business model, no roadmap, just me finding out how much a browser tab can take.",
    link: { label: "github.com/Manueldav2/sovereign", href: "https://github.com/Manueldav2/sovereign" },
  },
  {
    id: "open-source",
    label: "open source",
    kind: "belief",
    rank: 2,
    x: 0.1,
    y: -0.5,
    z: -0.2,
    story:
      "Most of the after-hours builds are public because free tools were my entire education. Publishing mine is how I pay that back.",
  },
  {
    id: "thirty-builds",
    label: "thirty-some builds",
    kind: "belief",
    rank: 2,
    x: -0.1,
    y: -0.3,
    z: 0.05,
    story:
      "The count is past thirty because building is how I think out loud. Some entries turned into companies, some stayed toys, and I regret none of them.",
  },

  /* ---------------------------------------------------------------- */
  /* The bridge between the eras                                       */
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
      "I once sent two hundred dollars of genuinely terrible emails in one afternoon. Best tuition I ever paid.",
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
      "For months I demoed Paradigm with an apology preloaded, certain someone was about to find the crack. The system kept working; only the doubt kept failing.",
  },

  /* ---------------------------------------------------------------- */
  /* The studio years                                                  */
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
      "The studio is where deadlines became real: a dancer’s audition does not move because my build broke. Those first invoices taught me more than the lectures did.",
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
      "A dance portfolio, a mobile detailing shop, a stack of resume pages. None of those clients care what framework I used, they care that the site loads on their phone, and that keeps you honest in a way no code review can.",
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
      "Applicant tracking systems filtered out enough of my friends that I sat down and reverse engineered how they read a resume. Aiming a build straight back at the machine that had been rejecting us felt personal, in the best way.",
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
      "The first ones went to classmates, then dancers, then athletes, built at my desk while I was still enrolled. The day someone I built for landed the interview, it stopped being a side hustle in my head.",
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
      "The internship answers came in two flavors: no, and silence. The people getting yeses were not smarter, they had better proof, and proof turned out to be something you can build.",
  },

  /* ---------------------------------------------------------------- */
  /* The door                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "reach",
    label: "say hi",
    kind: "door",
    rank: 1,
    x: -0.7,
    y: -0.2,
    z: 0.15,
    story:
      "If you drifted far enough into this field to find this word, we would probably get along. The email goes straight to me, and I answer it myself.",
    link: { label: "manuel@configure.dev", href: "mailto:manuel@configure.dev" },
  },
];

/**
 * Real relationships. Every pair below is something one thing did to another.
 * Read left to right: A led to B, or A is why B exists.
 */
export const edges: readonly (readonly [string, string])[] = [
  // The foundation, and the leap
  ["faith", "dropped-out"],
  ["faith", "san-francisco"],
  ["future-focused", "dropped-out"],
  ["dropped-out", "san-francisco"],
  ["dropped-out", "gideon"],
  ["dropped-out", "18vc"],

  // The rejection, and the studio it turned into
  ["rejection", "nouvo"],
  ["rejection", "resume-sites"],
  ["rejection", "18vc"],
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
  ["mistakes", "break-fast"],
  ["break-fast", "paradigm"],

  // The wall, and what he did about it
  ["context", "configure"],
  ["context", "ultron"],
  ["customer-first", "configure"],
  ["configure", "agents"],
  ["configure", "reach"],
  ["future-focused", "configure"],
  ["future-focused", "agents"],

  // The nights and weekends
  ["future-focused", "late-nights"],
  ["late-nights", "idex"],
  ["late-nights", "classroom"],
  ["late-nights", "sovereign"],
  ["late-nights", "thirty-builds"],
  ["open-source", "idex"],
  ["open-source", "classroom"],
  ["thirty-builds", "open-source"],
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
