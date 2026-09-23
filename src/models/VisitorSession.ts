import mongoose, { Schema, model, models } from "mongoose";

// One document per browser (keyed by an anonymous `visitorId` cookie, see
// /api/track/heartbeat), continuously upserted rather than inserted fresh
// per ping — so the collection size tracks distinct visitors ever seen,
// not total pings. "Currently online" (see /api/admin/visitors) is just a
// query on `lastSeenAt` recency, not a separate live/dead flag.
export interface IVisitorSession extends mongoose.Document {
  visitorId: string;
  ip: string;
  path: string;
  // Set only while the visitor is logged in at ping time — a denormalized
  // snapshot of their session name, not a live lookup, so this naturally
  // reads "Guest" for anyone not signed in.
  userId?: string | null;
  name?: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

const VisitorSessionSchema = new Schema<IVisitorSession>({
  visitorId: { type: String, required: true, unique: true },
  ip: { type: String, required: true, index: true },
  path: { type: String, default: "/" },
  userId: { type: String, default: null },
  name: { type: String, default: null },
  firstSeenAt: { type: Date, default: Date.now },
  // TTL index: Mongo's background sweep deletes a document ~30 days after
  // its `lastSeenAt`, so long-gone one-time guests don't accumulate
  // forever. This is independent of "online now" (that's a recency query
  // in /api/admin/visitors), it's purely collection hygiene.
  lastSeenAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30, index: true },
});

export default models.VisitorSession || model<IVisitorSession>("VisitorSession", VisitorSessionSchema);
