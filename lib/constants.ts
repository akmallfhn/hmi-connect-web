export const SESSION_COOKIE_NAME = "session_token_hmi";

// Session cookie domain per DOMAIN_MODE — swap the vercel.app default once a real domain is live.
export function getSessionCookieDomain(): string | undefined {
  return process.env.DOMAIN_MODE === "local"
    ? "example.com"
    : "hmi-connect-web.vercel.app";
}

// Site origins per environment — swap the placeholder/vercel.app values once a real domain is live.
export const DEV_MAIN_SITE_URL = "https://www.example.com:3000";
export const PROD_MAIN_SITE_URL = "https://hmi-connect-web.vercel.app";
export const DEV_ADMIN_SITE_URL = "https://admin.example.com:3000";
export const PROD_ADMIN_SITE_URL = "https://admin.example.com";

// Origin transactional email links must use — they're opened from an inbox, where a dev host resolves to nothing.
export const EMAIL_SITE_ORIGIN = PROD_MAIN_SITE_URL;

// Main site origin per DOMAIN_MODE — for links followed inside this app, never for email.
export function getMainSiteOrigin(): string {
  return process.env.DOMAIN_MODE === "local"
    ? DEV_MAIN_SITE_URL
    : PROD_MAIN_SITE_URL;
}

// Admin site origin per DOMAIN_MODE — same rule, cross-subdomain links only.
export function getAdminSiteOrigin(): string {
  return process.env.DOMAIN_MODE === "local"
    ? DEV_ADMIN_SITE_URL
    : PROD_ADMIN_SITE_URL;
}

// sessionStorage key + window event name the bottom navbar's compose button uses to open the composer after navigating.
export const COMPOSE_INTENT_KEY = "hmi-compose-intent";

// Companion to COMPOSE_INTENT_KEY — when set (e.g. by RepostToFeedButton), the composer opens pre-filled with this URL.
export const COMPOSE_INTENT_URL_KEY = "hmi-compose-intent-url";

// sessionStorage key NewMessageModal uses to hand the picked recipient's profile to /chats/new, since there's no conversation id yet.
export const CHAT_NEW_RECIPIENT_KEY = "hmi-chat-new-recipient";

// No roles/list endpoint on the backend — ids come from ordina's RoleName* consts. Administrator (1) was dropped when access_grants replaced can_manage_*.
export const USER_ROLE_OPTIONS = [
  { label: "Super Admin", value: 0 },
  { label: "General User", value: 2 },
];
