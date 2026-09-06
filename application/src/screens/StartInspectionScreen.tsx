import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { getSelectedMine, getUser } from '../services/storage';
import colors from '../theme/colors';
import type {
  ComplianceStatus,
  InspectionType,
  Mine,
  RootStackParamList,
  User,
} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'StartInspection'>;

type PermissionStatus = 'Checking...' | 'Granted' | 'Denied';

const INSPECTION_TYPES: { value: InspectionType; label: string }[] = [
  { value: 'ventilation', label: 'Ventilation Check' },
  { value: 'ppe_compliance', label: 'PPE Compliance' },
  { value: 'dust_monitoring', label: 'Dust Monitoring' },
  { value: 'equipment_safety', label: 'Equipment Safety' },
  { value: 'emergency_exits', label: 'Emergency Exits' },
];

const COMPLIANCE_OPTIONS: { value: ComplianceStatus; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'partial', label: 'Partial' },
  { value: 'fail', label: 'Fail' },
];

export default function StartInspectionScreen({ navigation }: Props) {
  const [mine, setMine] = useState<Mine | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('Checking...');
  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('Checking...');
  const [inspectionType, setInspectionType] = useState<InspectionType>('ventilation');
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>('pass');
  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSelectedMine().then(setMine);
      getUser().then(setUser);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const checkPermissions = async () => {
        setCameraStatus('Checking...');
        setLocationStatus('Checking...');

        const cameraResult = await Camera.requestCameraPermissionsAsync();
        setCameraStatus(cameraResult.granted ? 'Granted' : 'Denied');

        const locationResult = await Location.requestForegroundPermissionsAsync();
        setLocationStatus(locationResult.granted ? 'Granted' : 'Denied');
      };

      checkPermissions();
    }, []),
  );

  const handleSubmit = async () => {
    if (!mine) {
      return;
    }

    if (!observations.trim()) {
      Alert.alert('Validation', 'Please enter your inspection observations.');
      return;
    }

    setSubmitting(true);

    // Mock submission — inspection API will be wired in a future release.
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSubmitting(false);

    Alert.alert(
      'Inspection Submitted',
      `${INSPECTION_TYPES.find((t) => t.value === inspectionType)?.label} for ${mine.name} recorded as ${complianceStatus.toUpperCase()}.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ],
    );
  };

  if (!mine) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noMineText}>
          No mine selected. Please go back and select a mine.
        </Text>
        <CustomButton
          title="Select Mine"
          onPress={() => navigation.navigate('SelectMine')}
          style={styles.selectMineButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.mineCard}>
          <Text style={styles.mineTitle}>{mine.name}</Text>
          <Text style={styles.mineDetail}>Code: {mine.code}</Text>
          <Text style={styles.mineDetail}>Location: {mine.location}</Text>
          <Text style={styles.mineDetail}>Operator: {mine.operator}</Text>
          {user ? (
            <Text style={styles.mineDetail}>Inspector: {user.name}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Type</Text>
          <View style={styles.optionGroup}>
            {INSPECTION_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={[
                  styles.optionChip,
                  inspectionType === type.value && styles.optionChipSelected,
                ]}
                onPress={() => setInspectionType(type.value)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    inspectionType === type.value && styles.optionChipTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Status</Text>
          <View style={styles.statusGroup}>
            {COMPLIANCE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.statusOption,
                  complianceStatus === option.value && styles.statusOptionSelected,
                  complianceStatus === option.value &&
                    option.value === 'pass' &&
                    styles.statusPass,
                  complianceStatus === option.value &&
                    option.value === 'partial' &&
                    styles.statusPartial,
                  complianceStatus === option.value &&
                    option.value === 'fail' &&
                    styles.statusFail,
                ]}
                onPress={() => setComplianceStatus(option.value)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    complianceStatus === option.value && styles.statusOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <CustomInput
            label="Observations"
            value={observations}
            onChangeText={setObservations}
            placeholder="Document findings, violations, and corrective actions..."
            multiline
            numberOfLines={4}
            style={styles.observationsInput}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Permissions</Text>
          <Text style={styles.sectionSubtext}>
            Camera and location access support photo evidence and GPS tagging.
          </Text>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Camera</Text>
            <Text
              style={[
                styles.permissionStatus,
                cameraStatus === 'Granted' && styles.granted,
                cameraStatus === 'Denied' && styles.denied,
              ]}
            >
              {cameraStatus}
            </Text>
          </View>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Location</Text>
            <Text
              style={[
                styles.permissionStatus,
                locationStatus === 'Granted' && styles.granted,
                locationStatus === 'Denied' && styles.denied,
              ]}
            >
              {locationStatus}
            </Text>
          </View>
        </View>

        <CustomButton
          title="Submit Inspection"
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  noMineText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  selectMineButton: {
    alignSelf: 'stretch',
  },
  mineCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mineTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 12,
  },
  mineDetail: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 6,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  optionChipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  optionChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: colors.white,
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  statusOptionSelected: {
    borderWidth: 2,
  },
  statusPass: {
    borderColor: colors.success,
    backgroundColor: '#E3F9E5',
  },
  statusPartial: {
    borderColor: colors.gold,
    backgroundColor: '#FFF4E0',
  },
  statusFail: {
    borderColor: colors.error,
    backgroundColor: '#FFE3E3',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusOptionTextSelected: {
    color: colors.text,
  },
  observationsInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  permissionLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  permissionStatus: {
    fontSize: 15,
    fontWeight: '600',
  },
  granted: {
    color: colors.success,
  },
  denied: {
    color: colors.error,
  },
});
