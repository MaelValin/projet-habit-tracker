// Utilities pour le hachage de mots de passe - SERVEUR SEULEMENT
import bcryptjs from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}