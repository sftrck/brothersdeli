import type { MetadataRoute } from "next";

const BASE = "https://www.thebrothersdeli.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/order", priority: 0.9 },
    { path: "/catering", priority: 0.8 },
    { path: "/our-story", priority: 0.6 },
    { path: "/visit", priority: 0.7 },
  ];
  return pages.map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p.priority,
  }));
}
