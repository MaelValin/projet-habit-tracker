'use client';

import { useState, useEffect } from 'react';
import type { Habit, CreateHabitData, UpdateHabitData, ApiResponse } from '../../../shared/types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/habits');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des habitudes');
      }
      
      const data: ApiResponse<Habit[]> = await response.json();
      
      if (data.success && data.data) {
        setHabits(data.data);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habitData: CreateHabitData): Promise<Habit> => {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création');
    }

    const data: ApiResponse<Habit> = await response.json();
    
    if (data.success && data.data) {
      setHabits(prev => [data.data!, ...prev]);
      return data.data;
    } else {
      throw new Error(data.error || 'Erreur lors de la création');
    }
  };

  const updateHabit = async (habitId: string, updates: UpdateHabitData): Promise<Habit> => {
    const response = await fetch(`/api/habits/${habitId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour');
    }

    const data: ApiResponse<Habit> = await response.json();
    
    if (data.success && data.data) {
      setHabits(prev => prev.map(h => h.id === habitId ? data.data! : h));
      return data.data;
    } else {
      throw new Error(data.error || 'Erreur lors de la mise à jour');
    }
  };

  const deleteHabit = async (habitId: string): Promise<void> => {
    const response = await fetch(`/api/habits/${habitId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression');
    }

    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return {
    habits,
    loading,
    error,
    refetch: fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
  };
}

export function useHabitEntries() {
  const [entries, setEntries] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/entries?date=${today}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des entrées');
      }
      
      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && data.data) {
        const entriesMap: { [key: string]: boolean } = {};
        data.data.forEach((entry: any) => {
          if (entry.habitId) {
            entriesMap[entry.habitId] = entry.completed || false;
          }
        });
        setEntries(entriesMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const toggleEntry = async (habitId: string, completed: boolean): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        habitId,
        date: today,
        completed,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour');
    }

    setEntries(prev => ({
      ...prev,
      [habitId]: completed,
    }));
  };

  useEffect(() => {
    fetchTodayEntries();
  }, []);

  return {
    entries,
    loading,
    error,
    refetch: fetchTodayEntries,
    toggleEntry,
  };
}