'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Baby, Calendar, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'

interface OnboardingProps {
  onComplete: (data: { name: string; birthDate: string }) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.birthDate) {
      onComplete(formData)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8CCFE0] to-[#E9A5B4] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8CCFE0] to-[#E9A5B4] flex items-center justify-center">
              <Baby size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  ¡Bienvenido a Peque Diario!
            </h1>
            <p className="text-gray-600">
              Para comenzar, necesitamos algunos datos básicos de tu hijo
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setStep(2) }}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del niño
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Mateo"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0] text-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={!formData.name}
              className="w-full bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] text-lg py-6"
            >
              Continuar
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8CCFE0] to-[#E9A5B4] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8CCFE0] to-[#E9A5B4] flex items-center justify-center">
            <Calendar size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Fecha de nacimiento
          </h2>
          <p className="text-gray-600">
            Esto nos ayudará a calcular la edad y mostrar información relevante
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0] text-lg"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Atrás
            </Button>
            <Button
              type="submit"
              disabled={!formData.birthDate}
              className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
            >
              Completar
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

