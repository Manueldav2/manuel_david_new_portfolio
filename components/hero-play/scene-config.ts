/**
 * Everything the /3 PLAYGROUND world is made of, in one place: palette, the
 * three placemats that run down the table, what lands on each of them, the
 * camera stop for each stop on the scroll, and the pre-settled arrangement
 * used when the visitor asks for reduced motion.
 *
 * Palette note. The old site was tan on espresso and every AI hero is dark
 * with one accent, so this one is lit: a flat marigold ground, cream play
 * mats, and objects in ink / vermilion / spruce. Three object colours, one
 * ground, one mat colour. No purple, no SaaS blue, nothing frosted.
 *
 * Geometry note. The world is ONE table that runs away from the viewer along
 * -Z. The hero mat sits at z = 0 and is framed exactly as it always was. The
 * work mat and the projects mat sit further down the table, out of shot until
 * the scroll walks the camera to them.
 */

export const PALETTE = {
  /** Page and canvas ground. Ink on this is roughly 11:1. */
  marigold: "#E5A523",
  /** The floor MATERIAL is a touch deeper so lighting lands it on marigold. */
  floor: "#E0A81C",
  /** The mats the objects land on. */
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

/**
 * The three placemats. The hero one is centred and unchanged; the other two
 * sit off-axis so the composition never reads as a machine-made row, and so
 * there is always bare marigold on one side for the reading column to sit on.
 */
export type MatSpec = { w: number; d: number; x: number; z: number };

export const MATS: readonly MatSpec[] = [
  { w: MAT.w, d: MAT.d, x: 0, z: 0 },
  { w: 5.6, d: 5.0, x: 1.3, z: -12.4 },
  { w: 6.6, d: 6.4, x: -0.9, z: -22.4 },
];

/** Invisible walls, well outside the mats, so nothing is ever lost. */
export const ARENA = {
  minX: -8.4,
  maxX: 8.4,
  minZ: -29,
  maxZ: 6.4,
  height: 11,
};

/* -------------------------------------------------------------- the name --- */

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

export type BallSpec = {
  id: string;
  color: BlockColor | "cream";
  x: number;
  z: number;
  beat: number;
};

export const BALLS: readonly BallSpec[] = [
  { id: "b0", color: "vermilion", x: -2.55, z: 1.72, beat: 12 },
  { id: "b1", color: "spruce", x: 2.7, z: 1.85, beat: 13 },
  { id: "b2", color: "ink", x: 0.15, z: 1.9, beat: 14 },
];

/** Half the width of the longer word, which is what portrait has to fit. */
export const WORD_HALF_W = (5 * BLOCK_PITCH + BLOCK) / 2;

/* --------------------------------------------------------- work and toys --- */

/** A labelled slab or tile. The label is printed on the top and bottom face. */
export type PlateSpec = {
  id: string;
  label: string;
  color: BlockColor;
  x: number;
  z: number;
  /** Resting yaw, radians. Nothing here is square to the table. */
  yaw: number;
};

/** A work slab: big, heavy, lands with a thud. */
export const SLAB = { w: 2.9, h: 0.36, d: 1.16 };
/** A project tile: half the mass, twice as many. */
export const TILE = { w: 1.85, h: 0.3, d: 0.92 };

/** Landscape: three slabs walking diagonally across the work mat. */
export const WORK_WIDE: readonly PlateSpec[] = [
  { id: "w0", label: "Configure", color: "ink", x: 0.15, z: -14.0, yaw: 0.07 },
  { id: "w1", label: "Paradigm", color: "vermilion", x: 2.0, z: -12.4, yaw: -0.05 },
  { id: "w2", label: "Nouvo", color: "spruce", x: 0.6, z: -10.75, yaw: 0.11 },
];

/** Portrait: the same three, stacked down the mat so a phone can read them. */
export const WORK_TALL: readonly PlateSpec[] = [
  { id: "w0", label: "Configure", color: "ink", x: 1.15, z: -13.8, yaw: 0.06 },
  { id: "w1", label: "Paradigm", color: "vermilion", x: 1.55, z: -12.4, yaw: -0.05 },
  { id: "w2", label: "Nouvo", color: "spruce", x: 1.0, z: -11.0, yaw: 0.09 },
];

/**
 * Six of the thirty. Curated on purpose: the table stays readable and the DOM
 * underneath carries the rest with real links.
 */
export const PROJECTS_WIDE: readonly PlateSpec[] = [
  { id: "p0", label: "IDEX", color: "ink", x: -3.0, z: -23.9, yaw: -0.09 },
  { id: "p1", label: "Ultron", color: "vermilion", x: -1.05, z: -23.95, yaw: 0.06 },
  { id: "p2", label: "Gideon", color: "spruce", x: 0.9, z: -23.85, yaw: -0.04 },
  { id: "p3", label: "Launch Control", color: "vermilion", x: -2.6, z: -21.3, yaw: 0.08 },
  { id: "p4", label: "Claude Classroom", color: "ink", x: -0.65, z: -21.25, yaw: -0.07 },
  { id: "p5", label: "SOVEREIGN", color: "spruce", x: 1.3, z: -21.35, yaw: 0.05 },
];

/** Portrait keeps four, in two rows, so nothing is thumbnail-sized. */
export const PROJECTS_TALL: readonly PlateSpec[] = [
  { id: "p0", label: "IDEX", color: "ink", x: -2.15, z: -23.7, yaw: -0.08 },
  { id: "p1", label: "Ultron", color: "vermilion", x: -0.25, z: -23.75, yaw: 0.06 },
  { id: "p2", label: "Gideon", color: "spruce", x: -2.15, z: -21.6, yaw: 0.07 },
  { id: "p5", label: "SOVEREIGN", color: "ink", x: -0.25, z: -21.55, yaw: -0.05 },
];

/** How high above the mat a section's objects hang before gravity is on. */
export const PLATE_DROP = 3.4;

/* ---------------------------------------------------------- camera stops --- */

/**
 * One stop per section. `off` slides the camera sideways along the table with
 * no shear; `sy` shifts the frustum vertically so the objects can be pushed
 * up or down the frame and leave a clean band of marigold for the copy.
 */
export type CamStop = {
  /** Camera x and look-at x. A pure lateral pan. */
  off: number;
  /** Look-at height. */
  y: number;
  /** Ground point on the table the camera orbits. */
  z: number;
  /** Look-at z offset from the anchor. Positive lifts the subject up-frame. */
  bias: number;
  /** Degrees below horizontal. */
  pitch: number;
  /** Half-width of world that has to fit across the frame. */
  fit: number;
  /** Frustum shift as a fraction of viewport height. Positive lifts. */
  sy: number;
};

/**
 * Landscape. Stop 0 reproduces the original hero framing exactly. Stops 1 and
 * 2 keep the mat clear of the reading column on the opposite side. Stop 3 is
 * the only real move: the pitch drops to 41 degrees and the camera looks
 * straight down the length of the table, so the last thing you see is that all
 * of it was one surface.
 */
export const STOPS_WIDE: readonly CamStop[] = [
  { off: 0, y: 0.35, z: 0, bias: 0.42, pitch: 60, fit: MAT.w / 2 + 1.9, sy: 0 },
  { off: 0, y: 0.35, z: -12.4, bias: 0.3, pitch: 58, fit: 5.0, sy: 0.03 },
  { off: 1.15, y: 0.35, z: -22.4, bias: 0.3, pitch: 56, fit: 5.6, sy: 0.03 },
  { off: 2.6, y: 0.35, z: -14.2, bias: 0, pitch: 41, fit: 7.6, sy: -0.04 },
];

/** Portrait. Stop 0 reproduces the original hero framing exactly. */
export const STOPS_TALL: readonly CamStop[] = [
  { off: 0, y: 0.35, z: 0, bias: 0.85, pitch: 72, fit: WORD_HALF_W + 0.34, sy: 0 },
  { off: 1.3, y: 0.35, z: -12.4, bias: 1.4, pitch: 72, fit: 3.4, sy: 0.26 },
  { off: -1.2, y: 0.35, z: -22.4, bias: 1.4, pitch: 72, fit: 3.2, sy: 0.26 },
  { off: 1.0, y: 0.35, z: -17.0, bias: 1.0, pitch: 54, fit: 5.0, sy: 0.2 },
];

/* ------------------------------------------------------------ deterministic */

/** Height the name blocks hang at before gravity is switched on, per beat. */
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
