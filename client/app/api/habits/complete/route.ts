import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { toggleHabitInstance } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { habitId, date } = await request.json();

    if (!habitId || !date) {
      return NextResponse.json(
        { error: 'habitId et date requis' },
        { status: 400 }
      );
    }

    // Vérifier que c'est bien aujourd'hui
    const today = new Date();
    const requestDate = new Date(date);
    
    if (requestDate.toDateString() !== today.toDateString()) {
      return NextResponse.json(
        { error: 'Vous ne pouvez cocher que les habitudes du jour même' },
        { status: 400 }
      );
    }

    const { instance, xpChange } = await toggleHabitInstance(
      habitId,
      requestDate,
      session.user.id!
    );

    return NextResponse.json({ 
      message: instance.isCompleted ? 'Habitude complétée avec succès' : 'Habitude décochée avec succès',
      instance,
      xpChange
    });
  } catch (error) {
    console.error('Erreur lors du toggle:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}