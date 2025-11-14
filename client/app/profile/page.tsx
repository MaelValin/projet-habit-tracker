'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, LogOut, Trophy, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/lib/types';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.id) {
      loadUserData();
    }
  }, [session, status]);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        // Fusionner les données utilisateur avec les stats
        const userWithStats = { ...data.user, ...data.stats };
        setUser(userWithStats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const userName = user?.name || session?.user?.name || 'Utilisateur';
  const userEmail = user?.email || session?.user?.email || '';
  const level = user?.level || 1;
  const totalXp = user?.totalXp || 0;
  const habitCount = user?.habitCount || 0;
  const completedToday = user?.completedToday || 0;
  const totalCompleted = user?.totalCompleted || 0;
  const totalMissed = user?.totalMissed || 0;

  return (
    <main className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
         <h1 className="text-2xl font-bold text-glow">Profil</h1>
        </Button>
        
      </header>

      <section className="max-w-2xl mx-auto space-y-6">
        {/* Avatar et infos principales */}
        <section className="bg-card border border-border rounded-lg p-6 hologram-bg">
          <article className="flex items-center gap-6">
            <figure className="w-20 h-20 rounded-full bg-primary glow-blue flex items-center justify-center border-2 border-primary">
              <User className="w-10 h-10 text-white" />
            </figure>
            <header className="flex-1">
              <h2 className="text-xl font-semibold">{userName}</h2>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
              <address className="flex items-center gap-4 mt-2 not-italic">
                <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Niveau {level}
                </span>
                <span className="text-sm text-muted-foreground">
                  {totalXp} XP total
                </span>
              </address>
            </header>
          </article>
        </section>

        {/* Statistiques */}
        <section className="flex justify-center py-8" aria-label="Statistiques des habitudes">
          <article className="flex flex-col justify-center items-center">
            <header>
              <h2 className="text-center text-white/20 text-8xl font-normal font-['Inter']">TOTAL</h2>
            </header>
            <dl className="w-56 flex justify-center items-center gap-16 mt-4">
              <div className="w-24 flex flex-col items-center relative justify-between gap-6 h-full">
                <dt className="sr-only">Habitudes complétées</dt>
                <dd className="text-blue-400 text-6xl font-normal font-['Inter'] mb-4">{totalCompleted}</dd>
                <figure className="absolute top-[-2.5rem] w-32 h-32">
                  <img src="/rondblue.svg" alt="Graphique circulaire bleu" className="w-32 h-32" />
                </figure>
                <span className="text-white text-lg font-normal font-['Inter'] text-center">Complétées</span>
              </div>
              <div className="w-24 flex flex-col items-center relative justify-between gap-6 h-full">
                <dt className="sr-only">Habitudes non complétées</dt>
                <dd className="text-rose-500 text-6xl font-normal font-['Inter'] mb-4">{totalMissed}</dd>
                <figure className="absolute top-[-2.5rem] w-32 h-32">
                  <img src="/rondred.svg" alt="Graphique circulaire rouge" className="w-32 h-32" />
                </figure>
                <span className="text-white text-lg font-normal font-['Inter'] text-center">Non<br/>Complétées</span>
              </div>
            </dl>
          </article>
        </section>



        {/* Actions */}
        <footer className="flex justify-center">
          <Button
            variant="destructive"
            className="w-full max-w-sm flex items-center gap-2"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </footer>
      </section>
    </main>
  );
}