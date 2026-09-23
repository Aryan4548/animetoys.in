import mongoose, { Schema, model, models } from "mongoose";

export type InventoryTransactionType =
  | "RESTOCK"
  | "ORDER"
  | "CANCELLATION"
  | "RETURN"
  | "DAMAGED"
  | "MANUAL_ADJUSTMENT";

export interface IInventoryTransaction extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  type: InventoryTransactionType;
  quantityChange: number; // positive = stock added, negative = stock removed
  previousStock: number;
  newStock: number;
  order?: mongoose.Types.ObjectId;
  note?: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: {
      type: String,
      enum: ["RESTOCK", "ORDER", "CANCELLATION", "RETURN", "DAMAGED", "MANUAL_ADJUSTMENT"],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    note: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryTransactionSchema.index({ product: 1, createdAt: -1 });

export default models.InventoryTransaction ||
  model<IInventoryTransaction>("InventoryTransaction", InventoryTransactionSchema);
