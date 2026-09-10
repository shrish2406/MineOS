import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { GEO_ATTENDANCE_STATUSES, WorkerAttendance } from "../models/WorkerAttendance";
import { configureCloudinary, cloudinary } from "../config/cloudinary";
import { validId } from "../services/workflowService";

function isValidCoordinate(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isValidImageUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

export async function checkInAttendance(request: AuthenticatedRequest, response: Response): Promise<void> {
  const body = request.body as {
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
    timestamp?: string;
  };

  if (!isValidImageUrl(body.imageUrl)) {
    response.status(400).json({ message: "A valid imageUrl is required" });
    return;
  }

  if (!isValidCoordinate(body.latitude, -90, 90) || !isValidCoordinate(body.longitude, -180, 180)) {
    response.status(400).json({ message: "Valid latitude and longitude are required" });
    return;
  }

  const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
  if (Number.isNaN(timestamp.getTime())) {
    response.status(400).json({ message: "Invalid timestamp" });
    return;
  }

  try {
    const record = await WorkerAttendance.create({
      workerId: request.user!.id,
      imageUrl: body.imageUrl.trim(),
      location: {
        latitude: body.latitude,
        longitude: body.longitude
      },
      status: "Pending",
      timestamp
    });

    const populated = await WorkerAttendance.findById(record.id)
      .populate("workerId", "name email role")
      .lean();

    response.status(201).json(populated ?? record);
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Unable to save attendance" });
  }
}

export async function listPendingAttendance(request: AuthenticatedRequest, response: Response): Promise<void> {
  const records = await WorkerAttendance.find({
    status: "Pending",
    imageUrl: { $exists: true, $nin: [null, ""] }
  })
    .populate("workerId", "name email role")
    .sort({ timestamp: -1 })
    .lean();

  response.json({ data: records });
}

export async function updateAttendanceStatus(request: AuthenticatedRequest, response: Response): Promise<void> {
  if (!validId(request.params.id)) {
    response.status(404).json({ message: "Attendance record not found" });
    return;
  }

  const { status } = request.body as { status?: string };
  if (!status || !GEO_ATTENDANCE_STATUSES.includes(status as typeof GEO_ATTENDANCE_STATUSES[number])) {
    response.status(400).json({ message: `status must be one of: ${GEO_ATTENDANCE_STATUSES.join(", ")}` });
    return;
  }

  const record = await WorkerAttendance.findByIdAndUpdate(
    request.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("workerId", "name email role")
    .lean();

  if (!record) {
    response.status(404).json({ message: "Attendance record not found" });
    return;
  }

  response.json(record);
}

export async function uploadAttendanceImage(request: AuthenticatedRequest, response: Response): Promise<void> {
  if (!request.file) {
    response.status(400).json({ message: "Image file is required" });
    return;
  }

  if (!configureCloudinary()) {
    response.status(503).json({
      message: "Cloudinary is not configured on the server. Upload the image from the mobile app or set CLOUDINARY_* env vars."
    });
    return;
  }

  try {
    const result = await cloudinary.uploader.upload(
      `data:${request.file.mimetype};base64,${request.file.buffer.toString("base64")}`,
      {
        folder: "minsos/attendance",
        resource_type: "image"
      }
    );

    response.status(201).json({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    response.status(500).json({ message: error instanceof Error ? error.message : "Cloudinary upload failed" });
  }
}
