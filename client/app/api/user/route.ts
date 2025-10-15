import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import * as db from '@/lib/prisma';

// GET /api/user - Récupérer le profil utilisateur
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await db.getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les statistiques utilisateur
    const stats = await db.getUserStats(session.user.id);
    
    return NextResponse.json({ 
      user: {
        ...user,
        password: undefined, // Ne pas renvoyer le mot de passe
      },
      stats 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}