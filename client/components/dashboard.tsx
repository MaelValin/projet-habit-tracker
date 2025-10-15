'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Sparkles, Zap, Check, LogOut } from 'lucide-react';
import Calendar from '@/components/calendar';
import XpBar from '@/components/xp-bar';
import NpcMotivator from '@/components/npc-motivator';
import CreateHabit from '@/components/create-habit';
import { User, Habit, HabitInstance, CalendarDay } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayInstances, setTodayInstances] = useState<HabitInstance[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  
  // Données par défaut pour le développement
  const userName = session?.user?.name || 'Hero';
  const level = 12;
  const currentXp = 750;
  const maxXp = 1000;
  const handleCreateHabit = (habitData: any) => {
    console.log('Nouvelle habitude créée:', habitData);
    // TODO: Envoyer à l'API
    setShowCreateHabit(false);
  };

  const handleCompleteHabit = (habitId: string) => {
    console.log('Habitude complétée:', habitId);
    // TODO: Envoyer à l'API
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-glow">Bonjour {userName}</h1>
          <p className="text-sm text-muted-foreground">Continue ta progression</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => signOut()}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary glow-blue flex items-center justify-center border-2 border-primary">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-background">
              {level}
            </div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <XpBar level={level} currentXp={currentXp} maxXp={maxXp} />

      {/* NPC Motivator */}
      <NpcMotivator />

      {/* Calendar */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Calendrier de progression
        </h2>
        <Calendar 
          calendarData={calendarData}
          onDateClick={(date) => console.log('Date clicked:', date)}
        />
      </div>

      {/* Today's Habits */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Habitudes du jour</h2>
        <div className="space-y-2">
          {habits.length > 0 ? (
            habits.map((habit) => {
              const instance = todayInstances.find(i => i.habitId === habit.id);
              return (
                <HabitCard 
                  key={habit.id}
                  habit={habit}
                  isCompleted={instance?.isCompleted || false}
                  onComplete={() => handleCompleteHabit(habit.id)}
                />
              );
            })
          ) : (
            // Données fictives pour le développement
            <>
              <HabitCard 
                habit={{
                  id: '1',
                  name: 'Méditation matinale',
                  category: 'mindfulness',
                  xpReward: 50,
                  difficulty: 'easy'
                } as Habit}
                isCompleted={true}
                onComplete={() => {}}
              />
              <HabitCard 
                habit={{
                  id: '2',
                  name: 'Lire 10 pages',
                  category: 'learning',
                  xpReward: 30,
                  difficulty: 'medium'
                } as Habit}
                isCompleted={false}
                onComplete={() => {}}
              />
              <HabitCard 
                habit={{
                  id: '3',
                  name: 'Faire 20 pompes',
                  category: 'fitness',
                  xpReward: 40,
                  difficulty: 'medium'
                } as Habit}
                isCompleted={false}
                onComplete={() => {}}
              />
            </>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowCreateHabit(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center glow-blue shadow-lg hover:scale-110 transition-transform z-50"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Create Habit Modal */}
      {showCreateHabit && (
        <CreateHabit
          onClose={() => setShowCreateHabit(false)}
          onSubmit={handleCreateHabit}
        />
      )}
    </div>
  );
}

interface HabitCardProps {
  habit: Pick<Habit, 'id' | 'name' | 'category' | 'xpReward' | 'difficulty'>
  isCompleted: boolean
  onComplete: () => void
}

function HabitCard({ habit, isCompleted, onComplete }: HabitCardProps) {
  const [localCompleted, setLocalCompleted] = useState(isCompleted)

  const handleToggle = () => {
    setLocalCompleted(!localCompleted)
    onComplete()
  }

  const categoryLabels = {
    health: 'Santé',
    learning: 'Apprentissage', 
    fitness: 'Fitness',
    work: 'Travail',
    lifestyle: 'Style de vie',
    creativity: 'Créativité',
    mindfulness: 'Pleine conscience'
  }

  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400', 
    hard: 'text-orange-400',
    epic: 'text-purple-400'
  }

  return (
    <div
      className={`bg-card border rounded-lg p-4 transition-all hologram-bg ${
        localCompleted 
          ? "border-primary glow-blue opacity-75" 
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className={`font-medium ${localCompleted ? "line-through text-muted-foreground" : ""}`}>
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {categoryLabels[habit.category]}
            </span>
            <span className={`text-xs font-semibold ${difficultyColors[habit.difficulty]}`}>
              +{habit.xpReward} XP
            </span>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
            localCompleted 
              ? "bg-primary border-primary glow-blue check-bounce" 
              : "border-muted-foreground hover:border-primary"
          }`}
        >
          {localCompleted && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  )
}