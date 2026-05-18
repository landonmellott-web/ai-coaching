import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

const VALUE_PROPS = [
  {
    icon: 'sparkles' as const,
    title: 'Personalized Coaching',
    description: 'Tailored advice for your unique goals and situation',
  },
  {
    icon: 'trending-up' as const,
    title: 'Goal Tracking',
    description: 'Visualize progress and stay accountable every day',
  },
  {
    icon: 'flame' as const,
    title: 'Daily Accountability',
    description: 'Build powerful habits with streak tracking',
  },
];

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  const featureAnims = VALUE_PROPS.map(() => ({
    fade: useRef(new Animated.Value(0)).current,
    slide: useRef(new Animated.Value(30)).current,
  }));

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Title and subtitle
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Feature items staggered
    featureAnims.forEach(({ fade, slide }, index) => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 500,
          delay: 700 + index * 150,
          useNativeDriver: true,
        }),
        Animated.spring(slide, {
          toValue: 0,
          tension: 60,
          friction: 10,
          delay: 700 + index * 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/name');
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0D0820', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo section */}
          <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>🧠</Text>
            </LinearGradient>

            {/* Glow ring */}
            <View style={styles.glowRing} />
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.title}>MindCoach</Text>
            <Text style={styles.subtitle}>Your AI Life Coach, Available 24/7</Text>
          </Animated.View>

          {/* Value props */}
          <View style={styles.featuresSection}>
            {VALUE_PROPS.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureRow,
                  {
                    opacity: featureAnims[index].fade,
                    transform: [{ translateY: featureAnims[index].slide }],
                  },
                ]}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={20} color={Colors.primaryLight} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.88}
            style={styles.ctaWrapper}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Get Started Free</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.text} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}} style={styles.signInLink}>
            <Text style={styles.signInText}>
              Already a member?{' '}
              <Text style={styles.signInHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Free to start • No credit card required
          </Text>
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
    justifyContent: 'space-between',
  },
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary + '12',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primary + '08',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 56,
  },
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    width: '100%',
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  ctaWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
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
  signInLink: {
    paddingVertical: 4,
  },
  signInText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInHighlight: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  legalText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
