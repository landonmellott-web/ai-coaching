import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { PremiumModal } from '../../components/PremiumModal';
import {
  userProfileStorage,
  streakStorage,
  goalsStorage,
  premiumStorage,
  chatStorage,
  clearAllData,
  onboardingStorage,
} from '../../hooks/useStorage';
import { UserProfile, StreakData, Goal } from '../../types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatJoinDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  destructive?: boolean;
  subtitle?: string;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  destructive,
  subtitle,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !toggle}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.settingRow}
    >
      <View style={[styles.settingIcon, destructive && styles.settingIconDestructive]}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? Colors.accentWarm : Colors.textSecondary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, destructive && styles.settingLabelDestructive]}>
          {label}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {toggle && onToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.text}
        />
      )}
      {onPress && !toggle && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    lastCheckIn: '',
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [profileData, streak, goalsData, premium] = await Promise.all([
        userProfileStorage.get(),
        streakStorage.get(),
        goalsStorage.get(),
        premiumStorage.get(),
      ]);

      setProfile(profileData);
      setStreakData(streak);
      setGoals(goalsData);
      setIsPremium(premium);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubscribe = async () => {
    await premiumStorage.set(true);
    setIsPremium(true);
    setShowPremiumModal(false);
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'Delete all conversation history with Coach Maya?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await chatStorage.clear();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Done', 'Chat history cleared.');
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete ALL your data including goals, chat history, and profile. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await onboardingStorage.reset();
            router.replace('/onboarding/welcome');
          },
        },
      ]
    );
  };

  const handleEditFocusAreas = () => {
    router.push('/onboarding/focus');
  };

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const daysMember = profile?.joinDate ? getDaysSince(profile.joinDate) + 1 : 1;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Card */}
          <View style={styles.userCardWrapper}>
            <LinearGradient
              colors={['#1A0F3D', '#12121A']}
              style={styles.userCard}
            >
              <View style={styles.userCardContent}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.userAvatar}
                >
                  <Text style={styles.userAvatarText}>
                    {profile?.name ? getInitials(profile.name) : '?'}
                  </Text>
                </LinearGradient>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{profile?.name || 'User'}</Text>
                  <Text style={styles.userJoined}>
                    Member since {profile?.joinDate ? formatJoinDate(profile.joinDate) : 'recently'}
                  </Text>

                  <View style={styles.userBadges}>
                    {streakData.currentStreak > 0 && (
                      <View style={styles.streakBadge}>
                        <Text style={styles.streakBadgeText}>
                          🔥 {streakData.currentStreak} day streak
                        </Text>
                      </View>
                    )}
                    {isPremium && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>👑 Premium</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Premium Upgrade Card (if not premium) */}
          {!isPremium && (
            <TouchableOpacity
              onPress={() => setShowPremiumModal(true)}
              activeOpacity={0.92}
              style={styles.premiumCardWrapper}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumCard}
              >
                <View style={styles.premiumCardContent}>
                  <View style={styles.premiumCardLeft}>
                    <Text style={styles.premiumCardEmoji}>👑</Text>
                    <View>
                      <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
                      <Text style={styles.premiumCardSub}>
                        Unlimited AI coaching · $9.99/month
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={Colors.text} />
                </View>

                <View style={styles.premiumFeatures}>
                  {['Unlimited messages', 'Advanced insights', 'Exclusive programs'].map(f => (
                    <View key={f} style={styles.premiumFeatureItem}>
                      <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.premiumFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.premiumCtaRow}>
                  <View style={styles.premiumCtaBtn}>
                    <Text style={styles.premiumCtaBtnText}>Start 7-Day Free Trial</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statCardNumber}>{streakData.totalSessions}</Text>
                <Text style={styles.statCardLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statCardNumber, { color: Colors.accent }]}>
                  {completedGoals}
                </Text>
                <Text style={styles.statCardLabel}>Goals Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statCardNumber, { color: Colors.gold }]}>
                  {streakData.longestStreak}
                </Text>
                <Text style={styles.statCardLabel}>Best Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardNumber}>{daysMember}</Text>
                <Text style={styles.statCardLabel}>Days a Member</Text>
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingsGroup}>
              <SettingRow
                icon="notifications-outline"
                label="Daily Reminders"
                subtitle="Get nudged to check in with Maya"
                toggle
                toggleValue={notificationsEnabled}
                onToggle={val => {
                  setNotificationsEnabled(val);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon="flag-outline"
                label="Focus Areas"
                value={profile?.focusAreas?.length ? `${profile.focusAreas.length} selected` : 'None'}
                onPress={handleEditFocusAreas}
                subtitle="Edit what you're working on"
              />
            </View>
          </View>

          {/* Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            <View style={styles.settingsGroup}>
              <SettingRow
                icon="chatbubbles-outline"
                label="Clear Chat History"
                subtitle="Delete all messages"
                onPress={handleClearChat}
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon="shield-checkmark-outline"
                label="Privacy Policy"
                onPress={() => Alert.alert('Privacy Policy', 'Coming soon.')}
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon="document-text-outline"
                label="Terms of Service"
                onPress={() => Alert.alert('Terms of Service', 'Coming soon.')}
              />
            </View>
          </View>

          {/* Danger zone */}
          <View style={styles.section}>
            <View style={styles.settingsGroup}>
              <SettingRow
                icon="trash-outline"
                label="Reset App"
                subtitle="Delete all data and start fresh"
                onPress={handleResetApp}
                destructive
              />
            </View>
          </View>

          {/* App version */}
          <Text style={styles.versionText}>MindCoach v1.0.0 · Made with ❤️</Text>
        </Animated.ScrollView>
      </SafeAreaView>

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={handleSubscribe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCardWrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  userCard: {
    padding: 20,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  userJoined: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  userBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  streakBadge: {
    backgroundColor: Colors.accentWarm + '25',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accentWarm + '40',
  },
  streakBadgeText: {
    fontSize: 12,
    color: Colors.accentWarm,
    fontWeight: '700',
  },
  premiumBadge: {
    backgroundColor: Colors.gold + '25',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  premiumBadgeText: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '700',
  },
  premiumCardWrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumCard: {
    padding: 20,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  premiumCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumCardEmoji: {
    fontSize: 28,
  },
  premiumCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  premiumCardSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  premiumFeatures: {
    gap: 6,
    marginBottom: 16,
  },
  premiumFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumFeatureText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  premiumCtaRow: {},
  premiumCtaBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumCtaBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statCardNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  statCardLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingIconDestructive: {
    backgroundColor: Colors.accentWarm + '20',
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  settingLabelDestructive: {
    color: Colors.accentWarm,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  settingValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 62,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 32,
    paddingBottom: 8,
  },
});
