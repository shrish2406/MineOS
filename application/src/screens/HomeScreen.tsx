import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import MineCard from '../components/MineCard';
import { getUser } from '../services/storage';
import colors from '../theme/colors';
import type { HomeStackParamList, Mine, User } from '../types';
import { canDeleteMines, canManageMines } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const MINES_KEY = 'MINES_KEY';

const TODAY_TASKS = [
  { id: '1', title: 'Ventilation check — Section B', due: '10:00 AM' },
  { id: '2', title: 'PPE compliance audit', due: '1:30 PM' },
  { id: '3', title: 'Dust level monitoring', due: '4:00 PM' },
];

const OPEN_VIOLATIONS = [
  { id: '1', title: 'PPE non-compliance', severity: 'High', mine: 'North Ridge' },
  { id: '2', title: 'Blocked emergency exit', severity: 'Critical', mine: 'East Valley' },
  { id: '3', title: 'Overdue equipment inspection', severity: 'Medium', mine: 'South Pit' },
];

const mockMines: Mine[] = [
  {
    _id: '1',
    name: 'North Ridge Coal Mine',
    code: 'NR-001',
    location: 'Jharkhand, India',
    operator: 'Coal India Ltd.',
    status: 'active',
    createdBy: 'local',
  },
  {
    _id: '2',
    name: 'East Valley Mine',
    code: 'EV-002',
    location: 'Odisha, India',
    operator: 'Eastern Coalfields',
    status: 'active',
    createdBy: 'local',
  },
  {
    _id: '3',
    name: 'South Pit Mine',
    code: 'SP-003',
    location: 'Chhattisgarh, India',
    operator: 'SECL',
    status: 'inactive',
    createdBy: 'local',
  },
];

function severityColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return colors.error;
    case 'High':
      return '#E27A00';
    case 'Medium':
      return colors.gold;
    default:
      return colors.textSecondary;
  }
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function HomeScreen({ navigation: _navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [mines, setMines] = useState<Mine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [mineName, setMineName] = useState('');
  const [mineCode, setMineCode] = useState('');
  const [location, setLocation] = useState('');
  const [operator, setOperator] = useState('');

  useEffect(() => {
    const loadMines = async () => {
      try {
        const stored = await AsyncStorage.getItem(MINES_KEY);
        if (stored) {
          setMines(JSON.parse(stored) as Mine[]);
        } else {
          setMines(mockMines);
          await AsyncStorage.setItem(MINES_KEY, JSON.stringify(mockMines));
        }
      } catch {
        setMines(mockMines);
      }
    };

    loadMines();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUser().then(setUser);
    }, []),
  );

  const persistMines = async (updatedMines: Mine[]) => {
    await AsyncStorage.setItem(MINES_KEY, JSON.stringify(updatedMines));
  };

  const handleDelete = (id: string) => {
    setMines((prev) => {
      const updatedMines = prev.filter((mine) => mine._id !== id);
      persistMines(updatedMines);
      return updatedMines;
    });
  };

  const resetModal = () => {
    setMineName('');
    setMineCode('');
    setLocation('');
    setOperator('');
    setModalVisible(false);
  };

  const handleSaveMine = () => {
    const newMine: Mine = {
      _id: Date.now().toString(),
      name: mineName.trim(),
      code: mineCode.trim(),
      location: location.trim(),
      operator: operator.trim(),
      status: 'active',
      createdBy: 'local',
    };
    setMines((prev) => {
      const updatedMines = [...prev, newMine];
      persistMines(updatedMines);
      return updatedMines;
    });
    setMineName('');
    setMineCode('');
    setLocation('');
    setOperator('');
    setModalVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setMines(mockMines);
    persistMines(mockMines);
    setRefreshing(false);
  };

  const greeting = user?.name ? `Welcome, ${user.name}` : 'Welcome';
  const canAdd = user ? canManageMines(user.role) : false;
  const canDelete = user ? canDeleteMines(user.role) : false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
      }
    >
      <View style={styles.greetingCard}>
        <Text style={styles.greeting}>{greeting}</Text>
        {user?.role ? (
          <Text style={styles.roleBadge}>{formatRole(user.role)}</Text>
        ) : null}
        <Text style={styles.greetingSubtext}>
          MineOS — Coal Mine Governance & Compliance Dashboard
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registered Mines</Text>
          {canAdd ? (
            <Pressable onPress={() => setModalVisible(true)}>
              <Text style={styles.addLink}>+ Add Mine</Text>
            </Pressable>
          ) : null}
        </View>

        {mines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No mines registered yet.</Text>
            {canAdd ? (
              <CustomButton
                title="Add Your First Mine"
                onPress={() => setModalVisible(true)}
                style={styles.emptyButton}
              />
            ) : null}
          </View>
        ) : (
          mines.map((mine) => (
            <View key={mine._id} style={styles.mineRow}>
              <View style={styles.mineCardWrapper}>
                <MineCard mine={mine} />
              </View>
              {canDelete ? (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(mine._id)}
                  accessibilityLabel={`Delete ${mine.name}`}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        {TODAY_TASKS.map((task) => (
          <View key={task.id} style={styles.card}>
            <Text style={styles.cardTitle}>{task.title}</Text>
            <Text style={styles.cardMeta}>Due: {task.due}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Open Violations</Text>
        {OPEN_VIOLATIONS.map((violation) => (
          <View key={violation.id} style={styles.card}>
            <View style={styles.violationHeader}>
              <Text style={styles.cardTitle}>{violation.title}</Text>
              <Text style={[styles.severity, { color: severityColor(violation.severity) }]}>
                {violation.severity}
              </Text>
            </View>
            <Text style={styles.cardMeta}>{violation.mine}</Text>
          </View>
        ))}
      </View>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Register New Mine</Text>

            <Text style={styles.inputLabel}>Mine Name</Text>
            <TextInput
              style={styles.textInput}
              value={mineName}
              onChangeText={setMineName}
              placeholder="e.g., North Ridge Coal Mine"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Mine Code</Text>
            <TextInput
              style={styles.textInput}
              value={mineCode}
              onChangeText={setMineCode}
              placeholder="e.g., NRM-882"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Kentucky, USA"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Operator</Text>
            <TextInput
              style={styles.textInput}
              value={operator}
              onChangeText={setOperator}
              placeholder="e.g., Apex Mining Corp"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={resetModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveMine}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  greetingCard: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  greetingSubtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  addLink: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  emptyButton: {
    alignSelf: 'stretch',
  },
  mineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mineCardWrapper: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  violationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  severity: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.navy,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
