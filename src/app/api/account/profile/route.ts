import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { profileUpdateSchema } from "@/lib/validators";
import { handleApiError, isResponse, requireUser } from "@/lib/apiHelpers";

/** Lets a logged-in customer update their own name/phone from /account/settings. */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const body = await req.json();
    const data = profileUpdateSchema.parse(body);

    const user = await User.findById(session.sub);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    user.name = data.name;
    user.phone = data.phone ? data.phone : undefined;
    await user.save();

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        isWholesaleApproved: user.isWholesaleApproved,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
