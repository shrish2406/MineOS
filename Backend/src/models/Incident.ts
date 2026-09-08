import { Document, Schema, model } from "mongoose";
import { EvidenceMetadata, SEVERITIES, evidenceSchema, Severity } from "./workflowTypes";

export const INCIDENT_STATUSES = ["reported", "investigating", "closed"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface IIncident extends Document {
  mineId: Schema.Types.ObjectId;
  inspectionId?: Schema.Types.ObjectId;
  occurredAt: Date;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  evidence: EvidenceMetadata[];
  reportedBy: Schema.Types.ObjectId;
}

const incidentSchema = new Schema<IIncident>(
  {
    mineId: { type: Schema.Types.ObjectId, ref: "Mine", required: true },
    inspectionId: { type: Schema.Types.ObjectId, ref: "Inspection" },
    occurredAt: { type: Date, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    severity: { type: String, enum: SEVERITIES, required: true },
    status: { type: String, enum: INCIDENT_STATUSES, default: "reported", required: true },
    evidence: { type: [evidenceSchema], default: [] },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Incident = model<IIncident>("Incident", incidentSchema);