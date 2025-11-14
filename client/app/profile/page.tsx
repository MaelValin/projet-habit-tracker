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

  // Calculs des pourcentages
  const totalHabits = totalCompleted + totalMissed;
  const successRate = totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;
  const failureRate = totalHabits > 0 ? Math.round((totalMissed / totalHabits) * 100) : 0;

  // Fonction pour générer les segments de barre
  const generateProgressBar = (percentage: number, color: string, emptyColor: string = 'bg-neutral-700') => {
    const filledSegments = Math.round((percentage / 100) * 14);
    const segments = [];
    
    for (let i = 0; i < 14; i++) {
      const isActive = i < filledSegments;
      const segmentStyle = isActive 
        ? { filter: 'drop-shadow(0 0 2px currentColor)' }
        : {};
      
      segments.push(
        <div 
          key={i}
          className={`w-3 h-6 rounded-sm ${isActive ? color : emptyColor}`}
          style={isActive ? segmentStyle : {}}
        />
      );
    }
    return segments;
  };

  return (
    <main className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="flex items-center gap-4 pb-8">
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

      <section className="max-w-2xl space-y-6 flex flex-col items-center gap-6">
        {/* Avatar et infos principales */}
        <section className="bg-card border border-border rounded-lg p-6 hologram-bg">
          <article className="flex items-center gap-6">
            <figure className="w-20 h-20 rounded-full bg-primary  flex items-center justify-center border-2 border-primary" style={{filter: 'drop-shadow(0 0 1px #3B82F6) drop-shadow(0 0 3px #1E40AF)', boxShadow: '0 0 10px #3B82F6, inset 0 0 20px rgba(59, 130, 246, 0.3)'}}>
              <User className="w-10 h-10 text-white" />
            </figure>
            <header className="flex-1">
              <h2 className="text-xl font-semibold">{userName}</h2>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
              <address className="flex items-center gap-4 pt-2 not-italic">
                <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full glow-blue">
                  Niveau {level}
                </span>
                <span className="text-sm text-muted-foreground glow-yellow">
                  {totalXp} XP total
                </span>
              </address>
            </header>
          </article>
        </section>

        {/* Statistiques */}
        <section className="flex justify-center m-0" aria-label="Statistiques des habitudes">
          <article className="flex flex-col justify-center items-center">
            <header>
              <h2 className="text-center text-white/20 text-8xl font-normal font-['Inter']">TOTAL</h2>
            </header>
            <dl className="w-56 flex justify-center items-center gap-16 pt-4">
              <div className="w-24 flex flex-col items-center relative justify-between gap-6 h-full">
                <dt className="sr-only">Habitudes complétées</dt>
                <dd className="text-blue-400 text-6xl font-normal font-['Inter'] pb-4">{totalCompleted}</dd>
                <figure className="absolute top-[-2.25rem] w-32 h-32">
                  <img src="/rondblue.svg" alt="Graphique circulaire bleu" className="w-32 h-32  drop-shadow-2xl" style={{filter: 'drop-shadow(0 0 2px #3B82F6) drop-shadow(0 0 20px #1E40AF)'}} />
                </figure>
                <span className="text-white text-lg font-normal font-['Inter'] text-center">Terminées</span>
              </div>
              <div className="w-24 flex flex-col items-center relative justify-between gap-6 h-full">
                <dt className="sr-only">Habitudes non complétées</dt>
                <dd className="text-rose-500 text-6xl font-normal font-['Inter'] pb-4">{totalMissed}</dd>
                <figure className="absolute top-[-2.25rem] w-32 h-32">
                  <img src="/rondred.svg" alt="Graphique circulaire rouge" className="w-32 h-32  drop-shadow-2xl" style={{filter: 'drop-shadow(0 0 2px #EF4444) drop-shadow(0 0 20px #DC2626)'}} />
                </figure>
                <span className="text-white text-lg font-normal font-['Inter'] text-center">Oubliées</span>
              </div>
            </dl>
          </article>
        </section>

        {/* Barres de progression des performances */}
        <section className="flex justify-center w-[90%]" aria-label="Performances avant bonus/malus">
          <article className="w-full flex flex-col gap-6">
            {/* Barre de réussite (haut) */}
            <div className="flex items-center gap-6 relative">
              <span className="text-blue-400 text-3xl font-normal font-['Inter'] ">
                {successRate}%
              </span>
              <div className="absolute left-[-1rem]">
              <img 
                src="/rondblue.svg" 
                alt="Indicateur de réussite" 
                className="w-20 h-20" 
                style={{filter: 'drop-shadow(0 0 2px #3B82F6) drop-shadow(0 0 10px #1E40AF)'}} 
              />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-normal font-['Inter']">avant récompense</span>
                  <span className="text-white/40 text-sm font-normal font-['Inter']">100</span>
                </div>
                <div className="flex gap-1 text-blue-400 justify-between">
                  {generateProgressBar(successRate, 'bg-blue-900')}
                </div>
              </div>
            </div>

            {/* Barre d'échec (bas) */}
            <div className="flex items-center gap-6 relative flex-row-reverse">
              <span className="text-rose-500 text-3xl font-normal font-['Inter'] ">
                {failureRate}%
              </span>
              <div className="absolute right-[-1rem]">
              <img 
                src="/rondred.svg" 
                alt="Indicateur d'échec" 
                className="w-20 h-20" 
                style={{filter: 'drop-shadow(0 0 2px #EF4444) drop-shadow(0 0 10px #DC2626)'}} 
              />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                
                <div className="flex gap-1 text-rose-500 flex-row-reverse justify-between">
                  {generateProgressBar(failureRate, 'bg-red-700', 'bg-zinc-800')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm font-normal font-['Inter']">100</span>
                  <span className="text-white text-sm font-normal font-['Inter']">avant pénalité</span>
                </div>
              </div>
            </div>
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