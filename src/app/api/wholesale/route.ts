import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import WholesaleApplication from "@/models/WholesaleApplication";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  businessName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(6).max(20),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  businessType: z.string().trim().min(2).max(120),
  website: z.string().trim().max(200).optional(),
  instagram: z.string().trim().max(120).optional(),
  monthlyOrderVolume: z.string().trim().min(1).max(80),
  productCategories: z.array(z.string()).default([]),
  message: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter: Record<string, unknown> = {};
    if (searchParams.get("status")) filter.status = searchParams.get("status");

    const applications = await WholesaleApplication.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ applications });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const limited = rateLimit(`wholesale:${ip}`, 5, 60 * 60 * 1000);
    if (!limited.ok) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

    await connectDB();
    const body = await req.json();
    const data = schema.parse(body);

    const application = await WholesaleApplication.create(data);
    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
