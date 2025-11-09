'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '../components/Header'
import { Button } from '../components/ui/button'
import { Plus, Baby, Calendar, TrendingUp, Crown, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Activity {
  id: string
  timestamp: string
  type: 'feeding' | 'sleep' | 'diaper' | 'milestone'
  details: any
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [isPremium, setIsPremium] = useState(false)

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

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
        setMonthlyCount(data.monthlyCount || 0)
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

  // Filtrar actividades de últimos 30 días (versión gratuita)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - FREE_LIMIT_DAYS * 24 * 60 * 60 * 1000)
  const visibleActivities = isPremium 
    ? activities 
    : activities.filter(act => new Date(act.timestamp) >= thirtyDaysAgo)

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

        {/* Header del Dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard
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
            Nuevo Registro
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Baby className="text-blue-500" size={24} />
              <span className="text-2xl font-bold text-gray-800">
                {visibleActivities.filter(a => a.type === 'feeding').length}
              </span>
            </div>
            <p className="text-gray-600">Comidas registradas</p>
            {!isPremium && (
              <p className="text-xs text-gray-400 mt-2">Últimos {FREE_LIMIT_DAYS} días</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-purple-500" size={24} />
              <span className="text-2xl font-bold text-gray-800">
                {visibleActivities.filter(a => a.type === 'sleep').length}
              </span>
            </div>
            <p className="text-gray-600">Períodos de sueño</p>
            {!isPremium && (
              <p className="text-xs text-gray-400 mt-2">Últimos {FREE_LIMIT_DAYS} días</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-green-500" size={24} />
              <span className="text-2xl font-bold text-gray-800">
                {visibleActivities.filter(a => a.type === 'diaper').length}
              </span>
            </div>
            <p className="text-gray-600">Pañales registrados</p>
            {!isPremium && (
              <p className="text-xs text-gray-400 mt-2">Últimos {FREE_LIMIT_DAYS} días</p>
            )}
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actividades Recientes</h2>
          
          {visibleActivities.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-600 mb-4">No hay actividades registradas aún</p>
              <Button onClick={() => router.push('/dashboard/registro')}>
                <Plus className="mr-2" size={16} />
                Registrar Primera Actividad
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleActivities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activity.type === 'feeding' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'sleep' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'diaper' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'feeding' && <Baby size={20} />}
                      {activity.type === 'sleep' && <TrendingUp size={20} />}
                      {activity.type === 'diaper' && <Calendar size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {activity.type === 'feeding' && 'Comida'}
                        {activity.type === 'sleep' && 'Sueño'}
                        {activity.type === 'diaper' && 'Pañal'}
                        {activity.type === 'milestone' && 'Hito'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.details && (
                      <p className="text-sm text-gray-600">
                        {activity.type === 'feeding' && activity.details.type && `Tipo: ${activity.details.type}`}
                        {activity.type === 'sleep' && activity.details.duration && `Duración: ${activity.details.duration}h`}
                        {activity.type === 'diaper' && activity.details.type && `Tipo: ${activity.details.type}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isPremium && visibleActivities.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Versión Gratuita:</strong> Solo se muestran actividades de los últimos {FREE_LIMIT_DAYS} días.
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
            onClick={() => router.push('/vacunas')}
            className="h-24 bg-white hover:bg-gray-50 text-gray-800 shadow-lg"
            variant="outline"
          >
            <Calendar className="mr-3" size={24} />
            <div className="text-left">
              <p className="font-semibold">Calendario de Vacunas</p>
              <p className="text-sm text-gray-600">Ver vacunas argentinas</p>
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
                <p className="text-sm">$4.999 ARS - Pago único</p>
              </div>
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

