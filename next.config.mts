import type { NextConfig } from "next";

const SESSION_COOKIE_NAME = "session_token_hmi";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  // Force revalidation on www.example.com/admin.example.com so a cookie-dependent response never gets served stale.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "host",
            value:
              "((www|admin).(example.com)|hmi-connect-web\\.vercel\\.app).*",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // No session cookie on a protected path -> send to /auth/login
      {
        source:
          "/:path((?!auth/login|api/auth/callback/google|profile/.*|feeds/.*|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "(www.(example.com)|hmi-connect-web\\.vercel\\.app).*",
          },
        ],
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "/auth/login",
        permanent: false,
      },
      // No session cookie on the admin subdomain -> bounce out to the main site's login page.
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "host",
            value: "admin.(example.com).*",
          },
        ],
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "https://www.example.com/auth/login",
        basePath: false,
        permanent: false,
      },
      // Already signed in -> don't show the login page again.
      {
        source: "/auth(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "(www.(example.com)|hmi-connect-web\\.vercel\\.app).*",
          },
          { type: "cookie", key: SESSION_COOKIE_NAME, value: undefined },
        ],
        destination: "/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      // Hide the internal "/www" and "/admin" route groups from direct access.
      beforeFiles: [
        {
          source: "/(www|admin)",
          destination: "/_not-found/page",
        },
      ],
      afterFiles: [
        // admin.example.com -> the /admin route group.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "admin.(example.com).*",
            },
          ],
          destination: "/admin/:path*",
        },
        // Everything else falls through into the /www route group.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "(www.(example.com)|hmi-connect-web\\.vercel\\.app).*",
            },
          ],
          destination: "/www/:path*",
        },
      ],
    };
  },
  allowedDevOrigins: ["example.com", "*.example.com"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "example.com",
        "*.example.com",
        "hmi-connect-web.vercel.app",
      ],
    },
  },
};

export default nextConfig;
