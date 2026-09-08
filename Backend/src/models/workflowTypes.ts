import { Schema } from "mongoose";

export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export interface EvidenceMetadata {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  capturedAt?: Date;
  gps?: { latitude: number; longitude: number };
  uploadedBy: Schema.Types.ObjectId;
  uploadedAt: Date;
}

export const evidenceSchema = new Schema<EvidenceMetadata>(
  {
    id: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, trim: true, maxlength: 100 },
    sizeBytes: { type: Number, required: true, min: 0 },
    storageKey: { type: String, required: true, trim: true, maxlength: 500 },
    capturedAt: { type: Date },
    gps: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, required: true, default: Date.now }
  },
  { _id: false }
);

export function isValidGps(gps: unknown): boolean {
  if (!gps || typeof gps !== "object") return false;
  const value = gps as { latitude?: unknown; longitude?: unknown };
  return typeof value.latitude === "number" && value.latitude >= -90 && value.latitude <= 90
    && typeof value.longitude === "number" && value.longitude >= -180 && value.longitude <= 180;
}

export function normaliseEvidence(input: unknown, uploadedBy: string): EvidenceMetadata[] {
  if (!Array.isArray(input)) return [];
  return input.map((item) => {
    const value = item as Partial<EvidenceMetadata>;
    return {
      id: value.id ?? crypto.randomUUID(),
      fileName: value.fileName ?? "unnamed-file",
      mimeType: value.mimeType ?? "application/octet-stream",
      sizeBytes: value.sizeBytes ?? 0,
      storageKey: value.storageKey ?? "pending-upload",
      capturedAt: value.capturedAt ? new Date(value.capturedAt) : undefined,
      gps: value.gps,
      uploadedBy: new Schema.Types.ObjectId(uploadedBy),
      uploadedAt: value.uploadedAt ? new Date(value.uploadedAt) : new Date()
    };
  });
}