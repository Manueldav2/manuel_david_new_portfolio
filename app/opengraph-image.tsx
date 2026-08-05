import { ImageResponse } from "next/og"

// The share card wears the same identity as the page: ink ground, a drifting
// field of context words with hairline relations, one ember accent, and the
// serif voice. Newsreader is fetched at the edge so the card's type matches
// the site; if the font fetch ever fails the card still renders in the
// default face rather than erroring.
export const runtime = "edge"
export const alt = "Manuel David. Welcome to my context page."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const INK = "#06080a"
const BONE = "#ece9e2"
const MUTE = "#939c98"
const FIELD = "#c9dcd6"
const EMBER = "#e2552c"

async function loadGoogleFont(family: string, ital: 0 | 1, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital@${ital}&text=${encodeURIComponent(text)}`,
    // An older UA makes Google serve TTF, which satori can consume (it
    // cannot parse woff2).
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } },
  ).then((r) => r.text())
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1]
  if (!url) return null
  return fetch(url).then((r) => r.arrayBuffer())
}

// A quiet constellation. Positions are hand-set for 1200x630; sizes and
// opacities follow the site's three ranks. One word carries the ember.
const WORDS: {
  t: string
  x: number
  y: number
  s: number
  o: number
  serif?: boolean
  ember?: boolean
}[] = [
  { t: "faith", x: 700, y: 78, s: 30, o: 0.62, serif: true },
  { t: "all in", x: 852, y: 152, s: 26, o: 0.5, serif: true },
  { t: "san francisco", x: 1000, y: 96, s: 22, o: 0.44 },
  { t: "future focused", x: 662, y: 220, s: 18, o: 0.34 },
  { t: "paradigm", x: 930, y: 258, s: 34, o: 0.7, serif: true },
  { t: "customer first", x: 700, y: 330, s: 17, o: 0.3 },
  { t: "context", x: 1042, y: 372, s: 30, o: 0.85, serif: true, ember: true },
  { t: "configure", x: 796, y: 442, s: 36, o: 0.78, serif: true },
  { t: "nouvo", x: 652, y: 520, s: 24, o: 0.44, serif: true },
  { t: "agents", x: 992, y: 520, s: 20, o: 0.4 },
  { t: "break fast, fix fast", x: 806, y: 578, s: 15, o: 0.28 },
  { t: "late nights", x: 1084, y: 458, s: 15, o: 0.26 },
  { t: "ultron", x: 1104, y: 200, s: 16, o: 0.26 },
  { t: "gideon", x: 596, y: 414, s: 15, o: 0.26 },
]

// Hairline relations, drawn as thin rotated bars between neighbourhoods.
const LINES: { x: number; y: number; w: number; r: number; o: number }[] = [
  { x: 742, y: 96, w: 122, r: 26, o: 0.16 },
  { x: 902, y: 168, w: 118, r: -18, o: 0.14 },
  { x: 962, y: 286, w: 96, r: 48, o: 0.2 },
  { x: 862, y: 452, w: 168, r: -22, o: 0.22 },
  { x: 742, y: 470, w: 92, r: 38, o: 0.15 },
  { x: 1004, y: 400, w: 74, r: -60, o: 0.18 },
  { x: 706, y: 250, w: 110, r: 74, o: 0.12 },
]

export default async function OpengraphImage() {
  const heading = "Welcome to my context page. Manuel David"
  const fieldText = WORDS.map((w) => w.t).join("")
  const [serif, serifItalic, sans] = await Promise.all([
    loadGoogleFont("Newsreader", 0, heading + fieldText),
    loadGoogleFont("Newsreader", 1, "context page." + fieldText),
    loadGoogleFont("IBM Plex Sans", 0, heading + fieldText + "Founding engineer at Configure · San Francisco manueldavid.dev"),
  ])

  const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"] = []
  if (serif) fonts.push({ name: "Newsreader", data: serif, style: "normal" as const })
  if (serifItalic) fonts.push({ name: "Newsreader", data: serifItalic, style: "italic" as const })
  if (sans) fonts.push({ name: "Plex", data: sans, style: "normal" as const })

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: INK,
          backgroundImage:
            "radial-gradient(90% 80% at 72% 30%, rgba(26,34,36,0.6) 0%, rgba(6,8,10,0) 65%), radial-gradient(120% 90% at 40% 45%, #0c1113 0%, #080b0d 45%, #06080a 78%)",
          position: "relative",
          fontFamily: serif ? "Newsreader" : "serif",
        }}
      >
        {/* The field: hairlines first, words above them. */}
        {LINES.map((l, i) => (
          <div
            key={`l${i}`}
            style={{
              position: "absolute",
              left: l.x,
              top: l.y,
              width: l.w,
              height: 1,
              backgroundColor: BONE,
              opacity: l.o,
              transform: `rotate(${l.r}deg)`,
              transformOrigin: "0 0",
            }}
          />
        ))}
        {WORDS.map((w, i) => (
          <div
            key={`w${i}`}
            style={{
              position: "absolute",
              left: w.x,
              top: w.y,
              fontSize: w.s,
              color: w.ember ? EMBER : FIELD,
              opacity: w.ember ? 1 : w.o,
              fontFamily: w.serif && serif ? "Newsreader" : sans ? "Plex" : "sans-serif",
              fontStyle: w.serif ? "italic" : "normal",
              letterSpacing: w.serif ? "-0.5px" : "0.5px",
            }}
          >
            {w.t}
          </div>
        ))}

        {/* The voice, bottom-left, exactly like the hero block. */}
        <div
          style={{
            position: "absolute",
            left: 84,
            bottom: 74,
            display: "flex",
            flexDirection: "column",
            maxWidth: 640,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 30, color: BONE, fontFamily: serif ? "Newsreader" : "serif" }}>
              Manuel David
            </div>
            <div style={{ fontSize: 19, color: MUTE, fontFamily: sans ? "Plex" : "sans-serif" }}>
              Founding engineer at Configure · San Francisco
            </div>
          </div>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.06,
              color: BONE,
              letterSpacing: "-1.5px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Welcome to my</span>
            <span style={{ fontStyle: "italic" }}>context page.</span>
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 20,
              color: MUTE,
              fontFamily: sans ? "Plex" : "sans-serif",
            }}
          >
            manueldavid.dev
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  )
}
