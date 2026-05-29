// Corner bracket ⌐ + /> — represents "corner" (bracket) + "web" (code)
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Web Corner logo"
    >
      <path
        d="M4 22 L4 4 L22 4"
        stroke="url(#wc-g)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 30 L20 14"
        stroke="url(#wc-g)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M22 20 L28 25 L22 30"
        stroke="url(#wc-g)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="wc-g" x1="4" y1="4" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
