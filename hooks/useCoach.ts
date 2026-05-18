import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, CoachContext, Goal, UserProfile } from '../types';
import { getCoachingResponse } from '../services/claude';
import {
  chatStorage,
  userProfileStorage,
  goalsStorage,
  streakStorage,
  premiumStorage,
  messageCountStorage,
} from './useStorage';

const FREE_TIER_LIMIT = 5;

interface UseCoachReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isPremium: boolean;
  remainingMessages: number;
  canSendMessage: boolean;
  sendMessage: (text: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  initializeChat: (userName: string) => Promise<void>;
}

export function useCoach(): UseCoachReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(FREE_TIER_LIMIT);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const isInitialized = useRef(false);

  const refreshMessageCount = useCallback(async (premiumStatus: boolean) => {
    const remaining = await messageCountStorage.getRemainingMessages(premiumStatus);
    const can = await messageCountStorage.canSendMessage(premiumStatus);
    setRemainingMessages(remaining === Infinity ? 9999 : remaining);
    setCanSendMessage(can);
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      const [history, premiumStatus] = await Promise.all([
        chatStorage.get(),
        premiumStorage.get(),
      ]);
      setMessages(history);
      setIsPremium(premiumStatus);
      await refreshMessageCount(premiumStatus);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [refreshMessageCount]);

  const initializeChat = useCallback(async (userName: string) => {
    if (isInitialized.current) return;

    const history = await chatStorage.get();

    if (history.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        content: `Hi ${userName}! I'm Coach Maya, your personal AI life coach. I'm here to help you achieve your goals, work through challenges, and become the best version of yourself. What's on your mind today?`,
        timestamp: new Date().toISOString(),
      };

      await chatStorage.addMessage(welcomeMessage);
      setMessages([welcomeMessage]);
    } else {
      setMessages(history);
    }

    isInitialized.current = true;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    // Check if user can send a message (free tier limit)
    const currentPremium = await premiumStorage.get();
    const canSend = await messageCountStorage.canSendMessage(currentPremium);

    if (!canSend) {
      setCanSendMessage(false);
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: trimmedText,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Save user message to storage
      await chatStorage.addMessage(userMessage);

      // Increment message count
      await messageCountStorage.increment();

      // Gather context for Claude
      const [profile, goals, streakData] = await Promise.all([
        userProfileStorage.get(),
        goalsStorage.get(),
        streakStorage.get(),
      ]);

      const context: CoachContext = {
        userName: profile?.name ?? 'there',
        focusAreas: profile?.focusAreas ?? [],
        goals,
        streak: streakData.currentStreak,
        chatHistory: updatedMessages.slice(-20), // Last 20 for context
      };

      // Get Claude response
      const responseText = await getCoachingResponse(trimmedText, context);

      const assistantMessage: ChatMessage = {
        id: `msg_assistant_${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await chatStorage.addMessage(assistantMessage);

      // Update streak (check-in happened)
      await streakStorage.checkIn();

      // Refresh message count
      await refreshMessageCount(currentPremium);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message from coach
      const errorMessage: ChatMessage = {
        id: `msg_error_${Date.now()}`,
        role: 'assistant',
        content: "I'm having a little trouble connecting right now. Please check your internet connection and try again in a moment.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, refreshMessageCount]);

  const clearHistory = useCallback(async () => {
    await chatStorage.clear();
    setMessages([]);
    isInitialized.current = false;
  }, []);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  return {
    messages,
    isLoading,
    isPremium,
    remainingMessages,
    canSendMessage,
    sendMessage,
    loadChatHistory,
    clearHistory,
    initializeChat,
  };
}
