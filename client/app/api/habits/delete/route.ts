import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { habitId, instanceId, deleteSeries } = await request.json();
    if (!habitId && !instanceId) {
      return NextResponse.json({ error: 'habitId ou instanceId requis' }, { status: 400 });
    }

    if (deleteSeries && habitId) {
      // Supprimer toutes les instances liées à cette habitude
      await prisma.habitInstance.deleteMany({
        where: { habitId, userId: session.user.id! },
      });
      // Supprimer l'habitude elle-même
      await prisma.habit.delete({
        where: { id: habitId },
      });
      return NextResponse.json({ message: 'Série et habitude supprimées' });
    } else if (instanceId) {
      // Supprimer une seule instance
      await prisma.habitInstance.delete({
        where: { id: instanceId },
      });
      return NextResponse.json({ message: 'Instance supprimée' });
    } else if (habitId) {
      // Supprimer l'habitude seule
      await prisma.habit.delete({
        where: { id: habitId },
      });
      return NextResponse.json({ message: 'Habitude supprimée' });
    }
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
