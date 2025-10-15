"use client"

import { Bot } from "lucide-react"

interface NpcMotivatorProps {
  message?: string
}

export default function NpcMotivator({ message }: NpcMotivatorProps) {
  const defaultMessages = [
    "Tu progresses, héros ! Continue comme ça !",
    "Chaque jour est une nouvelle quête !",
    "Ta détermination est impressionnante !",
    "Les petites victoires mènent aux grandes !",
    "Tu deviens plus fort chaque jour !",
    "Tes habitudes forgent ton destin !",
    "Continue, le niveau suivant t'attend !",
    "Même les héros ont commencé par le niveau 1 !"
  ]

  const displayMessage = message || defaultMessages[Math.floor(Math.random() * defaultMessages.length)]

  return (
    <div className="relative bg-gradient-to-br from-card to-muted border border-primary/30 rounded-lg p-4 border-animate hologram-bg">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary glow-blue flex items-center justify-center flex-shrink-0">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-accent mb-1 text-glow">Assistant IA</h3>
          <p className="text-sm leading-relaxed">{displayMessage}</p>
        </div>
      </div>

      {/* Speech bubble tail */}
      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-card border-l border-b border-primary/30 transform rotate-45" />
    </div>
  )
}