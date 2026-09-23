import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validators";
import { verifyPassword, signSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/apiHelpers";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { mergeGuestCartIntoUser } from "@/lib/cartMerge";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const limited = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!limited.ok) return jsonError("Too many attempts. Please try again later.", 429);

    const body = await req.json();
    const data = loginSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email: data.email }).select("+passwordHash");
    if (!user || !user.isActive) return jsonError("Invalid email or password.", 401);

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) return jsonError("Invalid email or password.", 401);

    user.lastLoginAt = new Date();
    await user.save();

    await mergeGuestCartIntoUser(user._id.toString());

    const token = signSession({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
