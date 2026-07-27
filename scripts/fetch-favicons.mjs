// Fetch favicons for projects that have a live URL and save them as PNGs in
// public/favicons/<slug>.png. Google's s2 favicon service returns a generic
// globe for domains it has no icon for; we flag those by size heuristic so the
// card can fall back to a tan monogram instead of showing a meaningless globe.
//
// Usage: node scripts/fetch-favicons.mjs
//
// After running, eyeball the PNGs and set the `favicon` field in lib/content.ts
// (e.g. "/favicons/idex.png") for the slugs that resolved to a real mark.

import { mkdir, writeFile, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT_DIR = join(ROOT, "public", "favicons")

// Mirror of the projects in lib/content.ts that carry a live URL. github-only
// projects (launch-control, gideon, sovereign, zantana) intentionally use the
// monogram fallback, so they are omitted here.
const TARGETS = [
  { slug: "idex", url: "https://idex.dev" },
  { slug: "ultron", url: "https://ultron-omega.vercel.app" },
  { slug: "claude-skills-sync", url: "https://www.npmjs.com/package/claude-skills-sync" },
  { slug: "tripfund", url: "https://tripfund-mocha.vercel.app" },
  { slug: "satisfying-video-generator", url: "https://satisfying-video-gen.web.app" },
  { slug: "revive-rides", url: "https://revive-rides.web.app" },
]

function hostOf(url) {
  return new URL(url).host
}

async function fetchIcon(host) {
  const endpoint = `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // Google's generic-globe fallback is a fixed, small PNG. We capture its bytes
  // once (via a domain that certainly has no icon) to compare against.
  let genericLen = null
  try {
    const generic = await fetchIcon("this-domain-should-not-exist-xyzq.example")
    genericLen = generic.length
  } catch {
    // If the sentinel fetch fails, we just skip the generic comparison.
  }

  const results = []
  for (const t of TARGETS) {
    const host = hostOf(t.url)
    try {
      const buf = await fetchIcon(host)
      const isGeneric = genericLen !== null && buf.length === genericLen
      const outPath = join(OUT_DIR, `${t.slug}.png`)
      await writeFile(outPath, buf)
      results.push({
        slug: t.slug,
        host,
        bytes: buf.length,
        generic: isGeneric,
        saved: `public/favicons/${t.slug}.png`,
      })
    } catch (err) {
      results.push({ slug: t.slug, host, error: String(err) })
    }
  }

  console.log("\nFavicon fetch results:")
  console.log("======================")
  for (const r of results) {
    if (r.error) {
      console.log(`  [FAIL] ${r.slug.padEnd(26)} ${r.host}  -> ${r.error}`)
    } else {
      const flag = r.generic ? "GENERIC GLOBE (use monogram)" : "real icon"
      console.log(
        `  [ ok ] ${r.slug.padEnd(26)} ${r.host.padEnd(38)} ${String(r.bytes).padStart(6)}B  ${flag}`
      )
    }
  }
  console.log(
    "\nGeneric-globe byte length:",
    genericLen === null ? "unknown" : genericLen
  )
  console.log(
    "\nSet the favicon field in lib/content.ts for the slugs marked 'real icon'.\n"
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
