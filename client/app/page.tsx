import { auth } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  try {
    const session = await auth();
    
    if (session) {
      // Si connecté, aller au dashboard
      redirect('/dashboard');
    } else {
      // Si non connecté, aller à la page de login
      redirect('/login');
    }
  } catch (error) {
    // En cas d'erreur, aller à la page de login
    redirect('/login');
  }
}
