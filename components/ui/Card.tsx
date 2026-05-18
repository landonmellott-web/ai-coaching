import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  gradient?: readonly [string, string, ...string[]];
  padding?: number;
  borderColor?: string;
}

export function Card({
  children,
  style,
  elevated = false,
  gradient,
  padding = 16,
  borderColor,
}: CardProps) {
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.base,
          elevated && styles.elevated,
          { padding },
          borderColor && { borderColor, borderWidth: 1 },
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.base,
        elevated ? styles.elevated : styles.normal,
        { padding },
        borderColor && { borderColor, borderWidth: 1 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  normal: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
