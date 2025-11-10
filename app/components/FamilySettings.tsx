'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { UserPlus, Edit2, Users, Crown, X, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FamilyMember {
  email: string
  name: string
  role: string
  isOwner: boolean
}

interface FamilyInfo {
  babyName: string
  sharedUsers: FamilyMember[]
  familyId: string | null
  userRole: string
  userName: string
  isOwner: boolean
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
  const [invitedRole, setInvitedRole] = useState('padre')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingRole, setEditingRole] = useState<{ email: string; role: string } | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  
  const roles = [
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'niñera', label: 'Niñera' },
    { value: 'abuela', label: 'Abuela' },
    { value: 'abuelo', label: 'Abuelo' },
    { value: 'tía', label: 'Tía' },
    { value: 'tío', label: 'Tío' },
    { value: 'otro', label: 'Otro' },
  ]

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
        // Verificar si el usuario actual es el owner
        setIsOwner(data.isOwner || false)
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
          role: invitedRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al invitar usuario')
      }

      setSuccess('Usuario invitado correctamente')
      setInvitedEmail('')
      setInvitedRole('padre')
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
      <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="text-purple-500" size={20} />
            <h2 className="text-xl font-bold text-gray-800">Gestión de Familia</h2>
            <Crown className="text-yellow-500 ml-2" size={16} />
          </div>
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>
        {isExpanded && (
          <div className="px-6 pb-6">
            <p className="text-gray-600">Cargando...</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2">
          <Users className="text-purple-500" size={20} />
          <h2 className="text-xl font-bold text-gray-800">Gestión de Familia</h2>
          <Crown className="text-yellow-500 ml-2" size={16} />
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
          {/* Nombre del Niño */}
          <div className="pb-6 border-b border-gray-200">
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
            
            <AnimatePresence mode="wait">
              {isEditingName ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <motion.input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="Nombre del niño/a"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={50}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
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
                </motion.div>
              ) : (
                <motion.p
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg font-semibold text-gray-800"
                >
                  {familyInfo?.babyName || 'Bebé'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Invitar Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Invitar Miembro de la Familia
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800">
                <strong>📧 Importante:</strong> El miembro debe estar registrado en Chau Pañal con el mismo email que ingreses.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Si aún no se registró, debe hacerlo primero desde la página principal con su cuenta de Google.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={invitedEmail}
                  onChange={(e) => setInvitedEmail(e.target.value)}
                  placeholder="Email del miembro (ej: papa@gmail.com)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <select
                  value={invitedRole}
                  onChange={(e) => setInvitedRole(e.target.value)}
                  className="w-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleInviteUser}
                disabled={isInviting || !invitedEmail.trim()}
                className="w-full bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white"
              >
                <UserPlus className="mr-2" size={16} />
                {isInviting ? 'Enviando...' : 'Invitar'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Una vez invitado, el miembro verá automáticamente los registros compartidos la próxima vez que inicie sesión.
            </p>
          </div>

          {/* Mi Rol Actual */}
          <div className="pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mi Rol en la Familia
            </label>
            {editingRole?.email === 'me' ? (
              <div className="space-y-3">
                <select
                  value={editingRole.role}
                  onChange={(e) => setEditingRole({ ...editingRole, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        setError(null)
                        const response = await fetch('/api/family', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            action: 'updateMyRole',
                            newRole: editingRole.role,
                          }),
                        })

                        const data = await response.json()

                        if (!response.ok) {
                          throw new Error(data.error || 'Error al actualizar rol')
                        }

                        setSuccess('Rol actualizado correctamente')
                        setEditingRole(null)
                        loadFamilyInfo()
                      } catch (err: any) {
                        setError(err.message || 'Error al actualizar rol')
                      }
                    }}
                    className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white"
                  >
                    Guardar
                  </Button>
                  <Button
                    onClick={() => setEditingRole(null)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <Users className="text-gray-400" size={16} />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 block">
                      {familyInfo?.userName || 'Usuario'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {roles.find(r => r.value === familyInfo?.userRole)?.label || 'Padre'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setEditingRole({ email: 'me', role: familyInfo?.userRole || 'padre' })}
                  variant="ghost"
                  size="sm"
                >
                  <Edit2 className="mr-2" size={14} />
                  Editar
                </Button>
              </div>
            )}
          </div>

          {/* Usuarios Compartidos */}
          {familyInfo && familyInfo.sharedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Miembros de la Familia
              </label>
              <div className="space-y-2">
                {familyInfo.sharedUsers.map((member, index) => (
                  <motion.div
                    key={member.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Users className="text-gray-400" size={16} />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800 block">{member.name}</span>
                        <span className="text-xs text-gray-500 block">{member.email}</span>
                        {editingRole?.email === member.email ? (
                          <div className="mt-2 space-y-2">
                            <select
                              value={editingRole.role}
                              onChange={(e) => setEditingRole({ ...editingRole, role: e.target.value })}
                              className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              {roles.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <Button
                                onClick={async () => {
                                  try {
                                    setError(null)
                                    const response = await fetch('/api/family', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        action: 'updateUserRole',
                                        targetEmail: member.email,
                                        newRole: editingRole.role,
                                      }),
                                    })

                                    const data = await response.json()

                                    if (!response.ok) {
                                      throw new Error(data.error || 'Error al actualizar rol')
                                    }

                                    setSuccess('Rol actualizado correctamente')
                                    setEditingRole(null)
                                    loadFamilyInfo()
                                  } catch (err: any) {
                                    setError(err.message || 'Error al actualizar rol')
                                  }
                                }}
                                size="sm"
                                className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white text-xs"
                              >
                                Guardar
                              </Button>
                              <Button
                                onClick={() => setEditingRole(null)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {roles.find(r => r.value === member.role)?.label || 'Padre'}
                            {member.isOwner && ' (Dueño)'}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwner && !member.isOwner && !editingRole && (
                      <Button
                        onClick={() => setEditingRole({ email: member.email, role: member.role })}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit2 className="mr-2" size={14} />
                        Editar Rol
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mensajes de Error/Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="text-sm text-green-700">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

