/**
 * Everything the /3 PLAYGROUND world is made of, in one place: palette, the
 * three placemats that run down the table, what sits on each of them, the
 * camera stop for each section, and the pre-settled arrangement used when the
 * visitor asks for reduced motion.
 *
 * Palette note. The old site was tan on espresso and every AI hero is dark
 * with one accent, so this one is lit: a flat marigold ground, cream play
 * mats, and objects in ink / vermilion / spruce. Three object colours, one
 * ground, one mat colour. No purple, no SaaS blue, nothing frosted.
 *
 * Geometry note. The world is ONE table that runs away from the viewer along
 * -Z. The hero mat sits at z = 0 and is framed exactly as it always was. The
 * camera then drops to something close to sitting height and stays there for
 * the rest of the page, because the plan view read like a diagram of a table
 * instead of a table.
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
 * The three placemats. The hero one is centred and unchanged. The other two
 * sit off-axis and closer than they used to be, so the walk between them is a
 * beat rather than a stretch of bare tabletop.
 */
export type MatSpec = { w: number; d: number; x: number; z: number };

export const MAT_WORK = { x: 1.2, z: -10.8, w: 5.8, d: 5.0 };
export const MAT_PROJECTS = { x: -0.8, z: -19.8, w: 6.8, d: 6.4 };

export const MATS: readonly MatSpec[] = [
  { w: MAT.w, d: MAT.d, x: 0, z: 0 },
  { w: MAT_WORK.w, d: MAT_WORK.d, x: MAT_WORK.x, z: MAT_WORK.z },
  { w: MAT_PROJECTS.w, d: MAT_PROJECTS.d, x: MAT_PROJECTS.x, z: MAT_PROJECTS.z },
];

/** Invisible walls, well outside the mats, so nothing is ever lost. */
export const ARENA = {
  minX: -8.4,
  maxX: 8.4,
  minZ: -26.5,
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

/**
 * A labelled slab or tile. `id` is the same string the DOM uses for that
 * entry, so picking the object and pressing the row in the list are the same
 * action arriving from two directions.
 */
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

/**
 * Landscape and portrait have to carry the SAME ids in the SAME order: a
 * rotation re-homes each piece by position in this list, and the selection
 * plumbing looks pieces up by id.
 */
export const WORK_WIDE: readonly PlateSpec[] = [
  { id: "configure", label: "Configure", color: "ink", x: 1.0, z: -12.2, yaw: 0.07 },
  { id: "paradigm", label: "Paradigm", color: "vermilion", x: 1.78, z: -10.72, yaw: -0.05 },
  { id: "nouvo", label: "Nouvo", color: "spruce", x: 0.85, z: -9.28, yaw: 0.11 },
];

export const WORK_TALL: readonly PlateSpec[] = [
  { id: "configure", label: "Configure", color: "ink", x: 1.3, z: -12.15, yaw: 0.06 },
  { id: "paradigm", label: "Paradigm", color: "vermilion", x: 1.55, z: -10.75, yaw: -0.05 },
  { id: "nouvo", label: "Nouvo", color: "spruce", x: 1.05, z: -9.35, yaw: 0.09 },
];

/**
 * Six of the thirty, and every one of them a thing he wrote rather than a
 * thing he played. Two rows on the mat in landscape, three in portrait.
 */
export const PROJECTS_WIDE: readonly PlateSpec[] = [
  { id: "idex", label: "IDEX", color: "ink", x: -3.1, z: -21.3, yaw: -0.09 },
  { id: "ultron", label: "Ultron", color: "vermilion", x: -1.1, z: -21.4, yaw: 0.06 },
  { id: "gideon", label: "Gideon", color: "spruce", x: 0.9, z: -21.25, yaw: -0.04 },
  { id: "launch-control", label: "Launch Control", color: "vermilion", x: -2.9, z: -18.6, yaw: 0.08 },
  { id: "claude-classroom", label: "Claude Classroom", color: "ink", x: -0.9, z: -18.7, yaw: -0.07 },
  {
    id: "satisfying-video-generator",
    label: "Satisfying Video Generator",
    color: "spruce",
    x: 1.1,
    z: -18.55,
    yaw: 0.05,
  },
];

export const PROJECTS_TALL: readonly PlateSpec[] = [
  { id: "idex", label: "IDEX", color: "ink", x: -2.2, z: -21.6, yaw: -0.08 },
  { id: "ultron", label: "Ultron", color: "vermilion", x: 0.6, z: -21.5, yaw: 0.06 },
  { id: "gideon", label: "Gideon", color: "spruce", x: -2.2, z: -19.8, yaw: 0.07 },
  { id: "launch-control", label: "Launch Control", color: "vermilion", x: 0.6, z: -19.7, yaw: -0.05 },
  { id: "claude-classroom", label: "Claude Classroom", color: "ink", x: -2.2, z: -18.0, yaw: 0.05 },
  {
    id: "satisfying-video-generator",
    label: "Satisfying Video Generator",
    color: "spruce",
    x: 0.6,
    z: -17.95,
    yaw: -0.06,
  },
];

/** How high above the mat a section's objects hang before gravity is on. */
export const PLATE_DROP = 3.4;

/* ---------------------------------------------------------- camera stops --- */

/**
 * One stop per section. `off` slides the camera sideways along the table with
 * no shear; `yaw` swings it around the point it is looking at, which is what
 * turns a plan view into a view from a chair; `sy` shifts the frustum
 * vertically so the objects sit clear of the reading column.
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
  /** Degrees below horizontal. Small is human, large is a diagram. */
  pitch: number;
  /** Degrees around the anchor. 0 is square to the table. */
  yaw: number;
  /** Half-width of world that has to fit across the frame. */
  fit: number;
  /** Frustum shift as a fraction of viewport height. Positive lifts. */
  sy: number;
};

