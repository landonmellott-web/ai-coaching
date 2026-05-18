import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const PREMIUM_FEATURES: Feature[] = [
  {
    icon: 'infinite',
    title: 'Unlimited AI Coaching',
    description: 'Chat with Coach Maya as much as you need, every single day.',
  },
  {
    icon: 'flash',
    title: 'Priority Responses',
    description: 'Faster response times and more detailed coaching sessions.',
  },
  {
    icon: 'trending-up',
    title: 'Advanced Goal Insights',
    description: 'Deep analytics on your progress patterns and growth areas.',
  },
  {
    icon: 'star',
    title: 'Exclusive Programs',
    description: 'Access curated 30-day coaching programs for specific goals.',
  },
  {
    icon: 'notifications',
    title: 'Smart Daily Reminders',
    description: 'Personalized nudges timed to your peak motivation hours.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Private & Secure',
    description: 'Your conversations are encrypted and never used for training.',
  },
];

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function PremiumModal({ visible, onClose, onSubscribe }: PremiumModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Start Free Trial',
      'This would connect to your App Store subscription. Your 7-day free trial begins today — cancel anytime before it ends.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Start Trial',
          onPress: () => {
            onSubscribe();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <LinearGradient
            colors={['#1A0F3D', '#0A0A0F']}
            style={styles.sheetContent}
          >
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Close button */}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.crownContainer}
                >
                  <Text style={styles.crownEmoji}>👑</Text>
                </LinearGradient>

                <Text style={styles.title}>MindCoach Premium</Text>
                <Text style={styles.subtitle}>
                  Unlock your full coaching potential
                </Text>

                <View style={styles.pricingContainer}>
                  <LinearGradient
                    colors={[Colors.primary + '30', Colors.primary + '10']}
                    style={styles.pricingCard}
                  >
                    <Text style={styles.trialText}>7-Day Free Trial</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>$9.99</Text>
                      <Text style={styles.pricePeriod}>/month</Text>
                    </View>
                    <Text style={styles.cancelText}>Cancel anytime • No commitment</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Features list */}
              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>Everything included:</Text>
                {PREMIUM_FEATURES.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View style={styles.featureIconContainer}>
                      <Ionicons
                        name={feature.icon as any}
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Free tier comparison */}
              <View style={styles.comparisonSection}>
                <View style={styles.comparisonRow}>
                  <View style={[styles.comparisonCol, styles.comparisonFree]}>
                    <Text style={styles.comparisonTitle}>Free</Text>
                    <Text style={styles.comparisonItem}>5 messages/day</Text>
                    <Text style={styles.comparisonItem}>Basic goals</Text>
                    <Text style={styles.comparisonItem}>Daily insight</Text>
                  </View>
                  <View style={[styles.comparisonCol, styles.comparisonPremium]}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={[styles.comparisonTitle, { color: Colors.text }]}>Premium ✨</Text>
                    <Text style={[styles.comparisonItem, { color: Colors.text }]}>Unlimited messages</Text>
                    <Text style={[styles.comparisonItem, { color: Colors.text }]}>Advanced analytics</Text>
                    <Text style={[styles.comparisonItem, { color: Colors.text }]}>Exclusive programs</Text>
                  </View>
                </View>
              </View>

              {/* CTA */}
              <View style={styles.ctaSection}>
                <TouchableOpacity onPress={handleSubscribe} activeOpacity={0.9} style={styles.ctaWrapper}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButton}
                  >
                    <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.text} />
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                  $9.99/month after trial. Cancel in Settings anytime.{'\n'}
                  Subscriptions are managed through the App Store.
                </Text>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.92,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetContent: {
    flex: 1,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  crownContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  crownEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  pricingContainer: {
    width: '100%',
  },
  pricingCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  trialText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
  },
  pricePeriod: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cancelText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 14,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  comparisonSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  comparisonCol: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    overflow: 'hidden',
  },
  comparisonFree: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comparisonPremium: {
    position: 'relative',
    overflow: 'hidden',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  comparisonItem: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  ctaWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  legalText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
