'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Star, Plus, Camera } from 'lucide-react'
import { Button } from '../../components/ui/button'

export default function HitosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [milestones, setMilestones] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hitos y Recuerdos</h1>
          <p className="text-gray-600">Registra logros, fotos y momentos especiales</p>
        </div>
        <Button
          onClick={() => {
            // TODO: Implementar modal de registro
            alert('Funcionalidad próximamente disponible')
          }}
          className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
        >
          <Plus className="mr-2" size={18} />
          Nuevo Hito
        </Button>
      </div>

      {milestones.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <Star size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aún no hay hitos
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza registrando los logros y momentos especiales de tu hijo
          </p>
          <Button
            onClick={() => {
              // TODO: Implementar modal de registro
              alert('Funcionalidad próximamente disponible')
            }}
            className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
          >
            <Camera className="mr-2" size={18} />
            Registrar Hito
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TODO: Implementar línea de tiempo de hitos */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-gray-500">Línea de tiempo próximamente disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}

