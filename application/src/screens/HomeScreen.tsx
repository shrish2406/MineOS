import { useCallback, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import MineCard from '../components/MineCard';
import { logout } from '../services/authService';
import { deleteMine, fetchMines } from '../services/mineService';
import { getUser } from '../services/storage';
import colors from '../theme/colors';
import type { Mine, RootStackParamList, User } from '../types';
import { canDeleteMines, canManageMines } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

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

export default function HomeScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [mines, setMines] = useState<Mine[]>([]);
  const [minesLoading, setMinesLoading] = useState(true);
  const [minesError, setMinesError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadMines = useCallback(async () => {
    setMinesError('');
    try {
      const data = await fetchMines();
      setMines(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMinesError(err.response?.data?.message ?? 'Failed to load mines.');
      } else {
        setMinesError('An unexpected error occurred.');
      }
    } finally {
      setMinesLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUser().then(setUser);
      setMinesLoading(true);
      loadMines();
    }, [loadMines]),
  );

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleLogout]);

  const handleDeleteMine = (mine: Mine) => {
    Alert.alert(
      'Delete Mine',
      `Are you sure you want to delete "${mine.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMine(mine._id);
              setMines((prev) => prev.filter((m) => m._id !== mine._id));
            } catch (err) {
              const message = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'Failed to delete mine.'
                : 'An unexpected error occurred.';
              Alert.alert('Error', message);
            }
          },
        },
      ],
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMines();
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
            <Pressable onPress={() => navigation.navigate('AddMine')}>
              <Text style={styles.addLink}>+ Add Mine</Text>
            </Pressable>
          ) : null}
        </View>

        {minesLoading ? (
          <View style={styles.minesLoading}>
            <ActivityIndicator size="small" color={colors.gold} />
            <Text style={styles.loadingText}>Loading mines...</Text>
          </View>
        ) : minesError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{minesError}</Text>
            <Pressable onPress={loadMines}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        ) : mines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No mines registered yet.</Text>
            {canAdd ? (
              <CustomButton
                title="Add Your First Mine"
                onPress={() => navigation.navigate('AddMine')}
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
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMine(mine)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
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

      <CustomButton
        title="Select Mine for Inspection"
        onPress={() => navigation.navigate('SelectMine')}
        style={styles.selectButton}
      />
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
  logoutButton: {
    marginRight: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '600',
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
  minesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorCard: {
    backgroundColor: '#FFE3E3',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  mineCardWrapper: {
    opacity: 1,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  deleteText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
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
  selectButton: {
    marginTop: 8,
  },
});