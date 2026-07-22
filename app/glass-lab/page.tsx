// TEMPORARY verification page for the Glass primitive (Task 3).
// Self-contained — delete this whole directory in a later task.
import { Glass } from "@/components/glass/Glass"

const meshBg: React.CSSProperties = {
  background: `
    radial-gradient(at 15% 20%, rgba(255, 45, 45, 0.9) 0%, transparent 45%),
    radial-gradient(at 80% 15%, rgba(64, 120, 255, 0.85) 0%, transparent 50%),
    radial-gradient(at 65% 75%, rgba(255, 170, 0, 0.8) 0%, transparent 45%),
    radial-gradient(at 25% 85%, rgba(0, 220, 160, 0.7) 0%, transparent 50%),
    conic-gradient(from 220deg at 50% 50%, #1a0533, #33101a, #0a2038, #1a0533)
  `,
}

export default function GlassLab() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      {/* (a) Glass over a vivid gradient mesh — refraction should be obvious */}
      <section className="flex min-h-screen items-center justify-center p-8" style={meshBg}>
        <div className="flex w-full max-w-4xl flex-col gap-8">
          <Glass distort className="p-10">
            <p className="font-mono text-xs uppercase tracking-widest text-white/60">a — distort over mesh</p>
            <h1 className="mt-3 font-display text-5xl uppercase">Liquid Glass</h1>
            <p className="mt-4 max-w-md text-white/80">
              The backdrop behind this card is blurred, saturated, and refracted through the shared
              SVG displacement filter. This text must stay perfectly crisp.
            </p>
          </Glass>

          {/* Drop-in shapes: nav bar + pills, no per-use hacks */}
          <Glass as="nav" distort className="flex items-center justify-between rounded-full px-6 py-3">
            <span className="font-display uppercase">MD</span>
            <div className="flex gap-2">
              <Glass as="span" className="rounded-full px-4 py-1 text-sm">Work</Glass>
              <Glass as="span" className="rounded-full px-4 py-1 text-sm">Projects</Glass>
              <Glass as="span" interactive className="cursor-pointer rounded-full px-4 py-1 text-sm">Contact</Glass>
            </div>
          </Glass>
        </div>
      </section>

      {/* (b) Glass over flat #0a0a0c — must still read as a surface */}
      <section className="flex min-h-screen items-center justify-center p-8">
        <Glass className="max-w-md p-10">
          <p className="font-mono text-xs uppercase tracking-widest text-white/60">b — flat dark</p>
          <h2 className="mt-3 font-display text-4xl uppercase">Still reads</h2>
          <p className="mt-4 text-white/70">
            Over flat near-black there is nothing to refract, so the surface relies on its fill,
            specular top edge, and gradient border ring.
          </p>
        </Glass>
      </section>

      {/* (c) Interactive card — cursor-tracked specular spot */}
      <section className="flex min-h-screen items-center justify-center p-8" style={meshBg}>
        <Glass interactive distort className="max-w-md p-10">
          <p className="font-mono text-xs uppercase tracking-widest text-white/60">c — interactive</p>
          <h2 className="mt-3 font-display text-4xl uppercase">Move the cursor</h2>
          <p className="mt-4 text-white/70">
            A radial specular highlight trails the pointer via GSAP quickTo. Touch devices and
            reduced-motion users get the static surface.
          </p>
        </Glass>
      </section>
    </main>
  )
}
