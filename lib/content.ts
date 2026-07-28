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
    "Before that I founded Paradigm, the first agentic voice-powered growth engine, and ran it until it paid for itself without me. I became a Configure customer through it, watched where agents were headed, and I decided to build the future infrastructure they'll run on.",
  ],
  // The exact closing clause of the last bio paragraph. BioSection splits the
  // paragraph on this substring and renders this part in italic.
  bioItalic: "I decided to build the future infrastructure they'll run on.",
  // Kept for the chat system prompt; no longer rendered on the home page.
  bioClosing: "I build like it's already a few years from now.",
  stats: [
    { label: "Projects built", value: 19 },
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
  // Optional long-form story for the role, one string per paragraph. Rendered
  // behind an expandable "the story" toggle on the Work page.
  story?: string[];
};

export const work: readonly WorkEntry[] = [
  {
    company: "Configure", role: "Founding Engineer", status: "current",
    dates: "2026 to now",
    blurb: "Context infrastructure for AI agents. One profile that travels with you across every agent you use. I was a customer first. Then I joined to build it.",
    url: "https://configure.dev",
    story: [
      "I was a Configure customer before I was ever on the team. I found it while running Paradigm, and the first time I plugged it in I could feel where this was going. Agents are about to be everywhere, and every one of them wakes up knowing nothing about you. Configure fixes that. It is the connective tissue for the world of agents that is coming, the layer that lets any agent recognize you and carry your context with you instead of starting from zero every single time.",
      "By then I had built a lot of agents, and I had solved the context problem badly a dozen different ways. Paradigm is where I ran straight into it: I kept rebuilding the same memory, the same profile, the same who-is-this-person plumbing for every agent I shipped. So when I got the chance to work on context itself, the actual foundation the next decade of agents will run on, I took it. That is the whole reason I joined. I want to fix context for good, not one agent at a time.",
    ],
  },
  {
    company: "Paradigm", role: "Founder & CEO", status: "earning",
    dates: "2025 to now",
    blurb: "The first agentic voice-powered growth engine. It finds prospects, calls and emails them, handles replies, and books meetings. I built it until it ran itself.",
    url: "https://paradigmoutreach.com",
    story: [
      "Paradigm runs on one rule: break fast, fix fast, learn fast. I made every mistake you can make building it. I broke the whole system more than once. I burned 200 dollars sending a batch of garbage emails before I caught it. None of that scared me off, because a mistake you learn from is just tuition. Ship, watch what breaks, fix it, go again. That loop is the entire company.",
      "The idea is bigger than email. I want Paradigm to be the place you hand your whole work cycle to an agent. Not one channel, all of them: cold email, posting, multi-channel campaigns, running a stack of social accounts, even video and UGC. The trick is that it is selective, not spammy. It figures out the client-acquisition funnel that actually works for your specific company and runs only that one. I think we are heading toward a world where outreach is agent to agent, a buyer's agent and a seller's agent talking directly, and inbound gets so loud you need your own AI just to filter what is real. That future is coming, and I wanted to build for it early.",
      "Getting here took a leap. I left college and moved to San Francisco, a city I had never set foot in, mostly on faith. My biggest early mistake was not technical, it was imposter syndrome: second-guessing my own system instead of believing in it and telling people about it. Running Paradigm is also where I kept slamming into the same wall. Every agent I built started from zero, no memory of the user, no idea who it was even working for. I spent more time re-feeding context than building anything new. That wall is exactly what pulled me toward Configure.",
    ],
  },
  {
    company: "Nouvo", role: "Founder", status: "earning",
    dates: "2024 to now",
    blurb: "Nouvo is my web studio. Athletic portfolios, business sites, resume sites, built to order. I productized it so it brings in revenue on its own.",
    url: "https://nouvo.dev",
    story: [
      "Nouvo started with a rejection. I applied for tech internships and did not get one. When I looked at the people who did land those roles, a lot of them already had a clean personal site or portfolio backing them up. The tech world treats that as a given. Most people never get handed that edge, and I could not stop thinking about how unfair that gap is.",
      "So I started building the thing they were missing. Resume and portfolio sites for students and everyday people, the kind of polished web presence that usually only comes with being already plugged into tech. The idea was simple: take the advantage the industry keeps for itself and give it to everyone, so anyone walking into an application has a real shot at the job they actually want.",
      "That turned into Nouvo, my web studio. Athletic portfolios, business sites, resume pages, all built to order for real clients, and eventually productized so it earns on its own at nouvo.dev. It is also where I learned to ship fast for people who are counting on it, which set up everything I have built since.",
    ],
  },
];

export type Project = {
  slug: string; name: string; status: ProjectStatus; year: string;
  blurb: string; url?: string; github?: string; favicon?: string;
};

