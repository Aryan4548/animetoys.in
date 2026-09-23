import mongoose, { Schema, model, models } from "mongoose";

// Phase 2: per-product wholesale pricing, visible only to approved
// wholesale accounts (User.isWholesaleApproved).
export interface IWholesalePrice extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  pricingTier: string;
  price: number;
  moq: number;
  createdAt: Date;
  updatedAt: Date;
}

const WholesalePriceSchema = new Schema<IWholesalePrice>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    pricingTier: { type: String, required: true },
    price: { type: Number, required: true },
    moq: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

WholesalePriceSchema.index({ product: 1, pricingTier: 1 }, { unique: true });

export default models.WholesalePrice || model<IWholesalePrice>("WholesalePrice", WholesalePriceSchema);
