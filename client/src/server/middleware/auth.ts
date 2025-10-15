import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../auth/config';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/habits',
  '/stats',
  '/api/habits',
  '/api/entries',
  '/api/stats'
];

// Routes accessibles uniquement aux utilisateurs non authentifiés
const authRoutes = [
  '/auth/login',
  '/auth/register'
];

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si l'utilisateur est authentifié
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Rediriger les utilisateurs non authentifiés vers la page de connexion
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Rediriger les utilisateurs authentifiés loin des pages d'authentification
  if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Fonction pour extraire l'ID utilisateur de la session
export async function getUserFromRequest(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

// Fonction pour vérifier si l'utilisateur est authentifié
export async function requireAuth(): Promise<string> {
  const userId = await getUserFromRequest();
  if (!userId) {
    throw new Error('Authentification requise');
  }
  return userId;
}

// Wrapper pour les API routes qui nécessitent une authentification
export function withAuth<T extends any[]>(
  handler: (userId: string, ...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const userId = await requireAuth();
      return await handler(userId, ...args);
    } catch (error) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
  };
}