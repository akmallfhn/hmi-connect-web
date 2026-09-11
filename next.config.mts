import type { NextConfig } from "next";

const SESSION_COOKIE_NAME = "session_token_hmi";

// Host matchers per site: the real domain plus the local hosts-file entry; Vercel redirects its own deploy host to www.
const WWW_HOSTS =
  "(www\\.example\\.com|(www\\.)?hmiconnect\\.id)(:[0-9]+)?";
const ADMIN_HOSTS = "(admin\\.example\\.com|admin\\.hmiconnect\\.id)(:[0-9]+)?";
const ALL_HOSTS =
  "((www|admin)\\.example\\.com|(www\\.|admin\\.)?hmiconnect\\.id)(:[0-9]+)?";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  // Force revalidation on every site host so a cookie-dependent response never gets served stale.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "host",
            value: ALL_HOSTS,
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
          "/:path((?!auth/login|api/auth/callback/google|profile/.*|trainings(?:/.*)?|invitations/.*|feeds/.*|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
        has: [
          {
            type: "header",
            key: "host",
            value: WWW_HOSTS,
          },
        ],
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "/auth/login",
        permanent: false,
      },
      // No session cookie on the admin subdomain -> bounce to the main site's login.
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "admin\\.example\\.com:3000",
          },
        ],
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "https://www.example.com:3000/auth/login",
        basePath: false,
        permanent: false,
      },
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "admin\\.hmiconnect\\.id(:[0-9]+)?",
          },
        ],
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "https://www.hmiconnect.id/auth/login",
        basePath: false,
        permanent: false,
      },
      // The admin root has no page of its own — its index lives on the main site's /settings.
      {
        source: "/",
        has: [
          {
            type: "header",
            key: "host",
            value: "admin\\.example\\.com:3000",
          },
        ],
        destination: "https://www.example.com:3000/settings",
        basePath: false,
        permanent: false,
      },
      {
        source: "/",
        has: [
          {
            type: "header",
            key: "host",
            value: "admin\\.hmiconnect\\.id(:[0-9]+)?",
          },
        ],
        destination: "https://www.hmiconnect.id/settings",
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
            value: WWW_HOSTS,
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
        // The admin subdomain -> the /admin route group.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: ADMIN_HOSTS,
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
              value: WWW_HOSTS,
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
        "hmiconnect.id",
        "*.hmiconnect.id",
        "example.com",
        "*.example.com",
      ],
    },
  },
};

export default nextConfig;
