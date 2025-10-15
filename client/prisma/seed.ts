import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Démarrage du seeding...');

    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Utilisateur Test',
        password: hashedPassword,
        level: 5,
        currentXp: 250,
        totalXp: 1250,
        streak: 3,
        maxStreak: 7,
      },
    });

    console.log('✅ Utilisateur créé:', user.email);

    // Créer quelques habitudes d'exemple
    const habits = await Promise.all([
      prisma.habit.create({
        data: {
          name: 'Méditation matinale',
          description: '10 minutes de méditation pour commencer la journée',
          category: 'mindfulness',
          difficulty: 'easy',
          xpReward: 10,
          userId: user.id,
        },
      }),
      prisma.habit.create({
        data: {
          name: 'Lire 30 minutes',
          description: 'Lecture pour développer ses connaissances',
          category: 'learning',
          difficulty: 'medium',
          xpReward: 20,
          userId: user.id,
        },
      }),
      prisma.habit.create({
        data: {
          name: 'Faire du sport',
          description: '45 minutes d\'exercice physique',
          category: 'fitness',
          difficulty: 'hard',
          xpReward: 35,
          userId: user.id,
        },
      }),
    ]);

    console.log('✅ Habitudes créées:', habits.length);

    // Créer quelques instances d'habitudes pour les derniers jours
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Promise.all([
      // Hier
      prisma.habitInstance.create({
        data: {
          habitId: habits[0].id,
          userId: user.id,
          date: yesterday,
          isCompleted: true,
          completedAt: yesterday,
        },
      }),
      prisma.habitInstance.create({
        data: {
          habitId: habits[1].id,
          userId: user.id,
          date: yesterday,
          isCompleted: true,
          completedAt: yesterday,
        },
      }),
      // Aujourd'hui
      prisma.habitInstance.create({
        data: {
          habitId: habits[0].id,
          userId: user.id,
          date: today,
          isCompleted: true,
          completedAt: new Date(),
        },
      }),
    ]);

    console.log('✅ Instances d\'habitudes créées');

    // Créer des logs XP
    await Promise.all([
      prisma.xPLog.create({
        data: {
          userId: user.id,
          amount: 10,
          reason: 'Méditation matinale complétée',
          category: 'mindfulness',
        },
      }),
      prisma.xPLog.create({
        data: {
          userId: user.id,
          amount: 20,
          reason: 'Lecture complétée',
          category: 'learning',
        },
      }),
    ]);

    console.log('✅ Logs XP créés');

    // Créer une quête d'exemple
    await prisma.quest.create({
      data: {
        name: 'Débutant motivé',
        description: 'Complète 5 habitudes cette semaine',
        type: 'weekly_completion',
        target: 5,
        progress: 2,
        xpReward: 100,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    console.log('✅ Quête créée');

    console.log('🎉 Seeding terminé avec succès!');
    console.log(`
📊 Résumé:
- Email: test@example.com
- Mot de passe: password123
- Niveau: ${user.level}
- XP: ${user.currentXp}/${user.totalXp}
- Habitudes: ${habits.length}
`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();