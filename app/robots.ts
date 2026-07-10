import type { MetadataRoute } from "next";
import { siteOrigin } from "@/app/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/owner/",
          "/api/",
          "/auth/callback",
          "/pending-approval",
          "/account-disabled",
        ],
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
