import mongoose, { Schema, model, models } from "mongoose";

export interface IBlockedIp extends mongoose.Document {
  ip: string;
  reason?: string;
  blockedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlockedIpSchema = new Schema<IBlockedIp>(
  {
    ip: { type: String, required: true, unique: true, trim: true },
    reason: { type: String, trim: true, maxlength: 200 },
    // Denormalized (not a ref) — just the admin's display name at the time
    // they blocked this IP, for a quick "blocked by" column. If that admin
    // account is later renamed/removed this stays as a historical snapshot.
    blockedByName: { type: String, trim: true },
  },
  { timestamps: true }
);

export default models.BlockedIp || model<IBlockedIp>("BlockedIp", BlockedIpSchema);
