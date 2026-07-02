import type { NextConfig } from "next";

const SESSION_COOKIE_NAME = "session_token_hmi";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ["example.com", "*.example.com"],
  async redirects() {
    return [
      {
        source:
          "/:path((?!auth/login|api/auth/callback/google|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "/auth/login?redirectTo=/:path",
        permanent: false,
      },
      {
        source: "/auth/login",
        has: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/www",
          destination: "/_not-found/page",
        },
      ],
      afterFiles: [
        {
          source: "/:path*",
          destination: "/www/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
