import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Come back tomorrow.";
  if (streak < 5) return "You're building momentum!";
  if (streak < 10) return "You're on fire! Keep it up!";
  if (streak < 30) return "Incredible consistency!";
  if (streak < 100) return "You're a coaching superstar!";
  return "Legendary commitment!";
}

export function StreakCard({ currentStreak, longestStreak, totalSessions }: StreakCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const numberAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the flame
    if (currentStreak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStreak]);

  return (
    <LinearGradient
      colors={currentStreak > 0
        ? ['#2D1B69', '#1A0F3D']
        : [Colors.surface, Colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Subtle border glow for active streaks */}
      {currentStreak > 0 && (
        <View style={styles.glowBorder} />
      )}

      <View style={styles.mainContent}>
        <Animated.View style={[styles.flameContainer, { transform: [{ scale: glowAnim }] }]}>
          <Text style={styles.flameEmoji}>
            {currentStreak === 0 ? '💫' : '🔥'}
          </Text>
        </Animated.View>

        <View style={styles.streakInfo}>
          <Animated.Text style={[styles.streakNumber, { transform: [{ scale: scaleAnim }] }]}>
            {currentStreak}
          </Animated.Text>
          <Text style={styles.streakLabel}>
            {currentStreak === 1 ? 'day streak' : 'day streak'}
          </Text>
          <Text style={styles.streakMessage}>
            {getStreakMessage(currentStreak)}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Best streak</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Total sessions</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, currentStreak > 0 && styles.activeColor]}>
            {currentStreak > 0 ? '🔥' : '—'}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary + '60',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  flameContainer: {
    marginRight: 16,
  },
  flameEmoji: {
    fontSize: 52,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 52,
  },
  streakLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  streakMessage: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  activeColor: {
    color: Colors.accent,
  },
});
