"use client"

import { useEffect, useRef } from "react"

import { KIND_LABEL, edges, neighbours, nodes, revealOrder } from "./graph"
import styles from "./hero-field.module.css"

/**
 * THE MIND
 *
 * The graph from graph.ts rendered as a slowly breathing, two-lobed volume:
 * a person's head drawn as a map. Labels are real DOM buttons (crisp at any
 * DPI, keyboard reachable, hover and focus for free); the tissue underneath
 * them, the dust that gives the lobes mass, the causal edges and the pulses
 * that walk them, is one 2D canvas. No three.js, no assets, nothing fetched.
 *
 * At rest it is fully legible: every label readable, every edge visible,
 * ambient pulses retracing the spine of the story. Selection is deliberate.
 * Click or focus a node and its neighbourhood lifts while the rest recedes,
 * pulses run outward along its real edges, and the story panel (owned by the
 * parent) tells you what that node actually is.
 *
 * Nothing in the frame loop allocates, and selection never re-runs the
 * effect: the loop reads the current selection through a ref.
 */

const PERSP = 3.4
const BONE = "236,233,226"

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Deterministic PRNG so the dust is identical on every load. */
function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Unlabelled points that give the two lobes their mass. Texture, not data. */
const DUST = (() => {
  const rand = mulberry(20260729)
  const pts: { x: number; y: number; z: number; a: number }[] = []
  for (let i = 0; i < 96; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const u = rand() * 2 - 1
    const th = rand() * Math.PI * 2
    const r = Math.cbrt(rand())
    const ring = Math.sqrt(1 - u * u)
    pts.push({
      x: side * 0.47 + Math.cos(th) * ring * r * 0.48,
      y: 0.05 + u * r * 0.8,
      z: Math.sin(th) * ring * r * 0.54,
      a: 0.09 + rand() * 0.17,
    })
  }
  return pts
})()

const IDX = new Map(nodes.map((n, i) => [n.id, i]))
const EDGE_IDX: [number, number][] = edges.map(([a, b]) => [
  IDX.get(a) as number,
  IDX.get(b) as number,
])

/** Adjacency by index, for the per-frame emphasis pass. */
const ADJ: boolean[][] = (() => {
  const m = nodes.map(() => nodes.map(() => false))
  for (const [a, b] of EDGE_IDX) {
    m[a][b] = true
    m[b][a] = true
  }
  return m
})()

/** The spine of the story. Ambient pulses walk these while nothing is selected. */
const SPINE_IDX = (
  [
    ["faith", "dropped-out"],
    ["dropped-out", "moved-to-sf"],
    ["moved-to-sf", "paradigm"],
    ["paradigm", "context-wall"],
    ["context-wall", "configure"],
    ["no-internship", "nouvo"],
    ["nouvo", "paradigm"],
    ["customer-first", "configure"],
  ] as const
).map(([a, b]) =>
  edges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a)),
)

/** Per-edge curvature, deterministic, so the tissue looks organic, not drawn with a ruler. */
const CURVE = edges.map((_, i) => ((i * 37) % 2 ? 1 : -1) * (0.05 + ((i * 53) % 9) * 0.008))

const RANK_ALPHA = [0.96, 0.82, 0.7] as const
const RANK_DOT = [3.4, 2.7, 2.2] as const
const REVEAL_DELAY = nodes.map((n) => (revealOrder.get(n.id) ?? 7) * 0.1)

type Pulse = { e: number; from: 0 | 1; t: number; wait: number; loop: boolean }

