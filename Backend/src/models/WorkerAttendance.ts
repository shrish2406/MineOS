import { Document, Schema, model } from "mongoose";

export interface IWorkerAttendance extends Document {
  workerId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  date: string;
  shift: string;
  inTime: string;
  outTime: string;
  gate: string;
  status: string;
}

const workerAttendanceSchema = new Schema<IWorkerAttendance>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "Worker" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: String, required: true },
    shift: { type: String, required: true },
    inTime: { type: String, required: true },
    outTime: { type: String, required: true },
    gate: { type: String, default: "Turnstile Pit-Head #1" },
    status: { type: String, default: "Present (Biometric)" }
  },
  { timestamps: true }
);

export const WorkerAttendance = model<IWorkerAttendance>("WorkerAttendance", workerAttendanceSchema);
