import type { MetadataRoute } from "next";

const BASE_URL = "https://acroretreat.co.il";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/he/sign-in",
          "/en/sign-in",
          "/he/sign-up",
          "/en/sign-up",
          "/he/reset-password",
          "/en/reset-password",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
