export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Falls back to /login if OAuth is not configured (self-hosted mode).
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // If OAuth is not configured, fall back to local login page
  if (!oauthPortalUrl || oauthPortalUrl === 'undefined' || !appId || appId === 'undefined') {
    return returnPath ? `/login?return=${encodeURIComponent(returnPath)}` : '/login';
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch {
    // If URL construction fails, fall back to local login page
    return returnPath ? `/login?return=${encodeURIComponent(returnPath)}` : '/login';
  }
};
