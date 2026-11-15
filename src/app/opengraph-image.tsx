import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse cannot read CSS variables, so the Cobalt token values are repeated here.
const c = { bg: "#e4e4e1", ink: "#111111", muted: "#55554f", accent: "#3b5bff" };

// shortcut: uses the default OG font, not Host Grotesk/Silkscreen; load the font files here in the polish stage.
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: c.bg,
        color: c.ink,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32 }}>
        <span>PBS</span>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: c.ink }} />
          <div style={{ width: 24, height: 24, background: c.accent }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 88, letterSpacing: -3, lineHeight: 1 }}>{profile.name}</span>
        <span style={{ fontSize: 36, color: c.muted, marginTop: 24 }}>{profile.roleLine}</span>
      </div>
    </div>,
    size,
  );
}
