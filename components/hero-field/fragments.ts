import { profile, projects, work } from "@/lib/content";

/**
 * The field is made of context, not decoration.
 *
 * Every fragment below is a real value read out of `lib/content.ts` (profile
 * fields, company names, project names, the skill list) plus a short set of
 * preference-style lines written in his voice and pulled from the same file's
 * long-form story. Nothing here is invented from nothing, and nothing here is
 * abstract: what drifts behind the page is the profile the page is about.
 *
 * Tiers control size, resting brightness and depth. `key` fragments are the
 * ones you would put on a business card; `low` fragments are the texture a
 * real profile accumulates.
 */

export type FragmentTier = "key" | "mid" | "low";

export type Fragment = {
  /** Optional field name, set in italic serif ahead of the value. */
  label?: string;
  text: string;
  tier: FragmentTier;
};

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const byCompany = (name: string) => work.find((w) => w.company === name);
const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** The card. Eight lines that would identify him to anything that asked. */
const key: Fragment[] = [
  { label: "name", text: profile.name.toLowerCase(), tier: "key" },
  { label: "role", text: profile.role.toLowerCase(), tier: "key" },
  { label: "company", text: host(profile.companyUrl), tier: "key" },
  { label: "location", text: "san francisco", tier: "key" },
  { label: "reach", text: profile.email, tier: "key" },
  { label: "founded", text: byCompany("Paradigm")?.company.toLowerCase() ?? "paradigm", tier: "key" },
  { label: "founded", text: byCompany("Nouvo")?.company.toLowerCase() ?? "nouvo", tier: "key" },
  { label: "elsewhere", text: profile.xHandle, tier: "key" },
];

/** What he has built and what he is building. */
const mid: Fragment[] = [
  { text: "context infrastructure", tier: "mid" },
  { text: "builds agents", tier: "mid" },
  { text: host(byCompany("Paradigm")?.url ?? "paradigmoutreach.com"), tier: "mid" },
  { text: host(byCompany("Nouvo")?.url ?? "nouvo.dev"), tier: "mid" },
  { text: host(profile.github), tier: "mid" },
  { text: "one profile, every agent", tier: "mid" },
  { text: "user-owned system of record", tier: "mid" },
  { text: "agentic growth engine", tier: "mid" },
  { text: "web studio", tier: "mid" },
  { text: `${profile.projectsTotalLabel} projects built`, tier: "mid" },
  { text: (bySlug("idex")?.name ?? "IDEX").toLowerCase(), tier: "mid" },
  { text: (bySlug("ultron")?.name ?? "Ultron").toLowerCase(), tier: "mid" },
  { text: (bySlug("gideon")?.name ?? "Gideon").toLowerCase(), tier: "mid" },
  { text: (bySlug("launch-control")?.name ?? "Launch Control").toLowerCase(), tier: "mid" },
  { text: (bySlug("claude-classroom")?.name ?? "Claude Classroom").toLowerCase(), tier: "mid" },
  { text: bySlug("claude-skills-sync")?.name ?? "claude-skills-sync", tier: "mid" },
  { text: (bySlug("sovereign")?.name ?? "SOVEREIGN").toLowerCase(), tier: "mid" },
  { text: (bySlug("tripfund")?.name ?? "TripFund").toLowerCase(), tier: "mid" },
  { text: (bySlug("zantana")?.name ?? "Zantana").toLowerCase(), tier: "mid" },
];

/**
 * The long tail: the stack, and the preference lines an agent would actually
 * want. The preferences are his, lifted from the story paragraphs in
 * `lib/content.ts` and compressed into the shape a machine could read.
 */
const low: Fragment[] = [
  ...profile.skills.map((s): Fragment => ({ text: s.toLowerCase(), tier: "low" })),
  { text: "break fast, fix fast", tier: "low" },
  { text: "ships before it is comfortable", tier: "low" },
  { text: "future focused to a fault", tier: "low" },
  { text: "dropped out, moved to sf", tier: "low" },
  { text: "prefers plain language", tier: "low" },
  { text: "no em dashes", tier: "low" },
  { text: "a mistake you learn from is tuition", tier: "low" },
  { text: "open source by default", tier: "low" },
  { text: "was a customer first", tier: "low" },
  { text: "believer", tier: "low" },
];

/**
 * Slices the field down to a count. Key fragments always survive, then the
 * work, then the texture, so a 390px phone still shows the fragments that
 * carry meaning rather than a random handful of skill names.
 */
export function pickFragments(count: number): Fragment[] {
  const ordered = [...key, ...mid, ...low];
  return ordered.slice(0, Math.min(count, ordered.length));
}

export const fragmentTotal = key.length + mid.length + low.length;
