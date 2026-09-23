import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User, { type IAddress } from "@/models/User";
import { addressSchema } from "@/lib/validators";
import { handleApiError, isResponse, jsonError, requireUser } from "@/lib/apiHelpers";

interface Params {
  params: Promise<{ addressId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const { addressId } = await params;
    const body = await req.json();
    const data = addressSchema.partial().parse(body);

    const user = await User.findById(session.sub);
    if (!user) return jsonError("User not found.", 404);

    const address = user.addresses.id(addressId);
    if (!address) return jsonError("Address not found.", 404);

    if (data.isDefault) {
      user.addresses.forEach((a: IAddress) => (a.isDefault = false));
    }

    Object.assign(address, data);
    await user.save();

    return NextResponse.json({ addresses: user.addresses });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const { addressId } = await params;

    const user = await User.findById(session.sub);
    if (!user) return jsonError("User not found.", 404);

    user.addresses = user.addresses.filter((a: IAddress) => String(a._id) !== addressId) as any;
    await user.save();

    return NextResponse.json({ addresses: user.addresses });
  } catch (err) {
    return handleApiError(err);
  }
}
