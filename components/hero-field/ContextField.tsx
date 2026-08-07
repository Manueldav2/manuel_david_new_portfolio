"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { FocusEvent as ReactFocusEvent, RefObject } from "react"
import { createPortal } from "react-dom"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  LineSegments,
  Mesh,
  NormalBlending,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three"

import { pickFragments } from "./fragments"
import { KIND_LABEL, edges, importanceOf, nodeById, strongEdges } from "./graph"
import styles from "./hero-field.module.css"

/**
 * CONTEXT FIELD
 *
 * A drifting field of context. Not points, not particles: small real pieces
 * of one person's life, set in type, mostly too dim to read. Whatever the
 * cursor passes near wakes up, becomes legible, recognises its neighbours and
 * draws hairlines between them. Move on and the constellation dissolves,
 * slower than it formed, because forgetting takes longer than recognising.
 *
 * THE EXPLAINER: resting the pointer on a storied word (or focusing it with
 * the keyboard, or tapping it on touch) opens a compact story card anchored
 * right beside the word: what kind of thing it is, its story, its link. The
 * word itself is held fully awake and takes the ember while its card is
 * open. Leaving starts a short grace timer; crossing into the card cancels
 * it, so the link inside is always reachable. Escape, a tap elsewhere, or
 * scrolling into the reading channel closes it.
 *
 * Split by what each renderer is good at:
 *   - the fragments are DOM text, so they are crisp at any DPI, hinted by the
 *     same font stack as the page, and never resampled;
 *   - the links are one LineSegments in an orthographic WebGL pass sized in
 *     CSS pixels, so hairlines stay hairlines and additive blending gives the
 *     ink ground a little depth without a bloom pass.
 *
 * Everything runs off one simulation in viewport pixel space. Nothing inside
 * the frame loop allocates, nothing in the loop touches React state, and the
 * only layout reads happen on mount, on resize, when the webfonts land, and
 * on the open card (transform-only writes keep those reads cheap).
 */

const LINE_VERT = /* glsl */ `
  attribute float aAlpha;
  attribute float aTint;
  varying float vAlpha;
  varying float vTint;

  void main() {
    vAlpha = aAlpha;
    vTint = aTint;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const LINE_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uEmber;
  varying float vAlpha;
  varying float vTint;

  void main() {
    gl_FragColor = vec4(mix(uBase, uEmber, vTint * 0.72), vAlpha);
  }
`

const MAX_SEGMENTS = 400
const CURSOR_LINKS = 3
/** Gap left between the edge of a word and the hairline that reaches for it. */
const NODE_PAD = 7
/** How long the card lingers after the pointer leaves word or card. */
const GRACE_MS = 280

/**
 * Drift amplitude, in PIXELS, not normalised space. The old drift was a
 * fraction of the half-viewport (0.03 = 21px at 1440), which was larger than
 * the placement padding between words, so over a minute the field slowly
 * tangled: labels wandered into each other and the composition degraded
 * frame by frame. In pixel space each word owns an exclusive orbit around
 * its seeded anchor that is strictly smaller than the padding placement
 * guaranteed, so the field breathes but two words can never meet, at t=0 or
 * t=forever.
 */
const DRIFT_X = 5
const DRIFT_Y = 3.5
/** Clearance kept between a passing hairline and any label it crosses. */
const CLIP_PAD = 8
/** Sub-segments shorter than this are dropped instead of drawn as crumbs. */
const MIN_SUB_PX = 18
/**
 * At rest a node shows at most this many constellation lines, shortest
 * first. Hub nodes in the graph have up to nine relations; drawing all nine
 * as permanent hairlines is where the "messy moments" came from. The full
 * degree still lights up when both ends actually wake.
 */
const REST_DEG_MAX = 3
/** Minimum angle (radians) between two resting hairlines leaving one node. */
const MIN_EDGE_ANGLE = 0.3
/** Paper runs far fewer words, so two strokes leaving one node need more
 * daylight between them before the sheet reads as deliberate pen work:
 * three near-parallel strokes converging on one label read as a sliver
 * triangle drawn by mistake. */
const MIN_EDGE_ANGLE_PAPER = 0.55
/**
 * CSS-pixel width of the life spine's stroke. LineSegments cannot draw
 * wider than a hairline (gl lineWidth is a no-op on desktop GL), and the
 * old workaround (a second hairline offset 0.8px) rendered at DPR2 as two
 * parallel lines with daylight between them. The spine now draws as one
 * honest quad of this width through the same shader.
 */
const SPINE_WIDTH = 2.4

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Weighted exit: fast start, long settle. The entrance easing family. */
const easeOutQuart = (t: number) => {
  const u = 1 - Math.min(1, Math.max(0, t))
  return 1 - u * u * u * u
}

/* ------------------------------------------------------------------ */
/* LIGHTING                                                            */
/*                                                                     */
/* The field is lit, not uniformly dim. Configure is the light source:  */
/* it sits at the gravitational centre of the life, so warmth and       */
/* brightness fall off from it, and the far words cool into             */
/* atmospheric depth. The grade is computed per word from the AUTHORED  */
/* layout (once per placement, not per frame): each word gets a colour  */
/* on the cool-to-warm ramp and a brightness factor the frame loop      */
/* multiplies in. No filters, no bloom: it is only colour and alpha.    */
/* ------------------------------------------------------------------ */

/** Cool far-field ink and the warm tone near the source, as RGB. */
const LIGHT_COOL: [number, number, number] = [0xa6, 0xbe, 0xc8]
const LIGHT_WARM: [number, number, number] = [0xf4, 0xe6, 0xc0]
/** Paper wears its own ramp: warm near-black ink close to the source,
 * cooling to a softer graphite grey in the far field. */
const PAPER_COOL: [number, number, number] = [0x6b, 0x67, 0x62]
const PAPER_WARM: [number, number, number] = [0x24, 0x20, 0x1c]
/** Configure's ramp is systematic, not atmospheric: ink #141414 near the
 * source, cooling to a slate-tinted gray in the far field. The slate
 * undertone keys the far field to the brand without spending the accent;
 * the accent itself is worn by exactly one word (see applyLight). */
const CFG_COOL: [number, number, number] = [0x93, 0x9a, 0xa2]
const CFG_WARM: [number, number, number] = [0x14, 0x14, 0x14]

/**
 * Brightness envelope of the light, by distance from the source in units
 * of the short viewport axis. Words inside NEAR bathe in it; past FAR
 * they sink toward the resting-dim floor.
 */
const LIGHT_NEAR = 0.12
const LIGHT_FAR = 0.78

/* ------------------------------------------------------------------ */
/* ENTRANCE                                                            */
/*                                                                     */
/* One take, under 2.6s: the life spine ignites node by node with its   */
/* edges drawing in behind it, then the rest of the field breathes in   */
/* by tier, then the ambient drift takes over. Reduced motion lands     */
/* composed instantly.                                                  */
/* ------------------------------------------------------------------ */

/** The life spine, in ignition order. */
const SPINE_ORDER = [
  "faith",
  "all-in",
  "san-francisco",
  "nouvo",
  "paradigm",
  "configure",
] as const
/* Front-loaded: ignition begins ~150ms after the layout settles and the
 * cadence is tight enough that most of the spine is already burning by
 * 700ms. The take used to idle for 700ms before anything lit, which read
 * as dead air followed by a curtain-lift. */
const SPINE_STEP = 0.09
const SPINE_START = 0.15
/** When the non-spine tiers breathe in. */
const INTRO_KEY = SPINE_START + SPINE_ORDER.length * SPINE_STEP
const INTRO_MID = INTRO_KEY + 0.14
const INTRO_LOW = INTRO_MID + 0.2
/** Per-word fade duration once its cue hits. */
const INTRO_FADE = 0.5
/** The clock value at which the entrance is simply over. */
const INTRO_DONE = 2.1

/**
 * Deterministic PRNG (mulberry32). The composition is curated, not rolled:
 * every load of the page builds the identical field from LAYOUT_SEED, so the
 * first frame anyone sees is the final one and a reload never rearranges the
 * room. Only the life on top of the layout, the drift, the ambient wake, the
 * ghost cursor, stays organic.
 */
const mulberry32 = (seed: number) => {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Chosen by eye from rendered candidates (7, 47, 1987, 20260731, 104729 at
 * 1440x900 and 390x844): all four quadrants populated, the seven anchors
 * spread with real air between them, no word pinned to an edge, and the
 * phone cut keeps a clean diagonal above and below the hero block.
 */
const LAYOUT_SEED = 7

/**
 * Resting brightness and pixel size per tier, near depth then far depth.
 *
 * The hierarchy is deliberately steep. The seven key anchors are set large in
 * the display italic and legible at rest: they are the names that identify
 * him, and they give the field its compositional mass. The mid tier is
 * readable if you lean in; only the long tail rests near the threshold, so
 * the cursor still has something real to reveal without the whole field
 * reading as empty space.
 */
const TIER = {
  key: { alpha: [0.92, 0.68], size: [33, 24], depth: [0, 0.34] },
  mid: { alpha: [0.56, 0.36], size: [15.5, 12.5], depth: [0.2, 0.7] },
  low: { alpha: [0.42, 0.25], size: [12.5, 10.5], depth: [0.48, 1] },
} as const

/**
 * The scroll descent, in field depths.
 *
 * Scrolling out of the hero travels a virtual camera into the field along z.
 * Every word has a depth; the camera's z is scrubbed straight off scrollY
 * (read once per rAF, native scrolling untouched). Words ahead of the camera
 * swell and brighten as they approach, spread outward from a vanishing
 * point, then fade the instant they pass behind you; the hairlines follow
 * their endpoints, so the web stretches and lights as you move through it.
 * PERSP is the focal length: smaller = more violent perspective.
 */
const PERSP = 0.8
/** How many viewport heights of scroll complete the descent. */
const TRAVEL_SPAN = 1.1
/** Deepest camera z: a touch past the deepest word, so everything passes. */
const TRAVEL_DEPTH = 1.45

/** Padding kept around each word, and around the page's own type. The
 * vertical pad is deliberately larger than DRIFT_Y + the worst-case
 * parallax differential, so the placement guarantee survives motion. */
const WORD_PAD_X_BASE = 22
const WORD_PAD_Y_BASE = 12
/**
 * A 390 viewport is not a small 1440. Forty-four pixels of daylight
 * between two words costs a fifth of the usable width there, and the field
 * was reading as a dozen lonely labels because of it, so a NARROW frame
 * trades horizontal air for words.
 *
 * The vertical pad moves for a different reason and on a different gate.
 * On a COARSE pointer that axis has a second job: a tap target is 44px
 * tall (WCAG 2.5.5) while a 13px word's box is ~24, so each hit surface
 * reaches ~10px past its own glyphs top and bottom. The pad has to cover
 * that overhang plus the drift orbit, or two targets would collide even
 * though the two WORDS never do. Seventeen is what that arithmetic costs,
 * and it is owed on any touch screen — a phone held sideways and a tablet
 * have the same fingers as a phone held upright.
 */
const WORD_PAD_X_NARROW = 15
const WORD_PAD_Y_TOUCH = 17
/** Half of the WCAG 2.5.5 target: the hit surface a coarse pointer wants. */
const HIT_HALF = 22
/**
 * Worst-case RELATIVE wander between two words, in pixels: independent
 * drift orbits (DRIFT x2), the ambient parallax differential (the two
 * words can sit at opposite ends of the depth range), and the ghost
 * cursor's lean. Subtracted from every real separation before hit
 * surfaces are sized, so a target can never grow into its neighbour at
 * some later second of the clock.
 */
const WANDER_X = 20
const WANDER_Y = 14
/** The smallest a field word is allowed to be set on a phone or any other
 * touch screen. Below this the long tail stops being readable at arm's
 * length and starts being texture, which is the one thing this field is
 * not — and a word too small to read is also a word too small to aim at. */
const TOUCH_MIN_PX = 13
/**
 * How many words the phone cut aims to show. The candidate list is
 * deliberately longer (see FIELD_TUNE) so the fill pass has surplus to
 * choose from; this is where it stops. Sixteen to twenty is the band
 * where a 390 frame reads as a map rather than a list or a mess.
 */
const NARROW_SEATS = 19
const TYPE_PAD_X = 18
const TYPE_PAD_Y = 12

type Box = [x0: number, y0: number, x1: number, y1: number]

const hits = (a: Box, b: Box) =>
  a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]

/**
 * The type identities the field can wear. The mechanics are shared; each
 * identity tunes only density (how many words the viewport carries) and the
 * size contrast between tiers, because a grotesk can run denser than a serif
 * and a mono field wants more air around fewer words.
 */
export type FieldVariant = "base" | "serif" | "grotesk" | "mono" | "paper" | "configure"

const FIELD_TUNE: Record<
  FieldVariant,
  { counts: [phone: number, mid: number, wide: number]; size: { key: number; mid: number; low: number } }
> = {
  base: { counts: [20, 36, 48], size: { key: 1, mid: 1, low: 1 } },
  serif: { counts: [20, 36, 48], size: { key: 1.18, mid: 1.05, low: 0.98 } },
  grotesk: { counts: [22, 38, 48], size: { key: 1.06, mid: 1.05, low: 1.05 } },
  mono: { counts: [16, 28, 40], size: { key: 1.04, mid: 0.94, low: 0.95 } },
  /* Heavy cardstock runs CALM: the spine, the majors, and nothing else.
   * A printed sheet earns its gravity from what it leaves off. */
  paper: { counts: [12, 16, 21], size: { key: 1.16, mid: 1.0, low: 0.98 } },
  /* Configure runs the full audited field: every word that earned its
   * story, flat canvas, ink lines, systematic scatter. Configure itself is
   * pinned to the middle of the frame and the descent converges on it.
   * The phone count is deliberately higher than the placement can seat:
   * the copy stack swallows the middle of a 390px frame and parks the
   * words that started under it, so the cut needs surplus candidates for
   * the band below the copy to land the target of 16-20 visible words. */
  configure: { counts: [26, 32, 44], size: { key: 1.12, mid: 1.0, low: 0.98 } },
}

