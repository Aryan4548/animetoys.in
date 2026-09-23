import mongoose, { Schema, model, models } from "mongoose";

export type WholesaleApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IWholesaleApplication extends mongoose.Document {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  businessType: string;
  website?: string;
  instagram?: string;
  monthlyOrderVolume: string;
  productCategories: string[];
  message?: string;
  status: WholesaleApplicationStatus;
  adminNotes?: string;
  assignedPricingTier?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleApplicationSchema = new Schema<IWholesaleApplication>(
  {
    businessName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    businessType: { type: String, required: true },
    website: { type: String },
    instagram: { type: String },
    monthlyOrderVolume: { type: String, required: true },
    productCategories: { type: [String], default: [] },
    message: { type: String },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
    adminNotes: { type: String },
    assignedPricingTier: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default models.WholesaleApplication ||
  model<IWholesaleApplication>("WholesaleApplication", WholesaleApplicationSchema);
