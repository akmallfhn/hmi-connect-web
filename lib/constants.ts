export const SESSION_COOKIE_NAME = "session_token_hmi";

// sessionStorage key + window event name (same string, different APIs) the bottom navbar's
// compose button uses to tell the home feed to open the create-post modal after navigating.
export const COMPOSE_INTENT_KEY = "hmi-compose-intent";

// Companion sessionStorage key — when set alongside COMPOSE_INTENT_KEY (e.g. by
// RepostToFeedButton), the home feed opens the composer pre-filled with this URL instead of
// a blank post. Read once and cleared, same as COMPOSE_INTENT_KEY.
export const COMPOSE_INTENT_URL_KEY = "hmi-compose-intent-url";
