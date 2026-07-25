export const SESSION_COOKIE_NAME = "session_token_hmi";

// Session cookie domain per DOMAIN_MODE — swap the vercel.app default once a real domain is live.
export function getSessionCookieDomain(): string | undefined {
  return process.env.DOMAIN_MODE === "local"
    ? "example.com"
    : "hmi-connect-web.vercel.app";
}

// Main site origin per DOMAIN_MODE — swap the vercel.app default once a real domain is live.
export function getMainSiteOrigin(): string {
  return process.env.DOMAIN_MODE === "local"
    ? "https://www.example.com:3000"
    : "https://hmi-connect-web.vercel.app";
}

// sessionStorage key + window event name the bottom navbar's compose button uses to open the composer after navigating.
export const COMPOSE_INTENT_KEY = "hmi-compose-intent";

// Companion to COMPOSE_INTENT_KEY — when set (e.g. by RepostToFeedButton), the composer opens pre-filled with this URL.
export const COMPOSE_INTENT_URL_KEY = "hmi-compose-intent-url";

// sessionStorage key NewMessageModal uses to hand the picked recipient's profile to /chats/new, since there's no conversation id yet.
export const CHAT_NEW_RECIPIENT_KEY = "hmi-chat-new-recipient";