export const projects: readonly Project[] = [
  { slug: "idex", name: "IDEX", status: "open-source", year: "2026",
    blurb: "The IDE that watches the wait. A free, open-source cockpit for coding agents with a contextual scroll feed.",
    url: "https://idex.dev", github: "https://github.com/Manueldav2/idex", favicon: "/brand/proj-idex.svg" },
  { slug: "ultron", name: "Ultron", status: "current", year: "2026",
    blurb: "Hosted MCP server with 26 tools, bridged live into DevCore OS. My agents' home base.",
    url: "https://ultron-omega.vercel.app", favicon: "/favicons/ultron.png" },
  { slug: "launch-control", name: "Launch Control", status: "open-source", year: "2026",
    blurb: "One idea in, a week of on-brand launch content out. A swarm of Claude agents plans it, makes it, grades its own work, and ships it. Built for Claude Build Day.",
    github: "https://github.com/Manueldav2/launch-control", favicon: "/brand/proj-launch-control.svg" },
  { slug: "gideon", name: "Gideon", status: "shipped", year: "2026",
    blurb: "AI study platform (a.k.a. VisboardAI / ThoughtPlot): talk to it, and it maps what you're learning visually.",
    github: "https://github.com/Manueldav2/VisboardAI", favicon: "/brand/proj-gideon.svg" },
  { slug: "claude-classroom", name: "Claude Classroom", status: "open-source", year: "2026",
    blurb: "Makes many Claude Code sessions work as one team, with a shared board, file claims, negotiation, and a live dashboard.",
    github: "https://github.com/Manueldav2/claude-classroom", favicon: "/brand/proj-claude-classroom.svg" },
  { slug: "claude-skills-sync", name: "claude-skills-sync", status: "open-source", year: "2026",
    blurb: "Run npx claude-skills-sync to sync your Claude skills across machines with one token.",
    url: "https://www.npmjs.com/package/claude-skills-sync", favicon: "/favicons/claude-skills-sync.png" },
  { slug: "ats-resume-optimizer", name: "ATS Resume Optimizer", status: "shipped", year: "2025",
    blurb: "My resume ATS breaker. It reads your resume against a job post, finds what the tracker will trip on, and rewrites it to get through.",
    url: "https://ats-resume-optimizer.vercel.app", github: "https://github.com/Manueldav2/ats-resume-optimizer", favicon: "/brand/proj-ats-resume-optimizer.svg" },
  { slug: "tripfund", name: "TripFund", status: "shipped", year: "2026",
    blurb: "Trip savings tracker with live flight search, an AI assistant, and Stripe group contributions.",
    url: "https://tripfund-mocha.vercel.app", github: "https://github.com/Manueldav2/destino", favicon: "/favicons/tripfund.png" },
  { slug: "satisfying-video-generator", name: "Satisfying Video Generator", status: "shipped", year: "2026",
    blurb: "Gemini + Veo 3.1 pipeline that generates satisfying TikToks and posts them itself.",
    url: "https://satisfying-video-gen.web.app", github: "https://github.com/Manueldav2/satisfying-video-generator", favicon: "/brand/proj-satisfying-video-generator.svg" },
  { slug: "sovereign", name: "SOVEREIGN", status: "exploration", year: "2026",
    blurb: "Browser 3D RTS in Three.js. Command armies, or possess a single unit and fight first-person.",
    github: "https://github.com/Manueldav2/sovereign", favicon: "/brand/proj-sovereign.svg" },
  { slug: "zantana", name: "Zantana", status: "exploration", year: "2026",
    blurb: "Quiplash-style party game in a single HTML file. No backend, no build, just open it and play.",
    github: "https://github.com/Manueldav2/zantana", favicon: "/brand/proj-zantana.svg" },
  { slug: "revive-rides", name: "Revive Rides", status: "shipped", year: "2026",
    blurb: "Client work: a mobile detailing company's site, built and shipped on Firebase.",
    url: "https://revive-rides.web.app", favicon: "/brand/proj-revive-rides.svg" },
  { slug: "ai-generated-leads", name: "AI Lead Gen", status: "open-source", year: "2025",
    blurb: "Point it at a market and it uses Gemini to pull qualified business leads for you. Small, fast, and open.",
    url: "https://ai.studio/apps/drive/1Nqhuc3R48xDHk8Pub3WkH0dURcOQUQoz",
    github: "https://github.com/Manueldav2/AI_generated_leads" },

  // ---- Nouvo client sites -------------------------------------------------
  // Manuel's web studio. One collection card links to the studio, and a few
  // named client sites (all live on Firebase, verified) sit alongside it so the
  // body of client work is visible and clickable. Built at Nouvo.
  { slug: "nouvo-client-sites", name: "Nouvo Client Sites", status: "shipped", year: "2025",
    blurb: "The studio side of my work. Dozens of client sites built and shipped through Nouvo, from athlete portfolios to resume pages. A few live ones are below.",
    url: "https://nouvo.dev" },
  { slug: "bella-bland", name: "Bella Bland", status: "shipped", year: "2025",
    blurb: "Resume site for Bella, a marketing pro out of Tempe. Built at Nouvo.",
    url: "https://bella-bland-resume-website.web.app" },
  { slug: "kennedy-ragar", name: "Kennedy Ragar", status: "shipped", year: "2025",
    blurb: "Competitive dance portfolio: titles, reels, and a recruiting pitch. Built at Nouvo.",
    url: "https://kennedy-ragar-dance-website.web.app" },
  { slug: "kate-phillips", name: "Kate Phillips", status: "shipped", year: "2025",
    blurb: "Standout resume page for a graduating senior. Built at Nouvo.",
    url: "https://kate-phillips-resweb.web.app" },
  { slug: "ashtin-dowler", name: "Ashtin Dowler", status: "shipped", year: "2025",
    blurb: "Portfolio for a content strategist and educator out of Oklahoma. Built at Nouvo.",
    url: "https://ashtin-dowler-resweb.web.app" },
  { slug: "addison-reed", name: "Addison Reed", status: "shipped", year: "2025",
    blurb: "Dance portfolio for a competitor and choreographer chasing collegiate spots. Built at Nouvo.",
    url: "https://addison-reed-dance-portf-9dafd.web.app" },
];
