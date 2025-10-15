import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/database';
import { UpdateHabitForm } from '@/app/lib/habit-definitions';
import { z } from 'zod';

const updateHabitSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.enum(['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'other']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  targetCount: z.number().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Récupérer une habitude spécifique
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const habits = await db.getHabitsByUserId(session.user.id);
    const habit = habits.find(h => h.id === params.id);

    if (!habit) {
      return NextResponse.json({ error: 'Habitude non trouvée' }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'habitude:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une habitude
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validation des données
    const validationResult = updateHabitSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Vérifier que l'habitude appartient à l'utilisateur
    const habits = await db.getHabitsByUserId(session.user.id);
    const existingHabit = habits.find(h => h.id === params.id);

    if (!existingHabit) {
      return NextResponse.json({ error: 'Habitude non trouvée' }, { status: 404 });
    }

    const updatedHabit = await db.updateHabit(params.id, validationResult.data);
    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'habitude:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une habitude
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'habitude appartient à l'utilisateur
    const habits = await db.getHabitsByUserId(session.user.id);
    const existingHabit = habits.find(h => h.id === params.id);

    if (!existingHabit) {
      return NextResponse.json({ error: 'Habitude non trouvée' }, { status: 404 });
    }

    await db.deleteHabit(params.id);
    return NextResponse.json({ message: 'Habitude supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'habitude:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
    
    // Validation
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Le nom de l\'habitude ne peut pas être vide' },
          { status: 400 }
        );
      }
      if (body.name.trim().length > 100) {
        return NextResponse.json(
          { success: false, error: 'Le nom de l\'habitude doit faire moins de 100 caractères' },
          { status: 400 }
        );
      }
    }
    
    if (body.description !== undefined && body.description.length > 500) {
      return NextResponse.json(
        { success: false, error: 'La description doit faire moins de 500 caractères' },
        { status: 400 }
      );
    }
    
    const habit = await HabitService.update(params.id, userId, body);
    
    if (!habit) {
      return NextResponse.json(
        { success: false, error: 'Habitude introuvable' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: habit,
    });
  } catch (error) {
    console.error('Erreur API PATCH /habits/[id]:', error);
    
    if (error instanceof Error && error.message === 'Authentification requise') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const success = await HabitService.delete(params.id, userId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Habitude introuvable' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Habitude supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur API DELETE /habits/[id]:', error);
    
    if (error instanceof Error && error.message === 'Authentification requise') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}