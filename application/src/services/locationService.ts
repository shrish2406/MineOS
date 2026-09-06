import * as Location from 'expo-location';
import type { GpsCoordinates } from '../types';

export async function captureGpsCoordinates(): Promise<GpsCoordinates | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timestamp: new Date().toISOString(),
  };
}
