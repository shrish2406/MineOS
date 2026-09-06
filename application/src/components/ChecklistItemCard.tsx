import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraCapture from './CameraCapture';
import { captureGpsCoordinates } from '../services/locationService';
import colors from '../theme/colors';
import type {
  ChecklistItemResult,
  ComplianceStatus,
  GpsCoordinates,
  SeverityLevel,
} from '../types';

const COMPLIANCE_OPTIONS: { value: ComplianceStatus; label: string; color: string; bg: string }[] = [
  { value: 'pass', label: 'Pass', color: colors.success, bg: '#E3F9E5' },
  { value: 'partial', label: 'Partial', color: colors.gold, bg: '#FFF8E1' },
  { value: 'fail', label: 'Fail', color: colors.error, bg: '#FFE3E3' },
];

const SEVERITY_OPTIONS: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function severityColor(level: SeverityLevel): string {
  switch (level) {
    case 'LOW':
      return colors.textSecondary;
    case 'MEDIUM':
      return colors.gold;
    case 'HIGH':
      return '#E27A00';
    case 'CRITICAL':
      return colors.error;
  }
}

interface ChecklistItemCardProps {
  item: ChecklistItemResult;
  onChange: (updated: ChecklistItemResult) => void;
}

export default function ChecklistItemCard({ item, onChange }: ChecklistItemCardProps) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const showViolationForm = item.status === 'partial' || item.status === 'fail';

  const updateViolation = (field: keyof NonNullable<ChecklistItemResult['violation']>, value: string | GpsCoordinates | undefined) => {
    onChange({
      ...item,
      violation: {
        observationNotes: item.violation?.observationNotes ?? '',
        severity: item.violation?.severity ?? 'MEDIUM',
        photoUri: item.violation?.photoUri,
        gps: item.violation?.gps,
        [field]: value,
      },
    });
  };

  const handleStatusChange = (status: ComplianceStatus) => {
    if (status === 'pass') {
      onChange({ ...item, status, violation: undefined });
    } else {
      onChange({
        ...item,
        status,
        violation: item.violation ?? {
          observationNotes: '',
          severity: 'MEDIUM',
        },
      });
    }
  };

  useEffect(() => {
    if (!showViolationForm || item.violation?.gps) {
      return;
    }

    setGpsLoading(true);
    captureGpsCoordinates()
      .then((coords) => {
        if (coords) {
          onChange({
            ...item,
            violation: {
              observationNotes: item.violation?.observationNotes ?? '',
              severity: item.violation?.severity ?? 'MEDIUM',
              photoUri: item.violation?.photoUri,
              gps: coords,
            },
          });
        }
      })
      .finally(() => setGpsLoading(false));
  }, [showViolationForm, item.id, item.violation?.gps]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.gold} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>

      <View style={styles.statusGroup}>
        {COMPLIANCE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.statusOption,
              item.status === option.value && {
                borderColor: option.color,
                backgroundColor: option.bg,
                borderWidth: 2,
              },
            ]}
            onPress={() => handleStatusChange(option.value)}
          >
            <Text
              style={[
                styles.statusText,
                item.status === option.value && { color: option.color, fontWeight: '700' },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {showViolationForm ? (
        <View style={styles.violationForm}>
          <Text style={styles.violationTitle}>Violation Details</Text>

          <Text style={styles.fieldLabel}>Observation Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={item.violation?.observationNotes ?? ''}
            onChangeText={(text) => updateViolation('observationNotes', text)}
            placeholder="Describe the issue observed..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Severity</Text>
          <View style={styles.severityGroup}>
            {SEVERITY_OPTIONS.map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.severityChip,
                  item.violation?.severity === level && {
                    backgroundColor: severityColor(level),
                    borderColor: severityColor(level),
                  },
                ]}
                onPress={() => updateViolation('severity', level)}
              >
                <Text
                  style={[
                    styles.severityText,
                    item.violation?.severity === level && styles.severityTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>

          <CameraCapture
            photoUri={item.violation?.photoUri ?? null}
            onPhotoCaptured={(uri) => updateViolation('photoUri', uri)}
            onPhotoRemoved={() => updateViolation('photoUri', undefined)}
          />

          <View style={styles.gpsRow}>
            <Ionicons name="location-outline" size={18} color={colors.navy} />
            {gpsLoading ? (
              <Text style={styles.gpsText}>Capturing GPS coordinates...</Text>
            ) : item.violation?.gps ? (
              <Text style={styles.gpsText}>
                {item.violation.gps.latitude.toFixed(5)}, {item.violation.gps.longitude.toFixed(5)}
                {' · '}
                {new Date(item.violation.gps.timestamp).toLocaleTimeString()}
              </Text>
            ) : (
              <Text style={styles.gpsTextMuted}>GPS unavailable — enable location permissions</Text>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  violationForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  violationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    minHeight: 72,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  severityGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  severityChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  severityTextSelected: {
    color: colors.white,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
  },
  gpsText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  gpsTextMuted: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
