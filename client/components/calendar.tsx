"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CalendarDay } from "@/lib/types"
import BossFightModal from "@/components/boss-fight-modal"

interface CalendarProps {
  calendarData?: CalendarDay[]
  currentMonth?: Date
  onDateClick?: (date: Date) => void
  onMonthChange?: (date: Date) => void
  selectedDate?: Date
}

export default function Calendar({ 
  calendarData = [], 
  currentMonth = new Date(),
  onDateClick,
  onMonthChange,
  selectedDate
}: CalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(currentMonth)
  const [playerLevel, setPlayerLevel] = useState(1)
  const [playerXp, setPlayerXp] = useState(0)
  const [isBossFightModalOpen, setIsBossFightModalOpen] = useState(false)

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        if (data?.user?.level) {
          setPlayerLevel(data.user.level)
        }
        if (data?.user?.totalXp !== undefined) {
          setPlayerXp(data.user.totalXp)
        }
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  // Jours où TOUTES les habitudes sont complétées (100%) ET où il y a des habitudes
  const fullyCompletedDays = calendarData.length > 0 
    ? calendarData.filter(day => day.completionRate >= 100 && day.habits.length > 0).map(day => day.date.getDate())
    : [] // Pas de mock data pour éviter la confusion

  // Jours avec des habitudes non complétées (pour les jours rouges)
  const incompleteHabitDays = calendarData.length > 0 
    ? calendarData.filter(day => day.completionRate < 100 && day.habits.length > 0).map(day => day.date.getDate())
    : [] // Suppression du mock data pour éviter la confusion

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1).getDay()
  const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Convertir dimanche=0 en lundi=0

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  // Simulation : aujourd'hui = dernier jour du mois affiché
  const today = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), daysInMonth)
  const isCurrentMonth = displayMonth.getMonth() === today.getMonth() && 
                         displayMonth.getFullYear() === today.getFullYear()

  const previousMonth = () => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1)
    setDisplayMonth(newDate)
    onMonthChange?.(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1)
    setDisplayMonth(newDate)
    onMonthChange?.(newDate)
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
    onDateClick?.(clickedDate)
  }

  return (
    <section className="bg-card border border-border rounded-lg p-4" style={{filter: 'drop-shadow(0 0 2px #3B82F6) drop-shadow(0 0 10px #1E40AF)'}}  aria-label="Calendrier des habitudes">
      
      <header className="flex items-center justify-between mb-4">
        <button 
          onClick={previousMonth}
          className="p-1 hover:bg-muted rounded transition-all"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold">
          {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-1 hover:bg-muted rounded transition-all"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </header>

      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium">
            <abbr title={["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][i]}>
              {day}
            </abbr>
          </div>
        ))}
      </div>

      
      <main>
        <div className="grid grid-cols-7 gap-2" role="grid" aria-label={`Calendrier pour ${monthNames[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`}>
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} aria-hidden="true" />
          ))}

          
          {daysArray.map((day) => {
            const isFullyCompleted = fullyCompletedDays.includes(day)
            const hasIncompleteHabits = incompleteHabitDays.includes(day)
            const dayDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const isToday = dayDate.getTime() === todayDate.getTime()
            const isPastDay = dayDate < todayDate && !isToday
            const isFutureDay = dayDate > todayDate
            const isIncompleteAndPast = isPastDay && hasIncompleteHabits
            const isSelected = selectedDate && dayDate.getDate() === selectedDate.getDate() && dayDate.getMonth() === selectedDate.getMonth() && dayDate.getFullYear() === selectedDate.getFullYear()
            const formattedDate = dayDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            const dayData = calendarData.find(d => 
              d.date.getDate() === day && 
              d.date.getMonth() === displayMonth.getMonth() &&
              d.date.getFullYear() === displayMonth.getFullYear()
            )
            const futureWithHabits = isFutureDay && dayData && dayData.habits.length > 0;

            // Boss day: dernier jour du mois
            const isBossDay = day === daysInMonth;
            // Boss day aujourd'hui ?
            const isBossDayToday = isBossDay && isToday;

            return (
              <button
                key={day}
                onClick={() => {
                  if (isBossDayToday) {
                    setIsBossFightModalOpen(true);
                  } else {
                    handleDayClick(day);
                  }
                }}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105 relative ${
                  isSelected
                    ? "bg-yellow-300/30 text-yellow-500 border border-yellow-400 shadow-[0_0_8px_2px_rgba(255,215,0,0.3)]"
                    : isFullyCompleted
                      ? "bg-primary/20 text-primary border border-primary"
                      : isIncompleteAndPast
                        ? "bg-red-500/20 text-red-400 border border-red-500/50"
                        : isToday
                          ? "bg-accent/20 text-accent border border-accent"
                          : isBossDay
                            ? "bg-orange-400/10 text-orange-600 border border-orange-400"
                            : futureWithHabits
                              ? "border border-primary"
                            : "hover:bg-muted border border-transparent"
                }`}
                role="gridcell"
                aria-label={`${formattedDate}${dayData ? ` - ${dayData.totalXpEarned} XP, ${Math.round(dayData.completionRate)}% complété` : ''}${isBossDayToday ? ' - Combat de boss disponible' : isBossDay ? ' - Combat de boss (à venir)' : ''}`}
                title={isBossDayToday ? 'Combat de boss disponible !' : isBossDay ? 'Combat de boss (dernier jour du mois)' : (dayData ? `${dayData.totalXpEarned} XP - ${Math.round(dayData.completionRate)}% complété` : undefined)}
              >
                {day}
                {isBossDayToday && (
                  <span className="absolute top-0 left-0 w-3 h-3 bg-orange-500 rounded-full animate-pulse" aria-hidden="true" />
                )}
                {isBossDay && !isToday && (
                  <span className="absolute top-0 left-0 w-2 h-2 bg-orange-400/50 rounded-full" aria-hidden="true" />
                )}
                {dayData && dayData.totalXpEarned > 0 && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-accent rounded-full" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </main>

      {/* Legend */}
      <footer className="flex items-center gap-4 mt-4 text-xs" role="group" aria-label="Légende du calendrier">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary" aria-hidden="true" />
          <span className="text-muted-foreground">Toutes les habitudes complétées</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50" aria-hidden="true" />
          <span className="text-muted-foreground">Jour passé non complété</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-400/30 border-2 border-orange-500" aria-hidden="true" />
          <span className="text-muted-foreground">Combat de boss (dernier jour du mois)</span>
        </div>
      </footer>

      <BossFightModal
        isOpen={isBossFightModalOpen}
        onClose={() => setIsBossFightModalOpen(false)}
        playerLevel={playerLevel}
        playerXp={playerXp}
        onVictory={fetchUserData}
      />
    </section>
  )
}