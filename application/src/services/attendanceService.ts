import api, { logApiError } from './api';
import { uploadImageToCloudinary } from './cloudinaryService';
import type { GeoTaggedImage } from '../types';

export interface AttendanceCheckInPayload {
  imageUrl: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

async function uploadAttendanceImage(image: GeoTaggedImage): Promise<string> {
  if (!image.uri) {
    throw new Error('Missing image URI for upload');
  }

  // Upload directly from the worker device. The app's EXPO_PUBLIC_ Cloudinary
  // settings are intentionally used here, so attendance does not depend on
  // separate server-side Cloudinary credentials.
  return uploadImageToCloudinary(image.uri, 'attendance.jpg');
}

export async function submitAttendanceCheckIn(image: GeoTaggedImage): Promise<void> {
  try {
    const imageUrl = await uploadAttendanceImage(image);

    const payload: AttendanceCheckInPayload = {
      imageUrl,
      latitude: image.latitude,
      longitude: image.longitude,
      timestamp: image.timestamp,
    };

    await api.post('/attendance/check-in', payload);
  } catch (err) {
    logApiError('submitAttendanceCheckIn', err);
    throw err;
  }
}
