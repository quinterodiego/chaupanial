'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { UserPlus, Edit2, Users, Crown, X } from 'lucide-react'

interface FamilyInfo {
  babyName: string
  sharedUsers: string[]
  familyId: string | null
}

interface FamilySettingsProps {
  isPremium: boolean
}

export function FamilySettings({ isPremium }: FamilySettingsProps) {
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [babyName, setBabyName] = useState('')
  const [invitedEmail, setInvitedEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isPremium) {
      loadFamilyInfo()
    } else {
      setIsLoading(false)
    }
  }, [isPremium])

  const loadFamilyInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/family')
      if (response.ok) {
        const data = await response.json()
        console.log('Información de familia cargada:', data) // Debug
        setFamilyInfo(data)
        const name = data.babyName || 'Bebé'
        setBabyName(name)
        console.log('Nombre del niño establecido:', name) // Debug
      } else {
        const errorData = await response.json()
        console.error('Error en respuesta:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error cargando información de familia:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateBabyName = async () => {
    if (!babyName.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }

    try {
      setError(null)
      const response = await fetch('/api/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateBabyName',
          babyName: babyName.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar nombre')
      }

      setSuccess('Nombre actualizado correctamente')
      setIsEditingName(false)
      loadFamilyInfo()
      
      // Recargar la página después de 1 segundo para actualizar todos los registros
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar nombre')
    }
  }

  const handleInviteUser = async () => {
    if (!invitedEmail.trim()) {
      setError('El email no puede estar vacío')
      return
    }

    if (!invitedEmail.includes('@')) {
      setError('Email inválido')
      return
    }

    try {
      setIsInviting(true)
      setError(null)
      const response = await fetch('/api/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'inviteUser',
          invitedEmail: invitedEmail.trim().toLowerCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al invitar usuario')
      }

      setSuccess('Usuario invitado correctamente')
      setInvitedEmail('')
      loadFamilyInfo()
    } catch (err: any) {
      setError(err.message || 'Error al invitar usuario')
    } finally {
      setIsInviting(false)
    }
  }

  if (!isPremium) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-purple-500" size={20} />
          <h2 className="text-xl font-bold text-gray-800">Gestión de Familia</h2>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start gap-3">
            <Crown className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="font-semibold text-gray-800 mb-2">Funcionalidad Premium</p>
              <p className="text-sm text-gray-600 mb-3">
                Con Premium puedes compartir los registros con tu pareja y personalizar el nombre de tu hijo/a.
              </p>
              <Button
                onClick={() => window.location.href = '/premium'}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
              >
                <Crown className="mr-2" size={16} />
                Actualizar a Premium
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-purple-500" size={20} />
        <h2 className="text-xl font-bold text-gray-800">Gestión de Familia</h2>
        <Crown className="text-yellow-500 ml-auto" size={16} />
      </div>

      {/* Nombre del Niño */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Nombre del Niño/a</label>
          {!isEditingName && (
            <Button
              onClick={() => setIsEditingName(true)}
              variant="ghost"
              size="sm"
            >
              <Edit2 className="mr-2" size={14} />
              Editar
            </Button>
          )}
        </div>
        
        {isEditingName ? (
          <div className="space-y-3">
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Nombre del niño/a"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={50}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateBabyName}
                className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white"
              >
                Guardar
              </Button>
              <Button
                onClick={() => {
                  setIsEditingName(false)
                  setBabyName(familyInfo?.babyName || 'Bebé')
                  setError(null)
                }}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-lg font-semibold text-gray-800">
            {familyInfo?.babyName || 'Bebé'}
          </p>
        )}
      </div>

      {/* Invitar Usuario */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Invitar a tu Pareja
        </label>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <strong>📧 Importante:</strong> Tu pareja debe estar registrada en Chau Pañal con el mismo email que ingreses.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Si aún no se registró, debe hacerlo primero desde la página principal con su cuenta de Google.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={invitedEmail}
            onChange={(e) => setInvitedEmail(e.target.value)}
            placeholder="Email de tu pareja (ej: papa@gmail.com)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Button
            onClick={handleInviteUser}
            disabled={isInviting || !invitedEmail.trim()}
            className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white"
          >
            <UserPlus className="mr-2" size={16} />
            {isInviting ? 'Enviando...' : 'Invitar'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Una vez invitado, tu pareja verá automáticamente los registros compartidos la próxima vez que inicie sesión.
        </p>
      </div>

      {/* Usuarios Compartidos */}
      {familyInfo && familyInfo.sharedUsers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Miembros de la Familia
          </label>
          <div className="space-y-2">
            {familyInfo.sharedUsers.map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Users className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-700">{email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensajes de Error/Success */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </div>
  )
}

