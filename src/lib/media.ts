import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Media storage abstraction. Today this only implements a local-disk driver
 * (files written under MEDIA_ROOT, served back via /api/media/[...path]).
 * To migrate to S3/Cloudinary/R2 later, implement the same
 * `saveFile`/`getPublicUrl` interface against that provider and swap the
 * export — nothing else in the app needs to change.
 */

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export type MediaCategory = "products" | "categories" | "brands" | "banners" | "blog";

function mediaRoot(): string {
  return process.env.MEDIA_ROOT || path.join(process.cwd(), "storage");
}

function safeExtension(filename: string, mimeType: string): string {
  const fromMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return fromMime[mimeType] || path.extname(filename).toLowerCase() || ".bin";
}

export interface SavedFile {
  relativePath: string; // e.g. "products/1699999-abc123.jpg"
  url: string; // e.g. "/api/media/products/1699999-abc123.jpg"
}

export async function saveUploadedFile(
  file: File,
  category: MediaCategory
): Promise<SavedFile> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type. Only JPG, PNG, WEBP and GIF images are allowed.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Maximum size is 5MB.");
  }

  const dir = path.join(mediaRoot(), category);
  await mkdir(dir, { recursive: true });

  const ext = safeExtension(file.name, file.type);
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const fullPath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  const relativePath = `${category}/${filename}`;
  return { relativePath, url: `/api/media/${relativePath}` };
}

export function resolveMediaPath(relativeSegments: string[]): string {
  // Prevent path traversal: reject any segment containing "..".
  if (relativeSegments.some((s) => s.includes(".."))) {
    throw new Error("Invalid path.");
  }
  return path.join(mediaRoot(), ...relativeSegments);
}
