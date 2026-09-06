import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CameraCapture from '../components/CameraCapture';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { saveHazardReport } from '../services/hazardStorage';
import { captureGpsCoordinates } from '../services/locationService';
import { getUser } from '../services/storage';
import colors from '../theme/colors';
import type { GpsCoordinates, HazardReport, ProfileStackParamList, User } from '../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'HazardReport'>;

export default function HazardReportScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [gps, setGps] = useState<GpsCoordinates | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const loadGps = useCallback(async () => {
    setGpsLoading(true);
    const coords = await captureGpsCoordinates();
    setGps(coords);
    setGpsLoading(false);
  }, []);

  useEffect(() => {
    loadGps();
  }, [loadGps]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Validation', 'Please describe the hazard you observed.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User session not found. Please sign in again.');
      return;
    }

    if (!gps) {
      Alert.alert(
        'Location Required',
        'GPS coordinates are required for hazard reports. Please enable location permissions and try again.',
        [{ text: 'Retry', onPress: loadGps }],
      );
      return;
    }

    setSubmitting(true);

    try {
      const report: HazardReport = {
        id: `hazard_${Date.now()}`,
        description: description.trim(),
        photoUri: photoUri ?? undefined,
        gps,
        reporterId: user.id,
        reporterName: user.name,
        submittedAt: new Date().toISOString(),
      };

      await saveHazardReport(report);

      Alert.alert(
        'Hazard Report Submitted',
        'Your report has been saved locally and will be synced when connectivity is available.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Error', 'Failed to save hazard report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerCard}>
          <Ionicons name="warning" size={32} color={colors.gold} />
          <Text style={styles.headerTitle}>Quick Hazard Report</Text>
          <Text style={styles.headerSubtext}>
            Report a safety hazard immediately. Your location and photo evidence will be attached.
          </Text>
        </View>

        <View style={styles.section}>
          <CustomInput
            label="Hazard Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the hazard, its location, and any immediate risks..."
            multiline
            numberOfLines={5}
            style={styles.descriptionInput}
            textAlignVertical="top"
          />

          <CameraCapture
            photoUri={photoUri}
            onPhotoCaptured={setPhotoUri}
            onPhotoRemoved={() => setPhotoUri(null)}
            label="Photo Evidence (Optional)"
          />

          <View style={styles.gpsCard}>
            <View style={styles.gpsHeader}>
              <Ionicons name="location" size={20} color={colors.navy} />
              <Text style={styles.gpsTitle}>GPS Location</Text>
            </View>
            {gpsLoading ? (
              <Text style={styles.gpsText}>Capturing coordinates...</Text>
            ) : gps ? (
              <>
                <Text style={styles.gpsText}>
                  Lat: {gps.latitude.toFixed(6)} · Lng: {gps.longitude.toFixed(6)}
                </Text>
                <Text style={styles.gpsTimestamp}>
                  Captured at {new Date(gps.timestamp).toLocaleString()}
                </Text>
              </>
            ) : (
              <Text style={styles.gpsError}>
                Location unavailable. Tap retry to capture GPS.
              </Text>
            )}
            {!gpsLoading && !gps ? (
              <CustomButton
                title="Retry GPS Capture"
                onPress={loadGps}
                variant="secondary"
                style={styles.retryButton}
              />
            ) : null}
          </View>
        </View>

        <CustomButton
          title="Submit Hazard Report"
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginTop: 10,
    marginBottom: 6,
  },
  headerSubtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  gpsCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  gpsText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  gpsTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gpsError: {
    fontSize: 13,
    color: colors.error,
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 4,
  },
});
