import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import WholesaleApplication from "@/models/WholesaleApplication";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  adminNotes: z.string().max(2000).optional(),
  assignedPricingTier: z.string().max(80).optional(),
});

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
    const data = schema.parse(body);

    const application = await WholesaleApplication.findById(id);
    if (!application) return jsonError("Application not found.", 404);

    Object.assign(application, data);
    if (data.status && data.status !== "PENDING") {
      application.reviewedBy = session.sub as any;
      application.reviewedAt = new Date();
    }
    await application.save();

    return NextResponse.json({ application });
  } catch (err) {
    return handleApiError(err);
  }
}
