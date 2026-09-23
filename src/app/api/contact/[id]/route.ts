import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const message = await ContactMessage.findByIdAndUpdate(id, { isRead: !!body.isRead }, { new: true });
    if (!message) return jsonError("Message not found.", 404);

    return NextResponse.json({ message });
  } catch (err) {
    return handleApiError(err);
  }
}
