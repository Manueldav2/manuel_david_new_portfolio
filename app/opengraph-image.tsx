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
          padding: "84px 90px",
          backgroundColor: "#1a1310",
          backgroundImage:
            "radial-gradient(circle at 80% 16%, rgba(176,133,91,0.30) 0%, transparent 44%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
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
            flexDirection: "column",
            marginTop: 30,
            color: "#f3ece2",
            fontWeight: 900,
            fontSize: 132,
            lineHeight: 1.02,
            letterSpacing: -3,
          }}
        >
          <div style={{ display: "flex" }}>MANUEL</div>
          <div style={{ display: "flex" }}>DAVID</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 600,
            color: "#b0855b",
            marginTop: 40,
          }}
        >
          Founding Engineer at Configure
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(243,236,226,0.72)",
            marginTop: 18,
          }}
        >
          Building context infrastructure for AI agents
        </div>
      </div>
    ),
    { ...size }
  )
}
