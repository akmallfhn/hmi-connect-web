import type { NextConfig } from "next";

const SESSION_COOKIE_NAME = "session_token_hmi";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  // Force revalidation on www.example.com so a cookie-dependent response never gets served stale.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "host",
            value: "www.(example.com).*",
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
      // No session cookie on a protected path -> send to /auth/login and remember where they were headed.
      {
        source:
          "/:path((?!auth/login|api/auth/callback/google|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "/auth/login",
        permanent: false,
      },
      // Already signed in -> don't show the login page again.
      {
        source: "/auth(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "www.(example.com).*",
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
      // Hide the internal "/www" route group from direct access.
      beforeFiles: [
        {
          source: "/www",
          destination: "/_not-found/page",
        },
      ],
      afterFiles: [
        // Everything else falls through into the /www route group.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "www.(example.com).*",
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
      allowedOrigins: ["example.com", "*.example.com"],
    },
  },
};

export default nextConfig;
