
import { useState, useEffect } from 'react';
import { Habit } from '@/lib/types';
import { Check, Heart, BookOpen, Dumbbell, Briefcase, Coffee, Palette, Brain, Trash } from 'lucide-react';


export interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean
  onComplete: () => void
  canModify?: boolean
}

function HabitCard({ habit, isCompleted, onComplete, canModify = true }: HabitCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSeries, setDeleteSeries] = useState(false);

    const handleDeleteClick = () => {
      setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
      // Appeler la fonction de suppression selon le choix
      const deleteHabit = async () => {
        try {
          const res = await fetch('/api/habits/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              deleteSeries
                ? { habitId: habit.id, deleteSeries: true }
                : { habitId: habit.id }
            ),
          });
          const data = await res.json();
          if (res.ok) {
            // Optionnel : rafraîchir la liste ou afficher un message
            console.log('Suppression réussie :', data.message);
          } else {
            console.error('Erreur suppression :', data.error);
          }
        } catch (err) {
          console.error('Erreur réseau suppression :', err);
        }
        setShowDeleteModal(false);
      };
      deleteHabit();
    };

    const handleCancelDelete = () => {
      setShowDeleteModal(false);
      setDeleteSeries(false);
    };
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

  const categoryIcons = {
    health: <Heart className="w-4 h-4 text-red-400" />,
    learning: <BookOpen className="w-4 h-4 text-blue-400" />,
    fitness: <Dumbbell className="w-4 h-4 text-green-400" />,
    work: <Briefcase className="w-4 h-4 text-yellow-400" />,
    lifestyle: <Coffee className="w-4 h-4 text-purple-400" />,
    creativity: <Palette className="w-4 h-4 text-pink-400" />,
    mindfulness: <Brain className="w-4 h-4 text-cyan-400" />
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
          <div className="flex items-center">
          <h3 className={`font-medium ${localCompleted ? "line-through text-muted-foreground" : ""}`}>
            {habit.name}
          </h3>
          <button
            onClick={handleDeleteClick}
            className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 ml-1"
            aria-label={`Supprimer : ${habit.name}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <Trash className="w-4 h-4" />
          </button>
          </div>
          <p className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {categoryIcons[habit.category]}
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
      {/* Modale de confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-100">
          <div className=" rounded-lg p-6 shadow-lg max-w-xs w-full">
            <h4 className="text-lg font-semibold mb-4">Confirmer la suppression</h4>
            <p className="mb-4">Voulez-vous vraiment supprimer&nbsp;:
              <span className="font-bold"> {habit.name} </span> ?</p>
            {(habit.frequency === 'daily' || habit.frequency === 'weekly') && (
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={deleteSeries}
                    onChange={e => setDeleteSeries(e.target.checked)}
                  />
                  Supprimer toute la série ({habit.frequency === 'daily' ? 'quotidienne' : 'hebdomadaire'})
                </label>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1 rounded text-primary bg-gray-200 hover:bg-gray-300"
              >Annuler</button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              >Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </article>
  )

}

export default HabitCard;