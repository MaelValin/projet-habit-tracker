import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/src/server/services/database';
import { requireAuth } from '@/src/server/middleware/auth';
import { UpdateHabitData } from '@/src/shared/types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const habit = await HabitService.getById(params.id, userId);
    
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
    console.error('Erreur API GET /habits/[id]:', error);
    
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const body: UpdateHabitData = await request.json();
    
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