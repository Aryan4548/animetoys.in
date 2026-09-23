import mongoose, { Schema, model, models } from "mongoose";

// Phase 2: dedicated preorder allocation management. Product.isPreorder /
// releaseDate / preorderClosingDate already drive the storefront preorder
// badge and checkout flow in phase 1; this model adds allocation tracking
// on top once the wholesale/preorder admin screens are built.
export type PreorderStatus = "OPEN" | "CLOSING_SOON" | "CLOSED" | "RELEASED" | "CANCELLED";

export interface IPreorder extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  expectedReleaseDate: Date;
  preorderClosingDate: Date;
  preorderPrice: number;
  depositAmount?: number;
  totalAllocation: number;
  reservedQuantity: number;
  status: PreorderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PreorderSchema = new Schema<IPreorder>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    expectedReleaseDate: { type: Date, required: true },
    preorderClosingDate: { type: Date, required: true },
    preorderPrice: { type: Number, required: true },
    depositAmount: { type: Number },
    totalAllocation: { type: Number, required: true, default: 0 },
    reservedQuantity: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["OPEN", "CLOSING_SOON", "CLOSED", "RELEASED", "CANCELLED"],
      default: "OPEN",
      index: true,
    },
  },
  { timestamps: true }
);

export default models.Preorder || model<IPreorder>("Preorder", PreorderSchema);
