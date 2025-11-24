"use client"

import { useState } from "react"
import { X, Heart, BookOpen, Dumbbell, Briefcase, Coffee, Palette, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateHabitDTO } from "@/lib/types"

interface CreateHabitProps {
  onClose: () => void
  onSubmit?: (habit: CreateHabitDTO) => void
  selectedDate: Date
}

export default function CreateHabit({ onClose, onSubmit, selectedDate }: CreateHabitProps) {
  const [habitName, setHabitName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [frequency, setFrequency] = useState("daily")
  const [targetCount, setTargetCount] = useState(1)
  const [difficulty, setDifficulty] = useState("easy")
  const [error, setError] = useState<string>("")

  const categories = [
    { id: "health", name: "Santé", icon: <Heart className="w-5 h-5" />, color: "text-red-400" },
    { id: "learning", name: "Apprentissage", icon: <BookOpen className="w-5 h-5" />, color: "text-blue-400" },
    { id: "fitness", name: "Fitness", icon: <Dumbbell className="w-5 h-5" />, color: "text-green-400" },
    { id: "work", name: "Travail", icon: <Briefcase className="w-5 h-5" />, color: "text-yellow-400" },
    { id: "lifestyle", name: "Style de vie", icon: <Coffee className="w-5 h-5" />, color: "text-purple-400" },
    { id: "creativity", name: "Créativité", icon: <Palette className="w-5 h-5" />, color: "text-pink-400" },
    { id: "mindfulness", name: "Pleine conscience", icon: <Brain className="w-5 h-5" />, color: "text-cyan-400" },
  ]

  const difficulties = [
    { id: "easy", label: "Facile", xp: 10, color: "text-green-400" },
    { id: "medium", label: "Moyen", xp: 20, color: "text-yellow-400" },
    { id: "hard", label: "Difficile", xp: 35, color: "text-orange-400" },
  ]

  const selectedDifficulty = difficulties.find(d => d.id === difficulty) || difficulties[0]

  const handleSubmit = () => {
      console.log('Date sélectionnée (avant normalisation) :', selectedDate);
    // Normaliser la date sélectionnée à 12h locale (midi) pour éviter les décalages de fuseau horaire
    let normalizedDate;
    if (selectedDate) {
      normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(12, 0, 0, 0);
      console.log('Date sélectionnée (après normalisation à 12h) :', normalizedDate);
    }
    setError("");
    if (!habitName.trim() || !selectedCategory) {
      return;
    }
    // Vérifier que la date sélectionnée n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    if (selectedDay < today) {
      setError("Impossible de créer une habitude sur un jour passé.");
      return;
    }
    // Normaliser la date sélectionnée à 12h locale (midi) pour éviter les décalages de fuseau horaire
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(12, 0, 0, 0);

    const habitData: CreateHabitDTO = {
      name: habitName.trim(),
      description: description.trim() || undefined,
      category: selectedCategory as any,
      frequency: frequency as any,
      targetCount,
      difficulty: difficulty as any
    };
    console.log('Données de l’habitude à créer :', habitData);
    onSubmit?.(habitData);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-habit-title">
      <form className="bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border-animate hologram-bg">
        {/* Header */}
        <header className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 id="create-habit-title" className="text-xl font-bold text-glow">Nouvelle Habitude</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-all"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Message d'erreur */}
          {error && (
            <div className="mb-2 text-sm text-red-500 text-center">
              {error}
            </div>
          )}
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name">Nom de l'habitude <span className="text-red-50">*</span></Label>
            <Input
              id="habit-name"
              placeholder="Ex: Méditation matinale"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Category */}
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Catégorie *</legend>
            <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="category-legend">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/10 glow-blue"
                      : "border-border hover:border-primary/50"
                  }`}
                  aria-pressed={selectedCategory === category.id}
                >
                  <span className={category.color} aria-hidden="true">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Frequency */}
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Fréquence</legend>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-labelledby="frequency-legend">
              {[
                { id: "daily", label: "Quotidien", description: "Chaque jour à partir de la date sélectionnée" },
                { id: "weekly", label: "Hebdo", description: "Une fois par semaine, le même jour" },
                { id: "unique", label: "Unique", description: "Seulement pour la date sélectionnée" },
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id)}
                  className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    frequency === freq.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-accent/50"
                  }`}
                  role="radio"
                  aria-checked={frequency === freq.id}
                  title={freq.description}
                >
                  {freq.label}
                </button>
              ))}
            </div>
            {frequency === "daily" && (
              <p className="text-xs text-muted-foreground">
                Cette habitude sera ajoutée automatiquement chaque jour à partir de la date sélectionnée
              </p>
            )}
            {frequency === "weekly" && (
              <p className="text-xs text-muted-foreground">
                Cette habitude sera ajoutée chaque semaine le même jour que la date sélectionnée
              </p>
            )}
            {frequency === "unique" && (
              <p className="text-xs text-muted-foreground">
                Cette habitude ne sera créée que pour la date sélectionnée uniquement
              </p>
            )}
          </fieldset>

          {/* Difficulty */}
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Difficulté</legend>
            <div className="grid grid-cols-3 gap-3" role="radiogroup">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                    difficulty === diff.id
                      ? "border-primary bg-primary/10 glow-blue"
                      : "border-border hover:border-primary/50"
                  }`}
                  role="radio"
                  aria-checked={difficulty === diff.id}
                >
                  <span className="text-sm font-medium">{diff.label}</span>
                  <span className={`text-xs font-bold ${diff.color}`}>+{diff.xp} XP</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* XP Reward Preview */}
          <div className="bg-muted rounded-lg p-4 border border-border hologram-bg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Récompense XP</span>
              <span className={`text-lg font-bold ${selectedDifficulty.color}`}>
                +{selectedDifficulty.xp} XP
              </span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            className="flex-1 bg-transparent"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!habitName.trim() || !selectedCategory}
            className="flex-1 bg-primary hover:opacity-90 glow-blue disabled:opacity-50"
          >
            Créer l'habitude
          </Button>
        </footer>
      </form>
    </div>
  )
}