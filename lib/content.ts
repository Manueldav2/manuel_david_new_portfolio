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
  // First-person story, one string per paragraph. Rendered on /about and folded
  // into the chat system prompt. Humanized, warm, no em-dashes.
  about: [
    "I moved to San Francisco, a city I had never once set foot in, and went all in on building. I could see where everything was heading and I refused to miss it, so I stopped waiting for a future to be handed to me and came out here to grab it with my own hands. There is too much happening right now to sit still.",
    "I am future-focused to a fault. I move fast, I work harder than I probably should, and I would rather grind my way to something real than coast the safe, slow route to something ordinary. If I want a life where I win, I do not wait my turn for it. I reach out and take it. Everything I have built, I built that way.",
    "I am a believer, and I stay faithful to God. That is a real part of who I am, the foundation the rest of my life is built on top of. And when I look at how every single piece has fallen into place to get me here, I have no doubt there is a plan for my life. I am exactly where I am supposed to be, and I am just getting started.",
    "I build fast. Break fast, fix fast, learn fast, that is the whole loop. I have spent years building agentic systems, and I have made just about every mistake there is, including torching a couple hundred dollars on a batch of genuinely terrible emails before I caught it. None of it scared me off. A mistake you learn from is just tuition. The only ones that ever cost me were the times I doubted my own work instead of shipping it and telling people out loud what I was building.",
    "Here is what I am convinced of. We are walking into a world run by agents. Agents talking to agents, our attention filtered for us before we ever see it, whole workflows handled while we sleep. Someone has to build the infrastructure underneath all of it, the layer that decides what those agents know and who they work for. That is the work I care about. That is the future I moved out here to build.",
  ],
  stats: [
    { label: "Projects built", value: 30, suffix: "+" },
  ],
  // The real portfolio is bigger than the curated wall: public GitHub repos
  // plus private ones plus client sites. The projects page shows a selection;
  // this is the honest total the page and stat both point at.
  projectsTotalLabel: "30+",
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
      "Getting here took a leap. I moved to San Francisco, a city I had never set foot in, mostly on faith. My biggest early mistake was not technical, it was imposter syndrome: second-guessing my own system instead of believing in it and telling people about it. Running Paradigm is also where I kept slamming into the same wall. Every agent I built started from zero, no memory of the user, no idea who it was even working for. I spent more time re-feeding context than building anything new. That wall is exactly what pulled me toward Configure.",
    ],
  },
  {
    company: "Nouvo", role: "Founder", status: "earning",
    dates: "2024 to now",
    blurb: "Nouvo is my web studio. Athletic portfolios, business sites, resume sites, built to order. I productized it so it brings in revenue on its own.",
    url: "https://nouvo.dev",
    story: [
      "Nouvo started with a rejection. I applied for tech internships and did not get one. When I looked at the people who did land those roles, a lot of them already had a clean personal site or portfolio backing them up. The tech world treats that as a given. Most people never get handed that edge, and I could not stop thinking about how unfair that gap is.",
      "So I started building the thing they were missing, right on my own campus. Resume sites for classmates, portfolios for dancers and athletes, real web presence for people applying to the things they actually wanted. It worked. People I knew walked into interviews and auditions with something polished behind their name, and doors started opening for them. That feeling, watching someone I helped get their shot, is still one of the best things I have gotten out of building anything.",
      "The idea was simple: take the advantage the tech industry keeps for itself and hand it to everyone else.",
      "That turned into Nouvo, my web studio. Athletic portfolios, business sites, resume pages, all built to order for real clients, and eventually productized so it earns on its own at nouvo.dev. It is also where I learned to ship fast for people who are counting on it, which set up everything I have built since.",
    ],
  },
];

/**
 * A live client site inside a collection project (the Nouvo Clients card).
 * `kind` is the short mono descriptor shown in the gallery; `url` is a
 * verified-live site opened in a new tab.
 */
export type ProjectClient = { name: string; kind: string; url: string };

export type Project = {
  slug: string; name: string; status: ProjectStatus; year: string;
  blurb: string; url?: string; github?: string; favicon?: string;
  // A real screenshot of the live surface, under public/. Only the strongest,
  // verified-live projects carry one; it is what the /1 plates render.
  shot?: string; shotAlt?: string;
  // When present, the card is a COLLECTION: clicking it opens a gallery modal
  // of these client sites instead of navigating anywhere. See ProjectCard.
  clients?: readonly ProjectClient[];
};