/**
 * Landscape. Stop 0 reproduces the original hero framing exactly and is not to
 * be touched. From stop 1 on, the camera drops to between 33 and 41 degrees
 * and picks up a little yaw, so you are sitting at the table for the rest of
 * the page instead of hovering over it.
 */
export const STOPS_WIDE: readonly CamStop[] = [
  { off: 0, y: 0.35, z: 0, bias: 0.42, pitch: 60, yaw: 0, fit: MAT.w / 2 + 1.9, sy: 0 },
  { off: -2.15, y: 0.35, z: 0.2, bias: 0.2, pitch: 38, yaw: 15, fit: 6.1, sy: -0.05 },
  { off: MAT_WORK.x, y: 0.35, z: MAT_WORK.z, bias: 0.1, pitch: 40, yaw: -13, fit: 6.0, sy: 0.02 },
  {
    off: 0.4,
    y: 0.35,
    z: MAT_PROJECTS.z,
    bias: 0.15,
    pitch: 38,
    yaw: 11,
    fit: 7.0,
    sy: 0.02,
  },
  { off: 1.0, y: 0.35, z: -21.6, bias: 0.5, pitch: 32, yaw: 22, fit: 5.8, sy: 0.09 },
];

/** Portrait. Stop 0 reproduces the original hero framing exactly. */
export const STOPS_TALL: readonly CamStop[] = [
  { off: 0, y: 0.35, z: 0, bias: 0.85, pitch: 72, yaw: 0, fit: WORD_HALF_W + 0.34, sy: 0 },
  { off: 0.2, y: 0.35, z: 0.1, bias: 1.2, pitch: 57, yaw: 12, fit: 3.5, sy: 0.3 },
  { off: MAT_WORK.x, y: 0.35, z: MAT_WORK.z, bias: 1.2, pitch: 57, yaw: -9, fit: 3.5, sy: 0.28 },
  {
    off: MAT_PROJECTS.x,
    y: 0.35,
    z: MAT_PROJECTS.z,
    bias: 1.3,
    pitch: 55,
    yaw: 8,
    fit: 3.8,
    sy: 0.28,
  },
  { off: MAT_PROJECTS.x + 0.3, y: 0.35, z: -21.1, bias: 1.1, pitch: 45, yaw: 16, fit: 3.3, sy: 0.24 },
];

/* ------------------------------------------------- selection, in the world */

/** How far a chosen object lifts off its mat while its panel is open. */
export const LIFT = 0.72;
/** How far the camera leans toward a chosen object. 0 is not at all. */
export const FOCUS_PULL = 0.62;

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
