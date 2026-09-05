import { Document, Schema, model } from "mongoose";

export interface IMine extends Document {
  name: string;
  code: string;
  location: string;
  operator: string;
  status: "active" | "inactive";
  createdBy: Schema.Types.ObjectId;
}

const mineSchema = new Schema<IMine>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    operator: { type: String, required: true, trim: true, maxlength: 150 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Mine = model<IMine>("Mine", mineSchema);