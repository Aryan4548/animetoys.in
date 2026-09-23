import mongoose, { Schema, model, models } from "mongoose";

export type ProductStatus = "draft" | "published" | "archived";

export interface IProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface IProduct extends mongoose.Document {
  name: string;
  sku: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  brand?: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  series?: string;
  character?: string;
  price: number;
  mrp: number;
  costPrice?: number;
  // Public dual pricing: once a buyer's quantity for this product reaches
  // wholesaleMoq, wholesalePrice is charged per unit instead of `price`.
  // Both are optional — leave unset for a product with no wholesale tier.
  wholesalePrice?: number;
  wholesaleMoq?: number;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: IProductDimensions;
  images: string[];
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  isPreorder: boolean;
  releaseDate?: Date;
  preorderClosingDate?: Date;
  status: ProductStatus;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;

  // virtuals
  discountPercent?: number;
  available?: number;
  inventoryStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    shortDescription: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    series: { type: String, trim: true },
    character: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    wholesalePrice: { type: Number, min: 0 },
    wholesaleMoq: { type: Number, min: 2 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    reserved: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    featured: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    isPreorder: { type: Boolean, default: false, index: true },
    releaseDate: { type: Date },
    preorderClosingDate: { type: Date },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.virtual("discountPercent").get(function (this: IProduct) {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

ProductSchema.virtual("available").get(function (this: IProduct) {
  return Math.max(0, this.stock - this.reserved);
});

ProductSchema.virtual("inventoryStatus").get(function (this: IProduct) {
  if (this.isPreorder) return "PREORDER";
  const available = Math.max(0, this.stock - this.reserved);
  if (available <= 0) return "OUT_OF_STOCK";
  if (available <= this.lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ status: 1, category: 1 });
ProductSchema.index({ status: 1, brand: 1 });
ProductSchema.index({ status: 1, featured: 1 });
ProductSchema.index({ status: 1, newArrival: 1 });
ProductSchema.index({ status: 1, isPreorder: 1 });

export default models.Product || model<IProduct>("Product", ProductSchema);
