import { PrismaClient } from '@prisma/client';

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
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentXp: {
        increment: habit.xpReward,
      },
      totalXp: {
        increment: habit.xpReward,
      },
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