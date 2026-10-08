import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://meridianpress.pub";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/api/admin",
        "/api/admin/*",
        "/api/download/*",
        "/api/payments/*",
        "/orders/recover",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
