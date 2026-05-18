import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Goal, ChatMessage, StreakData, DailyMessageCount } from '../types';

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@mindcoach/user_profile',
  GOALS: '@mindcoach/goals',
  CHAT_HISTORY: '@mindcoach/chat_history',
  STREAK_DATA: '@mindcoach/streak_data',
  IS_PREMIUM: '@mindcoach/is_premium',
  DAILY_MESSAGE_COUNT: '@mindcoach/daily_message_count',
  HAS_ONBOARDED: '@mindcoach/has_onboarded',
} as const;

// Generic storage helpers
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    throw error;
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
}

// User Profile
export const userProfileStorage = {
  get: () => getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE),
  set: (profile: UserProfile) => setItem(STORAGE_KEYS.USER_PROFILE, profile),
  remove: () => removeItem(STORAGE_KEYS.USER_PROFILE),
  update: async (updates: Partial<UserProfile>): Promise<void> => {
    const existing = await userProfileStorage.get();
    if (existing) {
      await userProfileStorage.set({ ...existing, ...updates });
    }
  },
};

// Goals
export const goalsStorage = {
  get: async (): Promise<Goal[]> => {
    const goals = await getItem<Goal[]>(STORAGE_KEYS.GOALS);
    return goals ?? [];
  },
  set: (goals: Goal[]) => setItem(STORAGE_KEYS.GOALS, goals),
  add: async (goal: Goal): Promise<void> => {
    const existing = await goalsStorage.get();
    await goalsStorage.set([...existing, goal]);
  },
  update: async (goalId: string, updates: Partial<Goal>): Promise<void> => {
    const existing = await goalsStorage.get();
    const updated = existing.map(g =>
      g.id === goalId ? { ...g, ...updates } : g
    );
    await goalsStorage.set(updated);
  },
  remove: async (goalId: string): Promise<void> => {
    const existing = await goalsStorage.get();
    await goalsStorage.set(existing.filter(g => g.id !== goalId));
  },
};

// Chat History
const MAX_CHAT_MESSAGES = 50;

export const chatStorage = {
  get: async (): Promise<ChatMessage[]> => {
    const messages = await getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY);
    return messages ?? [];
  },
  set: (messages: ChatMessage[]) => setItem(STORAGE_KEYS.CHAT_HISTORY, messages),
  addMessage: async (message: ChatMessage): Promise<void> => {
    const existing = await chatStorage.get();
    const updated = [...existing, message].slice(-MAX_CHAT_MESSAGES);
    await chatStorage.set(updated);
  },
  clear: () => removeItem(STORAGE_KEYS.CHAT_HISTORY),
};

// Streak Data
export const streakStorage = {
  get: async (): Promise<StreakData> => {
    const data = await getItem<StreakData>(STORAGE_KEYS.STREAK_DATA);
    return data ?? {
      lastCheckIn: '',
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
    };
  },
  set: (data: StreakData) => setItem(STORAGE_KEYS.STREAK_DATA, data),
  checkIn: async (): Promise<StreakData> => {
    const today = new Date().toDateString();
    const existing = await streakStorage.get();

    if (existing.lastCheckIn === today) {
      // Already checked in today
      return existing;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const isConsecutive = existing.lastCheckIn === yesterdayStr;
    const newStreak = isConsecutive ? existing.currentStreak + 1 : 1;
    const newLongest = Math.max(existing.longestStreak, newStreak);

    const updated: StreakData = {
      lastCheckIn: today,
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalSessions: existing.totalSessions + 1,
    };

    await streakStorage.set(updated);
    return updated;
  },
};

// Premium Status
export const premiumStorage = {
  get: async (): Promise<boolean> => {
    const value = await getItem<boolean>(STORAGE_KEYS.IS_PREMIUM);
    return value ?? false;
  },
  set: (isPremium: boolean) => setItem(STORAGE_KEYS.IS_PREMIUM, isPremium),
};

// Daily Message Count
const FREE_TIER_LIMIT = 5;

export const messageCountStorage = {
  get: async (): Promise<DailyMessageCount> => {
    const data = await getItem<DailyMessageCount>(STORAGE_KEYS.DAILY_MESSAGE_COUNT);
    const today = new Date().toDateString();

    if (!data || data.date !== today) {
      return { date: today, count: 0 };
    }
    return data;
  },
  increment: async (): Promise<number> => {
    const current = await messageCountStorage.get();
    const updated: DailyMessageCount = {
      date: current.date,
      count: current.count + 1,
    };
    await setItem(STORAGE_KEYS.DAILY_MESSAGE_COUNT, updated);
    return updated.count;
  },
  canSendMessage: async (isPremium: boolean): Promise<boolean> => {
    if (isPremium) return true;
    const current = await messageCountStorage.get();
    return current.count < FREE_TIER_LIMIT;
  },
  getRemainingMessages: async (isPremium: boolean): Promise<number> => {
    if (isPremium) return Infinity;
    const current = await messageCountStorage.get();
    return Math.max(0, FREE_TIER_LIMIT - current.count);
  },
};

// Onboarding status
export const onboardingStorage = {
  isComplete: async (): Promise<boolean> => {
    const value = await getItem<boolean>(STORAGE_KEYS.HAS_ONBOARDED);
    return value ?? false;
  },
  complete: () => setItem(STORAGE_KEYS.HAS_ONBOARDED, true),
  reset: () => removeItem(STORAGE_KEYS.HAS_ONBOARDED),
};

// Clear all data (for logout/reset)
export const clearAllData = async (): Promise<void> => {
  const keys = Object.values(STORAGE_KEYS);
  await AsyncStorage.multiRemove(keys);
};
