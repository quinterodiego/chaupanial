'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Apple, Plus, Search } from 'lucide-react'
import { Button } from '../../components/ui/button'

export default function AlimentacionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mealRecords, setMealRecords] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Alimentación</h1>
          <p className="text-gray-600">Registra comidas y tomas con notas</p>
        </div>
        <Button
          onClick={() => {
            // TODO: Implementar modal de registro
            alert('Funcionalidad próximamente disponible')
          }}
          className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
        >
          <Plus className="mr-2" size={18} />
          Nuevo Registro
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar registros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
          />
        </div>
      </div>

      {mealRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <Apple size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aún no hay registros
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza registrando las comidas y tomas de tu hijo
          </p>
          <Button
            onClick={() => {
              // TODO: Implementar modal de registro
              alert('Funcionalidad próximamente disponible')
            }}
            className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
          >
            <Plus className="mr-2" size={18} />
            Registrar Alimentación
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TODO: Implementar lista de registros con filtros */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-gray-500">Registros próximamente disponibles</p>
          </div>
        </div>
      )}
    </div>
  )
}

