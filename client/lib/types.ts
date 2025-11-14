// Types pour le Habit Tracker

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: number;
  currentXp: number;
  totalXp: number;
  streak: number;
  maxStreak: number;
  createdAt: Date;
  updatedAt: Date;
  settings?: UserSettings;
  characterClass?: CharacterClass;
  password?: string; // Ajouté pour l'authentification
  habitCount?: number; // Nombre d'habitudes actives
  completedToday?: number; // Habitudes complétées aujourd'hui
  totalCompleted?: number; // Total des habitudes complétées dans l'historique
  totalMissed?: number; // Total des habitudes non complétées dans l'historique
}

// Type pour l'authentification avec mot de passe obligatoire
export interface UserWithPassword extends User {
  password: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  notifications: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  npcMotivatorEnabled: boolean;
  dailyQuestsEnabled: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number; // nombre de fois par période
  xpReward: number;
  difficulty: HabitDifficulty;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Stats calculées
  currentStreak: number;
  maxStreak: number;
  totalCompletions: number;
}

export interface HabitInstance {
  id: string;
  habitId: string;
  userId: string;
  date: Date; // Date du jour où l'habitude doit être accomplie
  isCompleted: boolean;
  completedAt?: Date;
  xpEarned: number;
  notes?: string;
}

export interface XPLog {
  id: string;
  userId: string;
  habitId?: string; // null si XP vient d'autre chose (bonus, quête)
  amount: number;
  source: 'habit' | 'quest' | 'bonus' | 'levelup';
  description: string;
  createdAt: Date;
}

export interface Quest {
  id: string;
  userId: string;
  type: QuestType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  isCompleted: boolean;
  isActive: boolean;
  expiresAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface CharacterClass {
  id: string;
  name: 'Paladin' | 'Guerrier' | 'Mage' | 'Rogue' | 'Archer';
  description: string;
  bonusCategories: HabitCategory[];
  xpMultiplier: number;
  unlockLevel: number;
}

// Enums
export type HabitCategory = 
  | 'health'      // Santé (sport, méditation, sommeil)
  | 'learning'    // Apprentissage (lecture, cours, langues)
  | 'fitness'     // Fitness (exercice, nutrition)
  | 'work'        // Travail (productivité, projets)
  | 'lifestyle'   // Style de vie (ménage, relations)
  | 'creativity'  // Créativité (art, musique, écriture)
  | 'mindfulness'; // Pleine conscience (méditation, gratitude)

export type HabitFrequency = 
  | 'daily'       // Tous les jours à partir de la date de création
  | 'weekly'      // Une fois par semaine, le même jour que la date de création
  | 'unique';     // Une seule fois, pour la date sélectionnée uniquement

export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export type QuestType = 
  | 'daily_completion'    // Compléter X habitudes aujourd'hui
  | 'category_focus'      // Focus sur une catégorie spécifique
  | 'streak_builder'      // Maintenir un streak
  | 'xp_grind'           // Gagner X XP
  | 'new_habit'          // Créer une nouvelle habitude
  | 'perfect_week';      // Semaine parfaite

// DTOs pour les API
export interface CreateHabitDTO {
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number;
  difficulty: HabitDifficulty;
}

export interface UpdateHabitDTO extends Partial<CreateHabitDTO> {
  isActive?: boolean;
}

export interface CompleteHabitDTO {
  habitId: string;
  date: string; // ISO string
  notes?: string;
}

export interface UserProfileDTO {
  name: string;
  avatar?: string;
}

// Statistiques pour le profil
export interface UserStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  currentStreak: number;
  maxStreak: number;
  totalXp: number;
  level: number;
  habitsThisWeek: number;
  habitsThisMonth: number;
  favoriteCategory: HabitCategory;
  perfectDays: number; // Jours où toutes les habitudes ont été complétées
}

// Pour les calendriers et vues
export interface CalendarDay {
  date: Date;
  habits: {
    habitId: string;
    habitName: string;
    isCompleted: boolean;
    category: HabitCategory;
  }[];
  totalXpEarned: number;
  completionRate: number; // Pourcentage d'habitudes complétées ce jour
}

export interface DashboardData {
  user: User;
  todayHabits: Habit[];
  todayInstances: HabitInstance[];
  activeQuests: Quest[];
  recentXp: XPLog[];
  stats: UserStats;
  npcMessage?: string;
}