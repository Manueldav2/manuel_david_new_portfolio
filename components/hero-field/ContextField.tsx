"use client"

import { useEffect, useRef } from "react"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three"

/**
 * CONTEXT FIELD
 *
 * A drifting field of points. Whatever the cursor passes near wakes up,
 * recognises its neighbours, and draws hairlines between them and back to
 * the cursor. Move on and the constellation dissolves, slower than it
 * formed, because forgetting takes longer than recognising.
 *
 * Written against three.js directly rather than react-three-fiber. This is
 * one Points object and one LineSegments object driven by a custom shader
 * with no scene graph to speak of, which is exactly the case where the
 * reconciler costs bundle weight and buys nothing. Every rule from the
 * R3F playbook still applies here: no allocation inside the loop, no React
 * state per frame, everything disposed on unmount.
 */

const POINT_VERT = /* glsl */ `
  uniform float uScale;
  uniform float uSize;
  attribute float aWake;
  attribute float aVar;
  varying float vWake;
  varying float vFade;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    vWake = aWake;
    // Shallow depth atmosphere. Enough parallax to feel like a volume,
    // not so much that it reads as a starfield.
    vFade = 0.46 + 0.54 * smoothstep(8.6, 4.6, dist);
    // Brightness and size lag behind wake on a curve so the recognition
    // radius does not read as a visible disc of half-lit points.
    float lit = aWake * aWake;
    gl_PointSize = uSize * aVar * (1.0 + lit * 1.5) * (uScale / dist);
    gl_Position = projectionMatrix * mv;
  }
`

const POINT_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uEmber;
  uniform float uAlpha;
  varying float vWake;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    // Tight core with a one-pixel shoulder. A wide falloff turns points
    // into bokeh, which is exactly the atmospheric cliche to avoid.
    float core = smoothstep(0.5, 0.22, d);
    if (core <= 0.001) discard;
    // Ember is reserved for the instant of recognition, so the curve is
    // cubed: a point has to be genuinely close before it takes any warmth.
    vec3 c = mix(uBase, uEmber, pow(vWake, 3.0) * 0.44);
    gl_FragColor = vec4(c, core * vFade * (uAlpha + vWake * vWake * 0.62));
  }
`

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
    gl_FragColor = vec4(mix(uBase, uEmber, vTint * 0.7), vAlpha);
  }
`

