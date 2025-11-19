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
          {/* Loader principal avec effet neon */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto glow-blue" 
                 style={{filter: 'drop-shadow(0 0 10px #3B82F6) drop-shadow(0 0 20px #1E40AF)'}}></div>
            
            {/* Cercles pulsants autour */}
            <div className="absolute inset-0 w-16 h-16 mx-auto">
              <div className="w-full h-full border-2 border-primary/20 rounded-full animate-ping"></div>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto animation-delay-75">
              <div className="w-full h-full border-2 border-primary/10 rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Texte avec animation de typing */}
          <div className="relative">
            <p className="text-primary font-medium text-lg glow-blue animate-pulse">
              Chargement du profil
              <span className="animate-bounce inline-block ml-1">.</span>
              <span className="animate-bounce inline-block ml-0.5 animation-delay-150">.</span>
              <span className="animate-bounce inline-block ml-0.5 animation-delay-300">.</span>
            </p>
            <p className="text-muted-foreground text-sm mt-2 animate-fade-in">
              Récupération de vos données...
            </p>
          </div>
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

  // Calculs des cycles de progression (indépendants)
  // Barre de récompense : progression vers 10 quêtes complétées pour +50 XP
  const rewardCycleProgress = (totalCompleted % 10) / 10 * 100;
  const rewardCyclesCompleted = Math.floor(totalCompleted / 10);
  
  // Barre de pénalité : progression vers 10 quêtes ratées pour -50 XP
  const penaltyCycleProgress = (totalMissed % 10) / 10 * 100;
  const penaltyCyclesTriggered = Math.floor(totalMissed / 10);

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
    <main className="min-h-screen w-full md:w-fit bg-background p-4">
      {/* Header */}
      <header className="flex w-full items-center gap-4 pb-8">
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

      <section className="max-w-2xl w-full  flex flex-col items-center gap-6">
        {/* Avatar et infos principales */}
        <section className="bg-card w-full border border-border rounded-lg p-6 hologram-bg" style={{filter: 'drop-shadow(0 0 2px #3B82F6) drop-shadow(0 0 10px #1E40AF)'}}>
          <article className="flex items-center gap-6">
            <figure className="w-20 h-20 rounded-full bg-primary  flex items-center justify-center border-2 border-primary" style={{filter: 'drop-shadow(0 0 1px #3B82F6) drop-shadow(0 0 3px #1E40AF)', boxShadow: '0 0 10px #3B82F6, inset 0 0 20px rgba(59, 130, 246, 0.3)'}}>
              <User className="w-10 h-10 text-white" />
            </figure>
            <header className="flex-1">
              <h3 className="text-xl font-semibold">{userName}</h3>
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

        <section className='flex flex-col gap-6 '>

        {/* Statistiques */}
        <section className="bg-card w-full border border-border rounded-lg p-6 hologram-bg" style={{filter: 'drop-shadow(0 0 2px #3B82F6) drop-shadow(0 0 10px #1E40AF)'}} aria-label="Statistiques des habitudes">
          <header className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-primary mb-1">Statistiques globales</h2>
            <p className="text-sm text-muted-foreground">Vue d'ensemble de toutes vos habitudes depuis le début</p>
          </header>
          <article className="flex flex-col justify-center items-center">
            <header>
              <h3 className="text-center text-white/20 text-8xl font-normal font-['Inter']">TOTAL</h3>
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
        <section className="bg-card w-full h-fit border border-border rounded-lg p-6 hologram-bg flex flex-col" style={{filter: 'drop-shadow(0 0 2px #3B82F6) drop-shadow(0 0 10px #1E40AF)'}} aria-label="Performances avant bonus/malus">
          <header className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-primary mb-1">Système de récompenses</h2>
            <p className="text-sm text-muted-foreground">Progression vers vos prochains bonus et malus</p>
          </header>
          <article className="w-full flex flex-col gap-6">
            {/* Barre de réussite (haut) */}
            <div className="flex items-center gap-6 relative">
              <span className="text-blue-400 text-3xl font-normal font-['Inter'] ">
                {Math.round(rewardCycleProgress)}%
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
                  <span className="text-white text-sm font-normal font-['Inter']">avant récompense (+50 XP)</span>
                  <span className="text-white/40 text-sm font-normal font-['Inter']">{totalCompleted % 10}/10</span>
                </div>
                <div className="flex gap-1 text-blue-400 justify-between">
                  {generateProgressBar(rewardCycleProgress, 'bg-blue-400')}
                </div>
                {rewardCyclesCompleted > 0 && (
                  <div className="text-xs text-blue-400/60 text-center">
                    Récompenses obtenues : {rewardCyclesCompleted} × 50 XP = {rewardCyclesCompleted * 50} XP
                  </div>
                )}
              </div>
            </div>

            {/* Barre d'échec (bas) */}
            <div className="flex items-center gap-6 relative flex-row-reverse">
              <span className="text-rose-500 text-3xl font-normal font-['Inter'] ">
                {Math.round(penaltyCycleProgress)}%
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
                  {generateProgressBar(penaltyCycleProgress, 'bg-red-700', 'bg-zinc-800')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm font-normal font-['Inter']">{totalMissed % 10}/10</span>
                  <span className="text-white text-sm font-normal font-['Inter']">avant pénalité (-50 XP)</span>
                </div>
                {penaltyCyclesTriggered > 0 && (
                  <div className="text-xs text-rose-500/60 text-center">
                    Pénalités subies : {penaltyCyclesTriggered} × 50 XP = -{penaltyCyclesTriggered * 50} XP
                  </div>
                )}
              </div>
            </div>
          </article>
        </section>


        </section>



        {/* Actions */}
        <footer className="flex flex-col items-center gap-3">
          <Button
            variant="destructive"
            className="w-full max-w-sm flex items-center gap-2"
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{filter: 'drop-shadow(0 0 2px #EF4444) drop-shadow(0 0 10px #DC2626)'}}
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </footer>
      </section>
    </main>
  );
}