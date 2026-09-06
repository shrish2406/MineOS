import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { logout } from '../services/authService';
import colors from '../theme/colors';
import type { MainTabParamList, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<MainTabParamList, 'Profile'>;

type SettingItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  hasSwitch?: boolean;
};

const SETTINGS_ITEMS: SettingItem[] = [
  {
    id: 'assigned-actions',
    title: 'Assigned Actions',
    subtitle: 'View and update your tasks',
    icon: 'clipboard-outline',
    accentColor: colors.gold,
  },
  {
    id: 'offline-sync',
    title: 'Offline Sync Mode',
    subtitle: 'Save data without internet',
    icon: 'cloud-offline-outline',
    accentColor: '#3B82F6',
    hasSwitch: true,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'View safety alerts',
    icon: 'notifications-outline',
    accentColor: colors.success,
  },
  {
    id: 'help-support',
    title: 'Help & Support',
    subtitle: 'Contact system admin',
    icon: 'help-circle-outline',
    accentColor: colors.gold,
  },
];

export default function ProfileScreen({ navigation }: Props) {
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          const rootNavigation = navigation.getParent()?.getParent();
          rootNavigation?.reset({
            index: 0,
            routes: [{ name: 'Login' as keyof RootStackParamList }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Ionicons name="person-circle" size={70} color={colors.navy} />
          <Text style={styles.profileName}>Sangharsh Sawale</Text>
          <Text style={styles.profileEmail}>sangharshsawale3@gmail.com</Text>
          <Text style={styles.roleBadge}>Admin / Inspector</Text>
        </View>

        <Text style={styles.sectionTitle}>APP SETTINGS</Text>

        <View style={styles.settingsList}>
          {SETTINGS_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.settingCard, pressed && styles.settingCardPressed]}
              onPress={() => {
                if (!item.hasSwitch) {
                  // Placeholder for future navigation
                }
              }}
            >
              <View style={[styles.accentLine, { backgroundColor: item.accentColor }]} />
              <View style={styles.settingContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#334155' }]}>
                  <Ionicons name={item.icon} size={22} color={item.accentColor} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                {item.hasSwitch ? (
                  <Switch
                    value={offlineSyncEnabled}
                    onValueChange={setOfflineSyncEnabled}
                    trackColor={{ false: '#475569', true: colors.gold }}
                    thumbColor={colors.white}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  profileEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  roleBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  settingsList: {
    gap: 12,
  },
  settingCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    overflow: 'hidden',
  },
  settingCardPressed: {
    opacity: 0.92,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: 'transparent',
  },
  logoutButtonPressed: {
    opacity: 0.85,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
