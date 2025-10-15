'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { Habit } from '../../../shared/types';

interface CreateHabitFormProps {
  onSubmit: (data: { name: string; description?: string; color?: string }) => Promise<void>;
  onCancel: () => void;
}

export function CreateHabitForm({ onSubmit, onCancel }: CreateHabitFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      setName('');
      setDescription('');
      setColor('#3B82F6');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700">
          Nom de l'habitude *
        </label>
        <input
          type="text"
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Ex: Lire 30 minutes"
          required
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Description optionnelle..."
          maxLength={500}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur
        </label>
        <div className="flex gap-2">
          {colorOptions.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === colorOption ? 'border-gray-800 scale-110' : 'border-gray-300'
              } transition-all`}
              style={{ backgroundColor: colorOption }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Création...' : 'Créer l\'habitude'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

interface HabitCardProps {
  habit: Habit;
  isCompleted?: boolean;
  onToggle?: (habitId: string, completed: boolean) => Promise<void>;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export function HabitCard({ habit, isCompleted = false, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!onToggle) return;
    
    setIsToggling(true);
    try {
      await onToggle(habit.id, !isCompleted);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div 
      className="p-4 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeftColor: habit.color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onToggle && (
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              } ${isToggling ? 'opacity-50' : ''} transition-colors`}
            >
              {isCompleted && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(habit)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(habit.id)}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface HabitListProps {
  habits: Habit[];
  todayEntries?: { [key: string]: boolean };
  onToggleEntry?: (habitId: string, completed: boolean) => Promise<void>;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  emptyMessage?: string;
}

export function HabitList({ 
  habits, 
  todayEntries = {}, 
  onToggleEntry, 
  onEditHabit, 
  onDeleteHabit,
  emptyMessage = "Aucune habitude trouvée"
}: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <PlusIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isCompleted={todayEntries[habit.id] || false}
          onToggle={onToggleEntry}
          onEdit={onEditHabit}
          onDelete={onDeleteHabit}
        />
      ))}
    </div>
  );
}