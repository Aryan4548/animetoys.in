import mongoose, { Schema, model, models } from "mongoose";

export interface IContactMessage extends mongoose.Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default models.ContactMessage || model<IContactMessage>("ContactMessage", ContactMessageSchema);
