"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { FocusEvent as ReactFocusEvent, RefObject } from "react"
import { createPortal } from "react-dom"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  LineSegments,
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

const MAX_SEGMENTS = 240
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

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

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
const WORD_PAD_X = 22
const WORD_PAD_Y = 12
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
export type FieldVariant = "base" | "serif" | "grotesk" | "mono"

const FIELD_TUNE: Record<
  FieldVariant,
  { counts: [phone: number, mid: number, wide: number]; size: { key: number; mid: number; low: number } }
> = {
  base: { counts: [20, 36, 48], size: { key: 1, mid: 1, low: 1 } },
  serif: { counts: [20, 36, 48], size: { key: 1.18, mid: 1.05, low: 0.98 } },
  grotesk: { counts: [22, 38, 48], size: { key: 1.06, mid: 1.05, low: 1.05 } },
  mono: { counts: [16, 28, 40], size: { key: 1.04, mid: 0.94, low: 0.95 } },
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
  // and the card should not flip sides frame to frame).
  const placeRef = useRef<{ mode: 0 | 1 | 2; decided: boolean }>({ mode: 0, decided: false })

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
      window.matchMedia("(pointer: coarse)").matches
    const narrow = window.innerWidth < 720

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

    // Scratch for clipping hairlines around label boxes.
    const blockT0 = new Float32Array(64)
    const blockT1 = new Float32Array(64)

    // Seeded: depth, brightness and size are part of the curated composition
    // (size feeds the measured boxes the placement is built from), so they
    // must come out identical on every load.
    const attrRng = mulberry32(LAYOUT_SEED)
    const tune = FIELD_TUNE[variant].size
    for (let i = 0; i < COUNT; i++) {
      phase[i] = attrRng()
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
      const size =
        (10.5 + 1.05 * w * w) *
        (0.96 + t * 0.08) *
        (narrow ? narrowK : 1) *
        tune[fragments[i].tier]
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

    const lineMat = new ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      uniforms: {
        uBase: { value: new Color("#c9dcd6") },
        uEmber: { value: new Color("#e2552c") },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    })

    const lines = new LineSegments(lineGeo, lineMat)
    lines.frustumCulled = false
    scene.add(lines)

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
        const r = (node as HTMLElement).getBoundingClientRect()
        if (r.width < 2 || r.height < 2) return
        keepouts.push([
          r.left + sx - TYPE_PAD_X,
          r.top + sy - TYPE_PAD_Y,
          r.right + sx + TYPE_PAD_X,
          r.bottom + sy + TYPE_PAD_Y,
        ])
      })
      typeBoxes = keepouts
      return keepouts
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

    const place = () => {
      const keepouts = gatherKeepouts()
      const spanX = vw * 0.5 - 26
      const spanY = vh * 0.5 - 24
      if (spanX <= 0 || spanY <= 0) return

      // 1) The authored composition, straight from the data (graph y is
      //    up-positive; the screen's is not).
      for (let i = 0; i < COUNT; i++) {
        parked[i] = 0
        tbx[i] = fragments[i].node.x
        tby[i] = -fragments[i].node.y
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
            if (ox < oy) {
              const dir = ax < bx2 ? -1 : ax > bx2 ? 1 : i < j ? -1 : 1
              const d = ((ox * 0.5 + 0.5) * dir) / spanX
              tbx[i] += d
              tbx[j] -= d
            } else {
              const dir = ay < by2 ? -1 : ay > by2 ? 1 : i < j ? -1 : 1
              const d = ((oy * 0.5 + 0.5) * dir) / spanY
              tby[i] += d
              tby[j] -= d
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

      for (let i = 0; i < COUNT; i++) {
        bx[i] = tbx[i]
        by[i] = tby[i]
      }
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
    }

    let laidOut = false

    const resize = () => {
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
      restFar = Math.min(vw, vh) * 1.05
      // The channel the reading column carves through the field once you
      // scroll past the hero.
      bandInner = Math.min(360, vw * 0.34)
      bandOuter = bandInner + 250
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

    let raf = 0
    let last = performance.now()
    // The still frame is composed, not arbitrary: this is the point on the idle
    // path where the ghost cursor sits above the headline and to the right of
    // centre, so the reduced-motion constellation lands in clear space.
    let clock = reduced ? 14 : 0
    let disposed = false

    const step = (dt: number) => {
      clock += dt

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
      // margins so body copy is never read through drifting words.
      const past = smoothstep(vh * 0.3, vh * 1.05, scrollY)
      const dim = 1 - 0.5 * past
      const driftY = 26 * Math.sin(scrollY / (vh * 1.7))
      // Vanishing point for the descent: near centre, a breath toward the
      // field's mass, so the frame empties evenly instead of hollowing out
      // one side while words pile into the other.
      const vpx = vw * 0.53
      const vpy = vh * 0.45
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
        const par = (0.32 - depth[i]) * 0.014
        x += (cx - vw * 0.5) * par
        y += (cy - vh * 0.5) * par * 0.7

        // The descent. Scale is relative to rest (travel 0 leaves the
        // measured layout untouched); as the camera advances, words ahead
        // swell and spread from the vanishing point, and words the camera
        // has passed blow up and fade out behind you.
        const depthZ = 0.12 + depth[i] * 0.88
        const rel = depthZ - camZ
        let s = (PERSP + depthZ) / (PERSP + Math.max(rel, -PERSP * 0.62))
        if (s > 3.2) s = 3.2
        // Words stay lit while they swell past the camera and only die once
        // they are genuinely behind you; the fly-past is the point.
        const passFade = smoothstep(-0.36, -0.04, rel)
        // Positions spread slower than glyphs swell, so the frame stays
        // populated through the middle of the descent instead of emptying
        // the moment perspective kicks in.
        const spreadS = 1 + (s - 1) * 0.72
        x = vpx + (x - vpx) * spreadS
        y = vpy + (y - vpy) * spreadS
        sc[i] = s

        if (hold > 0) {
          const kx = Math.min(vw - halfW[i] - 8, Math.max(halfW[i] + 8, x))
          const ky = Math.min(vh - halfH[i] - 6, Math.max(halfH[i] + 6, y))
          x = mix(x, kx, hold)
          y = mix(y, ky, hold)
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

        // Reading channel: below the hero the field steps aside for the text.
        const c = mix(1, smoothstep(bandInner, bandOuter, Math.abs(x - vw * 0.5)), past)
        chan[i] = c
        vis[i] = c * passFade

        const ww = wake[i]
        const lit = ww * ww * (3 - 2 * ww)
        // Approaching words brighten a little with their size, so the
        // descent reads as things coming to meet you, not just inflating.
        let o = (baseA[i] + lit * (0.96 - baseA[i])) * vis[i] * dim * (1 + (s - 1) * 0.4)
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
        const wantId =
          nearest >= 0 && nearestD < openR && vis[nearest] > 0.3
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
      }

      /* Card ---------------------------------------------------------- */
      // Anchored beside its word, decided once per open, clamped every
      // frame so the drifting anchor can never carry it off screen.
      const cardEl = cardRef.current
      if (actIdx >= 0 && cardEl) {
        const cw2 = cardEl.offsetWidth
        const ch2 = cardEl.offsetHeight
        const axp = px[actIdx]
        const ayp = py[actIdx]
        const M = 12
        const GAP = halfH[actIdx] * sc[actIdx] + 12
        const place2 = placeRef.current
        if (!place2.decided) {
          if (ayp + GAP + ch2 <= vh - M) place2.mode = 0
          else if (ayp - GAP - ch2 >= M) place2.mode = 1
          else place2.mode = 2
          place2.decided = true
        }
        let top: number
        let leftPx: number
        if (place2.mode === 2) {
          // Viewport shorter than card + clearance: sit beside the word.
          top = Math.min(Math.max(M, ayp - ch2 / 2), vh - M - ch2)
          leftPx =
            axp < vw / 2 ? axp + halfW[actIdx] + 18 : axp - halfW[actIdx] - 18 - cw2
        } else {
          top = place2.mode === 0 ? ayp + GAP : ayp - GAP - ch2
          top = Math.min(Math.max(M, top), vh - M - ch2)
          leftPx = axp - cw2 * 0.32
        }
        leftPx = Math.min(Math.max(M, leftPx), vw - M - cw2)
        cardEl.style.transform = `translate3d(${leftPx.toFixed(1)}px, ${top.toFixed(1)}px, 0)`
        cardEl.style.visibility = "visible"
      }

      let seg = 0

      /** Raw segment write. Everything above it decides WHAT to draw. */
      const writeSeg = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        alpha: number,
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
        lineAlpha[t] = alpha
        lineAlpha[t + 1] = alpha
        lineTint[t] = tint0
        lineTint[t + 1] = tint1
        seg++
      }

      /**
       * Writes one hairline between two nodes, trimmed to stop clear of each
       * word's box so the line reads as a connection between two pieces of
       * type rather than a strike-through, and CLIPPED around every other
       * visible label it would cross: the line ducks behind a word with the
       * same clearance the endpoints get, so no hairline ever strikes
       * through a label anywhere along its length. skipA/skipB are the
       * endpoint indices (-1 for the cursor), which must not occlude their
       * own line.
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
          writeSeg(sx, sy, sx + rx, sy + ry, alpha, tintA, tintB)
          return
        }

        // Sort the blocked intervals (insertion; nb is tiny), then draw the
        // gaps between them. Slivers shorter than MIN_SUB_PX are dropped.
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
        let cur = 0
        for (let q = 0; q <= nb; q++) {
          const gapEnd = q === nb ? 1 : blockT0[q]
          if (gapEnd - cur >= minT) {
            writeSeg(
              sx + rx * cur,
              sy + ry * cur,
              sx + rx * gapEnd,
              sy + ry * gapEnd,
              alpha,
              mix(tintA, tintB, cur),
              mix(tintA, tintB, gapEnd),
            )
          }
          if (q < nb && blockT1[q] > cur) cur = blockT1[q]
          if (cur >= 1) break
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
        // spine or belongs to the open card): fewer, better lines.
        const ang = Math.atan2(py[j] - py[i], px[j] - px[i])
        if (!isActive && !strong) {
          let bunched = false
          for (let q = 0; q < restDeg[i] && !bunched; q++) {
            const da = Math.abs(ang - restAng[i * REST_DEG_MAX + q]) % (Math.PI * 2)
            if (Math.min(da, Math.PI * 2 - da) < MIN_EDGE_ANGLE) bunched = true
          }
          const angJ = ang > 0 ? ang - Math.PI : ang + Math.PI
          for (let q = 0; q < restDeg[j] && !bunched; q++) {
            const da = Math.abs(angJ - restAng[j * REST_DEG_MAX + q]) % (Math.PI * 2)
            if (Math.min(da, Math.PI * 2 - da) < MIN_EDGE_ANGLE) bunched = true
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
          : (strong ? 0.46 : 0.22) *
            smoothstep(restFar * web * (strong ? 1.7 : 1), restNear, d) *
            web
        let alpha = (restAlpha + glow) * Math.min(vis[i], vis[j]) * dim
        if (isActive) {
          const floor = 0.32 * Math.min(vis[i], vis[j]) * dim
          if (alpha < floor) alpha = floor
        }
        if (alpha < 0.008) continue
        if (restDeg[i] < REST_DEG_MAX) restAng[i * REST_DEG_MAX + restDeg[i]] = ang
        if (restDeg[j] < REST_DEG_MAX) {
          restAng[j * REST_DEG_MAX + restDeg[j]] =
            ang > 0 ? ang - Math.PI : ang + Math.PI
        }
        restDeg[i]++
        restDeg[j]++
        push(
          px[i], py[i], halfW[i] * sc[i], halfH[i] * sc[i],
          px[j], py[j], halfW[j] * sc[j], halfH[j] * sc[j],
          alpha, 0, 0, i, j,
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
      for (let n = 0; n < CURSOR_LINKS && seg < MAX_SEGMENTS; n++) {
        const i = nearIdx[n]
        if (i < 0) continue
        const alpha =
          (0.07 +
            0.12 * smoothstep(radius * 1.9, radius * 0.25, nearDist[n]) +
            wake[i] * 0.5 * smoothstep(radius, radius * 0.1, nearDist[n])) *
          vis[i] *
          dim
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
          // Fonts landed after the failsafe already revealed the field:
          // correct the measured boxes (line trimming, centring) but keep
          // every position. A late font never rearranges the room.
          else measure()
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
      lineMat.dispose()
      if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
      }
      if (canvas?.parentNode) canvas.parentNode.removeChild(canvas)
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
