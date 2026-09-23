import mongoose, { Schema, model, models } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  priceAtAdd: number;
}

export interface ICart extends mongoose.Document {
  user?: mongoose.Types.ObjectId | null;
  guestId?: string | null;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtAdd: { type: Number, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    guestId: { type: String, default: null, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Cart || model<ICart>("Cart", CartSchema);
