import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    
    console.log('API instances - Date requested:', dateStr);

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date requise' },
        { status: 400 }
      );
    }

    // Parse la date en local pour éviter le décalage UTC
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0); // minuit local
    
    console.log('API instances - Normalized date:', date.toISOString());

    const instances = await prisma.habitInstance.findMany({
      where: {
        userId: session.user.id!,
        date: date,
      },
      include: {
        habit: true,
      },
    });
    
    console.log('API instances - Found instances:', instances.length);

    return NextResponse.json({ instances });
  } catch (error) {
    console.error('Erreur lors du chargement des instances:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

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
    
    console.log('API POST instances - Data received:', { habitId, date });

    if (!habitId || !date) {
      return NextResponse.json(
        { error: 'habitId et date requis' },
        { status: 400 }
      );
    }

    const requestDate = new Date(date + 'T12:00:00.000'); // Midi local pour éviter les décalages
    // Remettre à minuit local
    requestDate.setHours(0, 0, 0, 0);
    
    console.log('API POST instances - Original date string:', date);
    console.log('API POST instances - Parsed date:', requestDate.toISOString());
    console.log('API POST instances - Local date parts:', {
      year: requestDate.getFullYear(),
      month: requestDate.getMonth(),
      day: requestDate.getDate()
    });

    // Créer une instance d'habitude non complétée pour cette date
    const instance = await prisma.habitInstance.create({
      data: {
        habitId,
        userId: session.user.id!,
        date: requestDate,
        isCompleted: false,
      },
      include: {
        habit: true,
      },
    });

    return NextResponse.json({ 
      message: 'Instance créée avec succès',
      instance 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'instance:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}