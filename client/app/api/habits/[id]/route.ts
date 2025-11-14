import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import * as db from '@/lib/prisma';

// POST /api/habits/[id] - Compléter une habitude
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const resolvedParams = await params;
    const habitId = resolvedParams.id;
    const today = new Date();

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await db.getHabitById(habitId);
    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ error: 'Habitude non trouvée' }, { status: 404 });
    }

    // Compléter l'habitude pour aujourd'hui
    const instance = await db.completeHabitInstance(habitId, today, session.user.id);
    
    return NextResponse.json({ 
      message: 'Habitude complétée !',
      instance,
      xpGained: habit.xpReward 
    });
  } catch (error) {
    console.error('Erreur lors de la complétion de l\'habitude:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/habits/[id] - Supprimer une habitude
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const resolvedParams = await params;
    const habitId = resolvedParams.id;

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await db.getHabitById(habitId);
    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ error: 'Habitude non trouvée' }, { status: 404 });
    }

    await db.deleteHabit(habitId);
    
    return NextResponse.json({ message: 'Habitude supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'habitude:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}