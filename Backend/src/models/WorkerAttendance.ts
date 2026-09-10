import { Document, Schema, model } from "mongoose";

export const GEO_ATTENDANCE_STATUSES = ["Pending", "Present", "Absent"] as const;
export type GeoAttendanceStatus = (typeof GEO_ATTENDANCE_STATUSES)[number];

export interface IWorkerAttendance extends Document {
  workerId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: string;
  timestamp?: Date;
  date?: string;
  shift?: string;
  inTime?: string;
  outTime?: string;
  gate?: string;
}

const workerAttendanceSchema = new Schema<IWorkerAttendance>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "User" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    imageUrl: { type: String, trim: true },
    location: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    status: {
      type: String,
      enum: [...GEO_ATTENDANCE_STATUSES, "Present (Biometric)"],
      default: "Pending"
    },
    timestamp: { type: Date },
    date: { type: String },
    shift: { type: String },
    inTime: { type: String },
    outTime: { type: String },
    gate: { type: String, default: "Turnstile Pit-Head #1" }
  },
  { timestamps: true }
);

export const WorkerAttendance = model<IWorkerAttendance>("WorkerAttendance", workerAttendanceSchema);
