import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -100,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: "#161616",
              borderRadius: 18,
              border: "1.5px solid rgba(124,58,237,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Corner bracket */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                width: 22,
                height: 22,
                borderTop: "4px solid #7c3aed",
                borderLeft: "4px solid #7c3aed",
                borderRadius: "2px 0 0 0",
              }}
            />
            {/* Slash */}
            <div
              style={{
                position: "absolute",
                bottom: 13,
                left: 28,
                width: 4,
                height: 24,
                background: "#0ea5e9",
                transform: "rotate(-18deg)",
                borderRadius: 2,
              }}
            />
            {/* Chevron */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                right: 12,
                width: 14,
                height: 14,
                borderTop: "4px solid #0ea5e9",
                borderRight: "4px solid #0ea5e9",
                transform: "rotate(45deg)",
              }}
            />
          </div>

          {/* Brand name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-1px",
                lineHeight: 1,
              }}
            >
              Webistrydev
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Full-Stack Web Developer
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 560,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(14,165,233,0.5), transparent)",
            marginBottom: 32,
          }}
        />

        {/* Tagline */}
        <p
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Fast, elegant websites & web applications for businesses worldwide
        </p>
      </div>
    ),
    { ...size }
  );
}
