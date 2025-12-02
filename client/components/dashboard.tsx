'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles, Zap, Check, LogOut } from 'lucide-react';
import Calendar from '@/components/calendar';
import XpBar from '@/components/xp-bar';
import CreateHabit from '@/components/create-habit';
import { User, Habit, HabitInstance, CalendarDay } from '@/lib/types';
import { Button } from '@/components/ui/button';
import HabitCard from '@/components/habit-card';

export default function Dashboard() {
    const [showCreateHabit, setShowCreateHabit] = useState(false);


    useEffect(() => {
      if (showCreateHabit) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
      return () => {
        document.body.classList.remove('overflow-hidden');
      };
    }, [showCreateHabit]);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayInstances, setTodayInstances] = useState<HabitInstance[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showCreateHabit) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showCreateHabit]);
  
 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateInstances, setSelectedDateInstances] = useState<HabitInstance[]>([]);
  
 
  useEffect(() => {
    if (session?.user?.id) {
      loadUserData();
      loadHabits();
      loadCalendarData();
      loadSelectedDateInstances(new Date()); 
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

  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    loadSelectedDateInstances(date);
    // Affiche les habitudes reçues pour la date sélectionnée
    setTimeout(() => {
    }, 500);
  };

  
  const loadSelectedDateInstances = async (date: Date) => {
    try {
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
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

 
  const handleHabitComplete = (habitId: string, date: Date) => {
    
    loadUserData();
    
    loadCalendarData(date);
  };

  
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
        await createInstancesBasedOnFrequency(data.habit.id, habitData.frequency);
        setShowCreateHabit(false);
        loadSelectedDateInstances(selectedDate);
        loadCalendarData();
      } else {
        console.error('Erreur lors de la création de l\'habitude');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  
  const createInstancesBasedOnFrequency = async (habitId: string, frequency: string) => {
    try {
      // Crée une date avec la date sélectionnée + l'heure actuelle
      const now = new Date();
      const startDate = new Date(selectedDate);
      startDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      const response = await fetch('/api/habits/instances/frequency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId,
          frequency,
          startDate: startDate.toISOString(),
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
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}T${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}.${String(today.getMilliseconds()).padStart(3, '0')}Z`;
      
      const response = await fetch('/api/habits/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId,
          date: localDate,
        }),
      });

      if (response.ok) {
        
        loadUserData();
        loadCalendarData();
        
        if (selectedDate.toDateString() === today.toDateString()) {
          loadSelectedDateInstances(selectedDate);
        } else {
          
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
          
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto glow-blue" 
                 style={{filter: 'drop-shadow(0 0 10px #3B82F6) drop-shadow(0 0 20px #1E40AF)'}}></div>
            
            
            <div className="absolute inset-0 w-16 h-16 mx-auto">
              <div className="w-full h-full border-2 border-primary/20 rounded-full animate-ping"></div>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto animation-delay-75">
              <div className="w-full h-full border-2 border-primary/10 rounded-full animate-ping"></div>
            </div>
          </div>
          
          
          <div className="relative">
            <p className="text-primary font-medium text-lg animate-pulse">
              Chargement du dashboard
              <span className="animate-bounce inline-block ml-1">.</span>
              <span className="animate-bounce inline-block ml-0.5 animation-delay-150">.</span>
              <span className="animate-bounce inline-block ml-0.5 animation-delay-300">.</span>
            </p>
            <p className="text-muted-foreground text-sm mt-2 animate-fade-in">
              Préparation de vos habitudes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 pb-24 space-y-6 min-h-screen bg-background w-fit">
      
      <header className="flex items-center justify-between">
        <hgroup>
          <h1 className="text-2xl font-bold text-glow">Bonjour {userName}</h1>
          <p className="text-sm text-muted-foreground">Continue ta progression</p>
        </hgroup>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => router.push('/profile')}
            className="w-16 h-16 rounded-full bg-primary glow-blue flex items-center justify-center border-2 border-primary hover:scale-110 transition-transform"
            aria-label="Aller au profil"
            style={{filter: 'drop-shadow(0 0 2px #3B82F6)', boxShadow: '0 0 10px #1E40AF'}} 
          >
            <Sparkles className="w-8 h-8 text-white" />
          </button>
        </nav>
      </header>

      
      <section aria-label="Progression d'expérience">
        <XpBar level={level} currentXp={currentXp} totalXp={totalXp} />
      </section>

      

      {/* Calendar */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Calendrier de progression
        </h2>
        <Calendar 
          calendarData={calendarData}
          onDateClick={handleDateClick}
          onMonthChange={(date) => loadCalendarData(date)}
          selectedDate={selectedDate}
          onUserUpdate={loadUserData}
        />
      </section>

      {/* Today's Habits */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Habitudes du {selectedDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long',
            year: selectedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          })}
          {selectedDate.toDateString() === new Date().toDateString() && ' (aujourd\'hui)'}
        </h2>
        <ul className="space-y-2">
          {selectedDateInstances.length > 0 ? (
            selectedDateInstances.map((instance: any) => (
              <HabitCard 
                key={instance.id}
                habit={instance.habit}
                isCompleted={instance.isCompleted}
                onComplete={() => selectedDate.toDateString() === new Date().toDateString() ? handleCompleteHabit(instance.habit.id) : null}
                canModify={selectedDate.toDateString() === new Date().toDateString()}
                onDelete={() => loadSelectedDateInstances(selectedDate)}
              />
            ))
          ) : (
            <p className="text-muted-foreground">Aucune habitude pour ce jour</p>
          )}
        </ul>
      </section>

      {/* Add Habit Button */}
      <Button
        onClick={() => setShowCreateHabit(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center glow-blue shadow-lg hover:scale-110 transition-transform z-50"
        aria-label="Créer une nouvelle habitude"
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>

      {/* Create Habit Modal */}
      {showCreateHabit && (
        <CreateHabit
          onClose={() => setShowCreateHabit(false)}
          onSubmit={handleCreateHabit}
          selectedDate={selectedDate}
        />
      )}
    </main>
  );
}
