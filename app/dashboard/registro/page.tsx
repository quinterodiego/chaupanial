'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '../../components/Header'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Baby, Moon, Droplet, Star } from 'lucide-react'
import { useState } from 'react'

type ActivityType = 'feeding' | 'sleep' | 'diaper' | 'milestone'

export default function RegistroPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activityType, setActivityType] = useState<ActivityType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formulario de comida
  const [feedingType, setFeedingType] = useState('leche')
  const [feedingAmount, setFeedingAmount] = useState('')
  const [feedingNotes, setFeedingNotes] = useState('')

  // Formulario de sueño
  const [sleepStart, setSleepStart] = useState('')
  const [sleepDuration, setSleepDuration] = useState('')
  const [sleepNotes, setSleepNotes] = useState('')

  // Formulario de pañal
  const [diaperType, setDiaperType] = useState('húmedo')
  const [diaperNotes, setDiaperNotes] = useState('')

  // Formulario de hito
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [milestoneDescription, setMilestoneDescription] = useState('')

  const handleSubmit = async () => {
    if (!activityType) return

    setIsSubmitting(true)
    setError(null)

    let details: any = {}

    switch (activityType) {
      case 'feeding':
        details = {
          type: feedingType,
          amount: feedingAmount,
          notes: feedingNotes,
        }
        break
      case 'sleep':
        details = {
          start: sleepStart,
          duration: sleepDuration,
          notes: sleepNotes,
        }
        break
      case 'diaper':
        details = {
          type: diaperType,
          notes: diaperNotes,
        }
        break
      case 'milestone':
        details = {
          title: milestoneTitle,
          description: milestoneDescription,
        }
        break
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: activityType,
          details,
          babyName: 'Bebé', // Por ahora fijo, luego permitir múltiples bebés
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          setError('Has alcanzado el límite de registros gratuitos. Actualiza a Premium para continuar.')
          setTimeout(() => {
            router.push('/premium')
          }, 3000)
          return
        }
        throw new Error(data.error || 'Error al guardar')
      }

      // Éxito - redirigir al dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al guardar la actividad')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={16} />
          Volver
        </Button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Registrar Actividad
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Selección de tipo de actividad */}
        {!activityType && (
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setActivityType('feeding')}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <Baby className="text-blue-500 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Comida</h3>
              <p className="text-gray-600 text-sm">Registrar alimentación del bebé</p>
            </button>

            <button
              onClick={() => setActivityType('sleep')}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <Moon className="text-purple-500 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Sueño</h3>
              <p className="text-gray-600 text-sm">Registrar períodos de sueño</p>
            </button>

            <button
              onClick={() => setActivityType('diaper')}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <Droplet className="text-green-500 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Pañal</h3>
              <p className="text-gray-600 text-sm">Registrar cambio de pañal</p>
            </button>

            <button
              onClick={() => setActivityType('milestone')}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <Star className="text-yellow-500 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Hito</h3>
              <p className="text-gray-600 text-sm">Registrar un hito importante</p>
            </button>
          </div>
        )}

        {/* Formulario de Comida */}
        {activityType === 'feeding' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6">Registrar Comida</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de comida
                </label>
                <select
                  value={feedingType}
                  onChange={(e) => setFeedingType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="leche">Leche materna</option>
                  <option value="formula">Fórmula</option>
                  <option value="solido">Sólido</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad (opcional)
                </label>
                <input
                  type="text"
                  value={feedingAmount}
                  onChange={(e) => setFeedingAmount(e.target.value)}
                  placeholder="Ej: 120ml, 1/2 taza"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={feedingNotes}
                  onChange={(e) => setFeedingNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setActivityType(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Sueño */}
        {activityType === 'sleep' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6">Registrar Sueño</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={sleepStart}
                  onChange={(e) => setSleepStart(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  placeholder="Ej: 2.5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setActivityType(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Pañal */}
        {activityType === 'diaper' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6">Registrar Pañal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={diaperType}
                  onChange={(e) => setDiaperType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="húmedo">Húmedo</option>
                  <option value="seco">Seco</option>
                  <option value="sucio">Sucio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={diaperNotes}
                  onChange={(e) => setDiaperNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setActivityType(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Hito */}
        {activityType === 'milestone' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6">Registrar Hito</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Ej: Primera sonrisa, Primer diente"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                  placeholder="Cuéntanos más sobre este hito..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setActivityType(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !milestoneTitle}
                  className="flex-1"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

