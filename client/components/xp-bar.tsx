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
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Niveau {level}</span>
        <span className="text-sm text-muted-foreground">
          {xpInCurrentLevel} / {xpNeededForCurrentLevel} XP
        </span>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        {xpNeededForCurrentLevel - xpInCurrentLevel} XP jusqu'au niveau {level + 1}
      </p>
    </div>
  )
}