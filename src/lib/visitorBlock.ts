import { connectDB } from "@/lib/db";
import BlockedIp from "@/models/BlockedIp";

/**
 * Looked up on every storefront page render (see src/app/(store)/layout.tsx,
 * the only caller). Returns the block record — with its `reason`, if the
 * admin gave one — when this IP is currently on the block list, else null.
 * A fast, indexed `findOne` on the unique `ip` field; cheap enough to run
 * per request without a cache.
 */
export async function getBlockRecord(ip: string): Promise<{ ip: string; reason?: string } | null> {
  if (!ip || ip === "unknown") return null;
  await connectDB();
  return BlockedIp.findOne({ ip }).lean();
}
