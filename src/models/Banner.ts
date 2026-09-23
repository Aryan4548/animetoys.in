import mongoose, { Schema, model, models } from "mongoose";

export interface IBanner extends mongoose.Document {
  title: string;
  image: string;
  mobileImage?: string;
  link?: string;
  placement: string; // e.g. "homepage-hero", "preorder-strip", "wholesale-strip"
  isActive: boolean;
  sortOrder: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    mobileImage: { type: String },
    link: { type: String },
    placement: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export default models.Banner || model<IBanner>("Banner", BannerSchema);
