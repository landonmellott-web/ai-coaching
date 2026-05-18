import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { StreakCard } from '../../components/StreakCard';
import {
  userProfileStorage,
  goalsStorage,
  streakStorage,
} from '../../hooks/useStorage';
import { getDailyInsight } from '../../services/claude';
import { UserProfile, Goal, StreakData } from '../../types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function InsightSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <Animated.View style={{ opacity }}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      <View style={[styles.skeletonLine, styles.skeletonLineMid]} />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    lastCheckIn: '',
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
  });
  const [insight, setInsight] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    try {
      const [profileData, goalsData, streak] = await Promise.all([
        userProfileStorage.get(),
        goalsStorage.get(),
        streakStorage.get(),
      ]);

      setProfile(profileData);
      setGoals(goalsData);
      setStreakData(streak);

      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Load daily insight
      if (profileData) {
        setInsightLoading(true);
        try {
          const activeGoals = goalsData.filter(g => g.status === 'active');
          const insightText = await getDailyInsight(
            profileData.name,
            activeGoals,
            streak.currentStreak
          );
          setInsight(insightText);
        } catch (error) {
          setInsight("Every journey starts with a single step. What's one small action you can take toward your goals today?");
        } finally {
          setInsightLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/coach');
  };

  const handleReviewGoals = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/goals');
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  {getGreeting()}, {profile?.name || 'there'} 👋
                </Text>
                <Text style={styles.date}>{formatDate()}</Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                style={styles.avatarBtn}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {profile?.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Streak Card */}
            <View style={styles.section}>
              <StreakCard
                currentStreak={streakData.currentStreak}
                longestStreak={streakData.longestStreak}
                totalSessions={streakData.totalSessions}
              />
            </View>

            {/* Daily Insight */}
            <View style={styles.section}>
              <View style={styles.insightCard}>
                <LinearGradient
                  colors={['#1A0F3D', '#12121A']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.insightHeader}>
                  <View style={styles.insightAvatarSmall}>
                    <Text style={styles.insightAvatarText}>M</Text>
                  </View>
                  <View>
                    <Text style={styles.insightLabel}>Today's Insight</Text>
                    <Text style={styles.insightFrom}>from Coach Maya</Text>
                  </View>
                </View>

                {insightLoading ? (
                  <InsightSkeleton />
                ) : (
                  <Text style={styles.insightText}>{insight}</Text>
                )}

                <TouchableOpacity onPress={handleCheckIn} style={styles.insightCta}>
                  <Text style={styles.insightCtaText}>Discuss with Maya →</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={handleCheckIn}
                  activeOpacity={0.85}
                  style={styles.actionCardWrapper}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.actionCard}
                  >
                    <Ionicons name="chatbubble-ellipses" size={28} color={Colors.text} />
                    <Text style={styles.actionCardTitle}>Check In{'\n'}With Maya</Text>
                    <Text style={styles.actionCardSub}>Start a session</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReviewGoals}
                  activeOpacity={0.85}
                  style={styles.actionCardWrapper}
                >
                  <View style={styles.actionCardSecondary}>
                    <Ionicons name="flag" size={28} color={Colors.primary} />
                    <Text style={[styles.actionCardTitle, { color: Colors.text }]}>
                      Review My{'\n'}Goals
                    </Text>
                    <Text style={styles.actionCardSub}>
                      {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Goals Summary */}
            {goals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>My Goals</Text>
                  <TouchableOpacity onPress={handleReviewGoals}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.goalsSummary}>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalStatNumber}>{activeGoals.length}</Text>
                    <Text style={styles.goalStatLabel}>Active</Text>
                  </View>
                  <View style={styles.goalStatDivider} />
                  <View style={styles.goalStat}>
                    <Text style={[styles.goalStatNumber, { color: Colors.accent }]}>
                      {completedGoals.length}
                    </Text>
                    <Text style={styles.goalStatLabel}>Completed</Text>
                  </View>
                  <View style={styles.goalStatDivider} />
                  <View style={styles.goalStat}>
                    <Text style={styles.goalStatNumber}>
                      {activeGoals.length > 0
                        ? Math.round(
                            activeGoals.reduce((sum, g) => sum + g.progress, 0) /
                              activeGoals.length
                          )
                        : 0}%
                    </Text>
                    <Text style={styles.goalStatLabel}>Avg Progress</Text>
                  </View>
                </View>

                {/* Show top 2 active goals */}
                {activeGoals.slice(0, 2).map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={handleReviewGoals}
                    style={styles.miniGoalCard}
                  >
                    <View style={styles.miniGoalHeader}>
                      <Text style={styles.miniGoalEmoji}>{goal.categoryEmoji}</Text>
                      <Text style={styles.miniGoalTitle} numberOfLines={1}>
                        {goal.title}
                      </Text>
                      <Text style={styles.miniGoalProgress}>{goal.progress}%</Text>
                    </View>
                    <View style={styles.miniProgressBg}>
                      <View
                        style={[
                          styles.miniProgressFill,
                          { width: `${goal.progress}%` as any },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Focus Areas */}
            {profile?.focusAreas && profile.focusAreas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>My Focus Areas</Text>
                <View style={styles.focusPills}>
                  {profile.focusAreas.map((area, index) => (
                    <View key={index} style={styles.focusPill}>
                      <Text style={styles.focusPillText}>{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  avatarBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  insightCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    overflow: 'hidden',
    position: 'relative',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  insightAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  insightFrom: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  insightText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  insightCta: {
    alignSelf: 'flex-start',
  },
  insightCtaText: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  skeletonLine: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    marginBottom: 8,
  },
  skeletonLineShort: {
    width: '60%',
  },
  skeletonLineMid: {
    width: '80%',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCardWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionCard: {
    padding: 18,
    borderRadius: 18,
    gap: 8,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  actionCardSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    borderRadius: 18,
    gap: 8,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
  },
  actionCardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  goalsSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  goalStat: {
    flex: 1,
    alignItems: 'center',
  },
  goalStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  goalStatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  goalStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  miniGoalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  miniGoalEmoji: {
    fontSize: 16,
  },
  miniGoalTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  miniGoalProgress: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  focusPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusPill: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  focusPillText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
});
