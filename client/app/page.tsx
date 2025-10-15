"use client"

import { useState } from 'react'
import Dashboard from '@/components/dashboard'
import CreateHabit from '@/components/create-habit'
import { CreateHabitDTO } from '@/lib/types'

export default function HomePage() {
  const [showCreateHabit, setShowCreateHabit] = useState(false)

  const handleCreateHabit = (habitData: CreateHabitDTO) => {
    console.log('Créer habitude:', habitData)
    // TODO: Appeler l'API pour créer l'habitude
  }

  const handleCompleteHabit = (habitId: string) => {
    console.log('Compléter habitude:', habitId)
    // TODO: Appeler l'API pour marquer l'habitude comme complétée
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Dashboard 
        onCreateHabit={() => setShowCreateHabit(true)}
        onCompleteHabit={handleCompleteHabit}
      />
      
      {showCreateHabit && (
        <CreateHabit 
          onClose={() => setShowCreateHabit(false)}
          onSubmit={handleCreateHabit}
        />
      )}
    </div>
  )
}