const MAX_SEGMENTS = 300
const MAX_AWAKE = 46
const CURSOR_LINKS = 5

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export default function ContextField({
  className,
  onReady,
}: {
  className?: string
  onReady?: () => void
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const readyRef = useRef(onReady)
  readyRef.current = onReady

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      })
    } catch {
      // No WebGL. The typography is the page; it stands on its own.
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2)
    renderer.setPixelRatio(dpr)
    renderer.setClearAlpha(0)
    const canvas = renderer.domElement
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.display = "block"
    host.appendChild(canvas)

    const scene = new Scene()
    const camera = new PerspectiveCamera(50, 1, 0.1, 40)
    camera.position.z = 6

    const COUNT = coarse ? 560 : 1900

    // Base positions live in normalised space so a resize just rescales the
    // field instead of regenerating it.
    const base = new Float32Array(COUNT * 3)
    const phase = new Float32Array(COUNT)
    const variance = new Float32Array(COUNT)
    const positions = new Float32Array(COUNT * 3)
    const wake = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Elliptical disc, gently denser toward the middle. A uniform box
      // reads as wallpaper; a slight density gradient reads as a field
      // that has a centre.
      const a = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.78)
      base[i * 3] = Math.cos(a) * r * 1.22
      base[i * 3 + 1] = Math.sin(a) * r * 1.1
      base[i * 3 + 2] = Math.random() * 2 - 1
      phase[i] = Math.random()
      variance[i] = 0.72 + Math.random() * 0.56
    }

    const pointGeo = new BufferGeometry()
    const posAttr = new BufferAttribute(positions, 3)
    posAttr.setUsage(DynamicDrawUsage)
    const wakeAttr = new BufferAttribute(wake, 1)
    wakeAttr.setUsage(DynamicDrawUsage)
    pointGeo.setAttribute("position", posAttr)
    pointGeo.setAttribute("aWake", wakeAttr)
    pointGeo.setAttribute("aVar", new BufferAttribute(variance, 1))

    const bone = new Color("#c9dcd6")
    const ember = new Color("#e2552c")

    const pointMat = new ShaderMaterial({
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      uniforms: {
        uScale: { value: 800 },
        uSize: { value: 0.0158 },
        uBase: { value: bone },
        uEmber: { value: ember },
        uAlpha: { value: 0.3 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    })

    const points = new Points(pointGeo, pointMat)
    points.frustumCulled = false
    scene.add(points)

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
        uBase: { value: bone },
        uEmber: { value: ember },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    })

    const lines = new LineSegments(lineGeo, lineMat)
    lines.frustumCulled = false
    scene.add(lines)

    // Scratch buffers, allocated once. Nothing below this line allocates.
    const awakeIdx = new Int32Array(COUNT)
    const awakeWeight = new Float32Array(COUNT)
    const nearIdx = new Int32Array(CURSOR_LINKS)
    const nearDist = new Float32Array(CURSOR_LINKS)

    let halfW = 4.5
    let halfH = 2.8
    let extentZ = 2.4
    let radius = 1.4
    let linkRadius = 1

    const resize = () => {
      const w = host.clientWidth || window.innerWidth
      const h = host.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)

      halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      halfW = halfH * camera.aspect
      extentZ = 1.5
      // Recognition radius scales with the smaller axis so the constellation
      // stays the same relative size on a phone as on a display.
      radius = Math.min(halfW, halfH) * (coarse ? 0.66 : 0.58)
      linkRadius = radius * 0.5

      pointMat.uniforms.uScale.value =
        renderer.domElement.height / (2 * Math.tan((camera.fov * Math.PI) / 360))
    }

    resize()

    // Cursor state. Two positions: where the pointer actually is, and where
    // the field believes it is. The second chases the first, which is what
    // makes recognition feel like weight rather than a lookup.
    let targetNdcX = 0
    let targetNdcY = 0
    let easedX = 0
    let easedY = 0
    let userBlend = 0
    let hasPointer = false

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      targetNdcX = (e.clientX / window.innerWidth) * 2 - 1
      targetNdcY = -((e.clientY / window.innerHeight) * 2 - 1)
      hasPointer = true
    }

    let raf = 0
    let last = performance.now()
    let clock = reduced ? 9.4 : 0
    let disposed = false

    const step = (dt: number) => {
      clock += dt

      // Idle / touch: a ghost cursor wanders the field so the page
      // demonstrates itself before anyone touches it.
      const ghostX =
        Math.sin(clock * 0.21) * 0.5 + Math.sin(clock * 0.083 + 2.1) * 0.24
      const ghostY =
        Math.sin(clock * 0.157 + 1.7) * 0.38 + Math.cos(clock * 0.061) * 0.17

      if (hasPointer && !coarse) {
        userBlend = Math.min(1, userBlend + dt / 1.1)
      }

      const wantX = ghostX + (targetNdcX - ghostX) * userBlend
      const wantY = ghostY + (targetNdcY - ghostY) * userBlend

      if (reduced) {
        easedX = 0.3
        easedY = -0.06
      } else {
        const k = 1 - Math.exp(-dt * 6.5)
        easedX += (wantX - easedX) * k
        easedY += (wantY - easedY) * k
      }

      const cx = easedX * halfW
      const cy = easedY * halfH

      // Very slow rotation of the whole field. Nothing is legible as motion,
      // but the parallax keeps the ground alive.
      const spin = clock * 0.006
      const cs = Math.cos(spin)
      const sn = Math.sin(spin)

      const riseK = reduced ? 1 : 1 - Math.exp(-dt * 9)
      const fallK = reduced ? 1 : 1 - Math.exp(-dt * 3.1)

      let awakeCount = 0
      for (let n = 0; n < CURSOR_LINKS; n++) {
        nearIdx[n] = -1
        nearDist[n] = Infinity
      }

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3
        const ph = phase[i]
        const nx = base[i3] + Math.sin(clock * 0.13 + ph * 6.2832) * 0.055
        const ny = base[i3 + 1] + Math.cos(clock * 0.11 + ph * 5.1) * 0.05
        const nz = base[i3 + 2] + Math.sin(clock * 0.09 + ph * 4.1) * 0.09

        const px = (nx * cs - ny * sn) * halfW * 1.06
        const py = (nx * sn + ny * cs) * halfH * 1.06
        const pz = nz * extentZ

        positions[i3] = px
        positions[i3 + 1] = py
        positions[i3 + 2] = pz

        const dx = px - cx
        const dy = py - cy
        const dz = pz * 0.55
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz)

        const target = smoothstep(radius, radius * 0.16, d)
        const w = wake[i]
        wake[i] = w + (target - w) * (target > w ? riseK : fallK)

        if (wake[i] > 0.02 && awakeCount < COUNT) {
          awakeIdx[awakeCount] = i
          awakeWeight[awakeCount] = wake[i]
          awakeCount++
        }

        // Running top-K nearest for the cursor tethers.
        if (d < nearDist[CURSOR_LINKS - 1] && target > 0.03) {
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

      // Cap the awake set by brightness so the pair loop stays bounded.
      if (awakeCount > MAX_AWAKE) {
        for (let a = 1; a < awakeCount; a++) {
          const ki = awakeIdx[a]
          const kw = awakeWeight[a]
          let b = a - 1
          while (b >= 0 && awakeWeight[b] < kw) {
            awakeWeight[b + 1] = awakeWeight[b]
            awakeIdx[b + 1] = awakeIdx[b]
            b--
          }
          awakeWeight[b + 1] = kw
          awakeIdx[b + 1] = ki
        }
        awakeCount = MAX_AWAKE
      }

      let seg = 0

      // Point to point: the recognition itself.
      //
      // Every awake point reaches for its two nearest awake neighbours and
      // nothing else. Linking every pair inside a radius produces a hairball
      // that reads as generic particle wallpaper; capping the degree
      // produces a graph you can actually follow, which is the difference
      // between decoration and an argument about relationships.
      for (let a = 0; a < awakeCount && seg < MAX_SEGMENTS; a++) {
        const i = awakeIdx[a]
        const i3 = i * 3
        const wi = wake[i]

        let n0 = -1
        let d0 = Infinity
        let n1 = -1
        let d1 = Infinity

        for (let b = 0; b < awakeCount; b++) {
          if (b === a) continue
          const j3 = awakeIdx[b] * 3
          const dx = positions[i3] - positions[j3]
          const dy = positions[i3 + 1] - positions[j3 + 1]
          const dz = positions[i3 + 2] - positions[j3 + 2]
          const dij = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dij >= linkRadius) continue
          if (dij < d0) {
            d1 = d0
            n1 = n0
            d0 = dij
            n0 = awakeIdx[b]
          } else if (dij < d1) {
            d1 = dij
            n1 = awakeIdx[b]
          }
        }

        for (let k = 0; k < 2 && seg < MAX_SEGMENTS; k++) {
          const j = k === 0 ? n0 : n1
          const dij = k === 0 ? d0 : d1
          if (j < 0) continue

          const alpha =
            wi * wake[j] * smoothstep(linkRadius, linkRadius * 0.15, dij) * 0.46
          if (alpha < 0.008) continue

          const j3 = j * 3
          const v = seg * 6
          linePositions[v] = positions[i3]
          linePositions[v + 1] = positions[i3 + 1]
          linePositions[v + 2] = positions[i3 + 2]
          linePositions[v + 3] = positions[j3]
          linePositions[v + 4] = positions[j3 + 1]
          linePositions[v + 5] = positions[j3 + 2]
          const t = seg * 2
          lineAlpha[t] = alpha
          lineAlpha[t + 1] = alpha
          lineTint[t] = 0
          lineTint[t + 1] = 0
          seg++
        }
      }

      // Cursor tethers: the field reaching back toward whoever is reading.
      for (let n = 0; n < CURSOR_LINKS && seg < MAX_SEGMENTS; n++) {
        const i = nearIdx[n]
        if (i < 0) continue
        const i3 = i * 3
        const alpha = wake[i] * 0.6 * smoothstep(radius, radius * 0.1, nearDist[n])
        if (alpha < 0.006) continue

        const v = seg * 6
        linePositions[v] = cx
        linePositions[v + 1] = cy
        linePositions[v + 2] = 0
        linePositions[v + 3] = positions[i3]
        linePositions[v + 4] = positions[i3 + 1]
        linePositions[v + 5] = positions[i3 + 2]
        const t = seg * 2
        lineAlpha[t] = alpha * 0.35
        lineAlpha[t + 1] = alpha
        lineTint[t] = 0.15
        lineTint[t + 1] = 0.85
        seg++
      }

      posAttr.needsUpdate = true
      wakeAttr.needsUpdate = true
      lineGeo.setDrawRange(0, seg * 2)
      if (seg > 0) {
        // Whole-buffer upload: 13 kB of line data is cheaper than the
        // bookkeeping for partial ranges, and drawRange bounds what is read.
        linePosAttr.needsUpdate = true
        lineAlphaAttr.needsUpdate = true
        lineTintAttr.needsUpdate = true
      }

      renderer.render(scene, camera)
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
      // One composed frame. Two passes so the wake damping settles first.
      step(0)
      step(0)
    } else {
      raf = requestAnimationFrame(loop)
      window.addEventListener("pointermove", onPointerMove, { passive: true })
    }

    readyRef.current?.()

    const onResize = () => {
      resize()
      if (reduced) step(0)
    }
    window.addEventListener("resize", onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointerMove)
      pointGeo.dispose()
      pointMat.dispose()
      lineGeo.dispose()
      lineMat.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
    }
  }, [])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
