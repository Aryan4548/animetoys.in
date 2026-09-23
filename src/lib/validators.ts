import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  phone: z.string().trim().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
  label: z.string().trim().max(40).default("Home"),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  line1: z.string().trim().min(3).max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().min(2).max(56).default("India"),
  isDefault: z.boolean().optional().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  sku: z.string().trim().min(2).max(40),
  slug: z.string().trim().min(2).max(180).optional(),
  description: z.string().max(20000).optional(),
  shortDescription: z.string().max(500).optional(),
  // The admin form sends "" when the Brand/Category dropdown is left on
  // "None" — treat that the same as omitted, otherwise Mongoose tries to
  // cast an empty string to an ObjectId and throws.
  brand: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : undefined)),
  category: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : undefined)),
  series: z.string().max(120).optional(),
  character: z.string().max(120).optional(),
  price: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0).optional(),
  // Public wholesale tier: charged per unit once a buyer's quantity for
  // this product reaches wholesaleMoq. Leave both unset for no tier.
  wholesalePrice: z.coerce.number().min(0).optional(),
  wholesaleMoq: z.coerce.number().int().min(2).optional(),
  stock: z.coerce.number().min(0).default(0),
  lowStockThreshold: z.coerce.number().min(0).default(5),
  weight: z.coerce.number().min(0).optional(),
  dimensions: z
    .object({
      length: z.coerce.number().optional(),
      width: z.coerce.number().optional(),
      height: z.coerce.number().optional(),
    })
    .optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  isPreorder: z.boolean().default(false),
  releaseDate: z.string().optional().nullable(),
  preorderClosingDate: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  image: z.string().optional(),
  // Same "" vs ObjectId issue as Product.brand/category above.
  parent: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : undefined)),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).optional(),
  logo: z.string().optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["COD", "RAZORPAY"]).default("COD"),
});

export const inventoryAdjustSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["RESTOCK", "DAMAGED", "MANUAL_ADJUSTMENT"]),
  quantityChange: z.coerce.number().int().refine((v) => v !== 0, "Quantity change cannot be zero"),
  note: z.string().max(500).optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
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
  ]).optional(),
  trackingNumber: z.string().max(80).optional(),
  courier: z.string().max(80).optional(),
  note: z.string().max(500).optional(),
});
