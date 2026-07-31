import { profile } from "@/lib/content";

import { nodes, type MindNode } from "./graph";

/**
 * The field is made of context, not decoration.
 *
 * Two kinds of fragment drift behind the page:
 *
 *  - STORIED fragments carry a `node` from graph.ts: a real decision, belief,
 *    company or build from Manuel's life. Resting the pointer on one (or
 *    focusing it, or tapping it) opens its story card. These are the words
 *    that matter, and every one of them is drawn from lib/content.ts.
 *
 *  - TEXTURE fragments are the quiet padding a real profile accumulates:
 *    identity lines in his voice, one to three words, lowercase. They are
 *    not interactive and never focusable; they exist so the field reads as
 *    a field and not a scatter of 23 buttons.
 *
 * No tech-stack keywords, no narrative sentences. The label names the word;
 * the story card carries the weight.
 *
 * Tiers control size, resting brightness and depth. `key` fragments are the
 * ones you would put on a business card; `low` fragments are the long tail.
 */

export type FragmentTier = "key" | "mid" | "low";

export type Fragment = {
  /** Optional field name, set in italic serif ahead of the value. */
  label?: string;
  text: string;
  tier: FragmentTier;
  /** The graph node behind this word. Present = hoverable, has a story. */
  node?: MindNode;
};

const byId = new Map(nodes.map((n) => [n.id, n]));

const storied = (id: string, tier: FragmentTier): Fragment => {
  const node = byId.get(id);
  return { text: node?.label ?? id, tier, node };
};

/** The spine of the life: the words that would identify him to anything. */
const key: Fragment[] = [
  storied("faith", "key"),
  storied("dropped-out", "key"),
  storied("san-francisco", "key"),
  storied("configure", "key"),
  storied("paradigm", "key"),
  storied("nouvo", "key"),
  storied("context", "key"),
  { label: "name", text: profile.name.toLowerCase(), tier: "key" },
  { label: "role", text: "founding engineer", tier: "key" },
  { label: "reach", text: profile.email, tier: "key" },
];

/** The turns and the work that mattered. */
const midStoried: Fragment[] = [
  storied("future-focused", "mid"),
  storied("agents", "mid"),
  storied("customer-first", "mid"),
  storied("rejection", "mid"),
  storied("resume-sites", "mid"),
  storied("mistakes", "mid"),
  storied("late-nights", "mid"),
  storied("gideon", "mid"),
  storied("idex", "mid"),
];

const lowStoried: Fragment[] = [
  storied("ultron", "low"),
  storied("launch-control", "low"),
  storied("classroom", "low"),
  storied("sovereign", "low"),
  storied("self-doubt", "low"),
  storied("client-sites", "low"),
  storied("ats", "low"),
];

/** Identity texture, in his voice. Quiet, not interactive. */
const midTexture: Fragment[] = [
  { text: "believer", tier: "mid" },
  { text: "founder", tier: "mid" },
  { text: "one profile, every agent", tier: "mid" },
  { text: "context infrastructure", tier: "mid" },
  { text: "web studio", tier: "mid" },
  { text: "nights and weekends", tier: "mid" },
];

const lowTexture: Fragment[] = [
  { text: "just getting started", tier: "low" },
  { text: "break fast, fix fast", tier: "low" },
  { text: "ship it", tier: "low" },
  { text: "learn fast", tier: "low" },
  { text: "no safe route", tier: "low" },
  { text: "real clients", tier: "low" },
  { text: "the missing piece", tier: "low" },
  { text: "my own hands", tier: "low" },
  { text: "from zero", tier: "low" },
  { text: "the wall", tier: "low" },
  { text: "open source", tier: "low" },
  { text: "cause and effect", tier: "low" },
];

/**
 * Slices the field down to a count. Storied fragments survive first (the key
 * spine, then the turns, then the long tail), texture pads out whatever room
 * is left, so a 390px phone still shows the words that carry stories rather
 * than a random handful of padding.
 */
export function pickFragments(count: number): Fragment[] {
  const ordered = [...key, ...midStoried, ...lowStoried, ...midTexture, ...lowTexture];
  return ordered.slice(0, Math.min(count, ordered.length));
}

export const fragmentTotal =
  key.length + midStoried.length + lowStoried.length + midTexture.length + lowTexture.length;
