import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/auth";
import { ZodError } from "zod";
import mongoose from "mongoose";

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...(extra || {}) }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError("Validation failed", 422, { issues: err.issues });
  }
  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    return jsonError("A record with these details already exists.", 409);
  }
  // Mongoose schema validation (e.g. a field failing min/max/enum) or a
  // bad type cast (e.g. an empty string sent for an ObjectId field) — both
  // are caller mistakes, not server bugs, so surface the real reason
  // instead of the generic 500 fallback below.
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)[0]?.message || "Validation failed.";
    return jsonError(message, 422);
  }
  if (err instanceof mongoose.Error.CastError) {
    return jsonError(`Invalid value for "${err.path}".`, 422);
  }
  console.error(err);
  return jsonError("Something went wrong. Please try again.", 500);
}

/** Requires any logged-in user. Returns the session or a 401 NextResponse. */
export async function requireUser(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("You must be logged in.", 401);
  return session;
}

/** Requires an admin. Returns the session or a 401/403 NextResponse. */
export async function requireAdmin(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("You must be logged in.", 401);
  if (session.role !== "admin") return jsonError("Admin access required.", 403);
  return session;
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}
