// Read lazily (inside the function, not at module scope) so that simply
// *importing* this file — which happens for every route that touches it
// during `next build`'s page-data-collection step — never fails just
// because these env vars haven't been set yet. Same pattern as
// getAuthSecret() in lib/auth.ts. The error only fires when someone
// actually clicks "Continue with Google" before the site owner has
// created the OAuth credentials.
export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set. Add them to .env to enable \"Continue with Google\"."
    );
  }
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
    clientId,
    clientSecret,
    // Must match an "Authorized redirect URI" configured on the OAuth
    // client in Google Cloud Console exactly, including scheme and path.
    redirectUri: `${siteUrl}/api/auth/google/callback`,
  };
}
