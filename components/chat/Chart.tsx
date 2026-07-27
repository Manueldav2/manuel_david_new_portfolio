"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

export type ChartSpec = {
  type?: "bar" | "line" | "pie"
  title?: string
  data?: { label?: string; value?: number }[]
}

/**
 * Parses a ```chart fenced block's JSON into a ChartSpec, tolerating malformed
 * input (returns null so the caller can fall back to rendering the raw code).
 */
export function parseChartSpec(raw: string): ChartSpec | null {
  try {
    const parsed = JSON.parse(raw) as ChartSpec
    if (!parsed || !Array.isArray(parsed.data) || parsed.data.length === 0) return null
    const data = parsed.data
      .filter((d) => d && typeof d.value === "number" && Number.isFinite(d.value))
      .map((d) => ({ label: String(d.label ?? ""), value: Number(d.value) }))
    if (data.length === 0) return null
    const type = parsed.type === "line" || parsed.type === "pie" ? parsed.type : "bar"
    return { type, title: parsed.title, data }
  } catch {
    return null
  }
}

const W = 340
const H = 180
const PAD_L = 8
const PAD_R = 8
const PAD_T = 8
const PAD_B = 28

// Espresso-palette series colors (tan → cream range), tuned for the dark theme.
const SERIES = [
  "hsl(28 40% 58%)",
  "hsl(38 44% 68%)",
  "hsl(22 30% 48%)",
  "hsl(32 24% 60%)",
  "hsl(24 20% 44%)",
  "hsl(40 40% 74%)",
]

/**
 * Small on-brand SVG chart (bar / line / pie) rendered from a ChartSpec.
 * Tan/cream marks on espresso. Marks animate in with GSAP under motion-safe;
 * reduced-motion lands them instantly. No external chart dependency.
 */
export function Chart({ spec }: { spec: ChartSpec }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const data = spec.data ?? []
  const type = spec.type ?? "bar"
  const max = Math.max(...data.map((d) => d.value), 1)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { animate } = ctx.conditions as { animate: boolean }
          if (!animate) return
          const bars = root.querySelectorAll<SVGElement>("[data-bar]")
          const dots = root.querySelectorAll<SVGElement>("[data-dot]")
          const path = root.querySelector<SVGPathElement>("[data-line]")
          const slices = root.querySelectorAll<SVGElement>("[data-slice]")

          if (bars.length) {
            gsap.from(bars, {
              scaleY: 0,
              transformOrigin: "bottom",
              duration: 0.7,
              stagger: 0.06,
              ease: "power3.out",
            })
          }
          if (path) {
            const len = path.getTotalLength()
            gsap.fromTo(
              path,
              { strokeDasharray: len, strokeDashoffset: len },
              { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }
            )
          }
          if (dots.length) {
            gsap.from(dots, { scale: 0, transformOrigin: "center", duration: 0.4, stagger: 0.08, delay: 0.3, ease: "back.out(2)" })
          }
          if (slices.length) {
            gsap.from(slices, { opacity: 0, scale: 0.9, transformOrigin: "center", duration: 0.5, stagger: 0.08, ease: "power2.out" })
          }
        }
      )
      return () => mm.revert()
    },
    { scope: ref, dependencies: [type, data.length] }
  )

  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  return (
    <div
      ref={ref}
      className="my-4 rounded-xl border border-primary/20 bg-foreground/[0.04] p-3.5"
    >
      {spec.title && (
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {spec.title}
        </p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={spec.title ?? `${type} chart`}
      >
        {type === "bar" &&
          (() => {
            const gap = 10
            const bw = (chartW - gap * (data.length - 1)) / data.length
            return data.map((d, i) => {
              const h = (d.value / max) * chartH
              const x = PAD_L + i * (bw + gap)
              const y = PAD_T + (chartH - h)
              return (
                <g key={i}>
                  <rect
                    data-bar
                    x={x}
                    y={y}
                    width={bw}
                    height={h}
                    rx={3}
                    fill={SERIES[i % SERIES.length]}
                  />
                  <text
                    x={x + bw / 2}
                    y={H - PAD_B + 16}
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono"
                    fontSize="10"
                  >
                    {d.label}
                  </text>
                  <text
                    x={x + bw / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className="fill-foreground font-mono"
                    fontSize="10"
                  >
                    {d.value}
                  </text>
                </g>
              )
            })
          })()}

        {type === "line" &&
          (() => {
            const stepX = data.length > 1 ? chartW / (data.length - 1) : 0
            const pts = data.map((d, i) => ({
              x: PAD_L + i * stepX,
              y: PAD_T + (chartH - (d.value / max) * chartH),
              d,
            }))
            const dPath = pts
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
              .join(" ")
            return (
              <>
                <path
                  data-line
                  d={dPath}
                  fill="none"
                  stroke={SERIES[0]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle data-dot cx={p.x} cy={p.y} r={3.5} fill="hsl(38 44% 74%)" />
                    <text
                      x={p.x}
                      y={H - PAD_B + 16}
                      textAnchor="middle"
                      className="fill-muted-foreground font-mono"
                      fontSize="10"
                    >
                      {p.d.label}
                    </text>
                  </g>
                ))}
              </>
            )
          })()}

        {type === "pie" &&
          (() => {
            const cx = PAD_L + chartW * 0.32
            const cy = H / 2
            const r = Math.min(chartW * 0.32, chartH / 2) - 2
            const total = data.reduce((s, d) => s + d.value, 0) || 1
            let acc = -Math.PI / 2
            const arcs = data.map((d, i) => {
              const frac = d.value / total
              const start = acc
              const end = acc + frac * Math.PI * 2
              acc = end
              const x1 = cx + r * Math.cos(start)
              const y1 = cy + r * Math.sin(start)
              const x2 = cx + r * Math.cos(end)
              const y2 = cy + r * Math.sin(end)
              const large = end - start > Math.PI ? 1 : 0
              const dPath = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
              return { dPath, color: SERIES[i % SERIES.length], d, frac }
            })
            const legendX = cx + r + 18
            return (
              <>
                {arcs.map((a, i) => (
                  <path key={i} data-slice d={a.dPath} fill={a.color} stroke="hsl(20 24% 8%)" strokeWidth={1} />
                ))}
                {arcs.map((a, i) => (
                  <g key={`l-${i}`} transform={`translate(${legendX} ${PAD_T + 8 + i * 18})`}>
                    <rect width={10} height={10} rx={2} fill={a.color} />
                    <text x={16} y={9} className="fill-muted-foreground font-mono" fontSize="10">
                      {a.d.label} · {Math.round(a.frac * 100)}%
                    </text>
                  </g>
                ))}
              </>
            )
          })()}
      </svg>
    </div>
  )
}
