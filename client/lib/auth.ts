import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getUserByEmail, createUser } from './database';

// Étendre le type User pour inclure passwordHash
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  passwordHash?: string;
}

const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Credentials (email/password)
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ 
            email: z.string().email(), 
            password: z.string().min(6) 
          })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserByEmail(email) as ExtendedUser | null;
          
          if (!user) return null;
          
          // Pour les utilisateurs OAuth, il n'y a pas de mot de passe
          if (!user.passwordHash) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatar,
            };
          }
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Vérifier si l'utilisateur existe déjà
          const existingUser = await getUserByEmail(user.email!);
          
          if (!existingUser) {
            // Créer un nouvel utilisateur pour OAuth
            await createUser({
              email: user.email!,
              name: user.name!,
            });
          }
          
          return true;
        } catch (error) {
          console.error('Erreur lors de la création du compte OAuth:', error);
          return false;
        }
      }
      
      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);

// Fonction utilitaire pour l'inscription
export async function register(email: string, password: string, name: string) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà');
    }
    
    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Créer l'utilisateur
    const user = await createUser({
      email,
      name,
      passwordHash,
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}