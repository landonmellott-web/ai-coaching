import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { GoalCard } from '../../components/GoalCard';
import { goalsStorage } from '../../hooks/useStorage';
import { Goal, GOAL_CATEGORIES } from '../../types';

type FilterType = 'all' | 'active' | 'completed';

function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface GoalFormData {
  title: string;
  category: string;
  categoryEmoji: string;
  progress: number;
  targetDate: string;
}

const DEFAULT_FORM: GoalFormData = {
  title: '',
  category: 'Career & Goals',
  categoryEmoji: '🎯',
  progress: 0,
  targetDate: '',
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<FilterType>('active');
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<GoalFormData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const loadGoals = async () => {
    try {
      const data = await goalsStorage.get();
      setGoals(data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const openAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingGoal(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      category: goal.category,
      categoryEmoji: goal.categoryEmoji,
      progress: goal.progress,
      targetDate: goal.targetDate,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGoal(null);
    setForm(DEFAULT_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your goal.');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editingGoal) {
        const updates: Partial<Goal> = {
          title: form.title.trim(),
          category: form.category,
          categoryEmoji: form.categoryEmoji,
          progress: form.progress,
          targetDate: form.targetDate,
          status: form.progress >= 100 ? 'completed' : editingGoal.status,
        };
        await goalsStorage.update(editingGoal.id, updates);
      } else {
        const newGoal: Goal = {
          id: generateId(),
          title: form.title.trim(),
          category: form.category,
          categoryEmoji: form.categoryEmoji,
          progress: form.progress,
          targetDate: form.targetDate,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        await goalsStorage.add(newGoal);
      }

      await loadGoals();
      closeModal();
    } catch (error) {
      Alert.alert('Error', 'Could not save goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await goalsStorage.remove(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (error) {
      Alert.alert('Error', 'Could not delete goal.');
    }
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    await goalsStorage.update(goalId, {
      progress,
      status: progress >= 100 ? 'completed' : 'active',
    });
    await loadGoals();
  };

  const selectCategory = (cat: typeof GOAL_CATEGORIES[0]) => {
    setForm(prev => ({
      ...prev,
      category: cat.label,
      categoryEmoji: cat.emoji,
    }));
  };

  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'active') return g.status === 'active';
    if (filter === 'completed') return g.status === 'completed';
    return true;
  });

  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Goals</Text>
            <Text style={styles.headerSub}>
              {activeCount} active · {completedCount} completed
            </Text>
          </View>
          <TouchableOpacity onPress={openAddModal} style={styles.addBtn} activeOpacity={0.8}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={24} color={Colors.text} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['active', 'completed', 'all'] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>🎯</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'completed' ? 'No completed goals yet' : 'No goals yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'completed'
                  ? 'Keep working on your active goals!'
                  : 'Set your first goal and let Coach Maya help you crush it.'}
              </Text>
              {filter !== 'completed' && (
                <TouchableOpacity
                  onPress={openAddModal}
                  activeOpacity={0.88}
                  style={styles.emptyCtaWrapper}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.emptyCta}
                  >
                    <Ionicons name="add" size={18} color={Colors.text} />
                    <Text style={styles.emptyCtaText}>Add Your First Goal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onUpdateProgress={handleUpdateProgress}
              />
            ))
          )}
        </Animated.ScrollView>
      </SafeAreaView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalSheet}>
              <LinearGradient
                colors={['#1A1A26', '#12121A']}
                style={styles.modalContent}
              >
                {/* Modal Handle */}
                <View style={styles.modalHandle} />

                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingGoal ? 'Edit Goal' : 'New Goal'}
                  </Text>
                  <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={22} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Title input */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Goal Title *</Text>
                    <TextInput
                      value={form.title}
                      onChangeText={t => setForm(prev => ({ ...prev, title: t }))}
                      placeholder="e.g. Run a 5K by June"
                      placeholderTextColor={Colors.textMuted}
                      style={styles.formInput}
                      maxLength={100}
                      autoFocus={!editingGoal}
                    />
                  </View>

                  {/* Category */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categoryScroll}
                    >
                      {GOAL_CATEGORIES.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => selectCategory(cat)}
                          style={[
                            styles.categoryChip,
                            form.category === cat.label && styles.categoryChipActive,
                          ]}
                        >
                          <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
                          <Text
                            style={[
                              styles.categoryChipText,
                              form.category === cat.label && styles.categoryChipTextActive,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Progress */}
                  <View style={styles.formGroup}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.formLabel}>Current Progress</Text>
                      <Text style={styles.progressValue}>{form.progress}%</Text>
                    </View>

                    {/* Simple progress picker buttons */}
                    <View style={styles.progressButtons}>
                      {[0, 25, 50, 75, 100].map(p => (
                        <TouchableOpacity
                          key={p}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setForm(prev => ({ ...prev, progress: p }));
                          }}
                          style={[
                            styles.progressBtn,
                            form.progress === p && styles.progressBtnActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.progressBtnText,
                              form.progress === p && styles.progressBtnTextActive,
                            ]}
                          >
                            {p}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Progress bar preview */}
                    <View style={styles.progressPreviewBg}>
                      <Animated.View
                        style={[
                          styles.progressPreviewFill,
                          { width: `${form.progress}%` as any },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Target Date */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Target Date (optional)</Text>
                    <TextInput
                      value={form.targetDate}
                      onChangeText={t => setForm(prev => ({ ...prev, targetDate: t }))}
                      placeholder="YYYY-MM-DD (e.g. 2026-12-31)"
                      placeholderTextColor={Colors.textMuted}
                      style={styles.formInput}
                      maxLength={10}
                    />
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.88}
                    style={styles.saveWrapper}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>
                        {isLoading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Add Goal'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={{ height: 24 }} />
                </ScrollView>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyCtaWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  emptyCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalKeyboard: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalContent: {
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  formGroup: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipEmoji: {
    fontSize: 15,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.text,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  progressBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  progressBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  progressBtnTextActive: {
    color: Colors.text,
  },
  progressPreviewBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressPreviewFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  saveWrapper: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
});
