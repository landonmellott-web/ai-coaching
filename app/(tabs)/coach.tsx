import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { ChatBubble, TypingIndicator } from '../../components/ChatBubble';
import { PremiumModal } from '../../components/PremiumModal';
import { useCoach } from '../../hooks/useCoach';
import { userProfileStorage, premiumStorage } from '../../hooks/useStorage';
import { ChatMessage } from '../../types';

const FREE_TIER_LIMIT = 5;

export default function CoachScreen() {
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const headerFade = useRef(new Animated.Value(0)).current;

  const {
    messages,
    isLoading,
    isPremium,
    remainingMessages,
    canSendMessage,
    sendMessage,
    initializeChat,
    clearHistory,
  } = useCoach();

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const profile = await userProfileStorage.get();
        const name = profile?.name || 'there';
        setUserName(name);
        await initializeChat(name);

        Animated.timing(headerFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      };

      init();
    }, [initializeChat])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    if (!canSendMessage) {
      setShowPremiumModal(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');
    await sendMessage(text);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'This will delete all your conversation history with Coach Maya. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            const profile = await userProfileStorage.get();
            await initializeChat(profile?.name || 'there');
          },
        },
      ]
    );
  };

  const handleSubscribe = async () => {
    // In a real app, this would trigger App Store purchase
    await premiumStorage.set(true);
    setShowPremiumModal(false);
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => (
    <ChatBubble
      message={item}
      isLatest={index === messages.length - 1}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.typingContainer}>
        <TypingIndicator />
      </View>
    );
  };

  const showUpgradeBanner = !isPremium && !canSendMessage;
  const showLimitWarning = !isPremium && canSendMessage && remainingMessages <= 2 && remainingMessages > 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <LinearGradient
            colors={[Colors.surface, Colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            <View style={styles.coachInfo}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.coachAvatar}
              >
                <Text style={styles.coachAvatarText}>M</Text>
              </LinearGradient>

              <View style={styles.coachInfoText}>
                <Text style={styles.coachName}>Coach Maya</Text>
                <View style={styles.statusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.coachSubtitle}>Your Personal AI Life Coach</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={handleClearHistory} style={styles.headerAction}>
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Free tier remaining indicator */}
          {!isPremium && canSendMessage && (
            <View style={styles.limitIndicator}>
              {[...Array(FREE_TIER_LIMIT)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.limitDot,
                    i < remainingMessages ? styles.limitDotActive : styles.limitDotUsed,
                  ]}
                />
              ))}
              <Text style={styles.limitText}>
                {remainingMessages} free message{remainingMessages !== 1 ? 's' : ''} left today
              </Text>
            </View>
          )}
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />

          {/* Upgrade Banner */}
          {showUpgradeBanner && (
            <TouchableOpacity
              onPress={() => setShowPremiumModal(true)}
              activeOpacity={0.9}
              style={styles.upgradeBannerWrapper}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeBanner}
              >
                <View style={styles.upgradeBannerContent}>
                  <Text style={styles.upgradeBannerEmoji}>👑</Text>
                  <View style={styles.upgradeBannerText}>
                    <Text style={styles.upgradeBannerTitle}>Daily limit reached</Text>
                    <Text style={styles.upgradeBannerSub}>
                      Upgrade to Premium for unlimited coaching
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color={Colors.text} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Warning before limit */}
          {showLimitWarning && (
            <View style={styles.limitWarning}>
              <Ionicons name="warning-outline" size={14} color={Colors.gold} />
              <Text style={styles.limitWarningText}>
                {remainingMessages} free message{remainingMessages !== 1 ? 's' : ''} remaining today.{' '}
                <Text
                  style={styles.upgradeLink}
                  onPress={() => setShowPremiumModal(true)}
                >
                  Go Premium →
                </Text>
              </Text>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, showUpgradeBanner && styles.inputDisabled]}>
              <TextInput
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder={
                  showUpgradeBanner
                    ? 'Upgrade to continue chatting...'
                    : 'Ask Coach Maya anything...'
                }
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                multiline
                maxLength={500}
                returnKeyType="default"
                editable={!showUpgradeBanner && !isLoading}
                onFocus={() => setIsKeyboardOpen(true)}
                onBlur={() => setIsKeyboardOpen(false)}
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading || showUpgradeBanner}
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading || showUpgradeBanner) && styles.sendButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    inputText.trim() && !isLoading && !showUpgradeBanner
                      ? [Colors.primary, Colors.primaryDark]
                      : [Colors.surface, Colors.surface]
                  }
                  style={styles.sendButtonGradient}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={
                      inputText.trim() && !isLoading && !showUpgradeBanner
                        ? Colors.text
                        : Colors.textMuted
                    }
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {!showUpgradeBanner && (
              <Text style={styles.inputDisclaimer}>
                Maya is an AI. Not a substitute for professional help.
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={handleSubscribe}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coachAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  coachInfoText: {
    gap: 2,
  },
  coachName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  coachSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  limitIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 4,
  },
  limitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  limitDotActive: {
    backgroundColor: Colors.primary,
  },
  limitDotUsed: {
    backgroundColor: Colors.border,
  },
  limitText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  upgradeBannerWrapper: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  upgradeBanner: {
    padding: 14,
  },
  upgradeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeBannerEmoji: {
    fontSize: 22,
  },
  upgradeBannerText: {
    flex: 1,
  },
  upgradeBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  upgradeBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  limitWarningText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  upgradeLink: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 120,
    paddingVertical: 6,
    lineHeight: 21,
  },
  sendButton: {
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputDisclaimer: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
