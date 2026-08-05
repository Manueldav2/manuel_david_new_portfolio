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
 * Labels are deliberately short: crisp nouns and two-word phrases. Named
 * things (companies, cities, builds) wear their real casing; concepts stay
 * lowercase. The label names the node; the story carries the weight. The
 * hover card is where the narrative lives.
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
  | "night"
  | "moment"
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
  night: "a night",
  moment: "a moment",
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
    x: -0.5,
    y: 0.74,
    z: -0.06,
    story:
      "Every decision on this map looked reckless on paper: cross the country, bet on myself, build for a future nobody could see yet. None of it ever felt like gambling, because I have never once believed I was doing this alone.",
  },
  {
    id: "all-in",
    label: "all in",
    kind: "decision",
    rank: 0,
    x: -0.16,
    y: 0.6,
    z: 0.18,
    story:
      "Betting on myself is the one decision that explains all the others. I packed up, crossed the country, and made building the entire plan: no plan B, because I never intended to use one.",
    link: { label: "the full story, on 18VC", href: "https://youtu.be/sbacIYWPbSM" },
  },
  {
    id: "san-francisco",
    label: "San Francisco",
    kind: "decision",
    rank: 0,
    x: 0.1,
    y: 0.46,
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
    y: 0.82,
    z: -0.22,
    story:
      "My default question is not what exists, it is what is about to exist. I have been early to things that went nowhere, but early is the only position where being right actually pays.",
  },
  {
    id: "agents",
    label: "agents",
    kind: "belief",
    rank: 1,
    x: 0.68,
    y: 0.84,
    z: 0.08,
    story:
      "An agent is software that works on its own: it plans, uses tools, and finishes the job without a human driving every step. I have shipped agents that cold call, write code, and book meetings while I sleep. Once you have watched one work through the night, the question stops being whether that world arrives and becomes who builds its plumbing.",
  },
  {
    id: "break-fast",
    label: "velocity",
    kind: "belief",
    rank: 1,
    x: -0.06,
    y: 0.08,
    z: -0.15,
    story:
      "Break fast, fix fast, learn fast. I get a build breaking in front of me as fast as I possibly can, because a bug I can see is already halfway fixed, and speed is the one edge a builder fully controls.",
  },

  /* ---------------------------------------------------------------- */
  /* The present                                                       */
  /* ---------------------------------------------------------------- */
  {
    id: "configure",
    label: "Configure",
    kind: "company",
    rank: 0,
    x: 0.42,
    y: 0.12,
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
    x: 0.6,
    y: -0.04,
    z: -0.16,
    story:
      "Configure showed up in my life as a line item on Paradigm’s books, not a job posting. By the time we ever talked about me joining, I was less a candidate and more a very opinionated user.",
  },
  {
    id: "context",
    label: "context",
    kind: "turn",
    rank: 0,
    x: 0.32,
    y: 0.38,
    z: 0.12,
    story:
      "The tell was my clipboard: the same three paragraphs about who I am and what I do, pasted into every new agent, every day. When you catch yourself working as your own database, you have found a missing piece of infrastructure.",
  },
  {
    id: "paradigm",
    label: "Paradigm",
    kind: "company",
    rank: 0,
    x: 0.08,
    y: -0.12,
    z: 0.24,
    story:
      "The first meeting it booked while I was asleep, I read the email thread twice before I believed it. That morning changed how I think about agents: not a feature you add, a workforce you run.",
    link: { label: "paradigmoutreach.com", href: "https://paradigmoutreach.com" },
  },
  {
    id: "ultron",
    label: "Ultron",
    kind: "build",
    rank: 2,
    x: 0.72,
    y: 0.14,
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
    x: -0.04,
    y: -0.34,
    z: -0.1,
    story:
      "The demo that sold Paradigm was never slides. I would play back a call, let people hear the agent handle a real objection, and watch the room go quiet.",
  },
  {
    id: "agent-to-agent",
    label: "agent to agent",
    kind: "belief",
    rank: 2,
    x: 0.52,
    y: 0.72,
    z: -0.2,
    story:
      "Agent to agent is the world where your software talks to mine directly: my agent pitches, yours vets, they settle the details, and the humans only see the outcome. I think outreach ends up there, and Paradigm was my bet on getting there before it was obvious.",
  },
  {
    id: "attention",
    label: "attention",
    kind: "belief",
    rank: 2,
    x: 0.44,
    y: 0.9,
    z: 0.1,
    story:
      "Inbound is getting loud enough that soon an agent will read everything before you do. Whoever writes that filter decides what you see, and I would rather be one of the people writing it.",
  },

  /* ---------------------------------------------------------------- */
  /* Nights and weekends                                               */
  /* ---------------------------------------------------------------- */
  {
    id: "gideon",
    label: "Gideon",
    kind: "build",
    rank: 1,
    x: 0.22,
    y: -0.76,
    z: -0.28,
    story:
      "I never stopped being a student, I just fired the format. This one listens while you talk and sketches the diagram you would have doodled in the margin.",
    link: { label: "github.com/Manueldav2/VisboardAI", href: "https://github.com/Manueldav2/VisboardAI" },
  },
  {
    id: "late-nights",
    label: "late nights",
    kind: "belief",
    rank: 1,
    x: 0.6,
    y: -0.52,
    z: -0.04,
    story:
      "Most of what I have shipped went out after midnight. The night hours are the only ones where nothing needs me except the build.",
  },
  {
    id: "launch-control",
    label: "Launch Control",
    kind: "build",
    rank: 2,
    x: 0.62,
    y: -0.84,
    z: 0.12,
    story:
      "I typed in one idea and watched a swarm of agents plan the launch, write every asset, and grade each other’s drafts. The unsettling part was how little of it needed me.",
    link: { label: "github.com/Manueldav2/launch-control", href: "https://github.com/Manueldav2/launch-control" },
  },
  {
    id: "idex",
    label: "IDEX",
    kind: "build",
    rank: 1,
    x: 0.8,
    y: -0.48,
    z: 0.22,
    story:
      "Working with coding agents means waiting on them, and I watched too many of those minutes die. So I built the cockpit I now sit in all day, and gave it away for free.",
    link: { label: "github.com/Manueldav2/idex", href: "https://github.com/Manueldav2/idex" },
  },
  {
    id: "classroom",
    label: "Claude Classroom",
    kind: "build",
    rank: 2,
    x: 0.44,
    y: -0.9,
    z: -0.08,
    story:
      "It exists because I ran three coding agents on one repo and watched them trample each other’s files. The fix turned out to be social, not technical: make the agents claim their work and negotiate like coworkers.",
    link: { label: "github.com/Manueldav2/claude-classroom", href: "https://github.com/Manueldav2/claude-classroom" },
  },
  {
    id: "tripfund",
    label: "TripFund",
    kind: "build",
    rank: 2,
    x: 0.72,
    y: -0.66,
    z: -0.14,
    story:
      "Group trips die in the group chat. This one wires the plan to actual money: a shared pot, live flight prices, and a bot that politely bullies everyone into funding it.",
    link: { label: "tripfund-mocha.vercel.app", href: "https://tripfund-mocha.vercel.app" },
  },
  {
    id: "shipping",
    label: "shipping",
    kind: "belief",
    rank: 2,
    x: 0.0,
    y: -0.68,
    z: -0.08,
    story:
      "An unshipped build and an imaginary one look identical from the outside. Everything on this page is public or live because that is the only version of done I trust.",
  },
  {
    id: "open-source",
    label: "open source",
    kind: "belief",
    rank: 2,
    x: 0.32,
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
    x: 0.14,
    y: -0.62,
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
    x: 0.02,
    y: -0.52,
    z: 0.1,
    story:
      "I once sent two hundred dollars of genuinely terrible emails in one afternoon. Best tuition I ever paid. The only mistakes that ever cost me real ground were the times I doubted the work instead of shipping it.",
  },


  /* ---------------------------------------------------------------- */
  /* The studio years                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "nouvo",
    label: "Nouvo",
    kind: "company",
    rank: 0,
    x: -0.3,
    y: -0.68,
    z: 0.18,
    story:
      "The studio is where deadlines became real: a dancer’s audition does not move because my build broke. Those first invoices taught me things no tutorial ever covered.",
    link: { label: "nouvo.dev", href: "https://nouvo.dev" },
  },
  {
    id: "client-sites",
    label: "client sites",
    kind: "build",
    rank: 2,
    x: -0.12,
    y: -0.58,
    z: 0.2,
    story:
      "A dance portfolio, a mobile detailing shop, a stack of resume pages. None of those clients care what framework I used, they care that the site loads on their phone, and that keeps you honest in a way no code review can.",
    link: { label: "nouvo.dev", href: "https://nouvo.dev" },
  },
  {
    id: "ats",
    label: "ATS Optimizer",
    kind: "build",
    rank: 2,
    x: -0.7,
    y: -0.8,
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
    x: -0.54,
    y: -0.6,
    z: -0.05,
    story:
      "The first ones went to classmates, then dancers, then athletes, all built from the same desk after everything else was done for the day. The day someone I built for landed the interview, it stopped being a side hustle in my head.",
  },
  {
    id: "rejection",
    label: "rejection",
    kind: "turn",
    rank: 1,
    x: -0.76,
    y: -0.5,
    z: -0.1,
    story:
      "The internship answers came in two flavors: no, and silence. The people getting yeses were not smarter, they had better proof, and proof turned out to be something you can build.",
  },
  {
    id: "classmates",
    label: "classmates",
    kind: "era",
    rank: 2,
    x: -0.85,
    y: -0.66,
    z: -0.16,
    story:
      "My first users sat next to me in class, which is unforgiving QA: ship something broken and you hear about it at lunch, in person, every day until you fix it.",
  },
  {
    id: "first-client",
    label: "first client",
    kind: "era",
    rank: 2,
    x: -0.3,
    y: -0.5,
    z: 0.22,
    story:
      "Friends ask you to build things as a favor. The first stranger who paid me changed the job: now it had to work for someone with no reason to forgive me.",
  },
  {
    id: "athletes",
    label: "athletes",
    kind: "era",
    rank: 2,
    x: -0.68,
    y: -0.4,
    z: 0.18,
    story:
      "A recruiter gives each athlete a few seconds. A page that puts the film, the stats and the name in one clean place is sometimes the difference between skipped and seen.",
  },
  {
    id: "dancers",
    label: "dancers",
    kind: "era",
    rank: 2,
    x: -0.48,
    y: -0.84,
    z: 0.1,
    story:
      "Dance portfolios were the studio's quiet specialty. A dancer's whole case is thirty seconds of footage, and a page that plays it instantly is the difference between watched and skipped.",
  },
  {
    id: "revive-rides",
    label: "Revive Rides",
    kind: "build",
    rank: 2,
    x: -0.02,
    y: -0.9,
    z: 0.14,
    story:
      "A mobile detailing business that needed to look as clean as the cars it hands back. One page, one booking flow, a real local company running on something I shipped.",
    link: { label: "revive-rides.web.app", href: "https://revive-rides.web.app" },
  },
  {
    id: "build-day",
    label: "Build Day",
    kind: "night",
    rank: 2,
    x: 0.84,
    y: -0.78,
    z: 0.06,
    story:
      "Claude Build Day, June 13, San Francisco: I stood on stage and let a swarm of agents plan and ship a launch in front of the room. Standing there felt less like a demo and more like a preview.",
  },
  {
    id: "hack-night",
    label: "Voice Hack Night",
    kind: "night",
    rank: 2,
    x: -0.02,
    y: 0.3,
    z: -0.08,
    story:
      "An OpenAI voice hack night taught me that a live agent on the speakers beats any slide deck. Voice stopped being a feature that night and became a conviction.",
  },
  {
    id: "antler",
    label: "Antler",
    kind: "era",
    rank: 2,
    x: 0.18,
    y: 0.26,
    z: -0.1,
    story:
      "For a stretch of the founder era my commute ended at the Antler wall: a floor of founders all pretending not to compare traction. It taught me that speed only counts as a moat when it is pointed somewhere.",
  },
  {
    id: "optimus",
    label: "meeting Optimus",
    kind: "moment",
    rank: 2,
    x: 0.86,
    y: 0.68,
    z: -0.05,
    story:
      "I met Optimus in a showroom and grinned like a kid, because a body for the agents is the half of the future you can shake hands with. The software inside still wakes up knowing nothing about you; that half is mine.",
  },
  {
    id: "zantana",
    label: "Zantana",
    kind: "build",
    rank: 2,
    x: 0.5,
    y: -0.26,
    z: -0.18,
    story:
      "A party game in a single HTML file: no backend, no build step, open it and play. The constraint is the whole design, and it is the smallest thing I have shipped that makes a room laugh.",
    link: { label: "github.com/Manueldav2/zantana", href: "https://github.com/Manueldav2/zantana" },
  },
  {
    id: "sovereign",
    label: "Sovereign",
    kind: "build",
    rank: 2,
    x: 0.88,
    y: -0.62,
    z: 0.16,
    story:
      "A browser RTS where you can command the whole army or drop into one soldier first-person. Started as a way to learn 3D properly; stayed because possessing your own units is too fun to delete.",
    link: { label: "github.com/Manueldav2/sovereign", href: "https://github.com/Manueldav2/sovereign" },
  },
  {
    id: "satisfying-videos",
    label: "Satisfying Videos",
    kind: "build",
    rank: 2,
    x: 0.68,
    y: -0.36,
    z: -0.22,
    story:
      "A pipeline that dreams up oddly satisfying clips, renders them with a video model, and posts them on its own. A tiny media company that runs while I sleep, built mostly to prove the loop closes.",
    link: { label: "satisfying-video-gen.web.app", href: "https://satisfying-video-gen.web.app" },
  },
  {
    id: "skills-sync",
    label: "skills sync",
    kind: "build",
    rank: 2,
    x: 0.86,
    y: -0.18,
    z: 0.05,
    story:
      "One command that carries my agent setup to any machine I sit down at. Built in an evening, because configuring the same tools twice in one week is a bug.",
    link: { label: "npmjs.com/claude-skills-sync", href: "https://www.npmjs.com/package/claude-skills-sync" },
  },
  {
    id: "lead-gen",
    label: "lead gen",
    kind: "build",
    rank: 2,
    x: 0.36,
    y: -0.16,
    z: 0.08,
    story:
      "Point it at a market and it comes back with qualified leads. The earliest ancestor of Paradigm: small, fast proof that the boring half of sales was already automatable.",
    link: { label: "github.com/Manueldav2/AI_generated_leads", href: "https://github.com/Manueldav2/AI_generated_leads" },
  },
  {
    id: "18vc",
    label: "18VC",
    kind: "moment",
    rank: 2,
    x: -0.38,
    y: 0.88,
    z: 0.05,
    story:
      "I sat down on the 18VC podcast and told the whole arc out loud: the rejection, the studio, the move, the company. Saying it to a camera was the moment it stopped being a private bet.",
    link: { label: "watch it on YouTube", href: "https://youtu.be/sbacIYWPbSM" },
  },
  {
    id: "runs-itself",
    label: "runs itself",
    kind: "belief",
    rank: 2,
    x: -0.14,
    y: -0.82,
    z: 0.1,
    story:
      "Both companies pass the same test: they keep earning when I stop touching them. Nouvo takes orders and Paradigm books meetings whether I am at the desk or not, and that is the only definition of a product I trust.",
  },
  {
    id: "cold-calls",
    label: "cold calls",
    kind: "build",
    rank: 2,
    x: 0.16,
    y: -0.42,
    z: -0.08,
    story:
      "Paradigm's agents pick up the phone, pitch a stranger, and handle the objection in real time. The first time a prospect thanked the agent for the call, the demo era was over.",
  },
  {
    id: "plaid-for-context",
    label: "Plaid for context",
    kind: "belief",
    rank: 2,
    x: 0.68,
    y: 0.32,
    z: 0.02,
    story:
      "Plaid made your bank data portable; Configure does that for who you are. It is the shorthand I reach for when someone asks what I am building, and it usually lands.",
  },
];

/**
 * Real relationships. Every pair below is something one thing did to another.
 * Read left to right: A led to B, or A is why B exists.
 */
