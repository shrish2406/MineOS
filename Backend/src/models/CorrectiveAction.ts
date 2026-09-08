import { Document, Schema, model } from "mongoose";
import { EvidenceMetadata, evidenceSchema } from "./workflowTypes";

export const ACTION_STATUSES = ["open", "in_progress", "completed", "overdue", "verified"] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export interface ICorrectiveAction extends Document {
  violationId: Schema.Types.ObjectId;
  inspectionId: Schema.Types.ObjectId;
  mineId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  responsiblePersonId: Schema.Types.ObjectId;
  deadline: Date;
  status: ActionStatus;
  evidence: EvidenceMetadata[];
  completedAt?: Date;
  verification?: { verifiedBy: Schema.Types.ObjectId; verifiedAt: Date; note?: string };
  createdBy: Schema.Types.ObjectId;
}

const correctiveActionSchema = new Schema<ICorrectiveAction>(
  {
    violationId: { type: Schema.Types.ObjectId, ref: "Violation", required: true },
    inspectionId: { type: Schema.Types.ObjectId, ref: "Inspection", required: true },
    mineId: { type: Schema.Types.ObjectId, ref: "Mine", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 10000 },
    responsiblePersonId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ACTION_STATUSES, default: "open", required: true },
    evidence: { type: [evidenceSchema], default: [] },
    completedAt: { type: Date },
    verification: {
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
      note: { type: String, trim: true, maxlength: 2000 }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const CorrectiveAction = model<ICorrectiveAction>("CorrectiveAction", correctiveActionSchema);