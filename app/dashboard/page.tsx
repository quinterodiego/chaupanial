'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '../components/Header'
import { Button } from '../components/ui/button'
import { Plus, Baby, Calendar, TrendingUp, Crown, AlertCircle, Droplet, X, Eye, Search, Zap, Trophy, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CalendarView } from '../components/CalendarView'
import { ChartsView } from '../components/ChartsView'
import { FamilySettings } from '../components/FamilySettings'

interface Activity {
  id: string
  timestamp: string
  type: 'esfinteres'
  details: any
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedDayActivities, setSelectedDayActivities] = useState<Activity[]>([])
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      setIsPremium(session.user.isPremium || false)
      loadActivities()
    }
  }, [status, session, router])

  // Recargar actividades cuando la página se enfoca (por si se creó un registro en otra pestaña)
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated' && session?.user) {
        loadActivities()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [status, session])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        console.log('Actividades cargadas:', data.activities?.length || 0, data.activities)
        setActivities(data.activities || [])
        setMonthlyCount(data.monthlyCount || 0)
      } else {
        console.error('Error en respuesta:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error data:', errorData)
      }
    } catch (error) {
      console.error('Error cargando actividades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Límites de versión gratuita
  const FREE_LIMIT_MONTHLY = 50
  const FREE_LIMIT_DAYS = 30
  const isNearLimit = !isPremium && monthlyCount >= FREE_LIMIT_MONTHLY * 0.8
  const isAtLimit = !isPremium && monthlyCount >= FREE_LIMIT_MONTHLY

  // Función para registro rápido
  const handleQuickAdd = async (type: 'pipi' | 'caca' | 'seco') => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'esfinteres',
          details: { type },
          babyName: 'Bebé',
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          alert('Has alcanzado el límite de registros gratuitos. Actualiza a Premium para continuar.')
          router.push('/premium')
          return
        }
        throw new Error(data.error || 'Error al guardar')
      }

      // Recargar actividades
      loadActivities()
    } catch (err: any) {
      alert(err.message || 'Error al guardar')
    }
  }

  // Filtrar actividades de últimos 30 días (versión gratuita)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - FREE_LIMIT_DAYS * 24 * 60 * 60 * 1000)
  let visibleActivities = isPremium 
    ? activities 
    : activities.filter(act => new Date(act.timestamp) >= thirtyDaysAgo)

  // Aplicar filtros rápidos
  if (quickFilter === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    visibleActivities = visibleActivities.filter(act => {
      const actDate = new Date(act.timestamp)
      return actDate >= today && actDate < tomorrow
    })
  } else if (quickFilter === 'yesterday') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const today = new Date(yesterday)
    today.setDate(today.getDate() + 1)
    visibleActivities = visibleActivities.filter(act => {
      const actDate = new Date(act.timestamp)
      return actDate >= yesterday && actDate < today
    })
  } else if (quickFilter === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    visibleActivities = visibleActivities.filter(act => new Date(act.timestamp) >= weekAgo)
  }

  // Aplicar búsqueda
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    visibleActivities = visibleActivities.filter(act => {
      const dateStr = new Date(act.timestamp).toLocaleDateString('es').toLowerCase()
      const notes = act.details?.notes?.toLowerCase() || ''
      const type = act.details?.type || ''
      return dateStr.includes(query) || notes.includes(query) || type.includes(query)
    })
  }

  // Calcular estadísticas del día
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const todayActivities = activities.filter(act => {
    const actDate = new Date(act.timestamp)
    return actDate >= today && actDate < tomorrow
  })
  const todayStats = {
    pis: todayActivities.filter(a => a.details?.type === 'pipi' || a.details?.type === 'húmedo').length,
    caca: todayActivities.filter(a => a.details?.type === 'caca' || a.details?.type === 'sucio').length,
    pipiCaca: todayActivities.filter(a => a.details?.type === 'pipi-caca').length,
    seco: todayActivities.filter(a => a.details?.type === 'seco').length,
    total: todayActivities.length,
  }

  // Calcular racha (días consecutivos con registros)
  const calculateStreak = () => {
    const dates = new Set(activities.map(a => {
      const d = new Date(a.timestamp)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }))
    const sortedDates = Array.from(dates).sort().reverse()
    
    let streak = 0
    const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
    
    if (sortedDates.includes(todayStr)) {
      streak = 1
      for (let i = 1; i < sortedDates.length; i++) {
        const checkDate = new Date(now)
        checkDate.setDate(checkDate.getDate() - i)
        const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
        if (sortedDates.includes(checkStr)) {
          streak++
        } else {
          break
        }
      }
    }
    
    return streak
  }
  const streak = calculateStreak()

  // Tips diarios (rotativos)
  const tips = [
    "Sé paciente, cada niño tiene su ritmo en el control de esfínteres",
    "Celebra los pequeños logros, cada paso cuenta",
    "Mantén una rutina constante para ayudar a tu hijo",
    "No te desanimes si hay retrocesos, es parte del proceso",
    "Observa las señales de tu hijo para anticipar sus necesidades",
    "El control de esfínteres es un proceso gradual, no una carrera",
    "Crea un ambiente positivo y sin presión",
    "Recuerda que cada niño es único y tiene su propio tiempo",
  ]
  const todayTipIndex = new Date().getDate() % tips.length
  const todayTip = tips[todayTipIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Banner de límite alcanzado */}
        {isAtLimit && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <div className="flex-1">
                <p className="font-semibold">Has alcanzado el límite de registros gratuitos</p>
                <p className="text-sm">Actualiza a Premium para registros ilimitados y historial completo</p>
              </div>
              <Button onClick={() => router.push('/premium')} className="ml-4">
                <Crown className="mr-2" size={16} />
                Upgrade a Premium
              </Button>
            </div>
          </div>
        )}

        {/* Banner de cerca del límite */}
        {isNearLimit && !isAtLimit && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <div className="flex-1">
                <p className="font-semibold">Estás cerca del límite</p>
                <p className="text-sm">
                  Has usado {monthlyCount} de {FREE_LIMIT_MONTHLY} registros este mes
                </p>
              </div>
              <Button onClick={() => router.push('/premium')} variant="outline" className="ml-4">
                Ver Premium
              </Button>
            </div>
          </div>
        )}

        {/* Gestión de Familia (Premium) */}
        {isPremium && (
          <div className="mb-8">
            <FamilySettings isPremium={isPremium} />
          </div>
        )}

        {/* Header del Dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Control de Esfínteres
            </h1>
            <p className="text-gray-600">
              {isPremium ? (
                <span className="flex items-center">
                  <Crown className="mr-2 text-yellow-500" size={16} />
                  Cuenta Premium
                </span>
              ) : (
                <span>Versión Gratuita • {monthlyCount}/{FREE_LIMIT_MONTHLY} registros este mes</span>
              )}
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/registro')}
            disabled={isAtLimit}
            size="lg"
          >
            <Plus className="mr-2" size={20} />
            Registrar Esfínteres
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Droplet className="text-blue-500" size={24} />
              <span className="text-2xl font-bold text-gray-800">
                {visibleActivities.filter(a => a.details?.type === 'pipi' || a.details?.type === 'húmedo').length}
              </span>
            </div>
            <p className="text-gray-600">Registros de pis</p>
            {!isPremium && (
              <p className="text-xs text-gray-400 mt-2">Últimos {FREE_LIMIT_DAYS} días</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-purple-500" size={24} />
              <span className="text-2xl font-bold text-gray-800">
                {visibleActivities.filter(a => a.details?.type === 'caca' || a.details?.type === 'sucio').length}
              </span>
            </div>
            <p className="text-gray-600">Registros de caca</p>
            {!isPremium && (
              <p className="text-xs text-gray-400 mt-2">Últimos {FREE_LIMIT_DAYS} días</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-green-500" size={24} />
              <span className="text-2xl font-bold text-gray-800">
                {visibleActivities.length}
              </span>
            </div>
            <p className="text-gray-600">Total registros</p>
            {!isPremium && (
              <p className="text-xs text-gray-400 mt-2">Últimos {FREE_LIMIT_DAYS} días</p>
            )}
          </div>
        </div>

        {/* Registro Rápido (Quick Add) */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-yellow-500" size={20} />
            <h2 className="text-xl font-bold text-gray-800">Registro Rápido</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => handleQuickAdd('pipi')}
              disabled={isAtLimit}
              className="h-24 bg-blue-100 hover:bg-blue-200 text-blue-700 border-2 border-blue-300"
            >
              <Droplet className="mr-2" size={24} />
              <div className="text-left">
                <p className="font-bold text-lg">Pis</p>
                <p className="text-xs">Registro rápido</p>
              </div>
            </Button>
            <Button
              onClick={() => handleQuickAdd('caca')}
              disabled={isAtLimit}
              className="h-24 bg-purple-100 hover:bg-purple-200 text-purple-700 border-2 border-purple-300"
            >
              <Droplet className="mr-2" size={24} />
              <div className="text-left">
                <p className="font-bold text-lg">Caca</p>
                <p className="text-xs">Registro rápido</p>
              </div>
            </Button>
            <Button
              onClick={() => handleQuickAdd('seco')}
              disabled={isAtLimit}
              className="h-24 bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-300"
            >
              <Droplet className="mr-2" size={24} />
              <div className="text-left">
                <p className="font-bold text-lg">Seco</p>
                <p className="text-xs">Registro rápido</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Resumen del Día */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de Hoy</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{todayStats.pis}</p>
              <p className="text-sm text-gray-600">Pis</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{todayStats.caca}</p>
              <p className="text-sm text-gray-600">Caca</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{todayStats.pipiCaca}</p>
              <p className="text-sm text-gray-600">Pis y Caca</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{todayStats.seco}</p>
              <p className="text-sm text-gray-600">Seco</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">{todayStats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>

        {/* Tips Diarios */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg mb-8 border border-yellow-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Tip del Día</h3>
              <p className="text-gray-700">{todayTip}</p>
            </div>
          </div>
        </div>

        {/* Logros y Racha */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-500" size={20} />
            <h2 className="text-xl font-bold text-gray-800">Logros</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {streak > 0 && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg px-4 py-2">
                <p className="font-bold text-yellow-800">🔥 Racha: {streak} día{streak > 1 ? 's' : ''}</p>
              </div>
            )}
            {todayStats.total >= 3 && (
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg px-4 py-2">
                <p className="font-bold text-blue-800">✅ Meta diaria alcanzada</p>
              </div>
            )}
            {visibleActivities.length >= 10 && (
              <div className="bg-green-100 border-2 border-green-300 rounded-lg px-4 py-2">
                <p className="font-bold text-green-800">🎯 10+ registros</p>
              </div>
            )}
            {visibleActivities.length >= 50 && (
              <div className="bg-purple-100 border-2 border-purple-300 rounded-lg px-4 py-2">
                <p className="font-bold text-purple-800">🏆 50+ registros</p>
              </div>
            )}
            {streak === 0 && todayStats.total === 0 && (
              <p className="text-gray-500">Crea tu primer registro para comenzar a ganar logros</p>
            )}
          </div>
        </div>

        {/* Búsqueda Rápida */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-gray-600" size={20} />
            <h2 className="text-xl font-bold text-gray-800">Búsqueda Rápida</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por fecha, notas o tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setQuickFilter('all')}
                variant={quickFilter === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                Todos
              </Button>
              <Button
                onClick={() => setQuickFilter('today')}
                variant={quickFilter === 'today' ? 'default' : 'outline'}
                size="sm"
              >
                Hoy
              </Button>
              <Button
                onClick={() => setQuickFilter('yesterday')}
                variant={quickFilter === 'yesterday' ? 'default' : 'outline'}
                size="sm"
              >
                Ayer
              </Button>
              <Button
                onClick={() => setQuickFilter('week')}
                variant={quickFilter === 'week' ? 'default' : 'outline'}
                size="sm"
              >
                Esta Semana
              </Button>
            </div>
          </div>
        </div>

        {/* Calendario Visual - Oculto en botón */}
        <div className="mb-8">
          <Button
            onClick={() => setShowCalendar(!showCalendar)}
            variant="outline"
            className="w-full mb-4"
          >
            <Calendar className="mr-2" size={20} />
            {showCalendar ? 'Ocultar Calendario' : 'Mostrar Calendario'}
            {showCalendar ? <ChevronUp className="ml-2" size={20} /> : <ChevronDown className="ml-2" size={20} />}
          </Button>
          {showCalendar && (
            <CalendarView
              activities={visibleActivities}
              onDayClick={(date, dayActivities) => {
                setSelectedDayDate(date)
                setSelectedDayActivities(dayActivities)
              }}
            />
          )}
        </div>

        {/* Registros del día seleccionado */}
        {selectedDayDate && selectedDayActivities.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Registros del {selectedDayDate.toLocaleDateString('es', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h2>
              <Button
                onClick={() => {
                  setSelectedDayDate(null)
                  setSelectedDayActivities([])
                }}
                variant="ghost"
                size="sm"
              >
                <X size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {selectedDayActivities.map((activity) => {
                const type = activity.details?.type || 'seco'
                const isPipi = type === 'pipi' || type === 'húmedo'
                const isCaca = type === 'caca' || type === 'sucio'
                const isSeco = type === 'seco'
                
                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isPipi ? 'bg-blue-100 text-blue-600' :
                        isCaca ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Droplet size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {isPipi && 'Pis'}
                          {isCaca && 'Caca'}
                          {isSeco && 'Seco'}
                          {type === 'pipi-caca' && 'Pis y Caca'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.timestamp).toLocaleTimeString('es', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activity.details?.notes && (
                        <p className="text-sm text-gray-600 max-w-xs truncate hidden md:block">
                          {activity.details.notes}
                        </p>
                      )}
                      <Eye className="text-gray-400 hover:text-gray-600 transition-colors" size={18} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actividades Recientes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Registros Recientes</h2>
          
          {visibleActivities.length === 0 ? (
            <div className="text-center py-12">
              <Droplet className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-600 mb-4">No hay registros de esfínteres aún</p>
              <Button onClick={() => router.push('/dashboard/registro')}>
                <Plus className="mr-2" size={16} />
                Registrar Primer Esfínter
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleActivities.slice(0, 10).map((activity) => {
                const type = activity.details?.type || 'seco'
                const isPipi = type === 'pipi' || type === 'húmedo'
                const isCaca = type === 'caca' || type === 'sucio'
                const isSeco = type === 'seco'
                
                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isPipi ? 'bg-blue-100 text-blue-600' :
                        isCaca ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Droplet size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {isPipi && 'Pis'}
                          {isCaca && 'Caca'}
                          {isSeco && 'Seco'}
                          {type === 'pipi-caca' && 'Pis y Caca'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.timestamp).toLocaleString('es', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activity.details?.notes && (
                        <p className="text-sm text-gray-600 max-w-xs truncate hidden md:block">
                          {activity.details.notes}
                        </p>
                      )}
                      <Eye className="text-gray-400 hover:text-gray-600 transition-colors" size={18} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!isPremium && visibleActivities.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Versión Gratuita:</strong> Solo se muestran registros de los últimos {FREE_LIMIT_DAYS} días.
                <Button 
                  onClick={() => router.push('/premium')}
                  variant="link"
                  className="ml-2 text-blue-600 underline"
                >
                  Actualiza a Premium para ver todo el historial
                </Button>
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Button
            onClick={() => router.push('/dashboard/registro')}
            className="h-24 bg-white hover:bg-gray-50 text-gray-800 shadow-lg"
            variant="outline"
          >
            <Droplet className="mr-3" size={24} />
            <div className="text-left">
              <p className="font-semibold">Nuevo Registro</p>
              <p className="text-sm text-gray-600">Registrar esfínteres</p>
            </div>
          </Button>

          {!isPremium && (
            <Button
              onClick={() => router.push('/premium')}
              className="h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white shadow-lg"
            >
              <Crown className="mr-3" size={24} />
              <div className="text-left">
                <p className="font-semibold">Actualizar a Premium</p>
                <p className="text-sm">$28.999 ARS - Pago único</p>
              </div>
            </Button>
          )}
        </div>
      </main>

      {/* Modal de Detalles */}
      {selectedActivity && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedActivity(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Detalles del Registro</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  (selectedActivity.details?.type === 'pipi' || selectedActivity.details?.type === 'húmedo') ? 'bg-blue-100 text-blue-600' :
                  (selectedActivity.details?.type === 'caca' || selectedActivity.details?.type === 'sucio') ? 'bg-purple-100 text-purple-600' :
                  selectedActivity.details?.type === 'pipi-caca' ? 'bg-indigo-100 text-indigo-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <Droplet size={32} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedActivity.details?.type === 'pipi' && 'Pis'}
                    {selectedActivity.details?.type === 'caca' && 'Caca'}
                    {selectedActivity.details?.type === 'pipi-caca' && 'Pis y Caca'}
                    {selectedActivity.details?.type === 'seco' && 'Seco'}
                    {!selectedActivity.details?.type && 'Registro de Esfínteres'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedActivity.timestamp).toLocaleString('es', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {selectedActivity.details?.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Notas:</p>
                  <p className="text-gray-600">{selectedActivity.details.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Fecha</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedActivity.timestamp).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Hora</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedActivity.timestamp).toLocaleTimeString('es', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setSelectedActivity(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

