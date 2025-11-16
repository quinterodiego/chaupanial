'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Home, Ruler, Moon, Apple, Star, Baby, Droplet, Clock, TrendingUp, Plus, ArrowRight, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Activity {
  id: string
  timestamp: string
  type: 'esfinteres'
  details: any
}

export default function InicioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      }
    } catch (error) {
      console.error('Error cargando actividades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
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
    esfinteres: todayActivities.length,
    pis: todayActivities.filter(a => a.details?.type === 'pipi' || a.details?.type === 'húmedo').length,
    caca: todayActivities.filter(a => a.details?.type === 'caca' || a.details?.type === 'sucio').length,
    seco: todayActivities.filter(a => a.details?.type === 'seco').length,
  }

  // Últimos registros (máximo 5)
  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  // Secciones de navegación
  const sections = [
    {
      name: 'Crecimiento',
      href: '/dashboard/crecimiento',
      icon: Ruler,
      iconColor: 'text-blue-500',
      description: 'Peso, altura y perímetro cefálico',
    },
    {
      name: 'Sueño',
      href: '/dashboard/sueno',
      icon: Moon,
      iconColor: 'text-indigo-500',
      description: 'Siestas y horas nocturnas',
    },
    {
      name: 'Alimentación',
      href: '/dashboard/alimentacion',
      icon: Apple,
      iconColor: 'text-green-500',
      description: 'Comidas y tomas',
    },
    {
      name: 'Hitos',
      href: '/dashboard/hitos',
      icon: Star,
      iconColor: 'text-purple-500',
      description: 'Logros y recuerdos',
    },
    {
      name: 'Chau Pañal',
      href: '/dashboard/esfinteres',
      icon: Baby,
      iconColor: 'text-pink-500',
      description: 'Control de esfínteres',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          Inicio
        </h1>
        <p className="text-gray-600">
          Resumen del día • {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats del día - Esfínteres */}
      {todayStats.esfinteres > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] rounded-2xl p-6 shadow-lg mb-8 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Baby className="text-white" size={32} />
              <div>
                <h2 className="text-xl font-bold">Control de Esfínteres</h2>
                <p className="text-white/80 text-sm">Resumen de hoy</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard/esfinteres')}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Ver todo
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{todayStats.pis}</p>
              <p className="text-xs text-white/80">Pis</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{todayStats.caca}</p>
              <p className="text-xs text-white/80">Caca</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{todayStats.seco}</p>
              <p className="text-xs text-white/80">Seco</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Accesos Rápidos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Button
                  onClick={() => router.push(section.href)}
                  className="w-full h-24 bg-white hover:bg-gray-50 text-gray-800 shadow-lg border border-gray-200 flex flex-col items-center justify-center gap-2"
                  variant="outline"
                >
                  <Icon className={section.iconColor} size={28} />
                  <div className="text-center">
                    <p className="font-semibold text-sm">{section.name}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Últimos Registros */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Últimos Registros</h2>
          <Button
            onClick={() => router.push('/dashboard/esfinteres')}
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            Ver todos
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
        {recentActivities.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <Droplet className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 mb-4">Aún no hay registros</p>
            <Button
              onClick={() => router.push('/dashboard/esfinteres/registro')}
              className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
            >
              <Plus className="mr-2" size={18} />
              Crear Primer Registro
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const type = activity.details?.type || 'seco'
              const isPipi = type === 'pipi' || type === 'húmedo'
              const isCaca = type === 'caca' || type === 'sucio'
              const isSeco = type === 'seco'
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push('/dashboard/esfinteres')}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isPipi ? 'bg-blue-100 text-blue-600' :
                      isCaca ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <Droplet size={24} />
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
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Clock className="text-gray-400" size={18} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Premium Banner (si no es premium) */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Crown className="text-white" size={32} />
              <div>
                <h3 className="text-xl font-bold mb-1">Actualiza a Premium</h3>
                <p className="text-white/90 text-sm">Registros ilimitados y funcionalidades exclusivas</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/premium')}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Ver planes
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
