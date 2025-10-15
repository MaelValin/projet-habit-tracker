"use client"

import { Progress } from "@/components/ui/progress"

interface XpBarProps {
  level: number
  currentXp: number
  maxXp: number
}

export default function XpBar({ level, currentXp, maxXp }: XpBarProps) {
  const percentage = (currentXp / maxXp) * 100

  return (
    <div className="bg-card border border-border rounded-lg p-4 hologram-bg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-glow">Niveau {level}</span>
        <span className="text-sm text-muted-foreground">
          {currentXp} / {maxXp} XP
        </span>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden glow-blue">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        {maxXp - currentXp} XP jusqu'au niveau {level + 1}
      </p>
    </div>
  )
}