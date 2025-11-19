"use client"

import { useState, useEffect } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Habit, HabitInstance } from '@/lib/types';

interface DayHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  habits: Habit[];
  onHabitComplete: (habitId: string, date: Date) => void;
}

export default function DayHabitsModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  habits,
  onHabitComplete 
}: DayHabitsModalProps) {
  const [dayInstances, setDayInstances] = useState<HabitInstance[]>([]);
  const [loading, setLoading] = useState(false);

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isPastDay = selectedDate < new Date() && !isToday;

  useEffect(() => {
    if (isOpen && selectedDate) {
      loadDayInstances();
    }
  }, [isOpen, selectedDate]);

  const loadDayInstances = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/habits/instances?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setDayInstances(data.instances || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHabitToggle = async (habitId: string) => {
    if (!isToday) return; // Ne permettre de cocher que le jour même

    try {
      const response = await fetch('/api/habits/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId,
          date: selectedDate.toISOString(),
        }),
      });

      if (response.ok) {
        onHabitComplete(habitId, selectedDate);
        loadDayInstances(); // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors du toggle de l\'habitude:', error);
    }
  };

  const getHabitStatus = (habitId: string) => {
    const instance = dayInstances.find(inst => inst.habitId === habitId);
    return instance?.isCompleted || false;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"  role="dialog" aria-modal="true" aria-labelledby="day-habits-title">
      <article className="bg-card border border-border rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="day-habits-title" className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Habitudes du jour
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer">
            <X className="w-4 h-4" />
          </Button>
        </header>

        
        <section className="p-4 bg-muted/20">
          <time className="text-sm text-muted-foreground capitalize" dateTime={selectedDate.toISOString().split('T')[0]}>
            {formatDate(selectedDate)}
          </time>
          {!isToday && (
            <p className="text-xs text-muted-foreground mt-1">
              {isPastDay ? 'Jour passé - non modifiable' : 'Jour futur - non modifiable'}
            </p>
          )}
        </section>

        {/* Habits List */}
        <main className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground">Chargement...</p>
          ) : habits.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Aucune habitude créée
            </p>
          ) : (
            <ul className="space-y-3">
              {habits.map((habit) => {
                const isCompleted = getHabitStatus(habit.id);
                const canToggle = isToday;

                return (
                  <li
                    key={habit.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-card border-border hover:border-accent/50'
                    }`}
                  >
                    <button
                      onClick={() => handleHabitToggle(habit.id)}
                      disabled={!canToggle}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : canToggle
                            ? 'border-muted-foreground hover:border-accent'
                            : 'border-muted-foreground/50 cursor-not-allowed'
                      }`}
                      aria-label={`${isCompleted ? 'Marquer comme non terminé' : 'Marquer comme terminé'} : ${habit.name}`}
                    >
                      {isCompleted && <Check className="w-3 h-3" />}
                    </button>

                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        isCompleted ? 'text-primary' : 'text-foreground'
                      }`}>
                        {habit.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {habit.xpReward} XP • {habit.category}
                      </p>
                    </div>

                    <span className={`text-xs px-2 py-1 rounded ${
                      habit.difficulty === 'easy'
                        ? 'bg-green-500/20 text-green-400'
                        : habit.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      {habit.difficulty}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </footer>
      </article>
    </div>
  );
}