import mongoose, { Schema, model, models, Types } from "mongoose";

export interface IAddress {
  _id?: Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type UserRole = "customer" | "admin";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  addresses: IAddress[];
  isWholesaleApproved: boolean;
  wholesalePricingTier?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    addresses: { type: [AddressSchema], default: [] },
    isWholesaleApproved: { type: Boolean, default: false },
    wholesalePricingTier: { type: String },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
