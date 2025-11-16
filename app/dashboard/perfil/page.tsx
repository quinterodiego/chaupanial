'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, User, Calendar, Camera, Save, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [childProfile, setChildProfile] = useState({
    name: '',
    birthDate: '',
    photo: null as string | null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      loadProfile()
    }
  }, [status, session, router])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/child-profile')
      if (response.ok) {
        const data = await response.json()
        if (data.hasProfile && data.profile) {
          setChildProfile({
            name: data.profile.name || '',
            birthDate: data.profile.birthDate || '',
            photo: null, // Por ahora no hay foto
          })
        }
      }
    } catch (error) {
      console.error('Error cargando perfil:', error)
      setError('Error al cargar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!childProfile.name.trim()) {
      setError('El nombre es requerido')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/child-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: childProfile.name.trim(),
          birthDate: childProfile.birthDate || null,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al guardar el perfil')
      }
    } catch (error) {
      console.error('Error guardando perfil:', error)
      setError('Error al guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Perfil del Niño</h1>
        <p className="text-gray-600">Datos del niño y configuración general</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {childProfile.photo ? (
              <img
                src={childProfile.photo}
                alt="Foto del niño"
                className="w-32 h-32 rounded-full object-cover border-4 border-[#8CCFE0]"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8CCFE0] to-[#E9A5B4] flex items-center justify-center border-4 border-[#8CCFE0]">
                <User size={64} className="text-white" />
              </div>
            )}
            <Button
              size="sm"
              className="absolute bottom-0 right-0 rounded-full bg-[#8CCFE0] hover:bg-[#7CBFD0] text-white"
              onClick={() => {
                // TODO: Implementar selector de foto
                alert('Funcionalidad próximamente disponible')
              }}
            >
              <Camera size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del niño
            </label>
            <input
              type="text"
              value={childProfile.name}
              onChange={(e) => setChildProfile({ ...childProfile, name: e.target.value })}
              placeholder="Ingresa el nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={childProfile.birthDate}
              onChange={(e) => setChildProfile({ ...childProfile, birthDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded">
              <p className="font-semibold">¡Perfil actualizado!</p>
              <p className="text-sm">Los cambios se han guardado correctamente.</p>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !childProfile.name.trim()}
              className="w-full bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

