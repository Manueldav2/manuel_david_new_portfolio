/**
 * Everything the /3 PLAYGROUND scene is made of, in one place: palette, block
 * layout, the drop choreography and the pre-settled arrangement used when the
 * visitor asks for reduced motion.
 *
 * Palette note. The old site was tan on espresso and every AI hero is dark
 * with one accent, so this one is lit: a flat marigold ground, a cream play
 * mat, and objects in ink / vermilion / spruce. Three object colours, one
 * ground, one mat. No purple, no SaaS blue, nothing frosted.
 */

export const PALETTE = {
  /** Page and canvas ground. Ink on this is roughly 11:1. */
  marigold: "#E5A523",
  /** The floor MATERIAL is a touch deeper so lighting lands it on marigold. */
  floor: "#E0A81C",
  /** The play mat the letters land on. */
  cream: "#FFF6E4",
  ink: "#17140F",
  vermilion: "#E4502E",
  spruce: "#12705A",
} as const;

export type BlockColor = "ink" | "vermilion" | "spruce";

export const BLOCK = 0.82;
export const BLOCK_GAP = 0.24;
export const BLOCK_PITCH = BLOCK + BLOCK_GAP;

/** Cream mat, sized to hold both words with room to shove them around. */
export const MAT = { w: 7.9, d: 4.7, h: 0.16 };

/** Invisible walls sit well outside the mat so nothing is ever lost. */
export const ARENA = { halfX: 7.2, halfZ: 5.6, height: 9 };

export type BlockSpec = {
  id: string;
  char: string;
  color: BlockColor;
  /** Resting position on the mat. */
  x: number;
  z: number;
  /** Order in the drop choreography. */
  beat: number;
};

const WORDS: readonly { text: string; z: number; colors: readonly BlockColor[] }[] = [
  {
    text: "MANUEL",
    z: -0.76,
    colors: ["ink", "vermilion", "ink", "spruce", "ink", "vermilion"],
  },
  {
    text: "DAVID",
    z: 0.76,
    colors: ["ink", "spruce", "ink", "vermilion", "ink"],
  },
];

export const BLOCKS: readonly BlockSpec[] = WORDS.flatMap((word, row) => {
  const width = (word.text.length - 1) * BLOCK_PITCH;
  return word.text.split("").map((char, i) => ({
    id: `${row}-${i}`,
    char,
    color: word.colors[i],
    x: -width / 2 + i * BLOCK_PITCH,
    z: word.z,
    beat: row * word.text.length + i,
  }));
});

export const BALL_R = 0.28;

export type BallSpec = { id: string; color: BlockColor | "cream"; x: number; z: number; beat: number };

export const BALLS: readonly BallSpec[] = [
  { id: "b0", color: "vermilion", x: -2.55, z: 1.72, beat: 12 },
  { id: "b1", color: "spruce", x: 2.7, z: 1.85, beat: 13 },
  { id: "b2", color: "ink", x: 0.15, z: 1.9, beat: 14 },
];

/** Height the pieces hang at before gravity is switched on, per beat. */
export function dropHeight(beat: number) {
  return 1.62 + (beat % 3) * 0.3;
}

/** Deterministic jitter so the settle looks handled, not machined. */
export function jitter(beat: number) {
  const a = Math.sin(beat * 12.9898) * 43758.5453;
  const b = Math.sin(beat * 78.233) * 12345.6789;
  const c = Math.sin(beat * 39.425) * 24634.6345;
  const frac = (n: number) => n - Math.floor(n);
  return {
    dx: (frac(a) - 0.5) * 0.1,
    dz: (frac(b) - 0.5) * 0.1,
    spin: (frac(c) - 0.5) * 0.34,
    tilt: (frac(a * 1.7) - 0.5) * 0.1,
  };
}

/**
 * The reduced-motion arrangement. Same pieces, no simulation: the name is
 * already down, two blocks have come to rest at an angle and one is leaning on
 * its neighbour, so the scene still reads as something that was played with.
 */
export const SETTLED_ROTATION: Record<string, [number, number, number]> = {
  "0-1": [0, 0.19, 0],
  "0-4": [0, -0.13, 0],
  "1-0": [0, 0.09, 0],
  "1-3": [0, -0.22, 0],
};

export const SETTLED_OFFSET: Record<string, [number, number, number]> = {
  "0-1": [0.05, 0, 0.04],
  "0-4": [-0.04, 0, -0.03],
  "1-3": [0.06, 0, 0.05],
};

/**
 * One block has tipped onto its face. Because the letter is printed on all six
 * sides it still reads, it just reads at an angle, which is the whole point:
 * this is a thing that has been handled.
 */
export const SETTLED_TIPPED: Record<string, [number, number, number]> = {
  "0-5": [-Math.PI / 2, 0.14, 0],
};
