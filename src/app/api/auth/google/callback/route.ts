import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getGoogleOAuthConfig, getSiteUrl } from "@/lib/googleOAuth";
import { signSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { mergeGuestCartIntoUser } from "@/lib/cartMerge";

const STATE_COOKIE = "google_oauth_state";
const NEXT_COOKIE = "google_oauth_next";

// Google's signing keys for its ID tokens, fetched (and cached/rotated
// automatically) over JWKS — this is what lets us verify the id_token
// below actually came from Google instead of just trusting it blindly.
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function redirectWithError(reason: string) {
  const loginUrl = new URL("/login", getSiteUrl());
  loginUrl.searchParams.set("error", reason);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.delete(STATE_COOKIE);
  res.cookies.delete(NEXT_COOKIE);
  return res;
}

/** Google redirects here after the user approves (or denies) sign-in. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");

  const cookieState = req.cookies.get(STATE_COOKIE)?.value;
  const next = req.cookies.get(NEXT_COOKIE)?.value || "/account";

  if (errorParam) return redirectWithError("google_denied");
  if (!code || !state || !cookieState || state !== cookieState) {
    return redirectWithError("google_state_mismatch");
  }

  let config;
  try {
    config = getGoogleOAuthConfig();
  } catch {
    return redirectWithError("google_not_configured");
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return redirectWithError("google_token_exchange_failed");

    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) return redirectWithError("google_token_exchange_failed");

    const { payload } = await jwtVerify(tokenData.id_token, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: config.clientId,
    });

    const googleId = payload.sub as string;
    const email = (payload.email as string | undefined)?.toLowerCase();
    const emailVerified = payload.email_verified as boolean | undefined;
    const name = (payload.name as string | undefined) || email?.split("@")[0] || "Anime Fan";

    if (!email || !emailVerified) return redirectWithError("google_email_unverified");

    await connectDB();

    // Link onto an existing password account with the same email rather
    // than creating a duplicate — this is what makes "keep both login
    // methods" actually mean the same account either way in.
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
      } else {
        user = new User({ name, email, googleId, role: "customer" });
      }
    }
    if (!user.isActive) return redirectWithError("google_account_disabled");

    user.lastLoginAt = new Date();
    await user.save();

    await mergeGuestCartIntoUser(user._id.toString());

    const token = signSession({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const dest = new URL(next.startsWith("/") ? next : "/account", getSiteUrl());
    const res = NextResponse.redirect(dest);
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(NEXT_COOKIE);
    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return redirectWithError("google_auth_failed");
  }
}
