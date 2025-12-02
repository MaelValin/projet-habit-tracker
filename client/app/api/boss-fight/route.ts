import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

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
    // Mettre à jour le niveau et currentXp
    // (recalcule comme dans la logique existante)
    // Si tu as une fonction utilitaire, utilise-la ici
    return NextResponse.json({ success: true, xp: updatedUser.totalXp });
  } catch (error) {
    console.error('Erreur boss fight:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
