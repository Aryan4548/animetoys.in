import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Runs on the Edge runtime, so we use `jose` (not `jsonwebtoken`) to verify
// the session token here. Route handlers / server components use
// `src/lib/auth.ts` (jsonwebtoken) for the same job in the Node runtime.
const SESSION_COOKIE = "atu_session";

async function getRole(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return (payload.role as string) || null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const role = await getRole(token);
    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/account") || pathname.startsWith("/wishlist") || pathname.startsWith("/checkout")) {
    const role = await getRole(token);
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/wishlist/:path*", "/checkout/:path*"],
};