// Ordered strongest-first: the five with live, working surfaces lead, and the
// projects wall inherits this order.
export const projects: readonly Project[] = [
  { slug: "paradigm", name: "Paradigm", status: "shipped", year: "2025",
    blurb: "The first agentic voice-powered growth engine. It finds prospects, calls and emails them, handles the replies, and books the meeting. My flagship.",
    url: "https://paradigmoutreach.com",
    shot: "/shots/paradigm.jpg",
    shotAlt: "Paradigm landing page: the headline reads Your Outbound Runs Itself, above the live sales dashboard" },

  // ---- Nouvo Clients ------------------------------------------------------
  // One collection card for the studio work. Clicking it opens a gallery modal
  // of real, verified-live client sites (see ProjectCard). Revive Rides lives
  // here too: it is a Nouvo client (a mobile detailing business), not a
  // standalone card.
  { slug: "nouvo-clients", name: "Nouvo Clients", status: "shipped", year: "2025",
    blurb: "A slice of the sites I've built for real people at Nouvo. Resume sites, athletic portfolios, business pages.",
    shot: "/shots/nouvo.jpg",
    shotAlt: "Nouvo studio homepage: We Build, custom websites for athlete portfolios, resumes, and businesses",
    clients: [
      { name: "Addison Reed", kind: "Dance portfolio", url: "https://addison-reed-dance-portf-9dafd.firebaseapp.com" },
      { name: "Ashtin Dowler", kind: "Resume site", url: "https://ashtin-dowler-resweb.web.app" },
      { name: "Bella Bland", kind: "Resume site", url: "https://bella-bland-resume-website.web.app" },
      { name: "Kate Phillips", kind: "Resume site", url: "https://kate-phillips-resweb.web.app" },
      { name: "Kennedy Ragar", kind: "Dance website", url: "https://kennedy-ragar-dance-website.web.app" },
      { name: "Revive Rides", kind: "Mobile detailing business", url: "https://revive-rides.web.app" },
    ] },

  { slug: "ultron", name: "Ultron", status: "current", year: "2026",
    blurb: "Hosted MCP server with 26 tools, bridged live into DevCore OS. My agents' home base.",
    url: "https://ultron-omega.vercel.app", favicon: "/favicons/ultron.png",
    shot: "/shots/ultron.jpg",
    shotAlt: "Ultron landing page: Turn every conversation into delivery, with an Enter Dashboard button" },
  { slug: "gideon", name: "Gideon", status: "shipped", year: "2026",
    blurb: "AI study platform (a.k.a. VisboardAI / ThoughtPlot): talk to it, and it maps what you're learning visually.",
    url: "https://thought-plot-prod.web.app",
    github: "https://github.com/Manueldav2/VisboardAI", favicon: "/brand/proj-gideon.svg",
    shot: "/shots/gideon.jpg",
    shotAlt: "Gideon app home: a mode picker with Thought Plot, Architecture, quiz and study modes, and debate tools" },
  { slug: "ats-resume-optimizer", name: "ATS Resume Optimizer", status: "open-source", year: "2025",
    blurb: "My resume ATS breaker. It reads your resume against a job post, finds what the tracker will trip on, and rewrites it to get through.",
    url: "https://ats-resume-optimizer.vercel.app", github: "https://github.com/Manueldav2/ats-resume-optimizer", favicon: "/brand/proj-ats-resume-optimizer.svg",
    shot: "/shots/ats-resume-optimizer.jpg",
    shotAlt: "ATS Resume Optimizer app: upload a resume for instant ATS analysis and a compatibility score" },

  { slug: "idex", name: "IDEX", status: "open-source", year: "2026",
    blurb: "The IDE that watches the wait. A free, open-source cockpit for coding agents with a contextual scroll feed.",
    url: "https://idex.dev", github: "https://github.com/Manueldav2/idex", favicon: "/brand/proj-idex.svg" },
  { slug: "launch-control", name: "Launch Control", status: "open-source", year: "2026",
    blurb: "One idea in, a week of on-brand launch content out. A swarm of Claude agents plans it, makes it, grades its own work, and ships it. Built for Claude Build Day.",
    github: "https://github.com/Manueldav2/launch-control", favicon: "/brand/proj-launch-control.svg" },
  { slug: "claude-classroom", name: "Claude Classroom", status: "open-source", year: "2026",
    blurb: "Makes many Claude Code sessions work as one team, with a shared board, file claims, negotiation, and a live dashboard.",
    github: "https://github.com/Manueldav2/claude-classroom", favicon: "/brand/proj-claude-classroom.svg" },
  { slug: "claude-skills-sync", name: "claude-skills-sync", status: "open-source", year: "2026",
    blurb: "Run npx claude-skills-sync to sync your Claude skills across machines with one token.",
    url: "https://www.npmjs.com/package/claude-skills-sync", favicon: "/favicons/claude-skills-sync.png" },
  { slug: "tripfund", name: "TripFund", status: "open-source", year: "2026",
    blurb: "Trip savings tracker with live flight search, an AI assistant, and Stripe group contributions.",
    url: "https://tripfund-mocha.vercel.app", github: "https://github.com/Manueldav2/destino", favicon: "/favicons/tripfund.png" },
  { slug: "satisfying-video-generator", name: "Satisfying Video Generator", status: "open-source", year: "2026",
    blurb: "Gemini + Veo 3.1 pipeline that generates satisfying TikToks and posts them itself.",
    url: "https://satisfying-video-gen.web.app", github: "https://github.com/Manueldav2/satisfying-video-generator", favicon: "/brand/proj-satisfying-video-generator.svg" },
  { slug: "sovereign", name: "SOVEREIGN", status: "exploration", year: "2026",
    blurb: "Browser 3D RTS in Three.js. Command armies, or possess a single unit and fight first-person.",
    github: "https://github.com/Manueldav2/sovereign", favicon: "/brand/proj-sovereign.svg" },
  { slug: "zantana", name: "Zantana", status: "open-source", year: "2026",
    blurb: "Quiplash-style party game in a single HTML file. No backend, no build, just open it and play.",
    github: "https://github.com/Manueldav2/zantana", favicon: "/brand/proj-zantana.svg" },
  { slug: "blast-beyond", name: "Blast Beyond", status: "open-source", year: "2025",
    blurb: "A Next.js and Firebase build I shipped to GitHub. Public repo, still an experiment.",
    github: "https://github.com/Manueldav2/blast-beyond" },
  { slug: "ai-generated-leads", name: "AI Lead Gen", status: "open-source", year: "2025",
    blurb: "Point it at a market and it uses Gemini to pull qualified business leads for you. Small, fast, and open.",
    url: "https://ai.studio/apps/drive/1Nqhuc3R48xDHk8Pub3WkH0dURcOQUQoz",
    github: "https://github.com/Manueldav2/AI_generated_leads" },
];
