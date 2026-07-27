export type WorkStatus = "current" | "earning" | "prior";
export type ProjectStatus = "current" | "shipped" | "open-source" | "exploration" | "archived";
export type Status = WorkStatus | ProjectStatus;

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
    "I build agent infrastructure at Configure, the user-owned system of record that lets AI agents recognize you and carry your context everywhere you go. Think Plaid, but for personal context. Yeah, I know. Cool, right?",
    "Before that I founded Paradigm, an AI cold-outreach platform, and ran it until it paid for itself without me. I became a Configure customer through it, watched where agents were headed, and decided I'd be the one building the rails they run on.",
  ],
  bioClosing: "I build like it's already a few years from now.",
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
  company: string; role: string; status: WorkStatus; dates: string;
  blurb: string; url?: string;
};

export const work: readonly WorkEntry[] = [
  {
    company: "Configure", role: "Founding Engineer", status: "current",
    dates: "2026 to now",
    blurb: "Context infrastructure for AI agents. One profile that travels with you across every agent you use. I was a customer first. Then I joined to build it.",
    url: "https://configure.dev",
  },
  {
    company: "Paradigm", role: "Founder & CEO", status: "earning",
    dates: "2025 to now",
    blurb: "AI cold outreach, end to end: it finds prospects, researches them, writes the emails, handles replies, and books the meetings. I built it until it runs itself, so it earns while I work on Configure.",
    url: "https://paradigmoutreach.com",
  },
  {
    company: "Freelance", role: "Web Engineer", status: "prior",
    dates: "2024 to 2025",
    blurb: "Client sites and tools: portfolios for dancers and athletes, a detailing company's storefront, resume platforms. Where I learned to ship fast and alone.",
  },
];

export type Project = {
  slug: string; name: string; status: ProjectStatus; year: string;
  blurb: string; url?: string; github?: string; favicon?: string;
};

export const projects: readonly Project[] = [
  { slug: "idex", name: "IDEX", status: "current", year: "2026",
    blurb: "The IDE that watches the wait. A free, open-source cockpit for coding agents with a contextual scroll feed.",
    url: "https://idex.dev", github: "https://github.com/Manueldav2/idex" },
  { slug: "ultron", name: "Ultron", status: "current", year: "2026",
    blurb: "Hosted MCP server with 26 tools, bridged live into DevCore OS. My agents' home base.",
    url: "https://ultron-omega.vercel.app" },
  { slug: "launch-control", name: "Launch Control", status: "shipped", year: "2026",
    blurb: "One idea in, a week of on-brand launch content out. A swarm of Claude agents plans it, makes it, grades its own work, and ships it. Built for Claude Build Day.",
    github: "https://github.com/Manueldav2/launch-control" },
  { slug: "gideon", name: "Gideon", status: "shipped", year: "2026",
    blurb: "AI study platform (a.k.a. VisboardAI / ThoughtPlot): talk to it, and it maps what you're learning visually.",
    github: "https://github.com/Manueldav2/VisboardAI" },
  { slug: "claude-classroom", name: "Claude Classroom", status: "open-source", year: "2026",
    blurb: "Makes many Claude Code sessions work as one team, with a shared board, file claims, negotiation, and a live dashboard.",
    github: "https://github.com/Manueldav2/claude-classroom" },
  { slug: "claude-skills-sync", name: "claude-skills-sync", status: "shipped", year: "2026",
    blurb: "Run npx claude-skills-sync to sync your Claude skills across machines with one token.",
    url: "https://www.npmjs.com/package/claude-skills-sync" },
  { slug: "tripfund", name: "TripFund", status: "shipped", year: "2026",
    blurb: "Trip savings tracker with live flight search, an AI assistant, and Stripe group contributions.",
    url: "https://tripfund-mocha.vercel.app", github: "https://github.com/Manueldav2/destino" },
  { slug: "satisfying-video-generator", name: "Satisfying Video Generator", status: "shipped", year: "2026",
    blurb: "Gemini + Veo 3.1 pipeline that generates satisfying TikToks and posts them itself.",
    url: "https://satisfying-video-gen.web.app", github: "https://github.com/Manueldav2/satisfying-video-generator" },
  { slug: "sovereign", name: "SOVEREIGN", status: "exploration", year: "2026",
    blurb: "Browser 3D RTS in Three.js. Command armies, or possess a single unit and fight first-person.",
    github: "https://github.com/Manueldav2/sovereign" },
  { slug: "zantana", name: "Zantana", status: "exploration", year: "2026",
    blurb: "Quiplash-style party game in a single HTML file. No backend, no build, just open it and play.",
    github: "https://github.com/Manueldav2/zantana" },
  { slug: "revive-rides", name: "Revive Rides", status: "shipped", year: "2026",
    blurb: "Client work: a mobile detailing company's site, built and shipped on Firebase.",
    url: "https://revive-rides.web.app" },
];
