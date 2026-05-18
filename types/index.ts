export interface UserProfile {
  name: string;
  focusAreas: string[];
  joinDate: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  categoryEmoji: string;
  progress: number; // 0-100
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StreakData {
  lastCheckIn: string;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
}

export interface CoachContext {
  userName: string;
  focusAreas: string[];
  goals: Goal[];
  streak: number;
  chatHistory: ChatMessage[];
}

export interface DailyMessageCount {
  date: string;
  count: number;
}

export const FOCUS_AREAS = [
  { id: 'career', label: 'Career & Goals', emoji: '🎯' },
  { id: 'health', label: 'Health & Fitness', emoji: '💪' },
  { id: 'mental', label: 'Mental Wellbeing', emoji: '🧘' },
  { id: 'business', label: 'Business & Money', emoji: '💼' },
  { id: 'relationships', label: 'Relationships', emoji: '❤️' },
  { id: 'learning', label: 'Learning & Skills', emoji: '📚' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡' },
  { id: 'confidence', label: 'Confidence', emoji: '😊' },
] as const;

export const GOAL_CATEGORIES = [
  { id: 'career', label: 'Career & Goals', emoji: '🎯' },
  { id: 'health', label: 'Health & Fitness', emoji: '💪' },
  { id: 'mental', label: 'Mental Wellbeing', emoji: '🧘' },
  { id: 'business', label: 'Business & Money', emoji: '💼' },
  { id: 'relationships', label: 'Relationships', emoji: '❤️' },
  { id: 'learning', label: 'Learning & Skills', emoji: '📚' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡' },
  { id: 'confidence', label: 'Confidence', emoji: '😊' },
];
