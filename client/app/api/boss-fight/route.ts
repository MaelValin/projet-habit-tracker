import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma, calculateLevel, calculateCurrentXp } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    // Ajouter 200 XP et log
    await prisma.xPLog.create({
      data: {
        userId: session.user.id,
        amount: 200,
        reason: 'Victoire combat de boss',
        category: 'boss',
      },
    });
    // Mettre à jour l'XP utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalXp: { increment: 200 },
      },
    });
    // Calculer et mettre à jour le nouveau niveau et currentXp
    const newLevel = calculateLevel(updatedUser.totalXp);
    const newCurrentXp = calculateCurrentXp(updatedUser.totalXp);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        level: newLevel,
        currentXp: newCurrentXp,
      },
    });

    return NextResponse.json({ success: true, xp: updatedUser.totalXp, level: newLevel });
  } catch (error) {
    console.error('Erreur boss fight:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
