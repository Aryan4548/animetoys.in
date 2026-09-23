import mongoose, { Schema, model, models } from "mongoose";

// Phase 2: Homepage CMS. Lets admin reorder/toggle homepage sections and
// edit their headline/subtext without touching code.
export interface IHomepageSection extends mongoose.Document {
  key: string; // e.g. "hero", "shop-by-category", "preorder", "wholesale", "new-arrivals", "featured", "collector-community", "newsletter"
  title?: string;
  subtitle?: string;
  isVisible: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const HomepageSectionSchema = new Schema<IHomepageSection>(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String },
    subtitle: { type: String },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default models.HomepageSection || model<IHomepageSection>("HomepageSection", HomepageSectionSchema);