export const edges: readonly (readonly [string, string])[] = [
  // ---------------------------------------------------------------------
  // AUDITED. Every pair below is a relationship he can say out loud in one
  // sentence. Lines the field draws are read as claims, so nothing here is
  // "both are agent things" or "both happened at night by coincidence".
  // ---------------------------------------------------------------------

  // The foundation, and the leap
  ["faith", "all-in"], // the bet on himself never felt like gambling because of the faith under it
  ["faith", "san-francisco"], // he crossed the country to a city he had never seen, mostly on faith
  ["future-focused", "all-in"], // he went all in because he could see where everything was heading
  ["all-in", "san-francisco"], // the all-in bet WAS the move west

  // The rejection, and the studio it turned into
  ["rejection", "nouvo"], // Nouvo exists because the internships said no
  ["rejection", "resume-sites"], // the rejected were missing proof, so he started building it
  ["resume-sites", "nouvo"], // the resume sites grew into the studio
  ["resume-sites", "ats"], // the same fight from the other side: beat the tracker reading the resume
  ["classmates", "resume-sites"], // the first resume sites went to people sitting next to him
  ["athletes", "nouvo"], // athletic portfolios became a studio specialty
  ["dancers", "nouvo"], // dance portfolios were the studio's quiet specialty
  ["dancers", "client-sites"], // the dance portfolios are client work
  ["first-client", "nouvo"], // the first paying stranger turned the favor into a business
  ["first-client", "client-sites"], // that first invoice began the client roster
  ["nouvo", "client-sites"], // the studio's output is the client work
  ["client-sites", "revive-rides"], // Revive Rides is one of those client sites
  ["nouvo", "paradigm"], // the studio taught him to ship for clients; the company came next

  // The company he built out here
  ["san-francisco", "paradigm"], // Paradigm is what he built after landing
  ["paradigm", "antler"], // the founder era ran through the Antler floor
  ["antler", "san-francisco"], // the Antler wall is a San Francisco address
  ["paradigm", "mistakes"], // the 200-dollar email batch happened at Paradigm
  ["paradigm", "context"], // Paradigm is where he kept hitting the context wall
  ["paradigm", "agents"], // Paradigm is an agentic system end to end
  ["paradigm", "customer-first"], // Paradigm's books are where Configure first appeared
  ["paradigm", "voice-agents"], // the product cold calls; voice is the product
  ["paradigm", "agent-to-agent"], // Paradigm was his early bet on agent-to-agent outreach
  ["lead-gen", "paradigm"], // the little lead-gen tool is Paradigm's earliest ancestor
  ["voice-agents", "agents"], // voice agents are agents with a phone line
  ["voice-agents", "hack-night"], // the voice conviction started at the OpenAI hack night
  ["paradigm", "hack-night"], // live voice demos were Paradigm's whole thesis on stage
  ["voice-agents", "cold-calls"], // the calls are what the voice agents actually do
  ["nouvo", "runs-itself"], // the studio takes orders without him
  ["paradigm", "runs-itself"], // the company books meetings without him
  ["all-in", "18vc"], // the whole arc, told out loud on the podcast
  ["agent-to-agent", "future-focused"], // agent-to-agent is the future he is betting on
  ["attention", "agents"], // an agent reading your inbound before you is the attention filter
  ["attention", "future-focused"], // the loud-inbound world is one of his predictions
  ["mistakes", "break-fast"], // break fast, fix fast is his answer to mistakes
  ["break-fast", "paradigm"], // Paradigm runs on that rule
  ["break-fast", "shipping"], // shipping fast is how the loop closes

  // The wall, and what he did about it
  ["context", "configure"], // the context wall is the reason Configure made sense
  ["context", "ultron"], // Ultron was his scrappy homemade answer to the same wall
  ["customer-first", "configure"], // the customer became the founding engineer
  ["configure", "paradigm"], // he was a Configure customer through Paradigm before he joined
  ["configure", "agents"], // Configure is context infrastructure FOR agents
  ["agent-to-agent", "configure"], // agents talking to agents is the world Configure equips
  ["future-focused", "configure"], // he joined to build the layer the next decade runs on
  ["configure", "plaid-for-context"], // the shorthand that explains the company in one breath
  ["future-focused", "agents"], // agents are the core of what he thinks is about to exist
  ["agents", "optimus"], // Optimus is a body for the same agents he builds the minds for
  ["future-focused", "optimus"], // meeting the robot is what betting on the future looks like up close

  // The nights and weekends
  ["late-nights", "idex"], // IDEX shipped after midnight like most of the list
  ["late-nights", "classroom"], // same desk, same hours
  ["late-nights", "gideon"], // the study tool is an after-hours build
  ["late-nights", "thirty-builds"], // the count is what the night hours add up to
  ["late-nights", "tripfund"], // built in the same after-hours lane
  ["late-nights", "zantana"], // one evening, one HTML file
  ["late-nights", "sovereign"], // the 3D experiment lives in the same hours
  ["late-nights", "satisfying-videos"], // the video pipeline too
  ["gideon", "voice-agents"], // you talk to Gideon; voice is its interface
  ["launch-control", "build-day"], // Launch Control was built for and demoed at Claude Build Day
  ["mistakes", "classroom"], // Classroom exists because his agents trampled each other's files

  // The open-source shelf: everything public hangs off this belief
  ["open-source", "idex"],
  ["open-source", "classroom"],
  ["open-source", "gideon"],
  ["open-source", "launch-control"],
  ["open-source", "ats"],
  ["open-source", "tripfund"],
  ["open-source", "zantana"],
  ["open-source", "satisfying-videos"],
  ["open-source", "skills-sync"],
  ["thirty-builds", "open-source"], // most of the thirty-some are public
  ["shipping", "open-source"], // public or live is the only done he trusts
];

