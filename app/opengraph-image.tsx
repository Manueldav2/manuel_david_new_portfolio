import { ImageResponse } from "next/og"

// Static social card in the site's hero palette:
// espresso base #1a1310, cream text #f3ece2, tan-caramel accent #b0855b.
export const runtime = "edge"
export const alt = "Manuel David — Founding Engineer at Configure"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          backgroundColor: "#1a1310",
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(176,133,91,0.28) 0%, transparent 42%)",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#b0855b",
            fontWeight: 700,
          }}
        >
          manueldavid.dev
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 150,
            lineHeight: 1,
            fontWeight: 900,
            color: "#f3ece2",
            marginTop: 28,
            letterSpacing: -2,
          }}
        >
          MANUEL DAVID
        </div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 600,
            color: "#b0855b",
            marginTop: 32,
          }}
        >
          Founding Engineer at Configure
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(243,236,226,0.7)",
            marginTop: 20,
          }}
        >
          Building context infrastructure for AI agents
        </div>
      </div>
    ),
    { ...size }
  )
}
