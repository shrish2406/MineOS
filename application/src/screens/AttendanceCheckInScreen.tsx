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
import { submitAttendanceCheckIn } from '../services/attendanceService';
import colors from '../theme/colors';
import type { GeoTaggedImage, ProfileStackParamList } from '../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AttendanceCheckIn'>;

export default function AttendanceCheckInScreen({ navigation }: Props) {
  const [geoTaggedImage, setGeoTaggedImage] = useState<GeoTaggedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!geoTaggedImage) {
      Alert.alert('Photo Required', 'Please capture a geo-tagged attendance photo before checking in.');
      return;
    }

    setSubmitting(true);

    try {
      await submitAttendanceCheckIn(geoTaggedImage);

      Alert.alert(
        'Check-In Submitted',
        'Your geo-tagged attendance photo has been sent for Safety Officer review.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
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
            Capture a live photo with GPS coordinates. Your Safety Officer will review and mark you present.
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
              <Text style={styles.gpsTimestamp}>
                {new Date(geoTaggedImage.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>

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
    opacity: 0.85,
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
  gpsCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
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
});
