"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CalendarDay } from "@/lib/types"

interface CalendarProps {
  calendarData?: CalendarDay[]
  currentMonth?: Date
  onDateClick?: (date: Date) => void
  onMonthChange?: (date: Date) => void
}

export default function Calendar({ 
  calendarData = [], 
  currentMonth = new Date(),
  onDateClick,
  onMonthChange 
}: CalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(currentMonth)

  // Mock data si pas de données réelles
  const completedDays = calendarData.length > 0 
    ? calendarData.filter(day => day.completionRate > 0).map(day => day.date.getDate())
    : [1, 2, 3, 5, 7, 8, 10, 12, 14, 15]

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1).getDay()
  const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Convertir dimanche=0 en lundi=0

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const today = new Date()
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
    <div className="bg-card border border-border rounded-lg p-4 hologram-bg">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={previousMonth}
          className="p-1 hover:bg-muted rounded glow-blue transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-glow">
          {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-1 hover:bg-muted rounded glow-blue transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {daysArray.map((day) => {
          const isCompleted = completedDays.includes(day)
          const isToday = isCurrentMonth && day === today.getDate()
          const dayData = calendarData.find(d => 
            d.date.getDate() === day && 
            d.date.getMonth() === displayMonth.getMonth()
          )

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105 ${
                isCompleted
                  ? "bg-primary/20 text-primary border border-primary glow-blue check-bounce"
                  : isToday
                    ? "bg-accent/20 text-accent border border-accent"
                    : "hover:bg-muted border border-transparent"
              }`}
              title={dayData ? `${dayData.totalXpEarned} XP - ${Math.round(dayData.completionRate)}% complété` : undefined}
            >
              {day}
              {dayData && dayData.totalXpEarned > 0 && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary glow-blue" />
          <span className="text-muted-foreground">Habitudes complétées</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent/20 border border-accent" />
          <span className="text-muted-foreground">Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-muted-foreground">XP gagné</span>
        </div>
      </div>
    </div>
  )
}