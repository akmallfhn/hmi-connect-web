import type { MetadataRoute } from "next";
import { getMainSiteOrigin } from "@/lib/constants";

// Private surfaces bounce a crawler to login anyway; disallowing them just saves the crawl budget.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/activation",
        "/verification",
        "/settings",
        "/chats",
        "/notifications",
        "/official/",
        "/invitations/",
        "/reset-password/",
        "/auth/forget-password",
        "/articles/create",
        "/*/edit",
        "/*?as=",
      ],
    },
    // The index at /sitemap.xml names every per-type sitemap, so it's the only one to advertise.
    sitemap: `${getMainSiteOrigin()}/sitemap.xml`,
    host: getMainSiteOrigin(),
  };
}
