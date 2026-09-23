import mongoose, { Schema, model, models } from "mongoose";

export interface IBlogPost extends mongoose.Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author?: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    coverImage: { type: String },
    author: { type: String },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export default models.BlogPost || model<IBlogPost>("BlogPost", BlogPostSchema);
