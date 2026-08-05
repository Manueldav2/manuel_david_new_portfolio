import { nodes, type MindNode } from "./graph";

/**
 * The field is made of context, not decoration.
 *
 * EVERY fragment carries a node from graph.ts: a real decision, belief,
 * company or build from Manuel's life. Resting the pointer on one (or
 * focusing it, or tapping it) opens its story card. There is no inert
 * texture class: the hero promises that any word will tell its story, so
 * every word in the field has one. Fewer, truer words beat padding.
 *
 * No tech-stack keywords, no narrative sentences. The label names the word;
 * the story card carries the weight.
 *
 * Tiers control size, resting brightness and depth. `key` fragments are the
 * ones you would put on a business card; `low` fragments are the long tail.
 */

export type FragmentTier = "key" | "mid" | "low";

export type Fragment = {
  text: string;
  tier: FragmentTier;
  /** The graph node behind this word. Always present: every word has a story. */
  node: MindNode;
};

const byId = new Map(nodes.map((n) => [n.id, n]));

const storied = (id: string, tier: FragmentTier): Fragment => {
  const node = byId.get(id);
  if (!node) throw new Error(`fragments: unknown node id "${id}"`);
  return { text: node.label, tier, node };
};

/** The spine of the life: the words that would identify him to anything. */
const key: Fragment[] = [
  storied("faith", "key"),
  storied("all-in", "key"),
  storied("san-francisco", "key"),
  storied("configure", "key"),
  storied("paradigm", "key"),
  storied("nouvo", "key"),
  storied("context", "key"),
];

/** The turns, the beliefs, and the work that mattered. */
const mid: Fragment[] = [
  storied("future-focused", "mid"),
  storied("agents", "mid"),
  storied("customer-first", "mid"),
  storied("rejection", "mid"),
  storied("resume-sites", "mid"),
  storied("mistakes", "mid"),
  storied("late-nights", "mid"),
  storied("break-fast", "mid"),
  storied("gideon", "mid"),
  storied("idex", "mid"),
  storied("shipping", "mid"),
  storied("attention", "mid"),
  storied("agent-to-agent", "mid"),
  storied("voice-agents", "mid"),
];

/** The long tail: the after-hours builds, the eras, the quieter turns. */
const low: Fragment[] = [
  storied("ultron", "low"),
  storied("launch-control", "low"),
  storied("classroom", "low"),
  storied("self-doubt", "low"),
  storied("client-sites", "low"),
  storied("ats", "low"),
  storied("open-source", "low"),
  storied("thirty-builds", "low"),
  storied("build-day", "low"),
  storied("antler", "low"),
  storied("hack-night", "low"),
  storied("optimus", "low"),
  storied("first-client", "low"),
  storied("classmates", "low"),
  storied("athletes", "low"),
  storied("dancers", "low"),
  storied("tripfund", "low"),
  storied("lead-gen", "low"),
  storied("sovereign", "low"),
  storied("zantana", "low"),
  storied("satisfying-videos", "low"),
  storied("skills-sync", "low"),
  storied("revive-rides", "low"),
  storied("runs-itself", "low"),
  storied("cold-calls", "low"),
  storied("plaid-for-context", "low"),
  storied("18vc", "low"),
];

/**
 * Slices the field down to a count. The key spine survives first, then the
 * turns, then the long tail, so a 390px phone still shows the words that
 * carry the most weight rather than a random handful.
 */
export function pickFragments(count: number): Fragment[] {
  const ordered = [...key, ...mid, ...low];
  return ordered.slice(0, Math.min(count, ordered.length));
}

export const fragmentTotal = key.length + mid.length + low.length;
