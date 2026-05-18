import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  size = 'medium',
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
    large: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16 },
  };

  const textSizeStyles = {
    small: { fontSize: 14 },
    medium: { fontSize: 16 },
    large: { fontSize: 18 },
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.wrapper, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#4B4B6B', '#3B3B5B'] : [Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text} size="small" />
          ) : (
            <View style={styles.content}>
              {icon && <View style={styles.iconLeft}>{icon}</View>}
              <Text style={[styles.primaryText, textSizeStyles[size], textStyle]}>
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.75}
        style={[
          styles.base,
          styles.secondary,
          sizeStyles[size],
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[styles.secondaryText, textSizeStyles[size], textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.75}
        style={[
          styles.base,
          styles.danger,
          sizeStyles[size],
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.accentWarm} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[styles.dangerText, textSizeStyles[size], textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.6}
      style={[
        styles.base,
        styles.ghost,
        sizeStyles[size],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textSecondary} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.ghostText, textSizeStyles[size], textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.accentWarm,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: Colors.text,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryText: {
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  ghostText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dangerText: {
    color: Colors.accentWarm,
    fontWeight: '600',
  },
});
