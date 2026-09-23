import mongoose, { Schema, model, models } from "mongoose";

export interface INewsletterSubscriber extends mongoose.Document {
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.NewsletterSubscriber ||
  model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);
