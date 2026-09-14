import type { MetadataRoute } from "next";

const BASE = "https://www.thebrothersdeli.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
