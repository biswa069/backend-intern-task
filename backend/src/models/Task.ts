import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "pending" | "completed";
  user: Types.ObjectId;
}

const schema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const Task = mongoose.model<ITask>("Task", schema);