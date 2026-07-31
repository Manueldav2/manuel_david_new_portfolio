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

export type NodeKind =
  | "belief"
  | "decision"
  | "turn"
  | "company"
  | "build"
  | "era"
  | "door";

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
  era: "an era",
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
    link: { label: "the full story, on 18VC", href: "https://youtu.be/sbacIYWPbSM" },
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
    id: "voice-agents",
    label: "voice agents",
    kind: "build",
    rank: 2,
    x: -0.62,
    y: 0.4,
    z: -0.1,
    story:
      "The demo that sold Paradigm was never slides. I would play back a call, let people hear the agent handle a real objection, and watch the room go quiet.",
  },
  {
    id: "agent-to-agent",
    label: "agent to agent",
    kind: "belief",
    rank: 2,
    x: 0.6,
    y: 0.6,
    z: -0.2,
    story:
      "I think outreach ends with my agent talking to yours: pitching, vetting, scheduling, all before a human reads a word. Paradigm was my bet on getting there before it was obvious.",
  },
  {
    id: "attention",
    label: "attention",
    kind: "belief",
    rank: 2,
    x: 0.15,
    y: 0.75,
    z: 0.1,
    story:
      "Inbound is getting loud enough that soon an agent will read everything before you do. Whoever writes that filter decides what you see, and I would rather be one of the people writing it.",
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
    link: { label: "github.com/Manueldav2/idex", href: "https://github.com/Manueldav2/idex" },
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
    id: "tripfund",
    label: "tripfund",
    kind: "build",
    rank: 2,
    x: 0.62,
    y: -0.26,
    z: -0.14,
    story:
      "Group trips die in the group chat. This one wires the plan to actual money: a shared pot, live flight prices, and a bot that politely bullies everyone into funding it.",
    link: { label: "tripfund-mocha.vercel.app", href: "https://tripfund-mocha.vercel.app" },
  },
  {
    id: "zantana",
    label: "zantana",
    kind: "build",
    rank: 2,
    x: 0.42,
    y: -0.86,
    z: 0.1,
    story:
      "A whole party game living in one HTML file you can text to a friend. The constraint was the point: if it needs a server, it is not a party trick anymore.",
    link: { label: "github.com/Manueldav2/zantana", href: "https://github.com/Manueldav2/zantana" },
  },
  {
    id: "skills-sync",
    label: "skills sync",
    kind: "build",
    rank: 2,
    x: 0.68,
    y: -0.9,
    z: -0.18,
    story:
      "One npx command and every machine I sit down at knows my whole Claude setup. Tiny tool, published to npm, and I probably run it more than anything else I have made.",
    link: {
      label: "npmjs.com/package/claude-skills-sync",
      href: "https://www.npmjs.com/package/claude-skills-sync",
    },
  },
  {
    id: "satisfying-videos",
    label: "satisfying videos",
    kind: "build",
    rank: 2,
    x: 0.94,
    y: -0.74,
    z: 0.06,
    story:
      "A pipeline that invents oddly satisfying clips, renders them with a video model, and posts them to TikTok without me. I built it mostly to learn where hands-off stops working.",
    link: { label: "satisfying-video-gen.web.app", href: "https://satisfying-video-gen.web.app" },
  },
  {
    id: "lead-gen",
    label: "lead gen",
    kind: "build",
    rank: 2,
    x: 0.18,
    y: -0.24,
    z: 0.3,
    story:
      "Give it a market and it hands back a list of qualified businesses worth a call. I keep it small and open; boring tools are the ones people actually reuse.",
    link: {
      label: "github.com/Manueldav2/AI_generated_leads",
      href: "https://github.com/Manueldav2/AI_generated_leads",
    },
  },
  {
    id: "shipping",
    label: "shipping",
    kind: "belief",
    rank: 2,
    x: -0.06,
    y: -0.14,
    z: -0.08,
    story:
      "An unshipped build and an imaginary one look identical from the outside. Everything on this page is public or live because that is the only version of done I trust.",
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
  {
    id: "college",
    label: "college",
    kind: "era",
    rank: 2,
    x: -0.7,
    y: -0.55,
    z: 0.1,
    story:
      "By my last semesters the laptop in the lecture hall was open to client work, not notes. I was not skipping the education, I was swapping it for one with deadlines.",
  },
  {
    id: "classmates",
    label: "classmates",
    kind: "era",
    rank: 2,
    x: -0.44,
    y: -0.62,
    z: -0.16,
    story:
      "My first users sat next to me in class, which is unforgiving QA: ship something broken and you hear about it at lunch, in person, every day until you fix it.",
  },
  {
    id: "first-client",
    label: "first client",
    kind: "era",
    rank: 2,
    x: -0.28,
    y: -0.44,
    z: 0.22,
    story:
      "Friends ask you to build things as a favor. The first stranger who paid me changed the job: now it had to work for someone with no reason to forgive me.",
  },
  {
    id: "dancers",
    label: "dancers",
    kind: "era",
    rank: 2,
    x: -0.5,
    y: -0.3,
    z: -0.05,
    story:
      "Audition season runs on portfolios, and dancers talk to each other. One site that helped someone get seen turned into a referral chain I never had to ask for.",
  },
  {
    id: "athletes",
    label: "athletes",
    kind: "era",
    rank: 2,
    x: -0.76,
    y: -0.36,
    z: 0.18,
    story:
      "A recruiter gives each athlete a few seconds. A page that puts the film, the stats and the name in one clean place is sometimes the difference between skipped and seen.",
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
  ["dropped-out", "college"],

  // The rejection, and the studio it turned into
  ["rejection", "nouvo"],
  ["rejection", "resume-sites"],
  ["rejection", "college"],
  ["resume-sites", "nouvo"],
  ["resume-sites", "ats"],
  ["college", "classmates"],
  ["classmates", "resume-sites"],
  ["dancers", "resume-sites"],
  ["dancers", "nouvo"],
  ["athletes", "nouvo"],
  ["first-client", "nouvo"],
  ["first-client", "client-sites"],
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
  ["paradigm", "voice-agents"],
  ["paradigm", "agent-to-agent"],
  ["paradigm", "lead-gen"],
  ["voice-agents", "agents"],
  ["agent-to-agent", "future-focused"],
  ["attention", "agents"],
  ["attention", "future-focused"],
  ["mistakes", "self-doubt"],
  ["mistakes", "break-fast"],
  ["break-fast", "paradigm"],
  ["break-fast", "shipping"],

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
  ["late-nights", "thirty-builds"],
  ["late-nights", "tripfund"],
  ["late-nights", "satisfying-videos"],
  ["open-source", "idex"],
  ["open-source", "classroom"],
  ["open-source", "skills-sync"],
  ["thirty-builds", "open-source"],
  ["thirty-builds", "zantana"],
  ["thirty-builds", "lead-gen"],
  ["shipping", "open-source"],
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
