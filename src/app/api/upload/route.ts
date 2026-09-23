import { NextRequest, NextResponse } from "next/server";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";
import { saveUploadedFile, type MediaCategory } from "@/lib/media";

const VALID_CATEGORIES: MediaCategory[] = ["products", "categories", "brands", "banners", "blog"];

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    const formData = await req.formData();
    const file = formData.get("file");
    const categoryRaw = (formData.get("category") as string) || "products";
    const category = VALID_CATEGORIES.includes(categoryRaw as MediaCategory) ? (categoryRaw as MediaCategory) : "products";

    if (!(file instanceof File)) return jsonError("No file uploaded.", 400);

    const saved = await saveUploadedFile(file, category);

    return NextResponse.json({ url: saved.url, path: saved.relativePath }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && /Unsupported file type|too large/.test(err.message)) {
      return jsonError(err.message, 422);
    }
    return handleApiError(err);
  }
}
