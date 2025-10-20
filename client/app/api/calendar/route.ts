import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { getCalendarData } from '@/lib/prisma';

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
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');

    const month = monthStr ? parseInt(monthStr) : new Date().getMonth();
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
    
    const date = new Date(year, month, 1);
    const calendarData = await getCalendarData(session.user.id!, date);

    return NextResponse.json({ calendarData });
  } catch (error) {
    console.error('Erreur lors du chargement du calendrier:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}