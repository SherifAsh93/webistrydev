import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://www.webistrydev.com/",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
