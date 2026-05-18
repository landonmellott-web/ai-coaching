import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { Goal } from '../types';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onUpdateProgress: (goalId: string, progress: number) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysRemaining(targetDate: string): number {
  if (!targetDate) return 0;
  const target = new Date(targetDate);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function GoalCard({ goal, onEdit, onDelete, onUpdateProgress }: GoalCardProps) {
  const progressAnim = useRef(new Animated.Value(goal.progress / 100)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const daysRemaining = getDaysRemaining(goal.targetDate);
  const isCompleted = goal.status === 'completed';
  const isOverdue = daysRemaining < 0 && !isCompleted;

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(goal.id),
        },
      ]
    );
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit(goal);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const progressColor = isCompleted
    ? Colors.accent
    : goal.progress >= 70
    ? Colors.accent
    : goal.progress >= 40
    ? Colors.gold
    : Colors.primary;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handleEdit}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryEmoji}>{goal.categoryEmoji}</Text>
            <Text style={styles.categoryLabel}>{goal.category}</Text>
          </View>

          <View style={styles.actions}>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
                <Text style={styles.completedText}>Done</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.title, isCompleted && styles.completedTitle]} numberOfLines={2}>
          {goal.title}
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressPercent, { color: progressColor }]}>
              {goal.progress}%
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${goal.progress}%` as any,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          {goal.targetDate ? (
            <View style={styles.dateInfo}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={isOverdue ? Colors.accentWarm : Colors.textMuted}
              />
              <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
                {isOverdue
                  ? `${Math.abs(daysRemaining)}d overdue`
                  : isCompleted
                  ? `Due ${formatDate(goal.targetDate)}`
                  : daysRemaining === 0
                  ? 'Due today!'
                  : `${daysRemaining}d left`}
              </Text>
            </View>
          ) : (
            <View />
          )}

          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  touchable: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
    lineHeight: 22,
  },
  completedTitle: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  overdueText: {
    color: Colors.accentWarm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  editText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
