'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Sparkles, Zap, Check, LogOut } from 'lucide-react';
import Calendar from '@/components/calendar';
import XpBar from '@/components/xp-bar';
import CreateHabit from '@/components/create-habit';
import { User, Habit, HabitInstance, CalendarDay } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayInstances, setTodayInstances] = useState<HabitInstance[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour le modal des habitudes du jour
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateInstances, setSelectedDateInstances] = useState<HabitInstance[]>([]);
  
  // Charger les données utilisateur et habitudes
  useEffect(() => {
    if (session?.user?.id) {
      loadUserData();
      loadHabits();
      loadCalendarData();
      loadSelectedDateInstances(new Date()); // Charger les habitudes d'aujourd'hui par défaut
    }
  }, [session]);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const loadHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des habitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarData = async (month?: Date) => {
    try {
      const currentMonth = month || new Date();
      const response = await fetch(
        `/api/calendar?month=${currentMonth.getMonth()}&year=${currentMonth.getFullYear()}`
      );
      if (response.ok) {
        const data = await response.json();
        // Convertir les dates string en objets Date
        const calendarDataWithDates = data.calendarData.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        }));
        setCalendarData(calendarDataWithDates);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du calendrier:', error);
    }
  };

  // Fonction pour gérer le clic sur une date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    loadSelectedDateInstances(date);
  };

  // Charger les instances d'habitudes pour la date sélectionnée
  const loadSelectedDateInstances = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/habits/instances?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDateInstances(data.instances || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des instances:', error);
      setSelectedDateInstances([]);
    }
  };

  // Fonction pour gérer la complétion d'une habitude
  const handleHabitComplete = (habitId: string, date: Date) => {
    // Recharger les données utilisateur pour mettre à jour l'XP
    loadUserData();
    // Recharger les données du calendrier
    loadCalendarData(date);
  };

  // Données par défaut pour le développement
  const userName = user?.name || session?.user?.name || 'Hero';
  const level = user?.level || 1;
  const currentXp = user?.currentXp || 0;
  const totalXp = user?.totalXp || 0;
  const handleCreateHabit = async (habitData: any) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      });

      if (response.ok) {
        const data = await response.json();
        setHabits(prev => [...prev, data.habit]);
        
        // Créer des instances selon la fréquence choisie
        await createInstancesBasedOnFrequency(data.habit.id, habitData.frequency);
        
        setShowCreateHabit(false);
        
        // Recharger les données
        loadSelectedDateInstances(selectedDate);
        loadCalendarData();
      } else {
        console.error('Erreur lors de la création de l\'habitude');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Fonction pour créer des instances selon la fréquence
  const createInstancesBasedOnFrequency = async (habitId: string, frequency: string) => {
    try {
      const response = await fetch('/api/habits/instances/frequency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId,
          frequency,
          startDate: selectedDate.toISOString().split('T')[0], // Date sélectionnée comme point de départ
        }),
      });
      
      if (!response.ok) {
        console.error('Erreur lors de la création des instances de fréquence');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const response = await fetch('/api/habits/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId,
          date: new Date().toISOString(), // Toujours aujourd'hui pour la completion
        }),
      });

      if (response.ok) {
        // Recharger les données
        loadUserData();
        loadCalendarData();
        // Si on était sur aujourd'hui, recharger les instances de la date sélectionnée
        // Sinon, recharger aujourd'hui car c'est là que la completion a eu lieu
        const today = new Date();
        if (selectedDate.toDateString() === today.toDateString()) {
          loadSelectedDateInstances(selectedDate);
        } else {
          // Retourner sur aujourd'hui après la completion
          setSelectedDate(today);
          loadSelectedDateInstances(today);
        }
      } else {
        console.error('Erreur lors de la complétion de l\'habitude');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 space-y-6 min-h-screen bg-background w-fit">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-glow">Bonjour {userName}</h1>
          <p className="text-sm text-muted-foreground">Continue ta progression</p>
        </div>
        <div className="flex items-center gap-4">
          
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary glow-blue flex items-center justify-center border-2 border-primary">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-background">
              {level}
            </div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <XpBar level={level} currentXp={currentXp} totalXp={totalXp} />

      

      {/* Calendar */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Calendrier de progression
        </h2>
        <Calendar 
          calendarData={calendarData}
          onDateClick={handleDateClick}
          onMonthChange={(date) => loadCalendarData(date)}
        />
      </div>

      {/* Today's Habits */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Habitudes du {selectedDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long',
            year: selectedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          })}
          {selectedDate.toDateString() === new Date().toDateString() && ' (aujourd\'hui)'}
        </h2>
        <div className="space-y-2">
          {selectedDate.toDateString() === new Date().toDateString() ? (
            // Pour aujourd'hui, montrer toutes les habitudes de l'utilisateur
            habits.length > 0 ? (
              habits.map((habit) => {
                const instance = selectedDateInstances.find(i => i.habitId === habit.id);
                const isToday = selectedDate.toDateString() === new Date().toDateString();
                return (
                  <HabitCard 
                    key={habit.id}
                    habit={habit}
                    isCompleted={instance?.isCompleted || false}
                    onComplete={() => isToday ? handleCompleteHabit(habit.id) : null}
                    canModify={isToday}
                  />
                );
              })
            ) : (
              <p className="text-muted-foreground">Aucune habitude créée</p>
            )
          ) : (
            // Pour les autres jours, ne montrer que les habitudes qui ont des instances
            selectedDateInstances.length > 0 ? (
              selectedDateInstances.map((instance: any) => (
                <HabitCard 
                  key={instance.id}
                  habit={instance.habit}
                  isCompleted={instance.isCompleted}
                  onComplete={() => null} // Pas de modification pour les jours passés
                  canModify={false}
                />
              ))
            ) : (
              <p className="text-muted-foreground">Aucune habitude pour ce jour</p>
            )
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowCreateHabit(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center glow-blue shadow-lg hover:scale-110 transition-transform z-50"
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
  canModify?: boolean
}

function HabitCard({ habit, isCompleted, onComplete, canModify = true }: HabitCardProps) {
  const [localCompleted, setLocalCompleted] = useState(isCompleted)

  // Mettre à jour l'état local quand isCompleted change
  useEffect(() => {
    setLocalCompleted(isCompleted)
  }, [isCompleted])

  const handleToggle = () => {
    if (!canModify) return
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
          disabled={!canModify}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
            localCompleted 
              ? "bg-primary border-primary glow-blue check-bounce" 
              : canModify
                ? "border-muted-foreground hover:border-primary"
                : "border-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          {localCompleted && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  )
}