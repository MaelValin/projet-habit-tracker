
import { useState, useEffect } from 'react';
import { Habit } from '@/lib/types';
import { Check } from 'lucide-react';


export interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean
  onComplete: () => void
  canModify?: boolean
}

function HabitCard({ habit, isCompleted, onComplete, canModify = true }: HabitCardProps) {
  const [localCompleted, setLocalCompleted] = useState(isCompleted)

  
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
    <article
      className={`bg-card border rounded-lg p-4 transition-all hologram-bg ${
        localCompleted 
          ? "border-primary glow-blue opacity-75" 
          : "border-border hover:border-primary/50"
      }`}
    >
      <header className="flex items-center justify-between">
        <hgroup className="flex-1">
          <h3 className={`font-medium ${localCompleted ? "line-through text-muted-foreground" : ""}`}>
            {habit.name}
          </h3>
          <p className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {categoryLabels[habit.category]}
            </span>
            <span className={`text-xs font-semibold ${difficultyColors[habit.difficulty]}`}>
              +{habit.xpReward} XP
            </span>
          </p>
        </hgroup>
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
          style={{filter: 'drop-shadow(0 0 2px #3B82F6) '}} 
          aria-label={`${localCompleted ? 'Marquer comme non terminé' : 'Marquer comme terminé'} : ${habit.name}`}
        >
          {localCompleted && <Check className="w-4 h-4 text-white" />}
        </button>
      </header>
    </article>
  )
}

export default HabitCard;