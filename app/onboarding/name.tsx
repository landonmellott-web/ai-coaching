import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { userProfileStorage } from '../../hooks/useStorage';

export default function NameScreen() {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-focus input after animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save partial profile - will complete after focus selection
    await userProfileStorage.set({
      name: trimmedName,
      focusAreas: [],
      joinDate: new Date().toISOString(),
    });

    router.push('/onboarding/focus');
  };

  const isValid = name.trim().length >= 1;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0820', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={styles.progressLine} />
              <View style={styles.progressDot} />
              <View style={styles.progressLine} />
              <View style={styles.progressDot} />
            </View>

            <Text style={styles.stepText}>1 of 3</Text>
          </View>

          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Emoji illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.illustration}>
                <Text style={styles.illustrationEmoji}>👋</Text>
              </View>
            </View>

            <Text style={styles.heading}>What should{'\n'}Coach Maya call you?</Text>
            <Text style={styles.subheading}>
              A personalized name helps Maya give you more meaningful coaching.
            </Text>

            {/* Input */}
            <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={isFocused ? Colors.primary : Colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                ref={inputRef}
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={isValid ? handleContinue : undefined}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {name.length > 0 && (
                <TouchableOpacity onPress={() => setName('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {name.trim().length > 0 && (
              <Animated.Text style={styles.previewText}>
                Nice to meet you, {name.trim()}! 🌟
              </Animated.Text>
            )}
          </Animated.View>

          {/* Continue button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              onPress={handleContinue}
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
                <Text style={styles.ctaText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.text} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  illustration: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 42,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 38,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    paddingVertical: 14,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  previewText: {
    marginTop: 14,
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
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