export default function ContextField({
  className,
  onReady,
  cardMount,
  variant = "base",
}: {
  className?: string
  onReady?: () => void
  /** Which type identity's density/size tuning to run. Defaults to the live one. */
  variant?: FieldVariant
  /**
   * Where the story card portals to. The field lives inside the fixed
   * backdrop (z-index 0), which is its own stacking context, so a card
   * rendered here could never rise above the page type; the parent hands
   * down a mount that sits above the content instead. Must be inside the
   * .root element so the palette variables and font variables still apply.
   */
  cardMount?: RefObject<HTMLElement | null>
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const wordsRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const readyRef = useRef(onReady)
  readyRef.current = onReady

  // The storied word whose card is open. Hover, focus and tap all funnel
  // here; the frame loop reads it through a ref and never re-runs the effect.
  const [active, setActive] = useState<string | null>(null)
  const activeRef = useRef<string | null>(null)
  const redrawRef = useRef<(() => void) | null>(null)
  // Card placement, decided once per open (hysteresis: the anchor drifts,
  // and the card should not flip sides frame to frame). Modes: 0 below,
  // 1 above, 2 right of the word, 3 left of the word.
  const placeRef = useRef<{ mode: number; decided: boolean }>({ mode: 0, decided: false })

  const hideTimer = useRef<number | null>(null)
  const clearHide = () => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }
  const open = (id: string) => {
    clearHide()
    setActive(id)
  }
  const close = () => {
    clearHide()
    cardHotRef.current = false
    setActive(null)
  }
  const openRef = useRef(open)
  openRef.current = open
  const closeRef = useRef(close)
  closeRef.current = close
  // True while the pointer is over the open card; the proximity system must
  // never close a card someone is actually reading.
  const cardHotRef = useRef(false)
  // Escape dismisses a card; the proximity system must not immediately put
  // the same card back while the cursor is still parked beside the word.
  const suppressRef = useRef<string | null>(null)
  const scheduleHide = () => {
    clearHide()
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null
      setActive(null)
    }, GRACE_MS)
  }
  const blurAway = (e: ReactFocusEvent) => {
    const to = e.relatedTarget as Node | null
    if (to && cardRef.current?.contains(to)) return
    scheduleHide()
  }

  // Sync the loop's view before paint, so a card never flashes unplaced.
  useLayoutEffect(() => {
    activeRef.current = active
    placeRef.current.decided = false
    redrawRef.current?.()
  }, [active])

  // Escape closes; a press or tap anywhere outside a word or the card closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        suppressRef.current = activeRef.current
        closeRef.current()
      }
    }
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (wordsRef.current?.contains(t) || cardRef.current?.contains(t)) return
      closeRef.current()
    }
    window.addEventListener("keydown", onKey)
    document.addEventListener("click", onDocClick)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("click", onDocClick)
      clearHide()
    }
  }, [])

  // ssr:false, so this first render already happens in the browser and the
  // count can be decided before a single node is created.
  const fragments = useMemo(() => {
    const w = typeof window === "undefined" ? 1440 : window.innerWidth
    const [phone, mid, wide] = FIELD_TUNE[variant].counts
    return pickFragments(w < 720 ? phone : w < 1100 ? mid : wide)
  }, [variant])

  useEffect(() => {
    const host = hostRef.current
    const canvasHost = canvasHostRef.current
    const wordsHost = wordsRef.current
    if (!host || !canvasHost || !wordsHost) return

    const els = Array.from(wordsHost.children) as HTMLElement[]
    const COUNT = els.length
    if (!COUNT) return

    // Which fragment index answers for which graph node.
    const idxOfNode = new Map<string, number>()
    fragments.forEach((f, i) => {
      if (f.node) idxOfNode.set(f.node.id, i)
    })

    // The resting constellation: the REAL relationships from the graph,
    // resolved to fragment indices once. At rest these draw as hairlines a
    // shade above invisible, so the field reads as one connected thing even
    // before the cursor arrives; under the cursor the same pairs brighten,
    // and the true structure is what lights up.
    const restA: number[] = []
    const restB: number[] = []
    const restStrong: number[] = []
    const strongKey = new Set(
      strongEdges.map(([a, b]) => (a < b ? `${a}|${b}` : `${b}|${a}`)),
    )
    for (const [a, b] of edges) {
      const ia = idxOfNode.get(a)
      const ib = idxOfNode.get(b)
      if (ia !== undefined && ib !== undefined) {
        restA.push(ia)
        restB.push(ib)
        restStrong.push(strongKey.has(a < b ? `${a}|${b}` : `${b}|${a}`) ? 1 : 0)
      }
    }
    const restCount = restA.length

    // Adjacency, for placement: words cluster near the words they are
    // actually related to, so density is semantic rather than scattered.
    const nbr: number[][] = []
    for (let i = 0; i < fragments.length; i++) nbr.push([])
    for (let e = 0; e < restCount; e++) {
      nbr[restA[e]].push(restB[e])
      nbr[restB[e]].push(restA[e])
    }

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse =
      typeof window.matchMedia === "function" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches)
    const narrow = window.innerWidth < 720

    // Two different gates for two different reasons (see the constants):
    // horizontal thrift is about the width of the frame, vertical room is
    // about the size of a finger. A fine pointer on a wide screen matches
    // neither, so the approved desktop composition keeps its own numbers.
    const WORD_PAD_X = narrow ? WORD_PAD_X_NARROW : WORD_PAD_X_BASE
    const WORD_PAD_Y = coarse ? WORD_PAD_Y_TOUCH : WORD_PAD_Y_BASE

    const bx = new Float32Array(COUNT)
    const by = new Float32Array(COUNT)
    // Where each word is headed. Placement and eviction write these; bx/by
    // ease toward them every frame, so a re-fit glides instead of snapping.
    const tbx = new Float32Array(COUNT)
    const tby = new Float32Array(COUNT)
    const depth = new Float32Array(COUNT)
    const phase = new Float32Array(COUNT)
    const wake = new Float32Array(COUNT)
    const px = new Float32Array(COUNT)
    const py = new Float32Array(COUNT)
    const halfW = new Float32Array(COUNT)
    const halfH = new Float32Array(COUNT)
    const baseA = new Float32Array(COUNT)
    const chan = new Float32Array(COUNT)
    /** Perspective scale this frame (1 at rest, grows on the descent). */
    const sc = new Float32Array(COUNT).fill(1)
    /** Channel visibility x pass-fade: what the line pass multiplies by. */
    const vis = new Float32Array(COUNT)
    /** Final on-screen opacity this frame; the line pass treats any label
     * above a whisper as an occluder that hairlines must not cross. */
    const opac = new Float32Array(COUNT)
    // 1 when placement failed and the word sits out this layout entirely.
    const parked = new Uint8Array(COUNT)

    // Resting-web bookkeeping: per-frame degree count, and the edge order
    // (shortest first) so the cap keeps the tight local relations and sheds
    // the long room-crossing hairlines. Allocated once; the order array is
    // nearly sorted between frames, so the insertion sort is cheap.
    const restDeg = new Uint8Array(COUNT)
    const restLen = new Float32Array(restCount)
    const restOrder: number[] = []
    for (let e = 0; e < restCount; e++) restOrder.push(e)
    /** Departure angles of the hairlines already drawn from each node this
     * frame. Two lines leaving one node nearly parallel read as clutter, so
     * a new line must clear every drawn one by MIN_EDGE_ANGLE. */
    const restAng = new Float32Array(COUNT * REST_DEG_MAX)

    // Scratch for clipping hairlines around label boxes, and for the lit
    // gaps between the blocked intervals (both allocated once).
    const blockT0 = new Float32Array(64)
    const blockT1 = new Float32Array(64)
    const gapT0 = new Float32Array(66)
    const gapT1 = new Float32Array(66)

    // The lighting grade: per-word brightness factor and warm-ramp colour,
    // recomputed whenever the layout moves (placement, eviction). Read by
    // the frame loop as plain multipliers; never computed per frame.
    const lightK = new Float32Array(COUNT).fill(1)
    /** Warmth of each word's place in the light (0 far, 1 at the source).
     * The line pass reads it as a tint, so the web itself carries the
     * grade: strokes near Configure warm toward the source's tone. */
    const warmK = new Float32Array(COUNT)
    // The entrance cue sheet: when each word breathes in, in intro-clock
    // seconds. The life spine ignites in order; the tiers follow.
    const introAt = new Float32Array(COUNT)
    const spineCue = new Map<string, number>()
    SPINE_ORDER.forEach((id, k) => spineCue.set(id, SPINE_START + k * SPINE_STEP))
    /** Spine edge pairs (consecutive ignitions), for the draw-in. */
    const spineEdge = new Set<string>()
    for (const [a, b] of edges) {
      if (spineCue.has(a) && spineCue.has(b)) {
        spineEdge.add(a < b ? `${a}|${b}` : `${b}|${a}`)
      }
    }

    // Seeded: depth, brightness and size are part of the curated composition
    // (size feeds the measured boxes the placement is built from), so they
    // must come out identical on every load.
    const attrRng = mulberry32(LAYOUT_SEED)
    const tune = FIELD_TUNE[variant].size
    for (let i = 0; i < COUNT; i++) {
      phase[i] = attrRng()
      const id = fragments[i].node.id
      const cue = spineCue.get(id)
      introAt[i] =
        cue !== undefined
          ? cue
          : fragments[i].tier === "key"
            ? INTRO_KEY
            : fragments[i].tier === "mid"
              ? INTRO_MID + phase[i] * 0.26
              : INTRO_LOW + phase[i] * 0.3
      const tier = TIER[fragments[i].tier]
      const t = attrRng()
      depth[i] = mix(tier.depth[0], tier.depth[1], t)
      // Size and resting brightness are SEMANTIC, not aesthetic accident:
      // both map off the node's importance scale (graph.ts), identically in
      // every variant. Configure and faith dominate, then Paradigm, then
      // the other anchors, then the majors, then the long tail. A whisper
      // of seeded jitter keeps the field from reading as mechanical.
      const w = importanceOf(fragments[i].node.id)
      baseA[i] = Math.min(0.95, (0.3 + 0.026 * w * w) * (0.94 + t * 0.12))
      const narrowK = fragments[i].tier === "key" ? 0.7 : 0.86
      let size =
        (10.5 + 1.05 * w * w) *
        (0.96 + t * 0.08) *
        (narrow ? narrowK : 1) *
        tune[fragments[i].tier]
      // On a phone the long tail was landing at 9.6-10.1px, which is not
      // small type, it is unreadable type wearing the costume of
      // atmosphere. The floor is legibility; the hierarchy above it is
      // untouched, and a fine pointer on a wide screen never reaches
      // this line.
      if ((narrow || coarse) && size < TOUCH_MIN_PX) size = TOUCH_MIN_PX
      els[i].style.fontSize = `${size.toFixed(2)}px`
    }

    /* ---------------------------------------------------------------- */
    /* Renderer: links only. One draw call, orthographic, CSS pixels.     */
    /* ---------------------------------------------------------------- */
    let renderer: WebGLRenderer | null = null
    let canvas: HTMLCanvasElement | null = null
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      })
    } catch {
      // No WebGL. The fragments still drift and wake; only the hairlines are
      // lost, and the page is type first anyway.
      renderer = null
    }

    const scene = new Scene()
    const camera = new OrthographicCamera(0, 1, 0, 1, -1, 1)

    const linePositions = new Float32Array(MAX_SEGMENTS * 2 * 3)
    const lineAlpha = new Float32Array(MAX_SEGMENTS * 2)
    const lineTint = new Float32Array(MAX_SEGMENTS * 2)

    const lineGeo = new BufferGeometry()
    const linePosAttr = new BufferAttribute(linePositions, 3)
    linePosAttr.setUsage(DynamicDrawUsage)
    const lineAlphaAttr = new BufferAttribute(lineAlpha, 1)
    lineAlphaAttr.setUsage(DynamicDrawUsage)
    const lineTintAttr = new BufferAttribute(lineTint, 1)
    lineTintAttr.setUsage(DynamicDrawUsage)
    lineGeo.setAttribute("position", linePosAttr)
    lineGeo.setAttribute("aAlpha", lineAlphaAttr)
    lineGeo.setAttribute("aTint", lineTintAttr)
    lineGeo.setDrawRange(0, 0)

    // Light grounds draw INK on a sheet: normal blending, near-black
    // strokes. Paper's accent is oxide; Configure's is the brand slate.
    // The dark grounds keep the additive pale-filament pass.
    const paper = variant === "paper"
    const cfg = variant === "configure"
    /** Shared physics of ink on a light ground (paper AND configure):
     * normal blending, higher stroke body, tighter distance fades, calmer
     * descent. Paper alone keeps its craft flourishes (grain, annotation
     * underline, lingerers); configure stays flat and systematic. */
    const lightGround = paper || cfg
    const lineMat = new ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      uniforms: {
        uBase: { value: new Color(cfg ? "#141414" : paper ? "#403a33" : "#c9dcd6") },
        uEmber: { value: new Color(cfg ? "#586675" : paper ? "#8f3116" : "#e2552c") },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: lightGround ? NormalBlending : AdditiveBlending,
      // The spine quads share this material, and the y-down orthographic
      // projection flips their winding with the stroke's direction.
      side: DoubleSide,
    })

    const lines = new LineSegments(lineGeo, lineMat)
    lines.frustumCulled = false
    scene.add(lines)

    // The spine's material stroke. A GL line is a hairline no matter what,
    // so the one edge that carries real weight (Configure–Paradigm) draws
    // as camera-facing quads through the same shader: one honest stroke
    // with real width, endpoints on the same trim as every other edge, no
    // offset-hairline tricks, no glow.
    const QUAD_MAX = 24
    const quadPositions = new Float32Array(QUAD_MAX * 4 * 3)
    const quadAlpha = new Float32Array(QUAD_MAX * 4)
    const quadTint = new Float32Array(QUAD_MAX * 4)
    const quadGeo = new BufferGeometry()
    const quadPosAttr = new BufferAttribute(quadPositions, 3)
    quadPosAttr.setUsage(DynamicDrawUsage)
    const quadAlphaAttr = new BufferAttribute(quadAlpha, 1)
    quadAlphaAttr.setUsage(DynamicDrawUsage)
    const quadTintAttr = new BufferAttribute(quadTint, 1)
    quadTintAttr.setUsage(DynamicDrawUsage)
    const quadIndex = new Uint16Array(QUAD_MAX * 6)
    for (let q = 0; q < QUAD_MAX; q++) {
      const v = q * 4
      const t = q * 6
      quadIndex[t] = v
      quadIndex[t + 1] = v + 1
      quadIndex[t + 2] = v + 2
      quadIndex[t + 3] = v + 2
      quadIndex[t + 4] = v + 1
      quadIndex[t + 5] = v + 3
    }
    quadGeo.setIndex(new BufferAttribute(quadIndex, 1))
    quadGeo.setAttribute("position", quadPosAttr)
    quadGeo.setAttribute("aAlpha", quadAlphaAttr)
    quadGeo.setAttribute("aTint", quadTintAttr)
    quadGeo.setDrawRange(0, 0)
    const quadMesh = new Mesh(quadGeo, lineMat)
    quadMesh.frustumCulled = false
    scene.add(quadMesh)

    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearAlpha(0)
      canvas = renderer.domElement
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.display = "block"
      canvasHost.appendChild(canvas)
    }

    // Scratch, allocated once.
    const nearIdx = new Int32Array(CURSOR_LINKS)
    const nearDist = new Float32Array(CURSOR_LINKS)
    // 1 for every word related (in the REAL graph) to the word whose card
    // is open: hovering a word lights its true constellation.
    const nbrFlag = new Uint8Array(COUNT)
    let nbrFlagFor = -2

    let vw = 1
    let vh = 1
    let radius = 300
    let bandInner = 340
    let bandOuter = 580
    let restNear = 260
    let restFar = 860

    /**
     * The hardware's margins, in numbers the layout can use. The document
     * declares viewport-fit=cover, so vw/vh now include the strip under
     * the notch and the strip the home indicator lives on; the CSS gives
     * that back to the type with env(safe-area-inset-*), and this gives it
     * back to the two things CSS cannot reach: where a word is allowed to
     * sit, and where a card is allowed to be clamped. env() is not
     * readable from script, so a zero-size probe carries the values into
     * JS. Read on resize, never per frame; every desktop browser reports
     * four zeros and nothing below changes.
     */
    const safeProbe = document.createElement("div")
    safeProbe.setAttribute("aria-hidden", "true")
    safeProbe.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
      "padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) " +
      "env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)"
    document.body.appendChild(safeProbe)
    let safeT = 0
    let safeR = 0
    let safeB = 0
    let safeL = 0
    const readSafe = () => {
      const cs = getComputedStyle(safeProbe)
      safeT = parseFloat(cs.paddingTop) || 0
      safeR = parseFloat(cs.paddingRight) || 0
      safeB = parseFloat(cs.paddingBottom) || 0
      safeL = parseFloat(cs.paddingLeft) || 0
    }
    readSafe()

    const measure = () => {
      for (let i = 0; i < COUNT; i++) {
        halfW[i] = els[i].offsetWidth / 2
        halfH[i] = els[i].offsetHeight / 2
      }
    }

    const toX = (n: number) => vw * 0.5 + n * (vw * 0.5 - 26)
    const toY = (n: number) => vh * 0.5 + n * (vh * 0.5 - 24)

    /* ---------------------------------------------------------------- */
    /* Layout                                                            */
    /*                                                                   */
    /* AUTHORED, not sampled. Every node carries a hand-set normalised    */
    /* position in graph.ts, so the composition is a designed shape:      */
    /* centre-weighted, corners empty, the open-source hub mid-field      */
    /* where its spokes radiate cleanly, and identical on every load.     */
    /* place() converts the authored positions to the frame, then runs a  */
    /* fully deterministic relaxation: overlapping labels push each       */
    /* other apart, everything stays inside the frame with real margin,   */
    /* out of the page type's keep-outs, and out of the corners. There    */
    /* is no randomness anywhere in the pipeline any more.                */
    /* ---------------------------------------------------------------- */

    // The page type's keep-out boxes, in PAGE coordinates. Cached from the
    // latest gather so the line pass can clip hairlines around the hero
    // block every frame: the web must thread AROUND the big type, never
    // strike through it.
    let typeBoxes: Box[] = []

    const gatherKeepouts = (): Box[] => {
      const keepouts: Box[] = []
      const sx = window.scrollX || 0
      const sy = window.scrollY || 0
      document.querySelectorAll("[data-hf-keepout]").forEach((node) => {
        const el = node as HTMLElement
        const r = el.getBoundingClientRect()
        if (r.width < 2 || r.height < 2) return
        // The hero's entrance lifts each line in from a few pixels below,
        // and getBoundingClientRect reports where a thing IS, not where it
        // is going to be. A layout computed while that is still running
        // reads every keep-out low by however far it has left to travel —
        // and the layout runs on fonts.ready, which lands at a different
        // moment on every load. On a wide frame that is worth a fraction
        // of a pixel; on a 390 frame, where a row of words is the whole
        // difference between a map and a handful, it was the story behind
        // a phone cut that seated fourteen words one load and seventeen
        // the next. Subtracting the live transform makes a keep-out the
        // SETTLED box every time, so the phone composition is a
        // composition and not a coin toss.
        //
        // Narrow only, deliberately: the wide layout is approved as it
        // stands and does not get so much as a sub-pixel from this.
        let dx = 0
        let dy = 0
        if (narrow) {
          try {
            const t = getComputedStyle(el).transform
            if (t && t !== "none") {
              const m = new DOMMatrixReadOnly(t)
              dx = m.e
              dy = m.f
            }
          } catch {
            /* No DOMMatrix: fall back to the live box. */
          }
        }
        keepouts.push([
          r.left - dx + sx - TYPE_PAD_X,
          r.top - dy + sy - TYPE_PAD_Y,
          r.right - dx + sx + TYPE_PAD_X,
          r.bottom - dy + sy + TYPE_PAD_Y,
        ])
      })
      typeBoxes = keepouts
      return keepouts
    }

    /** True when a viewport-space rect misses every hero-type keep-out. */
    const rectClearOfType = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      sy: number,
    ) => {
      for (let k = 0; k < typeBoxes.length; k++) {
        const tb = typeBoxes[k]
        if (x0 < tb[2] && x1 > tb[0] && y0 < tb[3] - sy && y1 > tb[1] - sy) {
          return false
        }
      }
      return true
    }

    /**
     * Where a card of cw x ch can sit beside word i without covering the
     * hero type: below, above, right of the word, left of it, in that
     * order. Returns the first clear mode, or -1 when every side would
     * land on the identity block. Candidates are clamped to the viewport
     * before testing, exactly as the frame loop will clamp the real card,
     * so "clear" means clear on screen, not clear in theory; a candidate
     * that only fits by being clamped back over its own word is skipped.
     * The identity and headline are the one thing on the page a card must
     * never sit on, so this is a hard exclusion, not a preference.
     */
    const cardSpot = (i: number, cw: number, ch: number, sy: number): number => {
      // Same margins the frame loop clamps with, safe areas included, so
      // "clear" here means clear where the card will actually land.
      const M = 12
      const mL = M + safeL
      const mR = M + safeR
      const mT = M + safeT
      const mB = M + safeB
      const ax = px[i]
      const ay = py[i]
      const gap = halfH[i] * sc[i] + 12
      const side = halfW[i] * sc[i] + 18
      for (let m = 0; m < 4; m++) {
        let left: number
        let top: number
        if (m === 0) {
          left = ax - cw * 0.32
          top = ay + gap
          if (top + ch > vh - mB) continue
        } else if (m === 1) {
          left = ax - cw * 0.32
          top = ay - gap - ch
          if (top < mT) continue
        } else if (m === 2) {
          left = ax + side
          top = ay - ch / 2
          if (left + cw > vw - mR) continue
        } else {
          left = ax - side - cw
          top = ay - ch / 2
          if (left < mL) continue
        }
        left = Math.min(Math.max(mL, left), vw - mR - cw)
        top = Math.min(Math.max(mT, top), vh - mB - ch)
        if (rectClearOfType(left, top, left + cw, top + ch, sy)) return m
      }
      return -1
    }

    const limXFor = (hw: number) => {
      const spanX = vw * 0.5 - 26
      return spanX > 0 ? Math.min(1, (vw * 0.5 - 28 - hw) / spanX) : 0
    }
    const limYFor = (hh: number) => {
      const spanY = vh * 0.5 - 24
      return spanY > 0 ? Math.min(1, (vh * 0.5 - 24 - hh) / spanY) : 0
    }

    /** Frame, margin and corner rules for one word, applied in place. */
    const clampWord = (i: number) => {
      const lim = fragments[i].tier === "key" ? 0.84 : 1
      const lx = Math.min(limXFor(halfW[i]), lim)
      const ly = Math.min(limYFor(halfH[i]), lim)
      if (tbx[i] < -lx) tbx[i] = -lx
      else if (tbx[i] > lx) tbx[i] = lx
      if (tby[i] < -ly) tby[i] = -ly
      else if (tby[i] > ly) tby[i] = ly
      // The safe areas, in the same breath as the frame margins. A word
      // under the home indicator is a word you tap twice and reach once,
      // and one under the notch is not there at all. Zero on desktop, so
      // this is a no-op everywhere the composition was approved.
      if (safeT || safeR || safeB || safeL) {
        const spanX = vw * 0.5 - 26
        const spanY = vh * 0.5 - 24
        if (spanX > 0 && spanY > 0) {
          const yBot = vh - 24 - safeB - halfH[i]
          const yTop = 24 + safeT + halfH[i]
          const xR = vw - 28 - safeR - halfW[i]
          const xL = 28 + safeL + halfW[i]
          if (toY(tby[i]) > yBot) tby[i] = (yBot - vh * 0.5) / spanY
          if (toY(tby[i]) < yTop) tby[i] = (yTop - vh * 0.5) / spanY
          if (toX(tbx[i]) > xR) tbx[i] = (xR - vw * 0.5) / spanX
          if (toX(tbx[i]) < xL) tbx[i] = (xL - vw * 0.5) / spanX
        }
      }
      // A corner is where a label goes to die.
      if (Math.abs(tbx[i]) > 0.88 && Math.abs(tby[i]) > 0.88) {
        tbx[i] *= 0.86
        tby[i] *= 0.86
      }
    }

    const wordBox = (i: number, out: Box) => {
      const x = toX(tbx[i])
      const y = toY(tby[i])
      out[0] = x - halfW[i] - WORD_PAD_X
      out[1] = y - halfH[i] - WORD_PAD_Y
      out[2] = x + halfW[i] + WORD_PAD_X
      out[3] = y + halfH[i] + WORD_PAD_Y
    }

    const boxA: Box = [0, 0, 0, 0]
    const boxB: Box = [0, 0, 0, 0]

    /** Horizontal candidate offsets (normalised), shared by the anchor
     * rescue and the Configure guarantee: fixed order, deterministic. */
    const XOFF = [
      0, -0.12, 0.12, -0.24, 0.24, -0.36, 0.36, -0.48, 0.48, -0.6, 0.6,
      -0.72, 0.72,
    ]

    // Which resting edges belong to the life spine (for the entrance
    // draw-in). Resolved once against the fragment indices.
    const restSpineArr = new Uint8Array(restCount)
    for (let e = 0; e < restCount; e++) {
      const a = fragments[restA[e]].node.id
      const b = fragments[restB[e]].node.id
      restSpineArr[e] = spineEdge.has(a < b ? `${a}|${b}` : `${b}|${a}`) ? 1 : 0
    }

    /** Edge-brightness factor derived from the word grade, cached. */
    const lightE = new Float32Array(COUNT).fill(1)
    const lightIdx = idxOfNode.get("configure") ?? -1
    /** 1 for the words that linger through the paper phone descent: the
     * lowest one or two on the sheet ride down on a composed path (see
     * the descent block) so the handoff never goes fully blank. */
    const lingerFlag = new Uint8Array(COUNT)

    /**
     * The grade. Configure is the light source: warmth and brightness fall
     * off from it, far words cool toward the resting floor, and depth cools
     * a word further. Runs after every placement/eviction, never per frame:
     * the drift orbit is pixels wide, far below the grade's falloff scale.
     */
    const applyLight = () => {
      const span = Math.min(vw, vh)
      if (span <= 0) return
      const lx = lightIdx >= 0 ? toX(tbx[lightIdx]) : vw * 0.62
      const ly = lightIdx >= 0 ? toY(tby[lightIdx]) : vh * 0.44
      const cool = paper ? PAPER_COOL : cfg ? CFG_COOL : LIGHT_COOL
      const warmc = paper ? PAPER_WARM : cfg ? CFG_WARM : LIGHT_WARM
      for (let i = 0; i < COUNT; i++) {
        const ddx = toX(tbx[i]) - lx
        const ddy = toY(tby[i]) - ly
        const d = Math.sqrt(ddx * ddx + ddy * ddy) / span
        let w = smoothstep(LIGHT_FAR, LIGHT_NEAR, d) * (1 - depth[i] * 0.38)
        // The anchors always carry some of the light with them: faith and
        // Nouvo are the names of the story, and a name gone cold reads as
        // an accident rather than atmosphere.
        if (fragments[i].tier === "key" && w < 0.34) w = 0.34
        warmK[i] = w
        // Floored at a mild dim so the far field sinks into atmosphere
        // without ever going missing; near the source it genuinely burns.
        // The dark grade is steep on purpose: the pool around Configure
        // must read as THE light source in a still frame, not a hunch.
        // On stock the floor sits higher: even the lightest impression is
        // real ink, and hierarchy rides on size, weight and warmth.
        lightK[i] = lightGround ? 1.14 + 0.36 * w : 0.8 + 0.72 * w
        lightE[i] = 0.8 + 0.55 * w
        const r = Math.round(mix(cool[0], warmc[0], w))
        const g = Math.round(mix(cool[1], warmc[1], w))
        const b = Math.round(mix(cool[2], warmc[2], w))
        els[i].style.setProperty("--hfw", `rgb(${r} ${g} ${b})`)
      }

      // The brand marks its own center: on the configure identity the one
      // word that wears Configure Slate at rest is Configure. Everything
      // else is ink or gray; the accent is a statement, not a colour way.
      if (cfg && lightIdx >= 0) {
        els[lightIdx].style.setProperty("--hfw", "#586675")
      }

      // The paper phone descent's lingerers: the two lowest words in the
      // layout. They sit under the whole hero stack, so the keep-outs
      // sweep up and away from them the moment scrolling starts, and the
      // sheet keeps some ink through the middle of the descent instead of
      // going featureless beige. Recomputed with every layout, per frame
      // never.
      lingerFlag.fill(0)
      if (paper && narrow) {
        let low1 = -1
        let low2 = -1
        for (let i = 0; i < COUNT; i++) {
          if (parked[i]) continue
          const y = toY(tby[i])
          if (low1 < 0 || y > toY(tby[low1])) {
            low2 = low1
            low1 = i
          } else if (low2 < 0 || y > toY(tby[low2])) {
            low2 = i
          }
        }
        if (low1 >= 0) lingerFlag[low1] = 1
        if (low2 >= 0) lingerFlag[low2] = 2
      }
    }

    /**
     * The Configure guarantee. Configure is importance 5 and the scene's
     * light source: a cut that parks it has deleted the point of the page,
     * which is exactly what the phone layouts were doing when the rescue
     * found no fully-clear slot and gave up. If Configure is still parked
     * after a layout pass, this re-runs the band scan with the one hard
     * requirement kept (clear of the type keep-outs) and the soft one
     * relaxed: the candidate overlapping the least label area wins, and
     * whatever lesser words still overlap it sit out instead. Fully
     * deterministic: fixed candidate order, ties keep the first.
     */
    const ensureAnchor = (
      keepouts: Box[],
      i: number = lightIdx,
      /**
       * Normally a rescue may only displace words BELOW it in importance,
       * so two equal anchors can never chase each other around the frame.
       * The centre re-seat (configure identity, phone) passes true: there
       * the word being rescued is the single most important thing on the
       * page and its slot is the brief, so a tie loses to it and gets its
       * own rescue on the next pass. Configure is the only importance-5
       * word that ever asks, so this cannot cycle.
       */
      displaceTies = false,
    ) => {
      if (i < 0 || i >= COUNT || !parked[i]) return
      const myImportance =
        importanceOf(fragments[i].node.id) + (displaceTies ? 0.5 : 0)
      const spanX = vw * 0.5 - 26
      const spanY = vh * 0.5 - 24
      if (spanX <= 0 || spanY <= 0 || keepouts.length === 0) return
      let stackTop = Infinity
      let stackBot = -Infinity
      for (const k of keepouts) {
        if (k[1] < stackTop) stackTop = k[1]
        if (k[3] > stackBot) stackBot = k[3]
      }
      const bandBelowFirst = vh - stackBot > stackTop
      const saveX = tbx[i]
      const saveY = tby[i]
      const rowH = (halfH[i] + WORD_PAD_Y) * 2 + 6
      let bestX = 0
      let bestY = 0
      let bestCost = Infinity
      // Narrow viewports have one usable band under the copy stack; six
      // rows can run out before clearing the anchors already seated there,
      // so tight cuts scan deeper.
      const rowScan = vw < 720 ? 12 : 6
      for (let row = 0; row < rowScan && bestCost > 0; row++) {
        const below = bandBelowFirst ? row % 2 === 0 : row % 2 === 1
        const off = halfH[i] + WORD_PAD_Y + 6 + Math.floor(row / 2) * rowH
        const cy2 = below ? stackBot + off : stackTop - off
        for (let xo = 0; xo < XOFF.length && bestCost > 0; xo++) {
          tbx[i] = saveX + XOFF[xo]
          tby[i] = (cy2 - vh * 0.5) / spanY
          clampWord(i)
          wordBox(i, boxA)
          let clear = true
          for (let b = 0; b < keepouts.length && clear; b++) {
            clear = !hits(boxA, keepouts[b])
          }
          if (!clear) continue
          // The centre re-seat is about WHERE, not just whether: a clear
          // slot pinned to the far edge of the frame is a worse answer for
          // Configure than the middle of the band with one small word
          // moved out of it (and that word gets its own slot back on the
          // fill pass). 220px^2 per pixel off centre puts one column of
          // drift at roughly the price of one overlapped label.
          let cost = displaceTies ? Math.abs(toX(tbx[i]) - vw * 0.5) * 220 : 0
          for (let j = 0; j < COUNT && cost < Infinity; j++) {
            if (j === i || parked[j]) continue
            wordBox(j, boxB)
            const ox = Math.min(boxA[2], boxB[2]) - Math.max(boxA[0], boxB[0])
            const oy = Math.min(boxA[3], boxB[3]) - Math.max(boxA[1], boxB[1])
            if (ox > 0 && oy > 0) {
              // A rescue may only displace LESSER words: overlapping an
              // equal-or-higher anchor makes this candidate unusable.
              if (importanceOf(fragments[j].node.id) >= myImportance) cost = Infinity
              else cost += ox * oy
            }
          }
          if (cost < bestCost) {
            bestCost = cost
            bestX = tbx[i]
            bestY = tby[i]
          }
        }
      }
      if (bestCost === Infinity) {
        // No keep-out-clear slot exists at all (a pathological viewport).
        tbx[i] = saveX
        tby[i] = saveY
        return
      }
      tbx[i] = bestX
      tby[i] = bestY
      parked[i] = 0
      // The rescued anchor claims its spot: any LESSER word still under it
      // sits out (candidates overlapping equal-or-higher anchors were
      // rejected above, so this only ever displaces downward).
      wordBox(i, boxA)
      for (let j = 0; j < COUNT; j++) {
        if (j === i || parked[j]) continue
        if (importanceOf(fragments[j].node.id) >= myImportance) continue
        wordBox(j, boxB)
        if (hits(boxA, boxB)) parked[j] = 1
      }
    }

    /**
     * The anchor guarantee, generalized: every key anchor (importance >= 3)
     * that a layout pass parked gets a rescue attempt, most important
     * first, each only ever displacing lesser words. Configure (5) leads,
     * then faith, Paradigm, Nouvo, San Francisco.
     */
    const ensureAnchors = (keepouts: Box[]) => {
      const order: number[] = []
      for (let i = 0; i < COUNT; i++) {
        if (parked[i] && importanceOf(fragments[i].node.id) >= 3) order.push(i)
      }
      order.sort(
        (a, b) => importanceOf(fragments[b].node.id) - importanceOf(fragments[a].node.id),
      )
      for (const i of order) ensureAnchor(keepouts, i)
    }

    /**
     * The phone fill.
     *
     * On a 390 frame the copy stack is a keep-out that owns the top half,
     * and step 3 parks every word the relaxation could not honestly seat
     * around it — the cut was showing eleven words out of twenty-six, which
     * reads as a page that ran out of things to say rather than a map of a
     * life. This gives every parked word one attempt at the open ground.
     *
     * It is not a packer and it does not re-sample: each word scans a fixed
     * grid over the frame and takes the FULLY CLEAR slot nearest its own
     * authored position, so the composition's shape survives the re-seating
     * instead of collapsing into a queue at the top of the band. Most
     * important first, and it displaces nothing — a word that finds no
     * honest slot stays out, exactly as before.
     *
     * On a narrow frame it stops at NARROW_SEATS: the candidate list is
     * deliberately longer than the frame can hold so this pass has surplus
     * to choose from, and the words it never reaches are the least
     * important in the field. Wider touch frames (a phone turned sideways,
     * a tablet) have no such cap — there the pass is only making back the
     * words the 44px vertical pad cost them.
     *
     * Never on a fine pointer: those layouts seat 43 of 44 unaided, and
     * the approved desktop composition must not be touched by any of this.
     */
    const fillParked = (keepouts: Box[]) => {
      if (!narrow && !coarse) return
      const seatCap = narrow ? NARROW_SEATS : COUNT
      const spanX = vw * 0.5 - 26
      const spanY = vh * 0.5 - 24
      if (spanX <= 0 || spanY <= 0) return

      let seated = 0
      const order: number[] = []
      for (let i = 0; i < COUNT; i++) {
        if (parked[i]) order.push(i)
        else seated++
      }
      if (seated >= seatCap) return
      order.sort(
        (a, b) => importanceOf(fragments[b].node.id) - importanceOf(fragments[a].node.id),
      )

      /* Candidates. Two kinds, and the second is what makes this work:
       * a coarse sweep of the whole frame, plus every position that sits
       * FLUSH against something already there — the far side of a seated
       * word, the far side of a keep-out, the frame's own margin. A grid
       * alone leaves a sliver of dead air around every obstacle, and on a
       * 390 frame those slivers are the difference between twelve words
       * and twenty. */
      const STEP_X = 10
      const STEP_Y = 8
      const xs: number[] = []
      const ys: number[] = []

      /* Y is three times as expensive to travel as X. A word that cannot
       * stay where it was authored should slide along its own line into
       * the open ground beside it, not drop to a new row — which is also
       * how words end up sharing rows instead of staggering, and why the
       * band packs at all. */
      const YCOST = 3

      for (const i of order) {
        if (seated >= seatCap) break
        const homeX = tbx[i]
        const homeY = tby[i]
        const homeXp = toX(homeX)
        const homeYp = toY(homeY)
        const hw = halfW[i] + WORD_PAD_X
        const hh = halfH[i] + WORD_PAD_Y
        const xMin = 26 + halfW[i]
        const xMax = vw - 26 - halfW[i]
        const yMin = 24 + halfH[i]
        const yMax = vh - 24 - halfH[i]
        if (xMax < xMin || yMax < yMin) continue

        xs.length = 0
        ys.length = 0
        for (let x = xMin; x <= xMax; x += STEP_X) xs.push(x)
        xs.push(xMax)
        for (let y = yMin; y <= yMax; y += STEP_Y) ys.push(y)
        ys.push(yMax)
        const flush = (b: Box) => {
          if (b[0] - hw >= xMin && b[0] - hw <= xMax) xs.push(b[0] - hw)
          if (b[2] + hw >= xMin && b[2] + hw <= xMax) xs.push(b[2] + hw)
          if (b[1] - hh >= yMin && b[1] - hh <= yMax) ys.push(b[1] - hh)
          if (b[3] + hh >= yMin && b[3] + hh <= yMax) ys.push(b[3] + hh)
        }
        for (let b = 0; b < keepouts.length; b++) flush(keepouts[b])
        for (let j = 0; j < COUNT; j++) {
          if (j === i || parked[j]) continue
          wordBox(j, boxB)
          flush(boxB)
        }
        // Nearest to home first, so the first honest slot is already close
        // to the best one and the cost prune below skips almost everything
        // after it. Value breaks ties, so the order never depends on the
        // sort's stability.
        xs.sort((a, b) => Math.abs(a - homeXp) - Math.abs(b - homeXp) || a - b)
        ys.sort((a, b) => Math.abs(a - homeYp) - Math.abs(b - homeYp) || a - b)

        let bestX = 0
        let bestY = 0
        let bestCost = Infinity

        for (let yi = 0; yi < ys.length; yi++) {
          const dy = ys[yi] - homeYp
          const rowCost = YCOST * dy * dy
          // Cheapest possible cost for this whole row: if even a perfect
          // x cannot beat the incumbent, the row is not worth testing.
          if (rowCost >= bestCost) continue
          const ny = (ys[yi] - vh * 0.5) / spanY
          for (let xi = 0; xi < xs.length; xi++) {
            const dx = xs[xi] - homeXp
            const cost = dx * dx + rowCost
            if (cost >= bestCost) continue
            tbx[i] = (xs[xi] - vw * 0.5) / spanX
            tby[i] = ny
            clampWord(i)
            wordBox(i, boxA)
            let clear = true
            for (let b = 0; b < keepouts.length && clear; b++) {
              clear = !hits(boxA, keepouts[b])
            }
            for (let j = 0; j < COUNT && clear; j++) {
              if (j === i || parked[j]) continue
              wordBox(j, boxB)
              if (hits(boxA, boxB)) clear = false
            }
            if (!clear) continue
            bestCost = cost
            bestX = tbx[i]
            bestY = tby[i]
          }
        }

        if (bestCost < Infinity) {
          tbx[i] = bestX
          tby[i] = bestY
          parked[i] = 0
          seated++
        } else {
          tbx[i] = homeX
          tby[i] = homeY
        }
      }
    }

    /** Per-word hit-surface half-extents, in CSS pixels. Written to the
     * DOM as --hf-hit-w/h and read by .fragBtn::after; see applyHitAreas. */
    const hitW = new Float32Array(COUNT)
    const hitH = new Float32Array(COUNT)

    /**
     * Touch targets (WCAG 2.5.5), sized against the real layout.
     *
     * The visible word never changes: same face, same size, same place.
     * What grows is a transparent surface centred on it, and it grows to
     * 44x44 — unless the geometry says it cannot. For every pair this
     * subtracts the worst-case relative wander (drift orbits, ambient
     * parallax, the ghost cursor's lean) from their true separation and,
     * where 44 would put two targets on top of each other, hands the
     * overlap back: first the width, which nothing depends on, and only
     * then the height. A word's own glyph box is the floor.
     *
     * The result is that a tap always resolves to the word you aimed at,
     * at every second of the drift clock, rather than to whichever
     * invisible rectangle happened to be painted last.
     *
     * Runs after every layout (placement, eviction, resize) and never per
     * frame. Fine pointers skip it entirely and the pseudo-element that
     * reads these variables does not exist there.
     */
    const applyHitAreas = () => {
      if (!coarse) return
      for (let i = 0; i < COUNT; i++) {
        hitW[i] = Math.max(halfW[i], HIT_HALF)
        hitH[i] = Math.max(halfH[i], HIT_HALF)
      }
      for (let pass = 0; pass < 4; pass++) {
        let cut = false
        for (let i = 0; i < COUNT; i++) {
          if (parked[i]) continue
          const xi = toX(tbx[i])
          const yi = toY(tby[i])
          for (let j = i + 1; j < COUNT; j++) {
            if (parked[j]) continue
            const dx = Math.abs(xi - toX(tbx[j])) - WANDER_X
            const dy = Math.abs(yi - toY(tby[j])) - WANDER_Y
            const exX = hitW[i] + hitW[j] - dx
            const exY = hitH[i] + hitH[j] - dy
            if (exX <= 0 || exY <= 0) continue
            cut = true
            const roomX = hitW[i] - halfW[i] + (hitW[j] - halfW[j])
            const roomY = hitH[i] - halfH[i] + (hitH[j] - halfH[j])
            // Width first: height is the rule this whole pass exists to
            // keep, and two words side by side lose nothing real by
            // stopping their surfaces short of each other.
            if (exX <= roomX) {
              const k = (roomX - exX) / roomX
              hitW[i] = halfW[i] + (hitW[i] - halfW[i]) * k
              hitW[j] = halfW[j] + (hitW[j] - halfW[j]) * k
            } else if (exY <= roomY) {
              const k = (roomY - exY) / roomY
              hitH[i] = halfH[i] + (hitH[i] - halfH[i]) * k
              hitH[j] = halfH[j] + (hitH[j] - halfH[j]) * k
            } else {
              // Neither axis can pay. Both surfaces fall back to the words
              // themselves, which is where the field started.
              hitW[i] = halfW[i]
              hitW[j] = halfW[j]
              hitH[i] = halfH[i]
              hitH[j] = halfH[j]
            }
          }
        }
        if (!cut) break
      }
      for (let i = 0; i < COUNT; i++) {
        const el = els[i]
        el.style.setProperty("--hf-hit-w", `${(hitW[i] * 2).toFixed(1)}px`)
        el.style.setProperty("--hf-hit-h", `${(hitH[i] * 2).toFixed(1)}px`)
        // A parked word is invisible but, until now, still tappable: on a
        // 390 frame that left a stack of a dozen zero-opacity buttons in
        // the top-left corner, any of which could answer a tap meant for
        // the ground. Nothing you cannot see may take a touch.
        el.style.pointerEvents = parked[i] ? "none" : ""
      }
    }

    const place = () => {
      const keepouts = gatherKeepouts()
      const spanX = vw * 0.5 - 26
      const spanY = vh * 0.5 - 24
      if (spanX <= 0 || spanY <= 0) return

      // The open ground, measured before anything is placed: everything
      // above the first keep-out and everything below the last. On a phone
      // the copy stack owns the middle of the frame, so "the centre of the
      // composition" has to mean the centre of what is actually left.
      let stack0 = Infinity
      let stack1 = -Infinity
      for (const k of keepouts) {
        if (k[1] < stack0) stack0 = k[1]
        if (k[3] > stack1) stack1 = k[3]
      }
      const hasStack = keepouts.length > 0 && stack1 > stack0

      // 1) The authored composition, straight from the data (graph y is
      //    up-positive; the screen's is not). Paper compresses the vertical
      //    band a step and settles it lower on the sheet: the authored map
      //    was graded for the dark grounds, where a word 50px off the top
      //    edge reads as atmosphere; on cardstock it reads as sliding off
      //    the page, and the bottom third sat bare. Same map, re-weighted.
      for (let i = 0; i < COUNT; i++) {
        parked[i] = 0
        tbx[i] = fragments[i].node.x
        tby[i] = lightGround
          ? -fragments[i].node.y * 0.9 + 0.08
          : -fragments[i].node.y
        // The configure identity puts Configure in the middle, literally:
        // the owner's brand sits at the center of the map, the composition
        // orbits it, and the scroll descent converges on it. The hero copy
        // moves to the top-left (CSS) so the center of the frame is open.
        if (cfg && i === lightIdx) {
          tbx[i] = 0.03
          tby[i] = 0.06
          // ...except on a phone, where the copy is not to the left of the
          // centre, it IS the centre: a 390 frame gives the stack the top
          // half and the field the band underneath. Configure starts dead
          // centre of THAT band, horizontally centred, and the relaxation's
          // pin then makes every neighbour move around it rather than the
          // other way. Starting it here is what keeps it centred; the
          // rescue below is only the net.
          if (narrow && hasStack) {
            tbx[i] = 0
            tby[i] = ((stack1 + vh) * 0.5 - vh * 0.5) / spanY
          }
        }
        clampWord(i)
      }

      // 2) Deterministic relaxation. Same inputs, same order, same result.
      for (let pass = 0; pass < 70; pass++) {
        let moved = false

        for (let i = 0; i < COUNT; i++) {
          const ax = toX(tbx[i])
          const ay = toY(tby[i])
          for (let j = i + 1; j < COUNT; j++) {
            const bx2 = toX(tbx[j])
            const by2 = toY(tby[j])
            const ox = halfW[i] + halfW[j] + WORD_PAD_X * 2 - Math.abs(ax - bx2)
            const oy = halfH[i] + halfH[j] + WORD_PAD_Y * 2 - Math.abs(ay - by2)
            if (ox <= 0 || oy <= 0) continue
            moved = true
            // On the configure identity the center is Configure's and not
            // negotiable: a neighbour that overlaps it takes the whole
            // separation itself, so the relaxation can never drift the
            // anchor off the middle of the frame.
            const pinI = cfg && i === lightIdx
            const pinJ = cfg && j === lightIdx
            if (ox < oy) {
              const dir = ax < bx2 ? -1 : ax > bx2 ? 1 : i < j ? -1 : 1
              const d = ((ox * 0.5 + 0.5) * dir) / spanX
              if (pinI) tbx[j] -= d * 2
              else if (pinJ) tbx[i] += d * 2
              else {
                tbx[i] += d
                tbx[j] -= d
              }
            } else {
              const dir = ay < by2 ? -1 : ay > by2 ? 1 : i < j ? -1 : 1
              const d = ((oy * 0.5 + 0.5) * dir) / spanY
              if (pinI) tby[j] -= d * 2
              else if (pinJ) tby[i] += d * 2
              else {
                tby[i] += d
                tby[j] -= d
              }
            }
            clampWord(i)
            clampWord(j)
          }
        }

        for (let i = 0; i < COUNT; i++) {
          wordBox(i, boxA)
          for (let b = 0; b < keepouts.length; b++) {
            const k = keepouts[b]
            if (!hits(boxA, k)) continue
            moved = true
            // Smallest exit from the type's box, fully deterministic.
            const pushes: [number, number][] = [
              [k[0] - boxA[2], 0],
              [k[2] - boxA[0], 0],
              [0, k[1] - boxA[3]],
              [0, k[3] - boxA[1]],
            ]
            pushes.sort(
              (p, q) => Math.abs(p[0] + p[1]) - Math.abs(q[0] + q[1]),
            )
            tbx[i] += pushes[0][0] / spanX
            tby[i] += pushes[0][1] / spanY
            clampWord(i)
            break
          }
        }

        if (!moved) break
      }

      // 2.5) Anchor rescue. On a narrow viewport the type stack swallows
      //    the centre of the frame, and the smallest-exit push can strand
      //    an anchor inside it; the spine must survive the phone cut, so
      //    before a key word is allowed to park, it tries the open bands
      //    above and below the whole type stack. Fully deterministic:
      //    fixed candidate order, first honest fit wins.
      let stackTop = Infinity
      let stackBot = -Infinity
      for (const k of keepouts) {
        if (k[1] < stackTop) stackTop = k[1]
        if (k[3] > stackBot) stackBot = k[3]
      }
      // Most important first: Configure gets the pick of the open slots,
      // never the leftovers.
      const rescueOrder: number[] = []
      for (let i = 0; i < COUNT; i++) {
        if (fragments[i].tier === "key") rescueOrder.push(i)
      }
      rescueOrder.sort(
        (a, b) =>
          importanceOf(fragments[b].node.id) - importanceOf(fragments[a].node.id),
      )
      // The roomier band gets tried first.
      const bandBelowFirst = vh - stackBot > stackTop
      for (const i of rescueOrder) {
        wordBox(i, boxA)
        let hit = false
        for (let b = 0; b < keepouts.length && !hit; b++) hit = hits(boxA, keepouts[b])
        if (!hit) continue
        const saveX = tbx[i]
        const saveY = tby[i]
        const rowH = (halfH[i] + WORD_PAD_Y) * 2 + 6
        let placed = false
        for (let row = 0; row < 4 && !placed; row++) {
          const below = bandBelowFirst ? row % 2 === 0 : row % 2 === 1
          const off = (halfH[i] + WORD_PAD_Y + 6) + Math.floor(row / 2) * rowH
          const cy2 = below ? stackBot + off : stackTop - off
          for (let xo = 0; xo < XOFF.length && !placed; xo++) {
            tbx[i] = saveX + XOFF[xo]
            tby[i] = spanY > 0 ? (cy2 - vh * 0.5) / spanY : 0
            clampWord(i)
            wordBox(i, boxA)
            let clear = true
            for (let b = 0; b < keepouts.length && clear; b++) {
              clear = !hits(boxA, keepouts[b])
            }
            for (let j = 0; j < COUNT && clear; j++) {
              if (j === i) continue
              wordBox(j, boxB)
              if (hits(boxA, boxB)) clear = false
            }
            if (clear) placed = true
          }
        }
        if (!placed) {
          tbx[i] = saveX
          tby[i] = saveY
        }
      }

      // 3) Anything the relaxation could not honestly fit sits out: a
      //    label buried in the type, or the less important of a stuck
      //    overlapping pair. A missing fragment costs less than a mess.
      for (let i = 0; i < COUNT; i++) {
        wordBox(i, boxA)
        for (let b = 0; b < keepouts.length; b++) {
          if (hits(boxA, keepouts[b])) {
            parked[i] = 1
            break
          }
        }
      }
      for (let i = 0; i < COUNT; i++) {
        if (parked[i]) continue
        wordBox(i, boxA)
        for (let j = i + 1; j < COUNT; j++) {
          if (parked[j]) continue
          wordBox(j, boxB)
          if (!hits(boxA, boxB)) continue
          const yield_ =
            importanceOf(fragments[i].node.id) < importanceOf(fragments[j].node.id)
              ? i
              : j
          parked[yield_] = 1
          if (yield_ === i) break
        }
      }

      // On the configure identity's phone cut the copy stack owns the top
      // of the frame, and the keep-out pushes were shoving Configure off
      // to whichever side had room. The middle is the brief, so the centre
      // re-seat runs FIRST, before the other anchors are rescued into the
      // open band: Configure picks its slot from empty ground and takes
      // the centred column it was pinned to, and faith, Paradigm, Nouvo
      // and San Francisco arrange themselves around it on the pass below.
      // If the guarantee finds nothing it falls back to wherever the
      // relaxation had honestly put it, never to sitting out.
      if (cfg && narrow && lightIdx >= 0 && keepouts.length) {
        const sx0 = tbx[lightIdx]
        const sy0 = tby[lightIdx]
        const sp0 = parked[lightIdx]
        tbx[lightIdx] = 0
        parked[lightIdx] = 1
        ensureAnchor(keepouts, lightIdx, true)
        if (parked[lightIdx]) {
          tbx[lightIdx] = sx0
          tby[lightIdx] = sy0
          parked[lightIdx] = sp0
        }
      }

      // Key anchors always survive the cut; see ensureAnchors.
      ensureAnchors(keepouts)

      // ...and on a phone, everything the cut parked gets one honest shot
      // at the open ground before the frame is called finished.
      fillParked(keepouts)

      for (let i = 0; i < COUNT; i++) {
        bx[i] = tbx[i]
        by[i] = tby[i]
      }

      applyLight()
      applyHitAreas()
    }

    /**
     * Re-fits the EXISTING composition to a new viewport. The rescale itself
     * is free (positions live in normalised space, so toX/toY have already
     * re-projected every word); this pass only nudges words back out of the
     * page type's keep-outs and the frame edges, by the smallest
     * deterministic push that clears them. It never re-samples: word A's
     * neighbours stay word A's neighbours at every size.
     */
    const evict = () => {
      const keepouts = gatherKeepouts()
      const spanX = vw * 0.5 - 26
      const spanY = vh * 0.5 - 24

      for (let i = 0; i < COUNT; i++) {
        if (parked[i]) continue
        const hw = halfW[i]
        const hh = halfH[i]
        const limX = spanX > 0 ? Math.min(1, (vw * 0.5 - 28 - hw) / spanX) : 0
        const limY = spanY > 0 ? Math.min(1, (vh * 0.5 - 24 - hh) / spanY) : 0
        let nx = Math.min(limX, Math.max(-limX, tbx[i]))
        let ny = Math.min(limY, Math.max(-limY, tby[i]))
        let x = toX(nx)
        let y = toY(ny)
        let box: Box = [
          x - hw - WORD_PAD_X,
          y - hh - WORD_PAD_Y,
          x + hw + WORD_PAD_X,
          y + hh + WORD_PAD_Y,
        ]

        for (let pass = 0; pass < 4; pass++) {
          let hit: Box | null = null
          for (let b = 0; b < keepouts.length; b++) {
            if (hits(box, keepouts[b])) {
              hit = keepouts[b]
              break
            }
          }
          if (!hit) break
          // Four ways out of the overlap, smallest movement first, kept
          // inside the frame. Fully deterministic: no dice, so a resize can
          // shove a word aside but never deal a new hand.
          const pushes: [number, number][] = [
            [hit[0] - box[2], 0],
            [hit[2] - box[0], 0],
            [0, hit[1] - box[3]],
            [0, hit[3] - box[1]],
          ]
          pushes.sort(
            (a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]),
          )
          let moved = false
          for (const [dxp, dyp] of pushes) {
            const nnx = spanX > 0 ? (x + dxp - vw * 0.5) / spanX : 0
            const nny = spanY > 0 ? (y + dyp - vh * 0.5) / spanY : 0
            if (nnx < -limX || nnx > limX || nny < -limY || nny > limY) continue
            x += dxp
            y += dyp
            nx = nnx
            ny = nny
            box = [
              x - hw - WORD_PAD_X,
              y - hh - WORD_PAD_Y,
              x + hw + WORD_PAD_X,
              y + hh + WORD_PAD_Y,
            ]
            moved = true
            break
          }
          if (!moved) break
        }

        let blocked = false
        for (let b = 0; b < keepouts.length; b++) {
          if (hits(box, keepouts[b])) {
            blocked = true
            break
          }
        }
        if (blocked) {
          // No honest spot at this size. Sitting out beats covering the type.
          parked[i] = 1
          continue
        }
        tbx[i] = nx
        tby[i] = ny
      }

      // A resize can shove Configure into a corner it cannot honestly
      // hold; the guarantee applies to every re-fit, not just placement.
      ensureAnchors(keepouts)
      fillParked(keepouts)

      applyLight()
      applyHitAreas()
    }

    let laidOut = false

    const resize = () => {
      readSafe()
      const w = host.clientWidth || window.innerWidth
      const h = host.clientHeight || window.innerHeight
      // The canvas always matches the real viewport 1:1 in CSS pixels.
      if (renderer) {
        renderer.setSize(w, h, false)
        camera.left = 0
        camera.right = w
        camera.top = 0
        camera.bottom = h
        camera.updateProjectionMatrix()
      }
      // The LAYOUT dimensions update only on a real change of shape. A width
      // change is always real (words re-project proportionally and the
      // keep-out eviction re-runs); a height-only change under 15% is a
      // mobile URL bar breathing, and must not move a single word.
      const widthChanged = Math.abs(w - vw) > 1
      const heightReal = Math.abs(h - vh) > vh * 0.15
      if (laidOut && !widthChanged && !heightReal) return
      vw = w
      vh = h
      // Recognition radius scales with the short axis so a constellation is
      // the same relative size on a phone as on a display.
      radius = Math.min(vw, vh) * (coarse ? 0.44 : 0.33)
      // Resting hairlines fade with span: nearby relations whisper, a
      // relation stretched across the whole frame is gone entirely. The
      // far limit is deliberately tight: long room-crossing hairlines are
      // what made certain frames read as a tangle.
      restNear = Math.min(vw, vh) * 0.22
      // On paper the far limit is much tighter: a hairline is forgivable
      // across a dark room, but a ~600px pen stroke slicing the open
      // middle of a printed sheet reads as a ruler line through the
      // composition's air. Long relations distance-fade out on stock.
      restFar = Math.min(vw, vh) * (lightGround ? 0.66 : 1.05)
      // The channel the reading column carves through the field once you
      // scroll past the hero. Light grounds carve a narrower channel:
      // retreating ink keeps the mid-descent handoff from going fully blank.
      bandInner = lightGround ? Math.min(300, vw * 0.3) : Math.min(360, vw * 0.34)
      bandOuter = bandInner + (lightGround ? 210 : 250)
      placeRef.current.decided = false
      measure()
      if (!laidOut) {
        // First layout only. Every later resize re-fits the same composition
        // instead of rolling a new one.
        laidOut = true
        place()
      } else {
        evict()
      }
    }

    resize()

    /* ---------------------------------------------------------------- */
    /* Cursor. Two positions: where the pointer is, and where the field   */
    /* believes it is. The second chases the first, which is what makes   */
    /* recognition feel like weight rather than a lookup.                 */
    /* ---------------------------------------------------------------- */
    let targetX = 0
    let targetY = 0
    let easedX = 0
    let easedY = 0
    let userBlend = 0
    let hasPointer = false
    let litIndex = -1
    // Configure's UNSPREAD screen position (drift and parallax, no descent
    // spread), carried frame to frame. The descent's vanishing point must
    // be this, never the word's final position: converging the spread on
    // the word's own OUTPUT feeds the spread its own displacement and the
    // transform runs away exponentially within a second of scrolling.
    let cfgRawX = 0
    let cfgRawY = 0

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      targetX = e.clientX
      targetY = e.clientY
      hasPointer = true
    }

    // Ambient wake: every so often one word far from the cursor stirs on its
    // own for a couple of seconds, the field thinking to itself. Never the
    // ember, never a constellation, just one word surfacing and sinking.
    let ambientIdx = -1
    let ambientAge = 0
    let ambientWait = 4.5

    // Proximity cards: sweeping the field surfaces the nearest word's story
    // without needing to land on the label. A candidate must stay nearest
    // for PROX_HOLD_S before it opens (and must be clearly closer than the
    // word whose card is already up), so cards never flicker-swap.
    let proxCandidate: string | null = null
    let proxHold = 0
    const PROX_HOLD_S = 0.18
    // A pointer that has left the field and parked over the hero type is
    // reading the page, not sweeping words: after this long over the
    // identity/headline column, an open card eases closed. Word-to-word
    // travel never runs the timer (the pointer is over the field, not the
    // type), so the open/close hysteresis above it is untouched.
    let awayHold = 0
    const AWAY_CLOSE_S = 0.6

    // The entrance clock. Held at zero until the layout settles (fonts
    // measured, field revealed), then runs the one-take cue sheet above.
    // Reduced motion never runs it: everything lands composed.
    let introOn = false
    let introClock = 0

    let raf = 0
    let last = performance.now()
    // The still frame is composed, not arbitrary: this is the point on the idle
    // path where the ghost cursor sits above the headline and to the right of
    // centre, so the reduced-motion constellation lands in clear space.
    let clock = reduced ? 14 : 0
    let disposed = false

    const step = (dt: number) => {
      clock += dt
      if (introOn && !reduced && introClock < INTRO_DONE + 1) introClock += dt
      /** The entrance clock this frame; reduced motion is always done. */
      const introT = reduced ? INTRO_DONE + 9 : introClock

      const act = activeRef.current
      const actIdx = act ? (idxOfNode.get(act) ?? -1) : -1

      // The active word's REAL relations, refreshed only when it changes.
      if (actIdx !== nbrFlagFor) {
        nbrFlag.fill(0)
        if (actIdx >= 0) for (const j of nbr[actIdx]) nbrFlag[j] = 1
        nbrFlagFor = actIdx
      }

      const scrollY = window.scrollY || 0
      // The descent: 0 at rest, 1 once the camera has passed the deepest
      // word. Scrubbed straight off scrollY (read here, once per frame);
      // native scrolling is untouched. Reduced motion never travels.
      const travel = reduced ? 0 : smoothstep(0, vh * TRAVEL_SPAN, scrollY)
      const camZ = travel * TRAVEL_DEPTH
      // Mid-descent the resting web brightens as you pass through it, then
      // hands the page over to the reading channel.
      const web = 1 + Math.sin(travel * Math.PI) * 2.1
      // How far past the hero we are. Drives the retreat of the field to the
      // margins so body copy is never read through drifting words. Paper
      // dims less: retreating ink lingering through the handoff is what
      // keeps the descent from going featureless beige before "Who I am".
      const past = smoothstep(vh * 0.3, vh * 1.05, scrollY)
      const dim = 1 - (lightGround ? 0.32 : 0.5) * past
      const driftY = 26 * Math.sin(scrollY / (vh * 1.7))
      // Ambient camera drift: a slow orbit, a few pixels wide over ~26s,
      // applied with the same depth weighting as the cursor parallax so the
      // scene reads as a shallow volume the moment you land, before any
      // scroll. Budgeted against WORD_PAD with the drift orbit, so it can
      // never spend the separation the placement guaranteed.
      const ambX = Math.sin(clock * 0.239) * 4.6 + Math.sin(clock * 0.101 + 1.7) * 2.2
      const ambY = Math.cos(clock * 0.173) * 3.4 + Math.sin(clock * 0.077) * 1.6
      // Vanishing point for the descent: near centre, a breath toward the
      // field's mass, so the frame empties evenly instead of hollowing out
      // one side while words pile into the other. On the configure identity
      // the vanishing point IS the word Configure: the camera's convergence
      // point is its position, so the whole field flies outward past you
      // while Configure alone grows toward you and holds the middle. The
      // word's own screen position (last frame) is used, so the point rides
      // its drift exactly and the word never slides against its own zoom.
      const cfgIdx = cfg ? lightIdx : -1
      let vpx = vw * 0.53
      let vpy = vh * 0.45
      if (cfgIdx >= 0 && !parked[cfgIdx]) {
        if (cfgRawX !== 0 || cfgRawY !== 0) {
          vpx = cfgRawX
          vpy = cfgRawY
        } else {
          vpx = toX(bx[cfgIdx])
          vpy = toY(by[cfgIdx])
        }
      }
      // Words hold their viewport clamp at rest, then let go on the way in
      // so passing words can genuinely leave the frame.
      const hold = 1 - smoothstep(0.01, 0.1, travel)

      // The card belongs to the hero. Once the descent starts in earnest,
      // it leaves with the labels' legibility.
      if (actIdx >= 0 && (past > 0.45 || travel > 0.3)) {
        activeRef.current = null
        closeRef.current()
      }

      // Idle: a ghost cursor wanders the field so the page demonstrates
      // itself before anyone touches it, and forever on touch devices.
      const ghostX =
        vw * 0.5 +
        Math.sin(clock * 0.2) * vw * 0.29 +
        Math.sin(clock * 0.081 + 2.1) * vw * 0.11
      const ghostY =
        vh * 0.48 +
        Math.sin(clock * 0.151 + 1.7) * vh * 0.24 +
        Math.cos(clock * 0.059) * vh * 0.11

      if (hasPointer && !coarse) userBlend = Math.min(1, userBlend + dt / 1.1)

      const wantX = ghostX + (targetX - ghostX) * userBlend
      const wantY = ghostY + (targetY - ghostY) * userBlend

      if (reduced) {
        easedX = ghostX
        easedY = ghostY
      } else {
        const k = 1 - Math.exp(-dt * 6.5)
        easedX += (wantX - easedX) * k
        easedY += (wantY - easedY) * k
      }

      const cx = easedX
      const cy = easedY

      const riseK = reduced ? 1 : 1 - Math.exp(-dt * 8.5)
      const fallK = reduced ? 1 : 1 - Math.exp(-dt * 2.9)
      // Base positions glide toward their targets, so a keep-out eviction
      // after a resize reads as words stepping aside, not teleporting.
      // Placement writes bx and tbx together, so at rest this is a no-op.
      const settleK = reduced ? 1 : 1 - Math.exp(-dt * 5)

      if (!reduced) {
        ambientAge += dt
        ambientWait -= dt
        if (ambientWait <= 0) {
          ambientWait = 7 + Math.random() * 8
          // One self-wake at a time, and only a word that is actually in the
          // layout AND well clear of wherever the cursor already is, so the
          // ambient thought never stacks on top of a live constellation.
          for (let tries = 0; tries < 8; tries++) {
            const c = Math.floor(Math.random() * COUNT)
            if (parked[c]) continue
            const ddx = px[c] - cx
            const ddy = py[c] - cy
            if (ddx * ddx + ddy * ddy < radius * radius * 1.69) continue
            ambientIdx = c
            ambientAge = 0
            break
          }
        }
      }

      for (let n = 0; n < CURSOR_LINKS; n++) {
        nearIdx[n] = -1
        nearDist[n] = Infinity
      }

      let bestLit = -1
      let bestLitD = Infinity

      for (let i = 0; i < COUNT; i++) {
        if (parked[i] && i !== actIdx) {
          // Out of the layout this pass: invisible, and part of nothing.
          els[i].style.opacity = "0"
          wake[i] = 0
          chan[i] = 0
          vis[i] = 0
          opac[i] = 0
          continue
        }

        bx[i] += (tbx[i] - bx[i]) * settleK
        by[i] += (tby[i] - by[i]) * settleK

        const ph = phase[i]
        // Drift is added in PIXELS after projection, inside each word's
        // exclusive orbit (see DRIFT_X/DRIFT_Y): the breathing can never
        // spend the separation the placement paid for.
        let x =
          vw * 0.5 +
          bx[i] * (vw * 0.5 - 26) +
          Math.sin(clock * 0.107 + ph * 6.2832) * DRIFT_X
        let y =
          vh * 0.5 +
          by[i] * (vh * 0.5 - 24) +
          Math.cos(clock * 0.089 + ph * 5.1) * DRIFT_Y +
          driftY * (0.4 + depth[i] * 0.8)
        // Depth parallax: the whole field leans away from the cursor a few
        // pixels, near words more than far ones, so the scatter reads as a
        // volume rather than a plane. The coefficient is budgeted together
        // with the drift orbit against WORD_PAD, so the lean cannot tangle
        // the field either.
        const parW = 0.32 - depth[i]
        const par = parW * 0.014
        x += (cx - vw * 0.5) * par + ambX * parW
        y += (cy - vh * 0.5) * par * 0.7 + ambY * parW

        // The descent. Scale is relative to rest (travel 0 leaves the
        // measured layout untouched); as the camera advances, words ahead
        // swell and spread from the vanishing point, and words the camera
        // has passed blow up and fade out behind you.
        // On the configure identity, Configure is the deepest thing in the
        // scene: the camera reaches it LAST, near the end of the descent,
        // so the signature read is the whole life flying past while the
        // word the map converges on grows to meet you, then the view
        // passes THROUGH it into the reading.
        const isCfgWord = i === cfgIdx
        const depthZ = isCfgWord ? 0.9 : 0.12 + depth[i] * 0.88
        const rel = depthZ - camZ
        // The lingerers (paper phone only): the lowest words on the sheet
        // swell less, spread less, keep their frame clamp, and hold their
        // pass-fade far longer, so the mid-descent handoff always carries
        // a line or two of composed ink instead of ~600px of bare stock.
        const linger = lingerFlag[i] !== 0
        let s = (PERSP + depthZ) / (PERSP + Math.max(rel, -PERSP * 0.62))
        const sCap = isCfgWord ? 7 : linger ? 1.5 : lightGround ? 2.4 : 3.2
        if (s > sCap) s = sCap
        // Words stay lit while they swell past the camera and only die once
        // they are genuinely behind you; the fly-past is the point. Light
        // grounds let passed words linger much longer (and swell less), so
        // the mid-descent sheet keeps some ink on it through the handoff.
        // Each lingerer retires before the reading column climbs into its
        // band: the lower slot first, the upper one at the handoff's end,
        // so lingering ink is never read through the prose. Configure's own
        // fade is the through-the-word moment: it holds full presence while
        // it swells, and only lets go once the camera is genuinely inside
        // it, handing the page to the reading right as the sheet arrives.
        const passFade = isCfgWord
          ? smoothstep(-0.5, -0.18, rel)
          : linger
            ? smoothstep(-1.7, -0.35, rel) *
              (lingerFlag[i] === 1
                ? 1 - smoothstep(0.66, 0.84, travel)
                : 1 - smoothstep(0.5, 0.68, travel))
            : lightGround
              ? smoothstep(-0.8, -0.08, rel)
              : smoothstep(-0.36, -0.04, rel)
        // Positions spread slower than glyphs swell, so the frame stays
        // populated through the middle of the descent instead of emptying
        // the moment perspective kicks in. Configure never spreads on its
        // own identity: it IS the vanishing point, so it holds its raw
        // position (recorded here for next frame's convergence) while the
        // rest of the field streams outward past it.
        if (isCfgWord) {
          cfgRawX = x
          cfgRawY = y
        } else {
          const spreadS = 1 + (s - 1) * (linger ? 0.3 : 0.72)
          x = vpx + (x - vpx) * spreadS
          y = vpy + (y - vpy) * spreadS
        }
        // The entrance: each word breathes in on its cue with a small,
        // weighted settle of scale. Position is never touched, so the
        // choreography can never disturb the authored layout.
        const cueT = introAt[i]
        const inA =
          introT >= cueT + INTRO_FADE
            ? 1
            : introT <= cueT
              ? 0
              : easeOutQuart((introT - cueT) / INTRO_FADE)
        if (inA < 1) s *= 0.9 + 0.1 * inA
        sc[i] = s

        // Lingerers are never released from the frame: they fade out in
        // place at the end of the descent instead of flying off it.
        const holdK = linger ? 1 : hold
        if (holdK > 0) {
          const kx = Math.min(vw - halfW[i] - 8, Math.max(halfW[i] + 8, x))
          const ky = Math.min(vh - halfH[i] - 6, Math.max(halfH[i] + 6, y))
          x = mix(x, kx, holdK)
          y = mix(y, ky, holdK)
        }

        // The lingerers' composed path: as the descent gets under way they
        // ease into the right gutter, in the band the hero type has already
        // vacated and the rising reading channel has not yet covered, one
        // above the other. The keep-out fade below still applies to them,
        // so the path can graze nothing; the channel and the pass-fade
        // retire them at the end of the handoff.
        if (linger && travel > 0) {
          const lt = smoothstep(0.15, 0.5, travel)
          x = mix(x, vw * 0.78, lt)
          y = mix(y, vh * (lingerFlag[i] === 1 ? 0.3 : 0.46), lt)
        }

        px[i] = x
        py[i] = y

        const dx = x - cx
        const dy = y - cy
        const d = Math.sqrt(dx * dx + dy * dy)

        // Anything well inside the radius is fully awake, not partly awake.
        // The soft outer half is what keeps arrivals and departures from
        // popping; the inner half is where a fragment is simply readable.
        // The word whose card is open is held fully awake regardless of
        // where the cursor has drifted (keyboard focus, touch, the card).
        let target = smoothstep(radius, radius * 0.45, d)
        if (i === ambientIdx && ambientAge < 2.8) {
          // A soft half-wake, well under the ember threshold.
          const pulse = Math.sin((ambientAge / 2.8) * Math.PI) * 0.55
          if (pulse > target) target = pulse
        }
        // The open word's true relations wake with it, wherever they sit:
        // recognising a word means seeing what it is actually connected to.
        if (nbrFlag[i] && target < 0.85) target = 0.85
        if (i === actIdx) target = 1
        const w = wake[i]
        wake[i] = w + (target - w) * (target > w ? riseK : fallK)

        // Reading channel: below the hero the field steps aside for the
        // text. Configure is exempt on its own identity: it sits dead
        // center, exactly where the channel carves, and dimming it there
        // would gut the zoom's climax. Its pass-fade retires it instead,
        // timed to finish as the reading sheet covers the field.
        const c = isCfgWord
          ? 1
          : mix(1, smoothstep(bandInner, bandOuter, Math.abs(x - vw * 0.5)), past)
        chan[i] = c
        vis[i] = c * passFade * inA

        // Leaving the frame is a fade, not a guillotine. Once the descent
        // releases the viewport clamp, a word the spread pushes past the
        // frame edge dims out in proportion to how much of it is gone, so
        // the edge can never clip a label down to a stray pair of glyphs
        // hanging over the reading column ("c u", "Zan").
        if (travel > 0.02) {
          const hwS = halfW[i] * s
          const hhS = halfH[i] * s
          const outX = Math.max(0, x + hwS - vw, -(x - hwS))
          const outY = Math.max(0, y + hhS - vh, -(y - hhS))
          if (outX > 0 || outY > 0) {
            const ex = 1 - Math.min(1, outX / (hwS + 1))
            const ey = 1 - Math.min(1, outY / (hhS + 1))
            vis[i] *= mix(1, ex * ey, smoothstep(0.02, 0.12, travel))
          }
        }

        // The type keep-outs hold during the DESCENT too. Placement
        // guarantees the identity block and the contact links are clear at
        // rest, but the retreat used to be free to carry a swollen glyph
        // straight over manuel@configure.dev. A travelling word entering a
        // keep-out (shifted into viewport space) fades with its
        // penetration, the same reading as the frame-edge rule above; the
        // rest gate keeps the pixel-scale drift orbit out of it entirely.
        if (travel > 0.01 && vis[i] > 0) {
          const hwK = halfW[i] * s
          const hhK = halfH[i] * s
          let occ = 1
          for (let k = 0; k < typeBoxes.length; k++) {
            const tb3 = typeBoxes[k]
            const ox = Math.min(x + hwK, tb3[2]) - Math.max(x - hwK, tb3[0])
            const oy =
              Math.min(y + hhK, tb3[3] - scrollY) -
              Math.max(y - hhK, tb3[1] - scrollY)
            if (ox > 0 && oy > 0) {
              const f = 1 - Math.min(1, Math.min(ox, oy) / 14)
              if (f < occ) occ = f
            }
          }
          if (occ < 1) vis[i] *= mix(1, occ, smoothstep(0.01, 0.08, travel))
        }

        const ww = wake[i]
        const lit = ww * ww * (3 - 2 * ww)
        // The lit ground: resting brightness carries the light grade, so
        // words near the source rest brighter and the far field sinks into
        // atmosphere. Waking a word still lifts it to full presence.
        const bA = Math.min(0.95, baseA[i] * lightK[i])
        // Approaching words brighten a little with their size, so the
        // descent reads as things coming to meet you, not just inflating.
        let o = (bA + lit * (0.96 - bA)) * vis[i] * dim * (1 + (s - 1) * 0.4)
        // Ignition: a word arriving in the entrance flares past its resting
        // brightness and settles, so the take reads as things LIGHTING, not
        // fading in. The spine burns hardest.
        if (introT < INTRO_DONE && introT > cueT) {
          const flare =
            Math.sin(Math.PI * Math.min(1, (introT - cueT) / 0.9)) *
            (cueT < INTRO_KEY ? 0.75 : 0.32)
          o *= 1 + flare
        }
        if (o > 1) o = 1
        const el = els[i]
        el.style.transform = `translate3d(${(x - halfW[i]).toFixed(1)}px, ${(
          y - halfH[i]
        ).toFixed(1)}px, 0) scale(${s.toFixed(3)})`
        el.style.opacity = o.toFixed(3)
        opac[i] = o

        // The single fragment actually under the cursor takes the ember. One
        // word at a time, so the accent stays an event and not a colour.
        if (wake[i] > 0.82 && d < bestLitD && vis[i] > 0.5) {
          bestLitD = d
          bestLit = i
        }

        // The nearest words are tracked UNCONDITIONALLY (no wake gate): the
        // cursor is always webbed to its neighbourhood, wherever it floats.
        if (d < nearDist[CURSOR_LINKS - 1]) {
          let n = CURSOR_LINKS - 1
          while (n > 0 && nearDist[n - 1] > d) {
            nearDist[n] = nearDist[n - 1]
            nearIdx[n] = nearIdx[n - 1]
            n--
          }
          nearDist[n] = d
          nearIdx[n] = i
        }
      }

      // The ember stays out of the entrance: recognition is a reward for
      // arriving, not part of the take.
      if (introT < INTRO_DONE - 0.4) bestLit = -1

      // The idle ember cycle is retired: recognition colour belongs to a
      // real reader. The ghost cursor still wakes and webs words, but only
      // a live pointer (or an open card, below) may set a word burning, so
      // a resting frame tells the light story with exactly one source and
      // a printed sheet never wears a stray red error mark.
      if (userBlend < 0.5 && actIdx < 0) bestLit = -1

      // An open card owns the ember, wherever the eased cursor has settled.
      if (actIdx >= 0) bestLit = actIdx

      if (bestLit !== litIndex) {
        if (litIndex >= 0) delete els[litIndex].dataset.lit
        if (bestLit >= 0) els[bestLit].dataset.lit = "true"
        litIndex = bestLit
      }

      /* Proximity cards ------------------------------------------------ */
      // Sweeping near a word surfaces its story without landing on the
      // label. Real pointer only (never the ghost, never touch), hero only.
      // Hysteresis both ways: a new word must hold nearest for PROX_HOLD_S
      // and be clearly closer than the current card's word to take over,
      // and a card only leaves once the cursor is well outside its orbit
      // (and never while the card itself is being read).
      if (!coarse && !reduced && userBlend > 0.6 && travel < 0.15 && past < 0.3) {
        const nearest = nearIdx[0]
        const nearestD = nearDist[0]
        const actD =
          actIdx >= 0
            ? Math.sqrt((px[actIdx] - cx) ** 2 + (py[actIdx] - cy) ** 2)
            : Infinity
        const openR = radius * 0.5
        // A word only qualifies for auto-open if its card has somewhere
        // honest to sit: a placement fully clear of the identity block and
        // the headline. The dimensions are an estimate (the card does not
        // exist yet); the real placement re-runs the same exclusion with
        // measured dimensions once it opens.
        const wantId =
          nearest >= 0 &&
          nearestD < openR &&
          vis[nearest] > 0.3 &&
          cardSpot(nearest, Math.min(336, vw - 24), 216, scrollY) >= 0
            ? fragments[nearest].node.id
            : null
        if (wantId !== suppressRef.current) suppressRef.current = null
        if (
          wantId &&
          wantId !== act &&
          wantId !== suppressRef.current &&
          (actIdx < 0 ||
            nearestD < actD * 0.7 ||
            (!cardHotRef.current && actD > radius * 0.9))
        ) {
          if (proxCandidate === wantId) {
            proxHold += dt
            if (proxHold >= PROX_HOLD_S) {
              proxCandidate = null
              proxHold = 0
              openRef.current(wantId)
            }
          } else {
            proxCandidate = wantId
            proxHold = 0
          }
        } else if (!wantId) {
          proxCandidate = null
          proxHold = 0
          if (actIdx >= 0 && actD > radius * 1.15 && !cardHotRef.current) {
            closeRef.current()
          }
        }

        // The away timer (see AWAY_CLOSE_S): pointer parked over the hero
        // type block with a card still open eases the card closed. Never
        // while the card itself is being read.
        if (actIdx >= 0 && hasPointer && !cardHotRef.current) {
          let overType = false
          for (let k = 0; k < typeBoxes.length && !overType; k++) {
            const tb3 = typeBoxes[k]
            overType =
              targetX >= tb3[0] &&
              targetX <= tb3[2] &&
              targetY >= tb3[1] - scrollY &&
              targetY <= tb3[3] - scrollY
          }
          if (overType) {
            awayHold += dt
            if (awayHold >= AWAY_CLOSE_S) {
              awayHold = 0
              closeRef.current()
            }
          } else {
            awayHold = 0
          }
        } else {
          awayHold = 0
        }
      }

      /* Card ---------------------------------------------------------- */
      // Anchored beside its word, decided once per open, clamped every
      // frame so the drifting anchor can never carry it off screen. The
      // hero type's keep-outs are a hard exclusion: the side chosen is the
      // first of below/above/right/left whose card rect misses them all,
      // so a card can never park over "Manuel David" or the headline. If
      // no side is fully clear (a tapped word buried mid-type on a phone),
      // the placement falls back to whichever side covers the least.
      const cardEl = cardRef.current
      if (actIdx >= 0 && cardEl) {
        const cw2 = cardEl.offsetWidth
        const ch2 = cardEl.offsetHeight
        const axp = px[actIdx]
        const ayp = py[actIdx]
        const M = 12
        // The frame runs under the hardware now (viewport-fit=cover), so
        // the card's own margins carry the insets: a card clamped to the
        // bottom of a phone would otherwise put its last line, and its
        // link, under the home indicator.
        const ML = M + safeL
        const MR = M + safeR
        const MT = M + safeT
        const MB = M + safeB
        const GAP = halfH[actIdx] * sc[actIdx] + 12
        const SIDE = halfW[actIdx] * sc[actIdx] + 18
        const place2 = placeRef.current
        if (!place2.decided) {
          const clear = cardSpot(actIdx, cw2, ch2, scrollY)
          if (clear >= 0) {
            place2.mode = clear
          } else {
            let best = 0
            let bestCost = Infinity
            for (let m = 0; m < 4; m++) {
              let left =
                m === 2 ? axp + SIDE : m === 3 ? axp - SIDE - cw2 : axp - cw2 * 0.32
              let top2 = m === 0 ? ayp + GAP : m === 1 ? ayp - GAP - ch2 : ayp - ch2 / 2
              left = Math.min(Math.max(ML, left), vw - MR - cw2)
              top2 = Math.min(Math.max(MT, top2), vh - MB - ch2)
              let cost = 0
              for (let k = 0; k < typeBoxes.length; k++) {
                const tb2 = typeBoxes[k]
                const ox = Math.min(left + cw2, tb2[2]) - Math.max(left, tb2[0])
                const oy =
                  Math.min(top2 + ch2, tb2[3] - scrollY) -
                  Math.max(top2, tb2[1] - scrollY)
                if (ox > 0 && oy > 0) cost += ox * oy
              }
              if (cost < bestCost) {
                bestCost = cost
                best = m
              }
            }
            place2.mode = best
          }
          place2.decided = true
        }
        let top: number
        let leftPx: number
        if (place2.mode === 2) {
          leftPx = axp + SIDE
          top = ayp - ch2 / 2
        } else if (place2.mode === 3) {
          leftPx = axp - SIDE - cw2
          top = ayp - ch2 / 2
        } else {
          top = place2.mode === 0 ? ayp + GAP : ayp - GAP - ch2
          leftPx = axp - cw2 * 0.32
        }
        top = Math.min(Math.max(MT, top), vh - MB - ch2)
        leftPx = Math.min(Math.max(ML, leftPx), vw - MR - cw2)
        cardEl.style.transform = `translate3d(${leftPx.toFixed(1)}px, ${top.toFixed(1)}px, 0)`
        cardEl.style.visibility = "visible"
      }

      let seg = 0
      let qseg = 0

      /** Raw quad write, for strokes with real width (the spine). Same
       * shader, same attributes; the quad is aligned to the stroke. */
      const writeQuad = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        alpha0: number,
        alpha1: number,
        tint0: number,
        tint1: number,
        w: number,
      ) => {
        if (qseg >= QUAD_MAX) return
        const dx = x1 - x0
        const dy = y1 - y0
        const l = Math.sqrt(dx * dx + dy * dy) || 1
        const nx2 = (-dy / l) * w * 0.5
        const ny2 = (dx / l) * w * 0.5
        const v = qseg * 12
        quadPositions[v] = x0 + nx2
        quadPositions[v + 1] = y0 + ny2
        quadPositions[v + 2] = 0
        quadPositions[v + 3] = x0 - nx2
        quadPositions[v + 4] = y0 - ny2
        quadPositions[v + 5] = 0
        quadPositions[v + 6] = x1 + nx2
        quadPositions[v + 7] = y1 + ny2
        quadPositions[v + 8] = 0
        quadPositions[v + 9] = x1 - nx2
        quadPositions[v + 10] = y1 - ny2
        quadPositions[v + 11] = 0
        const t = qseg * 4
        quadAlpha[t] = alpha0
        quadAlpha[t + 1] = alpha0
        quadAlpha[t + 2] = alpha1
        quadAlpha[t + 3] = alpha1
        quadTint[t] = tint0
        quadTint[t + 1] = tint0
        quadTint[t + 2] = tint1
        quadTint[t + 3] = tint1
        qseg++
      }

      /** Raw segment write. Everything above it decides WHAT to draw. */
      const writeSeg = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        alpha0: number,
        alpha1: number,
        tint0: number,
        tint1: number,
      ) => {
        if (seg >= MAX_SEGMENTS) return
        const v = seg * 6
        linePositions[v] = x0
        linePositions[v + 1] = y0
        linePositions[v + 2] = 0
        linePositions[v + 3] = x1
        linePositions[v + 4] = y1
        linePositions[v + 5] = 0
        const t = seg * 2
        lineAlpha[t] = alpha0
        lineAlpha[t + 1] = alpha1
        lineTint[t] = tint0
        lineTint[t + 1] = tint1
        seg++
      }

      /** Luminance profile along a stroke: full at the nodes, dimmer at
       * mid-span, so the web reads as lit filaments rather than wireframe.
       * Pure alpha gradient; no glow, no bloom, no width change. */
      const lum = (t: number) => 1 - 0.42 * Math.sin(Math.PI * t)

      /** One drawn span, routed to the hairline or the wide-quad pass. */
      const emitSpan = (
        sx: number,
        sy: number,
        rx: number,
        ry: number,
        alpha: number,
        tintA: number,
        tintB: number,
        t0: number,
        t1: number,
        width: number,
      ) => {
        const x0 = sx + rx * t0
        const y0 = sy + ry * t0
        const x1 = sx + rx * t1
        const y1 = sy + ry * t1
        const a0 = alpha * lum(t0)
        const a1 = alpha * lum(t1)
        const c0 = mix(tintA, tintB, t0)
        const c1 = mix(tintA, tintB, t1)
        if (width > 0) writeQuad(x0, y0, x1, y1, a0, a1, c0, c1, width)
        else writeSeg(x0, y0, x1, y1, a0, a1, c0, c1)
      }

      /** One lit sub-span of a stroke, in segment parameter space. Splits
       * at the midpoint so the linear per-vertex alpha can actually dip. */
      const emitSub = (
        sx: number,
        sy: number,
        rx: number,
        ry: number,
        alpha: number,
        tintA: number,
        tintB: number,
        t0: number,
        t1: number,
        width: number,
      ) => {
        if (t0 < 0.5 && t1 > 0.5) {
          emitSpan(sx, sy, rx, ry, alpha, tintA, tintB, t0, 0.5, width)
          emitSpan(sx, sy, rx, ry, alpha, tintA, tintB, 0.5, t1, width)
          return
        }
        emitSpan(sx, sy, rx, ry, alpha, tintA, tintB, t0, t1, width)
      }

      /**
       * Writes one hairline between two nodes, trimmed to stop clear of each
       * word's box so the line reads as a connection between two pieces of
       * type rather than a strike-through, and CLIPPED around every other
       * visible label it would cross: the line ducks behind a word with the
       * same clearance the endpoints get, so no hairline ever strikes
       * through a label anywhere along its length. skipA/skipB are the
       * endpoint indices (-1 for the cursor), which must not occlude their
       * own line. width > 0 routes the stroke to the wide-quad pass (the
       * spine); freeB marks endpoint B as a moving tip (the entrance
       * draw-in), which is honestly mid-air and exempt from the arrival
       * rule below.
       */
      const push = (
        ax: number,
        ay: number,
        ahw: number,
        ahh: number,
        bxp: number,
        byp: number,
        bhw: number,
        bhh: number,
        alpha: number,
        tintA: number,
        tintB: number,
        skipA: number,
        skipB: number,
        width = 0,
        freeB = false,
      ) => {
        const dx = bxp - ax
        const dy = byp - ay
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len < 1) return
        const ux = dx / len
        const uy = dy / len
        const tA = boxT(ux, uy, ahw, ahh) + NODE_PAD
        const tB = boxT(ux, uy, bhw, bhh) + NODE_PAD
        if (tA + tB >= len - 4) return

        const sx = ax + ux * tA
        const sy = ay + uy * tA
        const rx = bxp - ux * tB - sx
        const ry = byp - uy * tB - sy
        const segLen = len - tA - tB

        // Slab test against every visible label box (padded), collecting the
        // blocked parameter intervals along the segment.
        let nb = 0
        for (let k = 0; k < COUNT && nb < 64; k++) {
          if (k === skipA || k === skipB) continue
          if (opac[k] < 0.05) continue
          const ohw = halfW[k] * sc[k] + CLIP_PAD
          const ohh = halfH[k] * sc[k] + CLIP_PAD
          const ox0 = px[k] - ohw
          const ox1 = px[k] + ohw
          const oy0 = py[k] - ohh
          const oy1 = py[k] + ohh
          let tEn = -Infinity
          let tEx = Infinity
          if (Math.abs(rx) < 1e-6) {
            if (sx < ox0 || sx > ox1) continue
          } else {
            const inv = 1 / rx
            let ta = (ox0 - sx) * inv
            let tb = (ox1 - sx) * inv
            if (ta > tb) {
              const tmp = ta
              ta = tb
              tb = tmp
            }
            tEn = ta
            tEx = tb
          }
          if (Math.abs(ry) < 1e-6) {
            if (sy < oy0 || sy > oy1) continue
          } else {
            const inv = 1 / ry
            let ta = (oy0 - sy) * inv
            let tb = (oy1 - sy) * inv
            if (ta > tb) {
              const tmp = ta
              ta = tb
              tb = tmp
            }
            if (ta > tEn) tEn = ta
            if (tb < tEx) tEx = tb
          }
          if (tEn >= tEx || tEx <= 0 || tEn >= 1) continue
          blockT0[nb] = tEn < 0 ? 0 : tEn
          blockT1[nb] = tEx > 1 ? 1 : tEx
          nb++
        }

        // The page's own type occludes too: the hero block's keep-out box,
        // shifted into viewport space, so no hairline ever crosses the
        // headline or the prose column it protects.
        for (let k = 0; k < typeBoxes.length && nb < 64; k++) {
          const tb2 = typeBoxes[k]
          const ox0 = tb2[0]
          const oy0 = tb2[1] - scrollY
          const ox1 = tb2[2]
          const oy1 = tb2[3] - scrollY
          let tEn = -Infinity
          let tEx = Infinity
          if (Math.abs(rx) < 1e-6) {
            if (sx < ox0 || sx > ox1) continue
          } else {
            const inv = 1 / rx
            let ta = (ox0 - sx) * inv
            let tb = (ox1 - sx) * inv
            if (ta > tb) {
              const tmp = ta
              ta = tb
              tb = tmp
            }
            tEn = ta
            tEx = tb
          }
          if (Math.abs(ry) < 1e-6) {
            if (sy < oy0 || sy > oy1) continue
          } else {
            const inv = 1 / ry
            let ta = (oy0 - sy) * inv
            let tb = (oy1 - sy) * inv
            if (ta > tb) {
              const tmp = ta
              ta = tb
              tb = tmp
            }
            if (ta > tEn) tEn = ta
            if (tb < tEx) tEx = tb
          }
          if (tEn >= tEx || tEx <= 0 || tEn >= 1) continue
          blockT0[nb] = tEn < 0 ? 0 : tEn
          blockT1[nb] = tEx > 1 ? 1 : tEx
          nb++
        }

        if (nb === 0) {
          emitSub(sx, sy, rx, ry, alpha, tintA, tintB, 0, 1, width)
          return
        }

        // Sort the blocked intervals (insertion; nb is tiny), then collect
        // the gaps between them. Slivers shorter than MIN_SUB_PX drop.
        for (let a2 = 1; a2 < nb; a2++) {
          const k0 = blockT0[a2]
          const k1 = blockT1[a2]
          let b2 = a2 - 1
          while (b2 >= 0 && blockT0[b2] > k0) {
            blockT0[b2 + 1] = blockT0[b2]
            blockT1[b2 + 1] = blockT1[b2]
            b2--
          }
          blockT0[b2 + 1] = k0
          blockT1[b2 + 1] = k1
        }
        const minT = segLen > 0 ? MIN_SUB_PX / segLen : 1
        let ng = 0
        let cur = 0
        for (let q = 0; q <= nb; q++) {
          const gapEnd = q === nb ? 1 : blockT0[q]
          if (gapEnd - cur >= minT) {
            gapT0[ng] = cur
            gapT1[ng] = gapEnd
            ng++
          }
          if (q < nb && blockT1[q] > cur) cur = blockT1[q]
          if (cur >= 1) break
        }
        if (ng === 0) return

        // A stroke must ARRIVE. If the clipping (another label, the hero
        // type's keep-out) has eaten the piece of the line that touches a
        // word endpoint, the whole stroke is dropped rather than drawn
        // dying mid-air: a line that cannot visibly reach its own word
        // reads as an error, not a relation. Cursor ends (skip < 0) and
        // the entrance draw-in tip (freeB) are mid-air by design.
        if (skipA >= 0 && gapT0[0] > 0.001) return
        if (skipB >= 0 && !freeB && gapT1[ng - 1] < 0.999) return

        for (let q = 0; q < ng; q++) {
          emitSub(sx, sy, rx, ry, alpha, tintA, tintB, gapT0[q], gapT1[q], width)
        }
      }

      /**
       * The resting web: the graph's real relationships, drawn a shade above
       * invisible all the time. This is what keeps the field from reading as
       * empty space with words scattered in it; even before the cursor
       * arrives, the space is visibly one connected thing. When the cursor
       * wakes both ends of a relation, the same hairline brightens, so the
       * structure the spider-crawl reveals is the structure that was always
       * faintly there.
       */
      // Order the resting edges shortest first (nearly sorted from the last
      // frame, so the insertion sort is close to free), then draw under a
      // per-node degree cap: a hub keeps its REST_DEG_MAX tightest relations
      // as permanent hairlines and sheds the long room-crossing ones, which
      // is what kept certain frames from piling up. A capped relation still
      // lights when both of its ends actually wake.
      for (let e = 0; e < restCount; e++) {
        const ddx = px[restA[e]] - px[restB[e]]
        const ddy = py[restA[e]] - py[restB[e]]
        restLen[e] = ddx * ddx + ddy * ddy
      }
      for (let a2 = 1; a2 < restCount; a2++) {
        const e2 = restOrder[a2]
        const l2 = restLen[e2]
        let b2 = a2 - 1
        while (b2 >= 0 && restLen[restOrder[b2]] > l2) {
          restOrder[b2 + 1] = restOrder[b2]
          b2--
        }
        restOrder[b2 + 1] = e2
      }
      restDeg.fill(0)
      for (let o2 = 0; o2 < restCount && seg < MAX_SEGMENTS; o2++) {
        const e = restOrder[o2]
        const i = restA[e]
        const j = restB[e]
        if (parked[i] || parked[j]) continue
        const glow = wake[i] * wake[j] * 0.26
        // An edge touching the open word ALWAYS draws (the card promises
        // the word's relationships), and the spine edges are never capped:
        // Paradigm being a Configure customer is the hinge of the story.
        const strong = restStrong[e] === 1
        const isActive = i === actIdx || j === actIdx
        // The cap yields ONLY to the spine and to the open card's word:
        // passing wake brightens the capped subset, and the full fan of a
        // hub is reserved for actually resting on it. Fewer, better lines.
        const overCap =
          !isActive &&
          !strong &&
          (restDeg[i] >= REST_DEG_MAX || restDeg[j] >= REST_DEG_MAX)
        if (overCap) continue

        // Angular separation: a hairline that would leave either endpoint
        // nearly parallel to one already drawn is dropped (unless it is the
        // spine or belongs to the open card): fewer, better lines. Paper's
        // sparse density demands a wider fan (see MIN_EDGE_ANGLE_PAPER).
        const minAng = lightGround ? MIN_EDGE_ANGLE_PAPER : MIN_EDGE_ANGLE
        const ang = Math.atan2(py[j] - py[i], px[j] - px[i])
        if (!isActive && !strong) {
          let bunched = false
          for (let q = 0; q < restDeg[i] && !bunched; q++) {
            const da = Math.abs(ang - restAng[i * REST_DEG_MAX + q]) % (Math.PI * 2)
            if (Math.min(da, Math.PI * 2 - da) < minAng) bunched = true
          }
          const angJ = ang > 0 ? ang - Math.PI : ang + Math.PI
          for (let q = 0; q < restDeg[j] && !bunched; q++) {
            const da = Math.abs(angJ - restAng[j * REST_DEG_MAX + q]) % (Math.PI * 2)
            if (Math.min(da, Math.PI * 2 - da) < minAng) bunched = true
          }
          if (bunched) continue
        }

        const d = Math.sqrt(restLen[e])
        // Visible at rest on purpose: the web is the structure the page is
        // about, so it reads at arm's length, not only under the cursor.
        // Mid-descent it brightens further (web > 1) as you pass through.
        // The spine draws at roughly double presence.
        const restAlpha = overCap
          ? 0
          : (strong ? 0.52 : 0.27) *
            smoothstep(restFar * web * (strong ? 1.7 : 1), restNear, d) *
            web
        let alpha = (restAlpha + glow) * Math.min(vis[i], vis[j]) * dim
        // The grade reaches the web: strokes near the light source hold
        // more presence than strokes out in the atmospheric far field.
        // Ink on stock needs more body than light on ink to read at all.
        alpha *= (lightE[i] + lightE[j]) * (lightGround ? 0.8 : 0.5)
        if (isActive) {
          const floor = 0.32 * Math.min(vis[i], vis[j]) * dim
          if (alpha < floor) alpha = floor
        }
        // During the entrance, a stroke waits a beat after its later word
        // has breathed in, so the web assembles just behind the words.
        const cueEdge = Math.max(introAt[i], introAt[j]) + 0.1
        if (introT < INTRO_DONE) {
          alpha *= smoothstep(cueEdge, cueEdge + 0.34, introT)
        }
        // A stroke may never outshine its endpoints: a line into a word
        // the eye cannot find reads as a stroke into nothing, so edge
        // alpha is capped by the dimmer endpoint's on-screen opacity.
        const capA = Math.min(opac[i], opac[j])
        if (alpha > capA) alpha = capA
        if (alpha < 0.008) continue
        if (restDeg[i] < REST_DEG_MAX) restAng[i * REST_DEG_MAX + restDeg[i]] = ang
        if (restDeg[j] < REST_DEG_MAX) {
          restAng[j * REST_DEG_MAX + restDeg[j]] =
            ang > 0 ? ang - Math.PI : ang + Math.PI
        }
        restDeg[i]++
        restDeg[j]++
        // The web carries the grade too: strokes near the light source
        // warm toward its tone (the shader mixes uBase toward uEmber by
        // tint, which at these values reads as warmth, never as accent).
        // Ink on stock stays ink: light grounds keep a whisper at most.
        // On configure the mix target is the brand slate, and the one
        // stroke allowed to really carry it is the spine: slate spine
        // emphasis, ink everything else, per the brand's single accent.
        const tintI = cfg ? warmK[i] * 0.12 : paper ? warmK[i] * 0.16 : warmK[i] * 0.5
        const tintJ = cfg ? warmK[j] * 0.12 : paper ? warmK[j] * 0.16 : warmK[j] * 0.5
        // The spine's stroke: one honest wide quad, warm, endpoints on the
        // same trim as every other edge (see SPINE_WIDTH).
        const w2 = strong ? SPINE_WIDTH : 0
        const strongTint = cfg ? 0.85 : paper ? 0.2 : 0.55
        const tintA2 = strong ? strongTint : tintI
        const tintB2 = strong ? strongTint : tintJ
        const alpha2 = strong ? alpha * 0.9 : alpha
        // The life spine draws ITSELF in during the entrance: each spine
        // stroke grows from the earlier-ignited word toward the later one.
        if (restSpineArr[e] === 1 && introT < INTRO_DONE) {
          const from = introAt[i] <= introAt[j] ? i : j
          const to = from === i ? j : i
          const g0 = introAt[from] + 0.08
          if (introT <= g0) continue
          const g = easeOutQuart((introT - g0) / (SPINE_STEP * 2.6))
          if (g < 1) {
            push(
              px[from], py[from], halfW[from] * sc[from], halfH[from] * sc[from],
              px[from] + (px[to] - px[from]) * g,
              py[from] + (py[to] - py[from]) * g,
              0, 0,
              alpha2 * (0.3 + 0.7 * g), tintA2, tintB2, from, to, w2, true,
            )
            continue
          }
        }
        push(
          px[i], py[i], halfW[i] * sc[i], halfH[i] * sc[i],
          px[j], py[j], halfW[j] * sc[j], halfH[j] * sc[j],
          alpha2, tintA2, tintB2, i, j, w2,
        )
      }

      // There is deliberately NO nearest-neighbour "recognition" pass any
      // more. Every line the field draws between two words is read as a
      // claimed relationship, and proximity in the layout is not one: the
      // old pass kept inventing pairs like a classroom tool linked to a
      // context server because they happened to land near each other. Only
      // the audited graph draws; waking a word brightens its REAL relations
      // through the resting-web loop above.

      // Cursor tethers: the field reaching back toward whoever is reading.
      // The floor term keeps the cursor CONNECTED at all times: wherever the
      // pointer floats, its nearest words hold a whisper of a line to it,
      // brightening as it closes in and as the words wake.
      //
      // A REAL reader only, like the ember. The ghost cursor still wakes
      // words, but a tether needs a visible anchor at both ends: strokes
      // converging on an invisible ghost point read as broken pen work
      // (near-parallel doubles beside real edges, orphan stubs, inverted
      // Vs meeting in blank space), plainest on paper where every line is
      // ink. On touch there is no cursor at all, so there is no tether.
      const tetherGate = reduced || coarse ? 0 : smoothstep(0.35, 0.7, userBlend)
      for (let n = 0; tetherGate > 0.01 && n < CURSOR_LINKS && seg < MAX_SEGMENTS; n++) {
        const i = nearIdx[n]
        if (i < 0) continue
        let alpha =
          (0.07 +
            0.12 * smoothstep(radius * 1.9, radius * 0.25, nearDist[n]) +
            wake[i] * 0.5 * smoothstep(radius, radius * 0.1, nearDist[n])) *
          (lightGround ? 1.5 : 1) *
          tetherGate *
          vis[i] *
          dim *
          // The tethers are the last thing to arrive: the field finishes
          // assembling itself before it reaches for the reader.
          (introT >= INTRO_DONE ? 1 : smoothstep(INTRO_DONE - 0.7, INTRO_DONE, introT))
        // Same arrival honesty as the web: a tether may not outshine the
        // word it reaches for.
        if (alpha > opac[i]) alpha = opac[i]
        if (alpha < 0.008) continue
        push(cx, cy, 0, 0, px[i], py[i], halfW[i] * sc[i], halfH[i] * sc[i], alpha, 0.9, 0.1, -1, i)
      }

      if (renderer) {
        lineGeo.setDrawRange(0, seg * 2)
        if (seg > 0) {
          linePosAttr.needsUpdate = true
          lineAlphaAttr.needsUpdate = true
          lineTintAttr.needsUpdate = true
        }
        quadGeo.setDrawRange(0, qseg * 6)
        if (qseg > 0) {
          quadPosAttr.needsUpdate = true
          quadAlphaAttr.needsUpdate = true
          quadTintAttr.needsUpdate = true
        }
        renderer.render(scene, camera)
      }
    }

    const loop = (now: number) => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      if (document.hidden) {
        last = now
        return
      }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      step(dt)
    }

    if (reduced) {
      // One composed frame, twice, so the wake damping settles before it is
      // read. A still, legible, connected constellation. Never blank.
      redrawRef.current = () => {
        step(0)
        step(0)
      }
      step(0)
      step(0)
    } else {
      redrawRef.current = null
      raf = requestAnimationFrame(loop)
      window.addEventListener("pointermove", onPointerMove, { passive: true })
    }

    const onResize = () => {
      resize()
      if (reduced) {
        step(0)
        step(0)
      }
    }
    window.addEventListener("resize", onResize)

    // Widths measured before the webfonts land are the fallback's widths, and
    // the whole layout is built out of those widths. Re-place once the real
    // metrics exist, then let the field fade up. Nothing is visible until
    // this settles, so the font-metrics reshuffle is never seen.
    //
    // settle() runs EXACTLY once. The old version ran on fonts.ready and
    // again on an unconditional 1400ms failsafe timer, and each run rolled a
    // fresh Math.random layout, so the field visibly re-scrambled about 1.4s
    // after it had already faded in. That was the jarring load. Now the
    // layout is seeded (idempotent) and the reveal is single-shot.
    let settled = false
    const settle = () => {
      if (disposed || settled) return
      settled = true
      measure()
      place()
      // The entrance clock starts the moment the composed layout exists.
      introOn = true
      if (reduced) {
        step(0)
        step(0)
      }
      readyRef.current?.()
    }

    if (typeof document !== "undefined" && "fonts" in document) {
      const fonts = document.fonts
      // Ask for every face/style/weight the fragments are measured in, not
      // just fonts.ready: ready can resolve before lazily-declared faces are
      // requested, but load() forces each one into flight now.
      const specs = new Set<string>()
      for (let i = 0; i < COUNT; i++) {
        const cs = getComputedStyle(els[i])
        specs.add(`${cs.fontStyle} ${cs.fontWeight} 16px ${cs.fontFamily}`)
      }
      const loads: Promise<unknown>[] = []
      if (typeof fonts.load === "function") {
        specs.forEach((spec) => {
          loads.push(fonts.load(spec).catch(() => []))
        })
      }
      Promise.all(loads)
        .then(() => fonts.ready)
        .then(() => {
          if (disposed) return
          if (!settled) settle()
          else {
            // Fonts landed after the failsafe already revealed the field.
            // Re-run the SAME deterministic placement on the real metrics:
            // a room built on fallback widths can park the wrong words
            // (even an anchor), and every load must converge on the one
            // authored composition. The base positions glide there through
            // the settle easing; nothing snaps.
            measure()
            place()
          }
        })
      // Belt and braces: never leave the field invisible if fonts stall.
      // Safe to race with the promise above; settle() is single-shot.
      window.setTimeout(settle, 1400)
    } else {
      settle()
    }

    return () => {
      disposed = true
      // The spans outlive this effect (React reuses the nodes across a
      // StrictMode remount), so hand them back clean. Otherwise the ember
      // from the previous run is still sitting on a word the next run knows
      // nothing about, and two fragments read as recognised at once.
      for (let i = 0; i < COUNT; i++) delete els[i].dataset.lit
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointerMove)
      lineGeo.dispose()
      quadGeo.dispose()
      lineMat.dispose()
      if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
      }
      if (canvas?.parentNode) canvas.parentNode.removeChild(canvas)
      if (safeProbe.parentNode) safeProbe.parentNode.removeChild(safeProbe)
      redrawRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragments])

  const activeNode = active ? nodeById.get(active) : undefined

  return (
    <div ref={hostRef} className={className}>
      <div ref={canvasHostRef} className={styles.fieldCanvas} aria-hidden="true" />
      <div
        ref={wordsRef}
        className={styles.fieldWords}
        role="group"
        aria-label="Manuel's context field. Every word is a real piece of his life; rest on one to read its story."
      >
        {fragments.map((f) => (
          <button
            key={f.node.id}
            type="button"
            className={`${styles.frag} ${styles.fragBtn}`}
            data-tier={f.tier}
            data-active={active === f.node.id ? "true" : undefined}
            aria-expanded={active === f.node.id}
            aria-describedby={active === f.node.id ? "hf-card" : undefined}
            aria-label={`${f.text}. ${KIND_LABEL[f.node.kind]}.`}
            onClick={(e) => {
              e.stopPropagation()
              open(f.node.id)
            }}
            onPointerEnter={(e) => {
              if (e.pointerType !== "touch") open(f.node.id)
            }}
            onPointerLeave={(e) => {
              if (e.pointerType !== "touch") scheduleHide()
            }}
            onFocus={() => open(f.node.id)}
            onBlur={blurAway}
          >
            {f.text}
          </button>
        ))}
      </div>

      {/* The story card. One per open word, anchored beside it by the
          frame loop, hoverable so the link inside is always reachable.
          Portaled above the page content; see cardMount. */}
      {cardMount?.current
        ? createPortal(
            <div className={styles.cardLayer} aria-live="polite">
              {activeNode ? (
                <div
                  key={activeNode.id}
                  ref={cardRef}
                  id="hf-card"
                  className={styles.card}
                  role="group"
                  aria-label={`${activeNode.label}: ${KIND_LABEL[activeNode.kind]}`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "touch") {
                      cardHotRef.current = true
                      clearHide()
                    }
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== "touch") {
                      cardHotRef.current = false
                      scheduleHide()
                    }
                  }}
                  onFocus={clearHide}
                  onBlur={blurAway}
                >
                  <div className={styles.cardIn}>
                    {/* Touch has no "walk away", so the card carries an
                        explicit way out. Rendered always, shown only where
                        the pointer cannot hover (CSS); the approved
                        desktop card is unchanged. */}
                    <button
                      type="button"
                      className={styles.cardClose}
                      aria-label={`Close ${activeNode.label}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        suppressRef.current = activeNode.id
                        close()
                      }}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                    <p className={styles.cardKind}>{KIND_LABEL[activeNode.kind]}</p>
                    <p className={styles.cardTitle}>{activeNode.label}</p>
                    <p className={styles.cardStory}>{activeNode.story}</p>
                    {activeNode.link ? (
                      <p className={styles.cardMeta}>
                        <a
                          className={styles.cardLink}
                          href={activeNode.link.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {activeNode.link.label}
                        </a>
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>,
            cardMount.current,
          )
        : null}
    </div>
  )
}

/**
 * Distance from a box centre to its boundary along a unit direction. Used to
 * park hairline endpoints just outside each word instead of through it.
 */
function boxT(ux: number, uy: number, hw: number, hh: number) {
  if (hw <= 0 && hh <= 0) return 0
  const tx = Math.abs(ux) > 1e-4 ? hw / Math.abs(ux) : Infinity
  const ty = Math.abs(uy) > 1e-4 ? hh / Math.abs(uy) : Infinity
  return Math.min(tx, ty)
}
