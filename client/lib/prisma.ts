import { PrismaClient } from '@prisma/client';
import { CalendarDay, HabitCategory } from '@/lib/types';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Fonctions utilitaires pour l'application

// Users
export const createUser = async (data: {
  email: string;
  name: string;
  password?: string;
}) => {
  return prisma.user.create({
    data: {
      ...data,
      password: data.password || null,
    },
  });
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

// Habits
export const createHabit = async (userId: string, data: {
  name: string;
  description?: string;
  category: string;
  frequency?: string;
  targetCount?: number;
  difficulty?: string;
}) => {
  const xpReward = getXpReward(data.difficulty || 'easy');
  
  return prisma.habit.create({
    data: {
      ...data,
      userId,
      xpReward,
    },
  });
};

export const getUserHabits = async (userId: string) => {
  return prisma.habit.findMany({
    where: { 
      userId,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getHabitById = async (id: string) => {
  return prisma.habit.findUnique({
    where: { id },
  });
};

export const deleteHabit = async (id: string) => {
  return prisma.habit.update({
    where: { id },
    data: { isActive: false },
  });
};

// Habit Instances
export const completeHabitInstance = async (
  habitId: string,
  date: Date,
  userId: string
) => {
  const habit = await getHabitById(habitId);
  if (!habit) throw new Error('Habitude non trouvée');

  // Upsert l'instance d'habitude
  const instance = await prisma.habitInstance.upsert({
    where: {
      habitId_date: {
        habitId,
        date: new Date(date.toDateString()), // Normaliser à minuit
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      habitId,
      userId,
      date: new Date(date.toDateString()),
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Ajouter XP log
  await prisma.xPLog.create({
    data: {
      userId,
      amount: habit.xpReward,
      reason: `Habitude complétée: ${habit.name}`,
      category: habit.category,
    },
  });

  // Mettre à jour l'XP utilisateur
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: {
        increment: habit.xpReward,
      },
    },
  });

  // Calculer et mettre à jour le nouveau niveau et currentXp
  const newLevel = calculateLevel(updatedUser.totalXp);
  const newCurrentXp = calculateCurrentXp(updatedUser.totalXp);

  await prisma.user.update({
    where: { id: userId },
    data: {
      level: newLevel,
      currentXp: newCurrentXp,
    },
  });

  return instance;
};

export const getUserStats = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) return null;

  const habitCount = await prisma.habit.count({
    where: { userId, isActive: true },
  });

  const completedToday = await prisma.habitInstance.count({
    where: {
      userId,
      date: {
        gte: new Date(new Date().toDateString()),
      },
      isCompleted: true,
    },
  });

  return {
    ...user,
    habitCount,
    completedToday,
  };
};

// Utilitaires
function getXpReward(difficulty: string): number {
  switch (difficulty) {
    case 'easy':
      return 10;
    case 'medium':
      return 20;
    case 'hard':
      return 35;
    default:
      return 10;
  }
}

// Fonction pour calculer le niveau basé sur l'XP total
export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}

// Fonction pour calculer l'XP actuel dans le niveau
export function calculateCurrentXp(totalXp: number): number {
  return totalXp % 100;
}

// Fonction pour obtenir les données du calendrier pour un mois donné
export const getCalendarData = async (userId: string, month: Date): Promise<CalendarDay[]> => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Obtenir toutes les habitudes de l'utilisateur
  const userHabits = await getUserHabits(userId);
  
  // Obtenir toutes les instances d'habitudes pour le mois
  const habitInstances = await prisma.habitInstance.findMany({
    where: {
      userId: userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      habit: true,
    },
  });

  // Grouper par jour
  const calendarData: CalendarDay[] = [];
  const daysInMonth = endOfMonth.getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
    const dayInstances = habitInstances.filter(
      instance => instance.date.getDate() === day
    );

    // Calculer les habitudes complétées vs total des habitudes pour ce jour
    const completedHabits = dayInstances.filter(instance => instance.isCompleted);
    const totalHabitsForDay = dayInstances.length; // Seulement les habitudes qui ont des instances ce jour
    const completionRate = totalHabitsForDay > 0 
      ? Math.round((completedHabits.length / totalHabitsForDay) * 100)
      : 0;

    // Calculer l'XP total gagné ce jour
    const totalXpEarned = completedHabits.reduce(
      (sum, instance) => sum + (instance.habit?.xpReward || 0), 
      0
    );

    calendarData.push({
      date: currentDate,
      habits: dayInstances.map(instance => ({
        habitId: instance.habitId,
        habitName: instance.habit?.name || '',
        isCompleted: instance.isCompleted,
        category: (instance.habit?.category as HabitCategory) || 'other',
      })),
      totalXpEarned,
      completionRate,
    });
  }

  return calendarData;
};