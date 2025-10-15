import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/database';
import { CreateHabitForm } from '@/app/lib/habit-definitions';
import { z } from 'zod';

// Schema de validation pour la création d'habitudes
const createHabitSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre est trop long'),
  description: z.string().optional(),
  category: z.enum(['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'other']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  targetCount: z.number().min(1, 'Le nombre cible doit être au moins 1').max(100, 'Le nombre cible est trop élevé')
});

// GET - Récupérer toutes les habitudes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const habits = await db.getHabitsByUserId(session.user.id);
    return NextResponse.json({ habits, total: habits.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des habitudes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle habitude
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validation des données
    const validationResult = createHabitSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const habitData = validationResult.data;
    const newHabit = await db.createHabit(session.user.id, habitData);

    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'habitude:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}