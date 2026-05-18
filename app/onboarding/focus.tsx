import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { FOCUS_AREAS } from '../../types';
import { userProfileStorage, onboardingStorage } from '../../hooks/useStorage';

export default function FocusScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const itemAnims = FOCUS_AREAS.map(() => ({
    scale: useRef(new Animated.Value(0.85)).current,
    fade: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger focus area items
    FOCUS_AREAS.forEach((_, index) => {
      Animated.parallel([
        Animated.spring(itemAnims[index].scale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          delay: 300 + index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnims[index].fade, {
          toValue: 1,
          duration: 400,
          delay: 300 + index * 60,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const toggleSelection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        // Remove first selected, add new
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleStart = async () => {
    if (selectedIds.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const selectedLabels = FOCUS_AREAS
      .filter(area => selectedIds.includes(area.id))
      .map(area => area.label);

    await userProfileStorage.update({ focusAreas: selectedLabels });
    await onboardingStorage.complete();

    router.replace('/(tabs)/home');
  };

  const isValid = selectedIds.length > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0820', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={styles.progressLine} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>

          <Text style={styles.stepText}>2 of 3</Text>
        </View>

        <Animated.View
          style={[
            styles.titleSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.heading}>What are you{'\n'}working on?</Text>
          <Text style={styles.subheading}>
            Choose up to 3 focus areas. Maya will tailor her coaching to what matters most to you.
          </Text>

          {selectedIds.length > 0 && (
            <View style={styles.selectionCount}>
              <Text style={styles.selectionCountText}>
                {selectedIds.length} of 3 selected
              </Text>
            </View>
          )}
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {FOCUS_AREAS.map((area, index) => {
            const isSelected = selectedIds.includes(area.id);
            return (
              <Animated.View
                key={area.id}
                style={[
                  styles.gridItem,
                  {
                    opacity: itemAnims[index].fade,
                    transform: [{ scale: itemAnims[index].scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleSelection(area.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.focusCard,
                    isSelected && styles.focusCardSelected,
                  ]}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={[Colors.primary + 'CC', Colors.primaryDark + 'CC']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color={Colors.text} />
                    </View>
                  )}

                  <Text style={styles.focusEmoji}>{area.emoji}</Text>
                  <Text style={[styles.focusLabel, isSelected && styles.focusLabelSelected]}>
                    {area.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={!isValid}
            activeOpacity={0.88}
            style={[styles.ctaWrapper, !isValid && styles.ctaDisabled]}
          >
            <LinearGradient
              colors={isValid ? [Colors.primary, Colors.primaryDark] : ['#3B3B5B', '#2A2A4A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>
                {isValid ? 'Start My Journey 🚀' : 'Select at least one'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
    borderRadius: 4,
  },
  progressLine: {
    width: 20,
    height: 2,
    backgroundColor: Colors.border,
  },
  stepText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 38,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  selectionCount: {
    marginTop: 10,
    backgroundColor: Colors.primary + '25',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  selectionCountText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  gridItem: {
    width: '47%',
  },
  focusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  focusCardSelected: {
    borderColor: Colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  focusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  focusLabelSelected: {
    color: Colors.text,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  ctaWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
});
