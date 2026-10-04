import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/m/", "/lead"],
      },
    ],
    sitemap: "https://www.webistrydev.com/sitemap.xml",
    host: "https://www.webistrydev.com",
  };
}
