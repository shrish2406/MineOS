import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CameraCapture from '../components/CameraCapture';
import CustomButton from '../components/CustomButton';
import { submitAttendanceCheckIn, type AttendanceCheckInResult } from '../services/attendanceService';
import colors from '../theme/colors';
import type { GeoTaggedImage, ProfileStackParamList } from '../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AttendanceCheckIn'>;

const VERIFICATION_CONFIG: Record<string, { icon: 'checkmark-circle' | 'time' | 'close-circle'; color: string; label: string }> = {
  AUTO_VERIFIED: { icon: 'checkmark-circle', color: colors.success, label: 'Auto-Verified ✓' },
  MANUAL_REVIEW: { icon: 'time', color: '#F59E0B', label: 'Pending Review' },
  REJECTED: { icon: 'close-circle', color: colors.error, label: 'Rejected' },
};

export default function AttendanceCheckInScreen({ navigation }: Props) {
  const [geoTaggedImage, setGeoTaggedImage] = useState<GeoTaggedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttendanceCheckInResult | null>(null);

  const handleSubmit = async () => {
    if (!geoTaggedImage) {
      Alert.alert('Photo Required', 'Please capture a geo-tagged attendance photo before checking in.');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await submitAttendanceCheckIn(geoTaggedImage);
      setResult(res);

      const verStatus = res.verificationStatus ?? res.status ?? 'MANUAL_REVIEW';
      const serverMessage = res.message ?? 'Your attendance has been submitted.';

      if (verStatus === 'REJECTED') {
        Alert.alert('Check-In Rejected', serverMessage, [{ text: 'OK' }]);
      } else if (verStatus === 'AUTO_VERIFIED') {
        Alert.alert(
          'Check-In Verified ✓',
          serverMessage,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert(
          'Check-In Submitted',
          serverMessage,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ?? 'Failed to submit attendance check-in.'
        : err instanceof Error
          ? err.message
          : 'Failed to submit attendance check-in.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const verStatus = result?.verificationStatus ?? result?.status;
  const verConfig = verStatus ? VERIFICATION_CONFIG[verStatus] : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerCard}>
          <Ionicons name="camera" size={32} color={colors.gold} />
          <Text style={styles.headerTitle}>Attendance Check-In</Text>
          <Text style={styles.headerSubtext}>
            Capture a live photo. Your GPS coordinates will be verified against the mine geofence automatically.
          </Text>
        </View>

        <View style={styles.section}>
          <CameraCapture
            geoTaggedImage={geoTaggedImage}
            onImageCaptured={setGeoTaggedImage}
            onImageRemoved={() => setGeoTaggedImage(null)}
            label="Geo-tagged Attendance Photo"
          />

          {geoTaggedImage ? (
            <View style={styles.gpsCard}>
              <View style={styles.gpsHeader}>
                <Ionicons name="location" size={20} color={colors.navy} />
                <Text style={styles.gpsTitle}>Captured Location</Text>
              </View>
              <Text style={styles.gpsText}>
                Lat: {geoTaggedImage.latitude.toFixed(6)} · Lng: {geoTaggedImage.longitude.toFixed(6)}
              </Text>
              {geoTaggedImage.accuracyMeters !== undefined && (
                <Text style={styles.gpsAccuracy}>
                  GPS Accuracy: ±{Math.round(geoTaggedImage.accuracyMeters)}m
                  {geoTaggedImage.accuracyMeters > 200 ? ' — Low accuracy, may require review' : ''}
                </Text>
              )}
              <Text style={styles.gpsTimestamp}>
                {new Date(geoTaggedImage.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Verification result card */}
        {result && verConfig && (
          <View style={[styles.resultCard, { borderColor: verConfig.color }]}>
            <Ionicons name={verConfig.icon} size={28} color={verConfig.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultStatus, { color: verConfig.color }]}>{verConfig.label}</Text>
              {result.distanceFromMine !== undefined && (
                <Text style={styles.resultDetail}>
                  Distance from mine: {result.distanceFromMine}m
                </Text>
              )}
              {result.message ? (
                <Text style={styles.resultMessage}>{result.message}</Text>
              ) : null}
            </View>
          </View>
        )}

        <CustomButton
          title="Submit Attendance Check-In"
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
    gap: 16,
  },
  headerCard: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  gpsCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  gpsText: {
    fontSize: 13,
    color: colors.text,
  },
  gpsAccuracy: {
    fontSize: 12,
    color: '#D97706',
    fontStyle: 'italic',
  },
  gpsTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  resultStatus: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  resultMessage: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});
