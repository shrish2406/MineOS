import { Document, Schema, model } from "mongoose";

export interface IWorkerTask extends Document {
  workerId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  title: string;
  category: string;
  done: boolean;
  time: string;
  date: string;
  completedAt?: Date;
}

const workerTaskSchema = new Schema<IWorkerTask>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "Worker" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    time: { type: String, default: "Pending" },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export const WorkerTask = model<IWorkerTask>("WorkerTask", workerTaskSchema);
