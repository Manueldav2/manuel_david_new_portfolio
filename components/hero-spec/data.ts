import { profile, projects, work, type Project, type ProjectStatus, type WorkStatus } from "@/lib/content";

/**
 * Every figure printed on the spec sheet is DERIVED from lib/content.ts at
 * module scope. Nothing is typed by hand, so nothing can drift out of true.
 */

const clientCollection = projects.find((p) => p.clients?.length);

export const vitals = {
  builtTotal: profile.projectsTotalLabel, // "30+" - the honest total, incl. private + client work
  logged: projects.length,
  openSource: projects.filter((p) => p.status === "open-source").length,
  shipped: projects.filter((p) => p.status === "shipped" || p.status === "current").length,
  clientSites: clientCollection?.clients?.length ?? 0,
  engagements: work.length,
  stack: profile.skills.length,
};

/** Earliest start year across all engagements. */
export const since = work
  .map((w) => Number.parseInt(w.dates.slice(0, 4), 10))
  .filter((n) => Number.isFinite(n))
  .reduce((a, b) => Math.min(a, b), 9999);

/** "2026 to now" -> "2026-now" with a proper en dash for the range. */
export function term(dates: string) {
  return dates.replace(/\s+to\s+/, "–");
}

/** Strip the protocol and any trailing slash so URLs set as compact data. */
export function endpoint(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Short class codes, the way a real parts table abbreviates. */
export const CLASS_CODE: Record<ProjectStatus, { code: string; full: string }> = {
  current: { code: "LIVE", full: "In development, live" },
  shipped: { code: "SHIP", full: "Shipped" },
  "open-source": { code: "OSS", full: "Open source" },
  exploration: { code: "EXP", full: "Exploration" },
  archived: { code: "ARCH", full: "Archived" },
};

/** Engagement state. "earning" means it pays for itself without him. */
export const WORK_STATE: Record<WorkStatus, string> = {
  current: "Primary",
  earning: "Self-running",
  prior: "Prior",
};

export function ref(prefix: string, i: number) {
  return `${prefix}‑${String(i + 1).padStart(2, "0")}`;
}

/** The primary link for a build-log row: live URL first, else the repo. */
export function primaryLink(p: Project) {
  return p.url ?? p.github;
}

/**
 * lib/content.ts is written with typewriter apostrophes. Curl them on the way
 * out so the sheet is typographically correct without touching shared content.
 */
export function smart(t: string) {
  return t.replace(/'/g, "’");
}

/** The abstract: bio paragraph one, trimmed of its aside. */
export const abstract = [
  smart(profile.bio[0].split(" Yeah, I know.")[0]),
  smart(profile.bio[1]),
];

export const ISSUE = "2026.07.29";
