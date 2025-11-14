import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as db from '@/lib/prisma';

// Import dynamique de bcrypt
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 12);
}

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Register API called');
    const body = await request.json();
    console.log('Request body received:', { ...body, password: '[HIDDEN]' });
    
    const { name, email, password } = registerSchema.parse(body);
    console.log('Validation passed');

    // Vérifier si l'utilisateur existe déjà
    console.log('Checking if user exists...');
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // Créer l'utilisateur
    console.log('Creating user in database...');
    const user = await db.createUser({
      name,
      email,
      password: hashedPassword,
    });
    console.log('User created successfully:', user.id);

    // Retourner la réponse sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { 
        message: 'Compte créé avec succès',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.errors);
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du compte:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}