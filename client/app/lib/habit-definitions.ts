// Types pour le système de suivi d'habitudes
export type Habit = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'health' | 'productivity' | 'learning' | 'fitness' | 'mindfulness' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number; // Nombre de fois à effectuer par période
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitEntry = {
  id: string;
  habitId: string;
  userId: string;
  completed: boolean;
  completedAt: string;
  notes?: string;
  value?: number; // Pour les habitudes quantifiables (ex: minutes d'exercice)
};

export type HabitStreak = {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
};

export type HabitStats = {
  habitId: string;
  totalCompletions: number;
  completionRate: number; // Pourcentage de réussite
  averagePerWeek: number;
  currentStreak: number;
  longestStreak: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  totalXP: number;
  joinedAt: string;
  settings: UserSettings;
};

export type UserSettings = {
  timezone: string;
  notifications: {
    daily: boolean;
    weekly: boolean;
    achievements: boolean;
  };
  theme: 'light' | 'dark' | 'system';
};

export type Achievement = {
  id: string;
  userId: string;
  type: 'streak' | 'completion' | 'consistency' | 'milestone';
  title: string;
  description: string;
  unlockedAt: string;
  habitId?: string; // Optionnel si l'achievement est lié à une habitude spécifique
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  isActive: boolean;
  expiresAt?: string;
};

export type QuestRequirement = {
  type: 'complete_habit' | 'maintain_streak' | 'complete_multiple';
  habitIds?: string[];
  targetValue: number;
  description: string;
};

export type QuestReward = {
  type: 'xp' | 'badge' | 'title';
  value: number | string;
  description: string;
};

export type UserQuest = {
  id: string;
  userId: string;
  questId: string;
  progress: number; // 0-100
  isCompleted: boolean;
  completedAt?: string;
  startedAt: string;
};

// Types pour les formulaires
export type CreateHabitForm = {
  title: string;
  description?: string;
  category: Habit['category'];
  frequency: Habit['frequency'];
  targetCount: number;
};

export type UpdateHabitForm = Partial<CreateHabitForm> & {
  isActive?: boolean;
};

export type HabitEntryForm = {
  completed: boolean;
  notes?: string;
  value?: number;
};

// Types pour les API responses
export type HabitsResponse = {
  habits: Habit[];
  total: number;
};

export type HabitEntriesResponse = {
  entries: HabitEntry[];
  total: number;
};

export type DashboardData = {
  habits: Habit[];
  todayEntries: HabitEntry[];
  stats: {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    currentStreak: number;
  };
  achievements: Achievement[];
  activeQuests: UserQuest[];
};