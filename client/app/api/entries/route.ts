import { NextRequest, NextResponse } from 'next/server';
import { HabitEntryService } from '@/src/server/services/database';
import { requireAuth } from '@/src/server/middleware/auth';
import { CreateHabitEntryData } from '@/src/shared/types';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre date est requis' },
        { status: 400 }
      );
    }
    
    // Valider le format de date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Format de date invalide (YYYY-MM-DD attendu)' },
        { status: 400 }
      );
    }
    
    const entries = await HabitEntryService.getTodayEntries(userId);
    
    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('Erreur API GET /entries:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body: CreateHabitEntryData = await request.json();
    
    // Validation
    if (!body.habitId || typeof body.habitId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'L\'ID de l\'habitude est requis' },
        { status: 400 }
      );
    }
    
    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json(
        { success: false, error: 'La date est requise' },
        { status: 400 }
      );
    }
    
    // Valider le format de date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { success: false, error: 'Format de date invalide (YYYY-MM-DD attendu)' },
        { status: 400 }
      );
    }
    
    if (typeof body.completed !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Le champ completed doit être un booléen' },
        { status: 400 }
      );
    }
    
    // TODO: Vérifier que l'habitude appartient à l'utilisateur
    // const habit = await HabitService.getById(body.habitId, userId);
    // if (!habit) {
    //   return NextResponse.json(
    //     { success: false, error: 'Habitude introuvable' },
    //     { status: 404 }
    //   );
    // }
    
    const entry = await HabitEntryService.upsert({
      habitId: body.habitId,
      date: body.date,
      completed: body.completed,
      notes: body.notes,
    });
    
    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Erreur API POST /entries:', error);
    
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