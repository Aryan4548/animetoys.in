import mongoose, { Schema, model, models } from "mongoose";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  image?: string;
  price: number;
  priceType: "retail" | "wholesale";
  quantity: number;
  isPreorder: boolean;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderStatusHistoryEntry {
  status: OrderStatus;
  note?: string;
  changedAt: Date;
}

export interface IOrder extends mongoose.Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId | null;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: IShippingAddress;
  paymentMethod: "COD" | "RAZORPAY";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  trackingNumber?: string;
  courier?: string;
  notes: string[];
  statusHistory: IOrderStatusHistoryEntry[];
  stockRestored: boolean;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    priceType: { type: String, enum: ["retail", "wholesale"], default: "retail" },
    quantity: { type: Number, required: true, min: 1 },
    isPreorder: { type: Boolean, default: false },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    trackingNumber: { type: String },
    courier: { type: String },
    notes: { type: [String], default: [] },
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          note: { type: String },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    stockRestored: { type: Boolean, default: false },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default models.Order || model<IOrder>("Order", OrderSchema);
