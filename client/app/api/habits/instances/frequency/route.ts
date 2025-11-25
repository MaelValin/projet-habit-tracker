import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { habitId, frequency, startDate } = await request.json();
    
    console.log('API frequency instances - Data received:', { habitId, frequency, startDate });

    if (!habitId || !frequency || !startDate) {
      return NextResponse.json(
        { error: 'habitId, frequency et startDate requis' },
        { status: 400 }
      );
    }

    const instances = [];
    const today = new Date();
    // Utilise la date et l'heure exacte envoyée par le frontend
    const start = new Date(startDate);

    switch (frequency) {
      case 'unique':
        // Une seule instance pour la date sélectionnée
        const uniqueInstance = await prisma.habitInstance.create({
          data: {
            habitId,
            userId: session.user.id!,
            date: start,
            isCompleted: false,
          },
          include: {
            habit: true,
          },
        });
        instances.push(uniqueInstance);
        break;

      case 'daily':
        // Créer des instances quotidiennes pour les 30 prochains jours à partir de la date sélectionnée
        for (let i = 0; i < 30; i++) {
          const instanceDate = new Date(start);
          instanceDate.setDate(start.getDate() + i);
          
          const dailyInstance = await prisma.habitInstance.create({
            data: {
              habitId,
              userId: session.user.id!,
              date: instanceDate,
              isCompleted: false,
            },
            include: {
              habit: true,
            },
          });
          instances.push(dailyInstance);
        }
        break;

      case 'weekly':
        // Créer des instances hebdomadaires pour les 12 prochaines semaines, le même jour de la semaine
        for (let i = 0; i < 12; i++) {
          // Calculer la date de l'instance
          const instanceDate = new Date(start);
          instanceDate.setDate(start.getDate() + (i * 7));
          // Normaliser à minuit locale
          instanceDate.setHours(0, 0, 0, 0);
          const weeklyInstance = await prisma.habitInstance.create({
            data: {
              habitId,
              userId: session.user.id!,
              date: instanceDate,
              isCompleted: false,
            },
            include: {
              habit: true,
            },
          });
          instances.push(weeklyInstance);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Fréquence non supportée' },
          { status: 400 }
        );
    }

    console.log(`Created ${instances.length} instances for frequency ${frequency}`);

    return NextResponse.json({ 
      message: `${instances.length} instances créées avec succès`,
      instances 
    });
  } catch (error) {
    console.error('Erreur lors de la création des instances de fréquence:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}