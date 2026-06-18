import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Corner bracket — top-left L shape */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            width: 54,
            height: 54,
            borderTop: "10px solid #7c3aed",
            borderLeft: "10px solid #7c3aed",
            borderRadius: "6px 0 0 0",
          }}
        />
        {/* Slash line */}
        <div
          style={{
            position: "absolute",
            bottom: 34,
            left: 72,
            width: 10,
            height: 58,
            background: "#0ea5e9",
            transform: "rotate(-18deg)",
            borderRadius: 5,
          }}
        />
        {/* Arrow chevron > */}
        <div
          style={{
            position: "absolute",
            bottom: 34,
            right: 28,
            width: 36,
            height: 36,
            borderTop: "10px solid #0ea5e9",
            borderRight: "10px solid #0ea5e9",
            transform: "rotate(45deg)",
            borderRadius: "0 6px 0 0",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
