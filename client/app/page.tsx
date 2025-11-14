import { auth } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  try {
    const session = await auth();
    
    if (session) {
      redirect('/dashboard');
    }
  } catch (error) {
    // Ignorer les erreurs JWT au premier démarrage
    console.log('Pas de session valide, affichage de la page d\'accueil');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Habit Tracker
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Transforme tes habitudes en aventure gaming. Gagne de l'XP, monte de niveau et deviens la meilleure version de toi-même.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200">
              Se connecter
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-medium py-3 px-8 rounded-lg transition-all duration-200">
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
