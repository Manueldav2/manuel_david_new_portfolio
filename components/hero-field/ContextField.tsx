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
import { KIND_LABEL, edges, nodeById } from "./graph"
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
const MAX_AWAKE = 24
const CURSOR_LINKS = 4
/** Gap left between the edge of a word and the hairline that reaches for it. */
const NODE_PAD = 7
/** How long the card lingers after the pointer leaves word or card. */
const GRACE_MS = 280

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
  mid: { alpha: [0.54, 0.34], size: [15.5, 12.5], depth: [0.2, 0.7] },
  low: { alpha: [0.4, 0.22], size: [12.5, 10], depth: [0.48, 1] },
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

/** Padding kept around each word, and around the page's own type. */
const WORD_PAD_X = 22
const WORD_PAD_Y = 9
const TYPE_PAD_X = 18
const TYPE_PAD_Y = 12

type Box = [x0: number, y0: number, x1: number, y1: number]

const hits = (a: Box, b: Box) =>
  a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]

export default function ContextField({
  className,
  onReady,
  cardMount,
}: {
  className?: string
  onReady?: () => void
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
    setActive(null)
  }
  const closeRef = useRef(close)
  closeRef.current = close
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
      if (e.key === "Escape") closeRef.current()
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
    return pickFragments(w < 720 ? 18 : w < 1100 ? 30 : 40)
  }, [])

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
    for (const [a, b] of edges) {
      const ia = idxOfNode.get(a)
      const ib = idxOfNode.get(b)
      if (ia !== undefined && ib !== undefined) {
        restA.push(ia)
        restB.push(ib)
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
    // 1 when placement failed and the word sits out this layout entirely.
    const parked = new Uint8Array(COUNT)

    // Seeded: depth, brightness and size are part of the curated composition
    // (size feeds the measured boxes the placement is built from), so they
    // must come out identical on every load.
    const attrRng = mulberry32(LAYOUT_SEED)
    for (let i = 0; i < COUNT; i++) {
      phase[i] = attrRng()
      const tier = TIER[fragments[i].tier]
      const t = attrRng()
      depth[i] = mix(tier.depth[0], tier.depth[1], t)
      baseA[i] = mix(tier.alpha[0], tier.alpha[1], t)
      const narrowK = fragments[i].tier === "key" ? 0.7 : 0.86
      const size = mix(tier.size[0], tier.size[1], t) * (narrow ? narrowK : 1)
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
    const awakeIdx = new Int32Array(COUNT)
    const awakeW = new Float32Array(COUNT)
    const nearIdx = new Int32Array(CURSOR_LINKS)
    const nearDist = new Float32Array(CURSOR_LINKS)

    let vw = 1
    let vh = 1
    let radius = 300
    let linkRadius = 220
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
    /* Base positions live in normalised space so small resizes just      */
    /* rescale the field. Placement is rejection sampling against two     */
    /* sets of boxes: the words already placed, and the page's own type.  */
    /*                                                                   */
    /* Sampling is biased, not uniform. The key anchors seed a handful    */
    /* of cluster centres; every later word tries to land near a placed   */
    /* word it is actually related to in the graph, and falls back to a   */
    /* cluster. Density gathers where the life gathers, and the space     */
    /* between clusters is real negative space instead of even scatter.   */
    /*                                                                   */
    /* The keep-out boxes are read straight off the DOM rather than       */
    /* hard-coded as fractions of the viewport, so the field gets out of  */
    /* the way of the real headline at whatever size it actually wrapped  */
    /* to. Nothing readable ever has a stray word sitting behind it.      */
    /* ---------------------------------------------------------------- */

    // Cluster centres, normalised. Chosen against the hero block (which
    // holds the left-centre): mass upper-right, right, below-right, and a
    // quieter shoulder above the block, so the composition is a diagonal.
    const CLUSTERS: readonly (readonly [number, number])[] = [
      [0.55, -0.5],
      [0.72, 0.18],
      [0.05, 0.66],
      [-0.55, 0.68],
      [-0.35, -0.62],
    ]

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
      return keepouts
    }

    const place = () => {
      // Re-seeded on every call: given the same measured boxes and the same
      // viewport, place() is a pure function of LAYOUT_SEED. Running it twice
      // is idempotent, so no code path can re-roll the composition.
      const rand = mulberry32(LAYOUT_SEED ^ 0x9e3779b9)
      // Approximate gaussian in [-1.5, 1.5]: sums keep clusters dense in the
      // middle with soft edges instead of hard discs.
      const gauss = () => rand() + rand() + rand() - 1.5

      const keepouts = gatherKeepouts()
      const placed: Box[] = []
      const cand: Box = [0, 0, 0, 0]

      for (let i = 0; i < COUNT; i++) {
        const hw = halfW[i]
        const hh = halfH[i]
        // Keep the whole word inside the frame, not just its centre.
        const spanX = vw * 0.5 - 26
        const spanY = vh * 0.5 - 24
        const limX = spanX > 0 ? Math.min(1, (vw * 0.5 - 16 - hw) / spanX) : 0
        const limY = spanY > 0 ? Math.min(1, (vh * 0.5 - 14 - hh) / spanY) : 0

        const isKey = fragments[i].tier === "key"
        // Related words already on the board, to gather near.
        const kin: number[] = []
        for (const j of nbr[i]) if (j < i && !parked[j]) kin.push(j)

        let found = false
        let fx = 0
        let fy = 0
        let okX = 0
        let okY = 0

        for (let k = 0; k < 420 && !found; k++) {
          // Widen the net as attempts fail, so tight clusters still resolve.
          const relax = 1 + k / 90
          let nx: number
          let ny: number
          if (isKey) {
            // Anchors seed the clusters, spread across them.
            const c = CLUSTERS[i % CLUSTERS.length]
            nx = c[0] + gauss() * 0.3 * relax
            ny = c[1] + gauss() * 0.28 * relax
          } else if (kin.length > 0 && k % 4 !== 3) {
            // Gather near a related word; every 4th try goes wide so a
            // crowded cluster can still spill somewhere honest.
            const j = kin[(rand() * kin.length) | 0]
            nx = tbx[j] + gauss() * 0.27 * relax
            ny = tby[j] + gauss() * 0.28 * relax
          } else {
            const c = CLUSTERS[((rand() * CLUSTERS.length) | 0)]
            nx = c[0] + gauss() * 0.4 * relax
            ny = c[1] + gauss() * 0.4 * relax
          }
          if (nx < -limX) nx = -limX
          else if (nx > limX) nx = limX
          if (ny < -limY) ny = -limY
          else if (ny > limY) ny = limY

          const x = toX(nx)
          const y = toY(ny)
          cand[0] = x - hw - WORD_PAD_X
          cand[1] = y - hh - WORD_PAD_Y
          cand[2] = x + hw + WORD_PAD_X
          cand[3] = y + hh + WORD_PAD_Y

          let blocked = false
          for (let b = 0; b < keepouts.length; b++) {
            if (hits(cand, keepouts[b])) {
              blocked = true
              break
            }
          }
          if (blocked) continue
          for (let b = 0; b < placed.length; b++) {
            if (hits(cand, placed[b])) {
              blocked = true
              break
            }
          }
          if (blocked) continue

          found = true
          fx = nx
          fy = ny
          okX = x
          okY = y
        }

        if (!found) {
          // Nothing fitted. Park it out of the layout rather than stack it on
          // the headline; a missing fragment costs less than an unreadable
          // page. Parked words render at zero opacity and join no lines.
          parked[i] = 1
          bx[i] = 0
          by[i] = 0
          tbx[i] = 0
          tby[i] = 0
          continue
        }

        parked[i] = 0
        bx[i] = fx
        by[i] = fy
        tbx[i] = fx
        tby[i] = fy
        placed.push([
          okX - hw - WORD_PAD_X,
          okY - hh - WORD_PAD_Y,
          okX + hw + WORD_PAD_X,
          okY + hh + WORD_PAD_Y,
        ])
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
        const limX = spanX > 0 ? Math.min(1, (vw * 0.5 - 16 - hw) / spanX) : 0
        const limY = spanY > 0 ? Math.min(1, (vh * 0.5 - 14 - hh) / spanY) : 0
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
      linkRadius = radius * 0.8
      // Resting hairlines fade with span: nearby relations whisper, a
      // relation stretched across the whole frame all but disappears.
      restNear = Math.min(vw, vh) * 0.24
      restFar = Math.min(vw, vh) * 1.5
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
          ambientIdx = Math.floor(Math.random() * COUNT)
          ambientAge = 0
          ambientWait = 7 + Math.random() * 8
        }
      }

      let awakeCount = 0
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
          continue
        }

        bx[i] += (tbx[i] - bx[i]) * settleK
        by[i] += (tby[i] - by[i]) * settleK

        const ph = phase[i]
        const nx = bx[i] + Math.sin(clock * 0.107 + ph * 6.2832) * 0.03
        const ny = by[i] + Math.cos(clock * 0.089 + ph * 5.1) * 0.034

        let x = vw * 0.5 + nx * (vw * 0.5 - 26)
        let y =
          vh * 0.5 + ny * (vh * 0.5 - 24) + driftY * (0.4 + depth[i] * 0.8)
        // Depth parallax: the whole field leans away from the cursor a few
        // pixels, near words more than far ones, so the scatter reads as a
        // volume rather than a plane.
        const par = (0.32 - depth[i]) * 0.02
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

        if (wake[i] > 0.02) {
          awakeIdx[awakeCount] = i
          awakeW[awakeCount] = wake[i]
          awakeCount++
        }

        // The single fragment actually under the cursor takes the ember. One
        // word at a time, so the accent stays an event and not a colour.
        if (wake[i] > 0.82 && d < bestLitD && vis[i] > 0.5) {
          bestLitD = d
          bestLit = i
        }

        if (d < nearDist[CURSOR_LINKS - 1] && target > 0.04) {
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

      // Cap the awake set by brightness so the pair loop stays bounded.
      if (awakeCount > MAX_AWAKE) {
        for (let a = 1; a < awakeCount; a++) {
          const ki = awakeIdx[a]
          const kw = awakeW[a]
          let b = a - 1
          while (b >= 0 && awakeW[b] < kw) {
            awakeW[b + 1] = awakeW[b]
            awakeIdx[b + 1] = awakeIdx[b]
            b--
          }
          awakeW[b + 1] = kw
          awakeIdx[b + 1] = ki
        }
        awakeCount = MAX_AWAKE
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

      /**
       * Writes one hairline between two nodes, trimmed to stop clear of each
       * word's box so the line reads as a connection between two pieces of
       * type rather than a strike-through.
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

        const v = seg * 6
        linePositions[v] = ax + ux * tA
        linePositions[v + 1] = ay + uy * tA
        linePositions[v + 2] = 0
        linePositions[v + 3] = bxp - ux * tB
        linePositions[v + 4] = byp - uy * tB
        linePositions[v + 5] = 0
        const t = seg * 2
        lineAlpha[t] = alpha
        lineAlpha[t + 1] = alpha
        lineTint[t] = tintA
        lineTint[t + 1] = tintB
        seg++
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
      for (let e = 0; e < restCount && seg < MAX_SEGMENTS; e++) {
        const i = restA[e]
        const j = restB[e]
        if (parked[i] || parked[j]) continue
        const dx = px[i] - px[j]
        const dy = py[i] - py[j]
        const d = Math.sqrt(dx * dx + dy * dy)
        // Visible at rest on purpose: the web is the structure the page is
        // about, so it reads at arm's length, not only under the cursor.
        // Mid-descent it brightens further (web > 1) as you pass through.
        const restAlpha = 0.2 * smoothstep(restFar * web, restNear, d) * web
        const glow = wake[i] * wake[j] * 0.3
        const alpha = (restAlpha + glow) * Math.min(vis[i], vis[j]) * dim
        if (alpha < 0.006) continue
        push(
          px[i], py[i], halfW[i] * sc[i], halfH[i] * sc[i],
          px[j], py[j], halfW[j] * sc[j], halfH[j] * sc[j],
          alpha, 0, 0,
        )
      }

      /**
       * Fragment to fragment: the recognition itself.
       *
       * Every awake fragment reaches for its two nearest awake neighbours and
       * nothing else. Linking every pair inside a radius makes a hairball that
       * reads as generic particle wallpaper; capping the degree makes a graph
       * you can follow, which is the difference between decoration and an
       * argument about relationships.
       */
      for (let a = 0; a < awakeCount && seg < MAX_SEGMENTS; a++) {
        const i = awakeIdx[a]
        const wi = wake[i]

        let n0 = -1
        let d0 = Infinity
        let n1 = -1
        let d1 = Infinity

        for (let b = 0; b < awakeCount; b++) {
          if (b === a) continue
          const j = awakeIdx[b]
          const dx = px[i] - px[j]
          const dy = py[i] - py[j]
          const dij = Math.sqrt(dx * dx + dy * dy)
          if (dij >= linkRadius) continue
          if (dij < d0) {
            d1 = d0
            n1 = n0
            d0 = dij
            n0 = j
          } else if (dij < d1) {
            d1 = dij
            n1 = j
          }
        }

        for (let k = 0; k < 2 && seg < MAX_SEGMENTS; k++) {
          const j = k === 0 ? n0 : n1
          const dij = k === 0 ? d0 : d1
          if (j < 0) continue
          const alpha =
            wi *
            wake[j] *
            smoothstep(linkRadius, linkRadius * 0.14, dij) *
            0.82 *
            Math.min(vis[i], vis[j]) *
            dim
          if (alpha < 0.01) continue
          push(
            px[i], py[i], halfW[i] * sc[i], halfH[i] * sc[i],
            px[j], py[j], halfW[j] * sc[j], halfH[j] * sc[j],
            alpha, 0, 0,
          )
        }
      }

      // Cursor tethers: the field reaching back toward whoever is reading.
      for (let n = 0; n < CURSOR_LINKS && seg < MAX_SEGMENTS; n++) {
        const i = nearIdx[n]
        if (i < 0) continue
        const alpha =
          wake[i] * 0.6 * smoothstep(radius, radius * 0.1, nearDist[n]) * vis[i] * dim
        if (alpha < 0.008) continue
        push(cx, cy, 0, 0, px[i], py[i], halfW[i] * sc[i], halfH[i] * sc[i], alpha, 0.9, 0.1)
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
                    if (e.pointerType !== "touch") clearHide()
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== "touch") scheduleHide()
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
