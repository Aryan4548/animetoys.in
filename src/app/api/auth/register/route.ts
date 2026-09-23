import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validators";
import { hashPassword, signSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/apiHelpers";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { mergeGuestCartIntoUser } from "@/lib/cartMerge";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const limited = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!limited.ok) return jsonError("Too many attempts. Please try again later.", 429);

    const body = await req.json();
    const data = registerSchema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email: data.email }).lean();
    if (existing) return jsonError("An account with this email already exists.", 409);

    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      role: "customer",
    });

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
