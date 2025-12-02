"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sword, Skull } from "lucide-react"

interface BossFightModalProps {
  isOpen: boolean
  onClose: () => void
  playerLevel: number
  playerXp: number
}

export default function BossFightModal({
  isOpen,
  onClose,
  playerLevel,
  playerXp,
}: BossFightModalProps) {
  const [bossLevel] = useState(() => Math.floor(Math.random() * 5) + 1)
  const [isRolling, setIsRolling] = useState(false)
  const [hasRolled, setHasRolled] = useState(false)
  const [result, setResult] = useState<{ victory: boolean; message: string } | null>(null)

  const handleRollDice = async () => {
    setIsRolling(true)
    
    // Animation de lancer de dé
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const baseChance = 0.5
    const levelDiff = playerLevel - bossLevel
    let winChance = baseChance + (levelDiff * 0.1)
    winChance = Math.max(0.1, Math.min(0.9, winChance))
    const roll = Math.random()
    const victory = roll < winChance

    if (victory) {
      // Appel API pour ajouter 200 XP
      try {
        const res = await fetch('/api/boss-fight', { method: 'POST' })
        if (res.ok) {
          setResult({
            victory: true,
            message: `Victoire ! Tu as vaincu le boss de niveau ${bossLevel} et gagné 200 XP !`,
          })
        } else {
          setResult({
            victory: true,
            message: 'Victoire, mais erreur lors de l\'ajout des XP.',
          })
        }
      } catch (e) {
        setResult({
          victory: true,
          message: 'Erreur réseau lors de l\'ajout des XP.',
        })
      }
    } else {
      setResult({
        victory: false,
        message: `Défaite... Le boss de niveau ${bossLevel} t'a vaincu. Réessaie le mois prochain !`,
      })
    }

    setIsRolling(false)
    setHasRolled(true)
  }

  const handleClose = () => {
    setHasRolled(false)
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Skull className="w-8 h-8 text-orange-500" />
            Combat de Boss !
          </DialogTitle>
          <DialogDescription>
            Dernier jour du mois - Affrontez le boss pour gagner 200 XP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stats du joueur */}
          <div className="bg-primary/10 border border-primary rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 text-primary">Votre héros</h3>
            <div className="space-y-1">
              <p className="text-sm">Niveau : <span className="font-bold">{playerLevel}</span></p>
              <p className="text-sm">XP Total : <span className="font-bold">{playerXp}</span></p>
            </div>
          </div>

          {/* VS */}
          <div className="flex justify-center">
            <div className="bg-muted rounded-full px-4 py-2">
              <Sword className="w-6 h-6 inline-block mr-2" />
              <span className="font-bold text-lg">VS</span>
              <Skull className="w-6 h-6 inline-block ml-2" />
            </div>
          </div>

          {/* Stats du boss */}
          <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 text-orange-600">Boss</h3>
            <div className="space-y-1">
              <p className="text-sm">Niveau : <span className="font-bold">{bossLevel}</span></p>
              <p className="text-sm text-muted-foreground">Récompense : 200 XP</p>
            </div>
          </div>

          {/* Résultat */}
          {hasRolled && result && (
            <div
              className={`${
                result.victory
                  ? 'bg-green-500/10 border-green-500 text-green-700'
                  : 'bg-red-500/10 border-red-500 text-red-700'
              } border rounded-lg p-4 animate-in fade-in-50 slide-in-from-bottom-5`}
            >
              <p className="font-semibold text-center">{result.message}</p>
            </div>
          )}

          {/* Bouton lancer le dé */}
          {!hasRolled && (
            <Button
              onClick={handleRollDice}
              disabled={isRolling}
              className="w-full"
              size="lg"
            >
              {isRolling ? (
                <>
                  <span className="animate-spin mr-2">🎲</span>
                  Lancement du dé...
                </>
              ) : (
                <>
                  <span className="mr-2">🎲</span>
                  Lancer le dé
                </>
              )}
            </Button>
          )}

          {/* Bouton fermer après combat */}
          {hasRolled && (
            <Button onClick={handleClose} className="w-full" variant="outline">
              Fermer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
