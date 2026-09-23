import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { resolveMediaPath } from "@/lib/media";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

interface Params {
  params: Promise<{ path: string[] }>;
}

/**
 * Serves locally-stored media in development. In production, point Nginx at
 * MEDIA_ROOT directly (see deploy/nginx.conf) so image requests never hit
 * Node at all — this route stays as a fallback / dev-mode server.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { path: segments } = await params;

  try {
    const fullPath = resolveMediaPath(segments);
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) return new NextResponse("Not found", { status: 404 });

    const buffer = await readFile(fullPath);
    const ext = segments[segments.length - 1].slice(segments[segments.length - 1].lastIndexOf("."));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
