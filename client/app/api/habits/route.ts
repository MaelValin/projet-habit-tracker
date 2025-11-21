import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import * as db from '@/lib/prisma';
import { z } from 'zod';

const createHabitSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  category: z.enum(['health', 'learning', 'fitness', 'work', 'lifestyle', 'creativity', 'mindfulness']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  frequency: z.enum(['daily', 'weekly', 'unique', 'custom']).default('daily'),
  targetCount: z.number().min(1).default(1),
  description: z.string().optional(),
});

// GET /api/habits - Récupérer les habitudes de l'utilisateur
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const habits = await db.getUserHabits(session.user.id);
    return NextResponse.json({ habits });
  } catch (error) {
    console.error('Erreur lors de la récupération des habitudes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/habits - Créer une nouvelle habitude
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createHabitSchema.parse(body);

    const habit = await db.createHabit(session.user.id, validatedData);

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Données invalides', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Erreur lors de la création de l\'habitude:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}