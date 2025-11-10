'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Droplet, Filter } from 'lucide-react'
import { Button } from './ui/button'

interface Activity {
  id: string
  timestamp: string
  type: 'esfinteres'
  details: any
}

interface CalendarViewProps {
  activities: Activity[]
  onDayClick?: (date: Date, dayActivities: Activity[]) => void
}

type FilterType = 'all' | 'pis' | 'caca' | 'pipi-caca' | 'seco'

export function CalendarView({ activities, onDayClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Obtener el primer día del mes y el número de días
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Domingo, 1 = Lunes, etc.

  // Ajustar para que la semana empiece en lunes (0 = Lunes)
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

  // Filtrar actividades según el filtro seleccionado
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities

    return activities.filter(activity => {
      const type = activity.details?.type || 'seco'
      if (filter === 'pis') return type === 'pipi' || type === 'húmedo'
      if (filter === 'caca') return type === 'caca' || type === 'sucio'
      if (filter === 'pipi-caca') return type === 'pipi-caca'
      if (filter === 'seco') return type === 'seco'
      return true
    })
  }, [activities, filter])

  // Agrupar actividades por día
  const activitiesByDay = useMemo(() => {
    const grouped: Record<string, Activity[]> = {}

    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(activity)
    })

    return grouped
  }, [filteredActivities])

  // Obtener actividades de un día específico
  const getDayActivities = (day: number): Activity[] => {
    const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return activitiesByDay[dateKey] || []
  }

  // Obtener tipos de registros de un día
  const getDayTypes = (day: number): string[] => {
    const dayActivities = getDayActivities(day)
    const types = new Set<string>()
    
    dayActivities.forEach(activity => {
      const type = activity.details?.type || 'seco'
      if (type === 'pipi' || type === 'húmedo') types.add('pis')
      else if (type === 'caca' || type === 'sucio') types.add('caca')
      else if (type === 'pipi-caca') types.add('pipi-caca')
      else if (type === 'seco') types.add('seco')
    })
    
    return Array.from(types)
  }

  // Manejar click en un día
  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dayActivities = getDayActivities(day)
    
    setSelectedDate(date)
    
    if (onDayClick) {
      onDayClick(date, dayActivities)
    }
  }

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  // Ir al mes actual
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date())
    setSelectedDate(null)
  }

  // Verificar si un día es hoy
  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  // Verificar si un día está seleccionado
  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  // Nombres de los días de la semana
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header del Calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <Button
            onClick={goToCurrentMonth}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Hoy
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            onClick={goToNextMonth}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span className="font-medium">Filtrar:</span>
        </div>
        {(['all', 'pis', 'caca', 'pipi-caca', 'seco'] as FilterType[]).map((filterType) => (
          <Button
            key={filterType}
            onClick={() => setFilter(filterType)}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            className={`text-xs ${
              filter === filterType
                ? 'bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] text-white border-0'
                : ''
            }`}
          >
            {filterType === 'all' && 'Todos'}
            {filterType === 'pis' && 'Pis'}
            {filterType === 'caca' && 'Caca'}
            {filterType === 'pipi-caca' && 'Pis y Caca'}
            {filterType === 'seco' && 'Seco'}
          </Button>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {/* Días de la semana */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Días vacíos al inicio */}
        {Array.from({ length: adjustedStartingDay }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Días del mes */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const dayActivities = getDayActivities(day)
          const dayTypes = getDayTypes(day)
          const hasActivities = dayActivities.length > 0

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all
                ${isToday(day) ? 'border-blue-500 bg-blue-50' : 'border-transparent'}
                ${isSelected(day) ? 'border-purple-500 bg-purple-50' : ''}
                ${hasActivities ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'}
                ${!hasActivities ? 'opacity-50' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span
                  className={`
                    text-sm font-semibold mb-1
                    ${isToday(day) ? 'text-blue-600' : 'text-gray-800'}
                    ${isSelected(day) ? 'text-purple-600' : ''}
                  `}
                >
                  {day}
                </span>
                
                {/* Puntos de colores por tipo de registro */}
                {hasActivities && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {dayTypes.includes('pis') && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" title="Pis" />
                    )}
                    {dayTypes.includes('caca') && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" title="Caca" />
                    )}
                    {dayTypes.includes('pipi-caca') && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" title="Pis y Caca" />
                    )}
                    {dayTypes.includes('seco') && (
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Seco" />
                    )}
                    {dayActivities.length > 1 && (
                      <span className="text-xs text-gray-500 font-medium">
                        {dayActivities.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Leyenda:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Pis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-600">Caca</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-gray-600">Pis y Caca</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Seco</span>
          </div>
        </div>
      </div>
    </div>
  )
}

