import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/fix-center",
        "/history",
        "/settings",
        "/onboarding",
        "/api/",
        "/audit/results/",
        "/coming-soon",
      ],
    },
    sitemap: "https://link-medic.app/sitemap.xml",
  };
}
