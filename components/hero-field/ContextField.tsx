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
 * Resting brightness and pixel size per tier, near depth then far depth.
 *
 * The resting values are low on purpose. The whole gesture depends on the gap
 * between texture and fact: if the field is already readable there is nothing
 * for the cursor to reveal, and it collapses back into wallpaper.
 */
const TIER = {
  key: { alpha: [0.29, 0.17], size: [16.5, 13.5], depth: [0, 0.34] },
  mid: { alpha: [0.18, 0.09], size: [13.5, 10.5], depth: [0.2, 0.7] },
  low: { alpha: [0.13, 0.062], size: [12, 9.5], depth: [0.48, 1] },
} as const

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

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches
    const narrow = window.innerWidth < 720

    const bx = new Float32Array(COUNT)
    const by = new Float32Array(COUNT)
    const depth = new Float32Array(COUNT)
    const phase = new Float32Array(COUNT)
    const wake = new Float32Array(COUNT)
    const px = new Float32Array(COUNT)
    const py = new Float32Array(COUNT)
    const halfW = new Float32Array(COUNT)
    const halfH = new Float32Array(COUNT)
    const baseA = new Float32Array(COUNT)
    const chan = new Float32Array(COUNT)
    // 1 when placement failed and the word sits out this layout entirely.
    const parked = new Uint8Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      phase[i] = Math.random()
      const tier = TIER[fragments[i].tier]
      const t = Math.random()
      depth[i] = mix(tier.depth[0], tier.depth[1], t)
      baseA[i] = mix(tier.alpha[0], tier.alpha[1], t)
      const size = mix(tier.size[0], tier.size[1], t) * (narrow ? 0.86 : 1)
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
    /* The keep-out boxes are read straight off the DOM rather than       */
    /* hard-coded as fractions of the viewport, so the field gets out of  */
    /* the way of the real headline at whatever size it actually wrapped  */
    /* to. Nothing readable ever has a stray word sitting behind it.      */
    /* ---------------------------------------------------------------- */
    const place = () => {
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

        let okX = 0
        let okY = 0
        let bestX = 0
        let bestY = 0
        let bestClear = -Infinity
        let found = false

        for (let k = 0; k < 420 && !found; k++) {
          const nx = (Math.random() * 2 - 1) * limX
          const ny = (Math.random() * 2 - 1) * limY
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

          let clear = Infinity
          for (let b = 0; b < placed.length; b++) {
            if (hits(cand, placed[b])) {
              clear = -1
              break
            }
            const dx = Math.abs(x - (placed[b][0] + placed[b][2]) * 0.5)
            const dy = Math.abs(y - (placed[b][1] + placed[b][3]) * 0.5) * 2.6
            const d = dx * dx + dy * dy
            if (d < clear) clear = d
          }

          if (clear < 0) {
            continue
          }
          if (clear > bestClear) {
            bestClear = clear
            bestX = nx
            bestY = ny
            okX = x
            okY = y
          }
          // Take the first candidate that clears everything with room to
          // spare; otherwise keep hunting for the roomiest one.
          if (clear > 34000 || k > 120) found = true
        }

        if (bestClear === -Infinity) {
          // Nothing fitted. Park it out of the layout rather than stack it on
          // the headline; a missing fragment costs less than an unreadable
          // page. Parked words render at zero opacity and join no lines.
          parked[i] = 1
          bx[i] = 0
          by[i] = 0
          continue
        }

        parked[i] = 0
        bx[i] = bestX
        by[i] = bestY
        placed.push([
          okX - hw - WORD_PAD_X,
          okY - hh - WORD_PAD_Y,
          okX + hw + WORD_PAD_X,
          okY + hh + WORD_PAD_Y,
        ])
      }
    }

    let placedW = 0
    let placedH = 0

    const resize = () => {
      vw = host.clientWidth || window.innerWidth
      vh = host.clientHeight || window.innerHeight
      if (renderer) {
        renderer.setSize(vw, vh, false)
        camera.left = 0
        camera.right = vw
        camera.top = 0
        camera.bottom = vh
        camera.updateProjectionMatrix()
      }
      // Recognition radius scales with the short axis so a constellation is
      // the same relative size on a phone as on a display.
      radius = Math.min(vw, vh) * (coarse ? 0.44 : 0.33)
      linkRadius = radius * 0.8
      // Resting hairlines fade with span: nearby relations whisper, a
      // relation stretched across the whole frame all but disappears.
      restNear = Math.min(vw, vh) * 0.24
      restFar = Math.min(vw, vh) * 0.95
      // The channel the reading column carves through the field once you
      // scroll past the hero.
      bandInner = Math.min(360, vw * 0.34)
      bandOuter = bandInner + 250
      placeRef.current.decided = false
      measure()
      // Re-place only on a real change of shape. Reshuffling the field while
      // someone drags a window edge would be gratuitous.
      if (
        Math.abs(vw - placedW) > placedW * 0.22 ||
        Math.abs(vh - placedH) > placedH * 0.22
      ) {
        placedW = vw
        placedH = vh
        place()
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
      // How far past the hero we are. Drives the retreat of the field to the
      // margins so body copy is never read through drifting words.
      const past = smoothstep(vh * 0.12, vh * 0.8, scrollY)
      const dim = 1 - 0.45 * past
      const spread = 1 + 0.1 * past
      const driftY = 26 * Math.sin(scrollY / (vh * 1.7))

      // The card belongs to the hero. Once the reading channel takes over,
      // it leaves with the labels' legibility.
      if (actIdx >= 0 && past > 0.45) {
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
          continue
        }

        const ph = phase[i]
        const nx = bx[i] + Math.sin(clock * 0.107 + ph * 6.2832) * 0.03
        const ny = by[i] + Math.cos(clock * 0.089 + ph * 5.1) * 0.034

        let x = vw * 0.5 + nx * spread * (vw * 0.5 - 26)
        let y =
          vh * 0.5 + ny * (vh * 0.5 - 24) + driftY * (0.4 + depth[i] * 0.8)
        // Depth parallax: the whole field leans away from the cursor a few
        // pixels, near words more than far ones, so the scatter reads as a
        // volume rather than a plane.
        const par = (0.32 - depth[i]) * 0.02
        x += (cx - vw * 0.5) * par
        y += (cy - vh * 0.5) * par * 0.7
        x = Math.min(vw - halfW[i] - 8, Math.max(halfW[i] + 8, x))
        y = Math.min(vh - halfH[i] - 6, Math.max(halfH[i] + 6, y))

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

        const ww = wake[i]
        const lit = ww * ww * (3 - 2 * ww)
        const o = (baseA[i] + lit * (0.94 - baseA[i])) * c * dim
        const el = els[i]
        el.style.transform = `translate3d(${(x - halfW[i]).toFixed(1)}px, ${(
          y - halfH[i]
        ).toFixed(1)}px, 0)`
        el.style.opacity = o.toFixed(3)

        if (wake[i] > 0.02) {
          awakeIdx[awakeCount] = i
          awakeW[awakeCount] = wake[i]
          awakeCount++
        }

        // The single fragment actually under the cursor takes the ember. One
        // word at a time, so the accent stays an event and not a colour.
        if (wake[i] > 0.82 && d < bestLitD && c > 0.5) {
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
        const GAP = halfH[actIdx] + 12
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
        const restAlpha = 0.05 * smoothstep(restFar, restNear, d)
        const glow = wake[i] * wake[j] * 0.3
        const alpha = (restAlpha + glow) * Math.min(chan[i], chan[j]) * dim
        if (alpha < 0.006) continue
        push(px[i], py[i], halfW[i], halfH[i], px[j], py[j], halfW[j], halfH[j], alpha, 0, 0)
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
            Math.min(chan[i], chan[j]) *
            dim
          if (alpha < 0.01) continue
          push(px[i], py[i], halfW[i], halfH[i], px[j], py[j], halfW[j], halfH[j], alpha, 0, 0)
        }
      }

      // Cursor tethers: the field reaching back toward whoever is reading.
      for (let n = 0; n < CURSOR_LINKS && seg < MAX_SEGMENTS; n++) {
        const i = nearIdx[n]
        if (i < 0) continue
        const alpha =
          wake[i] * 0.6 * smoothstep(radius, radius * 0.1, nearDist[n]) * chan[i] * dim
        if (alpha < 0.008) continue
        push(cx, cy, 0, 0, px[i], py[i], halfW[i], halfH[i], alpha, 0.9, 0.1)
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
    // this settles, so the reshuffle is never seen.
    const settle = () => {
      if (disposed) return
      measure()
      placedW = 0
      placedH = 0
      resize()
      if (reduced) {
        step(0)
        step(0)
      }
      readyRef.current?.()
    }

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(settle)
      // Belt and braces: never leave the field invisible if fonts stall.
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
