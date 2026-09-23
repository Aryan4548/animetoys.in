import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User, { type IAddress } from "@/models/User";
import { addressSchema } from "@/lib/validators";
import { handleApiError, isResponse, requireUser } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const body = await req.json();
    const data = addressSchema.parse(body);

    const user = await User.findById(session.sub);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (data.isDefault) {
      user.addresses.forEach((a: IAddress) => (a.isDefault = false));
    }
    if (user.addresses.length === 0) data.isDefault = true;

    user.addresses.push(data as any);
    await user.save();

    return NextResponse.json({ addresses: user.addresses }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
