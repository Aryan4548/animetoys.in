import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getGoogleOAuthConfig, getSiteUrl } from "@/lib/googleOAuth";

// Short-lived, httpOnly — read back once in the callback and deleted there.
const STATE_COOKIE = "google_oauth_state";
const NEXT_COOKIE = "google_oauth_next";
const COOKIE_MAX_AGE = 10 * 60; // 10 minutes is plenty for a Google login round-trip

/** Starting point for "Continue with Google" — redirects to Google's consent screen. */
export async function GET(req: NextRequest) {
  let config;
  try {
    config = getGoogleOAuthConfig();
  } catch {
    const url = new URL("/login", getSiteUrl());
    url.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(url);
  }

  // CSRF guard: the callback only accepts a code if it comes back with this
  // same value, so a forged callback request can't log someone in.
  const state = crypto.randomBytes(16).toString("hex");
  const nextParam = req.nextUrl.searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/account";

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl);
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
  res.cookies.set(STATE_COOKIE, state, cookieOpts);
  res.cookies.set(NEXT_COOKIE, next, cookieOpts);
  return res;
}
