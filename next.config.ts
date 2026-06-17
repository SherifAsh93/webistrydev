import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Only redirect when visited from the old Vercel deployment URL
        source: "/:path*",
        has: [{ type: "host", value: "webistrydev.vercel.app" }],
        destination: "https://webistrydev.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