/**
 * The spine: relationships so central they draw brighter than everything
 * else and are never hidden by the resting degree cap. Paradigm being a
 * Configure customer is the hinge of the whole story.
 */
export const strongEdges: readonly (readonly [string, string])[] = [
  ["configure", "paradigm"],
];

/**
 * Importance, 1 to 5, owner-specified: Configure and faith dominate (the
 * job and the foundation), then Paradigm, then Nouvo and San Francisco,
 * then the major beliefs and builds, then the long tail. Size and resting
 * brightness are mapped off this scale identically in every variant, so
 * the field's hierarchy is semantic, not aesthetic accident.
 */
export const importance: Record<string, number> = {
  configure: 5,
  faith: 4.8,
  paradigm: 4,
  nouvo: 3.2,
  "san-francisco": 3.2,
  "all-in": 3,
  context: 3,
  agents: 2.2,
  "future-focused": 2,
  "break-fast": 2,
  "customer-first": 2,
  "voice-agents": 2,
  "agent-to-agent": 2,
  attention: 2,
  mistakes: 2,
  "late-nights": 2,
  rejection: 2,
  "resume-sites": 2,
  gideon: 2,
  idex: 2,
  shipping: 2,
  "open-source": 2,
};

/** Everything unlisted rests at the long-tail weight. */
export const importanceOf = (id: string): number => importance[id] ?? 1;

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
 * the web draws itself outward from the moment he went all in rather than
 * fading up as one undifferentiated block.
 */
export const revealOrder = (() => {
  const order = new Map<string, number>();
  const queue = ["all-in"];
  order.set("all-in", 0);
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
