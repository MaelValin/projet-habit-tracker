"use client"

import { Progress } from "@/components/ui/progress"

interface XpBarProps {
  level: number
  currentXp: number
  totalXp: number
}

export default function XpBar({ level, currentXp, totalXp }: XpBarProps) {
  // Calculer l'XP nécessaire pour le niveau actuel et le suivant
  const xpForCurrentLevel = (level - 1) * 100 // 0 XP pour niveau 1, 100 pour niveau 2, etc.
  const xpForNextLevel = level * 100
  const xpInCurrentLevel = totalXp - xpForCurrentLevel
  const xpNeededForCurrentLevel = xpForNextLevel - xpForCurrentLevel
  
  // Pourcentage de progression dans le niveau actuel
  const percentage = Math.min((xpInCurrentLevel / xpNeededForCurrentLevel) * 100, 100)

  return (
    <section className="bg-card border border-border rounded-lg p-4" style={{filter: 'drop-shadow(0 0 2px #3B82F6) drop-shadow(0 0 10px #1E40AF)'}}  aria-label={`Progression du niveau ${level}`}>
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Niveau {level}</h3>
        <span className="text-sm text-muted-foreground" aria-label={`${xpInCurrentLevel} points d'expérience sur ${xpNeededForCurrentLevel} nécessaires`}>
          {xpInCurrentLevel} / {xpNeededForCurrentLevel} XP
        </span>
      </header>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Progression: ${Math.round(percentage)}% vers le niveau ${level + 1}`}>
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <footer className="text-xs text-muted-foreground mt-2 text-center">
        {xpNeededForCurrentLevel - xpInCurrentLevel} XP jusqu'au niveau {level + 1}
      </footer>
    </section>
  )
}