export default function Mind({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const labelsRef = useRef<(HTMLButtonElement | null)[]>([])
  const selectedRef = useRef<string | null>(selected)
  const redrawRef = useRef<(() => void) | null>(null)

  // Keep the loop's view of the selection current without re-running the
  // effect; in reduced-motion mode ask for one fresh frame instead.
  useEffect(() => {
    selectedRef.current = selected
    redrawRef.current?.()
  }, [selected])

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const N = nodes.length
    const els = labelsRef.current
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Projected state, allocated once.
    const sx = new Float32Array(N)
    const sy = new Float32Array(N)
    const sc = new Float32Array(N)
    const dep = new Float32Array(N)
    const emph = new Float32Array(N).fill(1)
    const intro = new Float32Array(N)
    const lw = new Float32Array(N)
    const lh = new Float32Array(N)
    const dsx = new Float32Array(DUST.length)
    const dsy = new Float32Array(DUST.length)
    const dsc = new Float32Array(DUST.length)
    const dda = new Float32Array(DUST.length)

    let w = 1
    let h = 1
    let dpr = 1
    let rx = 100
    let ry = 100
    let cx = 0
    let cyc = 0

    const measure = () => {
      for (let i = 0; i < N; i++) {
        const el = els[i]
        lw[i] = el ? el.offsetWidth : 0
        lh[i] = el ? el.offsetHeight : 0
      }
    }

    const resize = () => {
      const r = stage.getBoundingClientRect()
      w = Math.max(1, r.width)
      h = Math.max(1, r.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const margin = w < 720 ? 86 : 132
      rx = Math.max(80, w / 2 - margin)
      ry = Math.max(80, h / 2 - 46)
      cx = w / 2
      cyc = h / 2
      measure()
      redrawRef.current?.()
    }

    /* -------------------------------------------------------------- */
    /* Orientation: a slow breath, tilted a little by the pointer.      */
    /* -------------------------------------------------------------- */
    let yaw = 0.1
    let pitch = -0.055
    let pointerX = 0
    let pointerY = 0
    let rawPX = 0
    let rawPY = 0

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const r = stage.getBoundingClientRect()
      rawPX = clamp01((e.clientX - r.left) / r.width) - 0.5
      rawPY = clamp01((e.clientY - r.top) / r.height) - 0.5
    }
    const onPointerLeave = () => {
      rawPX = 0
      rawPY = 0
    }

    /* -------------------------------------------------------------- */
    /* Pulses                                                          */
    /* -------------------------------------------------------------- */
    let pulses: Pulse[] = []
    let ambientTimer = 1.4
    let lastSel: string | null = null
    let selBlend = 0

    const spawnSelectionPulses = (id: string) => {
      pulses = []
      const idx = IDX.get(id)
      if (idx === undefined) return
      let k = 0
      for (let e = 0; e < EDGE_IDX.length; e++) {
        const [a, b] = EDGE_IDX[e]
        if (a !== idx && b !== idx) continue
        pulses.push({ e, from: a === idx ? 0 : 1, t: 0, wait: k * 0.16, loop: true })
        k++
      }
    }

    /* -------------------------------------------------------------- */
    /* One frame                                                       */
    /* -------------------------------------------------------------- */
    let time = reduced ? 11.3 : 0
    let introT = reduced ? 99 : -0.25

    const qx = (ax: number, bx: number, mx: number, t: number) => {
      const u = 1 - t
      return u * u * ax + 2 * u * t * mx + t * t * bx
    }

    const render = (dt: number) => {
      time += dt
      if (introT > -1) introT += dt

      // Selection bookkeeping (loop-side so React never re-runs the effect).
      const sel = selectedRef.current
      if (sel !== lastSel) {
        lastSel = sel
        if (sel) spawnSelectionPulses(sel)
        else pulses = []
      }
      const selIdx = sel ? (IDX.get(sel) ?? -1) : -1
      const kSel = reduced ? 1 : 1 - Math.exp(-dt * 7)
      selBlend += ((selIdx >= 0 ? 1 : 0) - selBlend) * kSel

      // Orientation.
      const idleYaw = 0.05 + Math.sin(time * 0.07) * 0.085
      const idlePitch = -0.05 + Math.sin(time * 0.047 + 1.3) * 0.032
      const kP = reduced ? 1 : 1 - Math.exp(-dt * 2.6)
      pointerX += (rawPX - pointerX) * kP
      pointerY += (rawPY - pointerY) * kP
      const wantYaw = idleYaw + pointerX * 0.17
      const wantPitch = idlePitch - pointerY * 0.11
      const kO = reduced ? 1 : 1 - Math.exp(-dt * 3)
      yaw += (wantYaw - yaw) * kO
      pitch += (wantPitch - pitch) * kO

      const cyw = Math.cos(yaw)
      const syw = Math.sin(yaw)
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)

      const project = (x: number, y: number, z: number, out: number) => {
        const x1 = x * cyw + z * syw
        const z1 = -x * syw + z * cyw
        const y1 = y * cp - z1 * sp
        const z2 = y * sp + z1 * cp
        const s = PERSP / (PERSP - z2)
        if (out >= 0) {
          sx[out] = cx + x1 * rx * s
          sy[out] = cyc - y1 * ry * s
          sc[out] = s
          dep[out] = clamp01((z2 + 1) / 2)
        }
        return s
      }

      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        project(n.x, n.y, n.z, i)
        intro[i] = reduced ? 1 : smooth(REVEAL_DELAY[i], REVEAL_DELAY[i] + 0.55, introT)

        const target =
          selIdx < 0 ? 1 : i === selIdx ? 1 : ADJ[selIdx][i] ? 0.82 : 0.3
        emph[i] += (target - emph[i]) * (reduced ? 1 : 1 - Math.exp(-dt * 8))
      }

      for (let d = 0; d < DUST.length; d++) {
        const p = DUST[d]
        const x1 = p.x * cyw + p.z * syw
        const z1 = -p.x * syw + p.z * cyw
        const y1 = p.y * cp - z1 * sp
        const z2 = p.y * sp + z1 * cp
        const s = PERSP / (PERSP - z2)
        dsx[d] = cx + x1 * rx * s
        dsy[d] = cyc - y1 * ry * s
        dsc[d] = s
        dda[d] = p.a * (0.45 + 0.55 * clamp01((z2 + 1) / 2))
      }

      /* Labels ------------------------------------------------------ */
      const introAll = reduced ? 1 : smooth(0, 0.4, introT)
      for (let i = 0; i < N; i++) {
        const el = els[i]
        if (!el) continue
        const n = nodes[i]
        const s = sc[i]
        const left = n.x < 0
        const width = lw[i]
        if (width <= 0) {
          // Hidden at this breakpoint; the dot still renders on canvas.
          el.style.opacity = "0"
          continue
        }
        const gap = 8 * s
        let px = left ? sx[i] - width - gap : sx[i] + gap
        // Never let a label leave the stage; slide it back in instead. The
        // scale transform grows away from the dot (origin sits on the dot
        // side), so the overhang is width * (s - 1) on the far side.
        const over = width * (Math.max(1, s) - 1)
        if (left) {
          const minPx = 4 + over
          if (px < minPx) px = minPx
        } else {
          const maxPx = w - 4 - width - over
          if (px > maxPx) px = maxPx
        }
        const py = sy[i] - lh[i] / 2

        const depthMod = 0.55 + 0.45 * dep[i]
        const selfSel = i === selIdx ? selBlend : 0
        let o =
          intro[i] *
          RANK_ALPHA[n.rank] *
          mix(depthMod, 1, selfSel) *
          (0.22 + 0.78 * emph[i])
        if (selfSel > 0.5) o = Math.max(o, 0.98 * intro[i])

        el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${(s * (1 + 0.06 * selfSel)).toFixed(3)})`
        el.style.opacity = o.toFixed(3)
        el.style.zIndex = String(20 + Math.round(dep[i] * 40) + (i === selIdx ? 60 : 0))
      }

      /* Canvas ------------------------------------------------------ */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Dust.
      for (let d = 0; d < DUST.length; d++) {
        ctx.fillStyle = `rgba(${BONE},${(dda[d] * introAll).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(dsx[d], dsy[d], 1.05 * dsc[d], 0, 6.2832)
        ctx.fill()
      }

      // Edges.
      for (let e = 0; e < EDGE_IDX.length; e++) {
        const [a, b] = EDGE_IDX[e]
        const ia = Math.min(intro[a], intro[b])
        if (ia <= 0.01) continue
        const touching = selIdx >= 0 && (a === selIdx || b === selIdx)
        const avgDepth = (dep[a] + dep[b]) / 2
        const base = 0.15 + 0.12 * avgDepth
        const alpha = Math.min(
          0.62,
          base * ia * mix(1, touching ? 3.1 : 0.32, selBlend),
        )
        if (alpha <= 0.012) continue

        const ax = sx[a]
        const ay = sy[a]
        const bx2 = sx[b]
        const by2 = sy[b]
        const mxp = (ax + bx2) / 2 - (by2 - ay) * CURVE[e]
        const myp = (ay + by2) / 2 + (bx2 - ax) * CURVE[e]

        const warm = touching ? selBlend : 0
        ctx.strokeStyle =
          warm > 0.04
            ? `rgba(${Math.round(mix(236, 228, warm))},${Math.round(mix(233, 128, warm))},${Math.round(mix(226, 88, warm))},${alpha.toFixed(3)})`
            : `rgba(${BONE},${alpha.toFixed(3)})`
        ctx.lineWidth = touching ? mix(1, 1.4, selBlend) : 1
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.quadraticCurveTo(mxp, myp, bx2, by2)
        ctx.stroke()
      }

      // Pulses.
      if (!reduced) {
        if (selIdx < 0) {
          ambientTimer -= dt
          if (ambientTimer <= 0 && introT > 1.2) {
            ambientTimer = 2.3 + Math.random() * 0.9
            const e = SPINE_IDX[Math.floor(Math.random() * SPINE_IDX.length)]
            if (e >= 0) pulses.push({ e, from: 0, t: 0, wait: 0, loop: false })
          }
        }

        for (let p = pulses.length - 1; p >= 0; p--) {
          const pu = pulses[p]
          if (pu.wait > 0) {
            pu.wait -= dt
            continue
          }
          const [a, b] = EDGE_IDX[pu.e]
          const i0 = pu.from === 0 ? a : b
          const i1 = pu.from === 0 ? b : a
          const dx = sx[i1] - sx[i0]
          const dy = sy[i1] - sy[i0]
          const len = Math.max(40, Math.sqrt(dx * dx + dy * dy))
          pu.t += (dt * 130) / len
          if (pu.t >= 1) {
            if (pu.loop && selectedRef.current) {
              pu.t = 0
              pu.wait = 0.7 + Math.random() * 0.9
            } else {
              pulses.splice(p, 1)
            }
            continue
          }

          const ax = sx[i0]
          const ay = sy[i0]
          const bx2 = sx[i1]
          const by2 = sy[i1]
          const flip = pu.from === 0 ? 1 : -1
          const mxp = (ax + bx2) / 2 - (by2 - ay) * CURVE[pu.e] * flip
          const myp = (ay + by2) / 2 + (bx2 - ax) * CURVE[pu.e] * flip
          const fade = smooth(0, 0.12, pu.t) * smooth(1, 0.88, pu.t)
          for (let tail = 0; tail < 3; tail++) {
            const tt = pu.t - tail * 0.022
            if (tt <= 0) break
            const pxp = qx(ax, bx2, mxp, tt)
            const pyp = qx(ay, by2, myp, tt)
            ctx.fillStyle = `rgba(226,85,44,${(fade * (0.85 - tail * 0.26)).toFixed(3)})`
            ctx.beginPath()
            ctx.arc(pxp, pyp, 2 - tail * 0.4, 0, 6.2832)
            ctx.fill()
          }
        }
      }

      // Node points, drawn last so they sit on top of their edges.
      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        const isSel = i === selIdx
        const r = RANK_DOT[n.rank] * sc[i] * (isSel ? 1.25 : 1)
        const a =
          intro[i] * (0.4 + 0.5 * dep[i]) * (0.3 + 0.7 * emph[i])
        if (isSel && selBlend > 0.04) {
          ctx.fillStyle = `rgba(226,85,44,${(0.95 * intro[i] * selBlend).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(sx[i], sy[i], r, 0, 6.2832)
          ctx.fill()
          ctx.strokeStyle = `rgba(226,85,44,${(0.5 * selBlend).toFixed(3)})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(sx[i], sy[i], r + 3.5, 0, 6.2832)
          ctx.stroke()
        } else {
          ctx.fillStyle = `rgba(${BONE},${a.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(sx[i], sy[i], r, 0, 6.2832)
          ctx.fill()
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Drive                                                           */
    /* -------------------------------------------------------------- */
    let raf = 0
    let last = performance.now()
    let disposed = false

    const loop = (now: number) => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      if (document.hidden) {
        last = now
        return
      }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      render(dt)
    }

    redrawRef.current = reduced ? () => render(0) : null

    const ro = new ResizeObserver(resize)
    ro.observe(stage)
    resize()

    const ready = () => {
      if (disposed) return
      measure()
      introT = reduced ? 99 : 0
      if (reduced) render(0)
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(ready)
      window.setTimeout(ready, 1300)
    } else {
      ready()
    }

    if (reduced) {
      render(0)
    } else {
      raf = requestAnimationFrame(loop)
      stage.addEventListener("pointermove", onPointerMove, { passive: true })
      stage.addEventListener("pointerleave", onPointerLeave, { passive: true })
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      stage.removeEventListener("pointermove", onPointerMove)
      stage.removeEventListener("pointerleave", onPointerLeave)
      redrawRef.current = null
    }
    // The graph is static and selection flows through selectedRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      onClick={() => onSelect(null)}
      onKeyDown={(e) => {
        if (e.key === "Escape") onSelect(null)
      }}
      role="group"
      aria-label="A map of Manuel's life. Each node is a real event, belief, company or project; select one to read its story."
    >
      <canvas ref={canvasRef} className={styles.stageCanvas} aria-hidden="true" />
      {nodes.map((n, i) => (
        <button
          key={n.id}
          ref={(el) => {
            labelsRef.current[i] = el
          }}
          type="button"
          className={styles.node}
          data-rank={n.rank}
          data-side={n.x < 0 ? "l" : "r"}
          data-on={selected === n.id ? "true" : undefined}
          data-dim={selected && selected !== n.id && !neighbours.get(selected)?.includes(n.id) ? "true" : undefined}
          aria-pressed={selected === n.id}
          aria-label={`${n.label}. ${KIND_LABEL[n.kind]}.`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(selected === n.id ? null : n.id)
          }}
        >
          {n.label}
        </button>
      ))}
    </div>
  )
}
