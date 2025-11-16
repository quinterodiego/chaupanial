'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Ruler, Plus, TrendingUp, X, Calendar, Clock, Scale, Gauge, Circle, Save, Loader2, Edit, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNumberAR, parseNumberAR } from '@/lib/utils'

interface GrowthRecord {
  id: string
  timestamp: string
  weight: number | null
  height: number | null
  headCircumference: number | null
  notes: string | null
}

export default function CrecimientoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null)
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    headCircumference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      loadRecords()
    }
  }, [status, session, router])

  const loadRecords = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/growth')
      if (response.ok) {
        const data = await response.json()
        setGrowthRecords(data.records || [])
      }
    } catch (error) {
      console.error('Error cargando registros:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (record?: GrowthRecord) => {
    if (record) {
      setEditingRecord(record)
      const recordDate = new Date(record.timestamp)
      setFormData({
        weight: record.weight ? formatNumberAR(record.weight, 1) : '',
        height: record.height ? formatNumberAR(record.height, 1) : '',
        headCircumference: record.headCircumference ? formatNumberAR(record.headCircumference, 1) : '',
        notes: record.notes || '',
        date: recordDate.toISOString().split('T')[0],
        time: `${String(recordDate.getHours()).padStart(2, '0')}:${String(recordDate.getMinutes()).padStart(2, '0')}`,
      })
    } else {
      setEditingRecord(null)
      setFormData({
        weight: '',
        height: '',
        headCircumference: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRecord(null)
    setFormData({
      weight: '',
      height: '',
      headCircumference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.weight && !formData.height && !formData.headCircumference) {
      alert('Debes ingresar al menos un valor (peso, altura o perímetro cefálico)')
      return
    }

    try {
      setIsSaving(true)
      
      // Convertir valores de formato argentino a formato estándar para la API
      const submitData = {
        ...formData,
        weight: formData.weight ? parseNumberAR(formData.weight)?.toString() || '' : '',
        height: formData.height ? parseNumberAR(formData.height)?.toString() || '' : '',
        headCircumference: formData.headCircumference ? parseNumberAR(formData.headCircumference)?.toString() || '' : '',
      }
      
      const response = await fetch('/api/growth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        handleCloseModal()
        loadRecords()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al guardar el registro')
      }
    } catch (error) {
      console.error('Error guardando registro:', error)
      alert('Error al guardar el registro')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  // Calcular estadísticas
  const latestRecord = growthRecords[0]
  const hasWeight = growthRecords.filter(r => r.weight !== null).length > 0
  const hasHeight = growthRecords.filter(r => r.height !== null).length > 0
  const hasHeadCircumference = growthRecords.filter(r => r.headCircumference !== null).length > 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crecimiento</h1>
          <p className="text-gray-600">Registra peso, altura y perímetro cefálico</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
        >
          <Plus className="mr-2" size={18} />
          Nuevo Registro
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      {latestRecord && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {latestRecord.weight && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Scale className="text-blue-500" size={24} />
                <span className="text-2xl font-bold text-gray-800">{formatNumberAR(latestRecord.weight, 1)} kg</span>
              </div>
              <p className="text-sm text-gray-600">Peso actual</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(latestRecord.timestamp).toLocaleDateString('es')}
              </p>
            </div>
          )}
          {latestRecord.height && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Gauge className="text-green-500" size={24} />
                <span className="text-2xl font-bold text-gray-800">{formatNumberAR(latestRecord.height, 1)} cm</span>
              </div>
              <p className="text-sm text-gray-600">Altura actual</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(latestRecord.timestamp).toLocaleDateString('es')}
              </p>
            </div>
          )}
          {latestRecord.headCircumference && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Circle className="text-purple-500" size={24} />
                <span className="text-2xl font-bold text-gray-800">{formatNumberAR(latestRecord.headCircumference, 1)} cm</span>
              </div>
              <p className="text-sm text-gray-600">Perímetro cefálico</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(latestRecord.timestamp).toLocaleDateString('es')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Gráficos simples */}
      {growthRecords.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-[#8CCFE0]" size={24} />
            Evolución
          </h2>
          
          <div className="space-y-6">
            {hasWeight && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Peso (kg)</h3>
                <div className="h-32 flex items-end gap-2">
                  {growthRecords
                    .filter(r => r.weight !== null)
                    .slice(0, 10)
                    .reverse()
                    .map((record, index) => {
                      const maxWeight = Math.max(...growthRecords.filter(r => r.weight !== null).map(r => r.weight!))
                      const minWeight = Math.min(...growthRecords.filter(r => r.weight !== null).map(r => r.weight!))
                      const height = maxWeight > minWeight 
                        ? ((record.weight! - minWeight) / (maxWeight - minWeight)) * 100 
                        : 50
                      return (
                        <div key={record.id} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500"
                            style={{ height: `${height}%`, minHeight: '8px' }}
                            title={`${formatNumberAR(record.weight, 1)} kg - ${new Date(record.timestamp).toLocaleDateString('es')}`}
                          />
                          <span className="text-xs text-gray-500 mt-1">{formatNumberAR(record.weight, 1)}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {hasHeight && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Altura (cm)</h3>
                <div className="h-32 flex items-end gap-2">
                  {growthRecords
                    .filter(r => r.height !== null)
                    .slice(0, 10)
                    .reverse()
                    .map((record, index) => {
                      const maxHeight = Math.max(...growthRecords.filter(r => r.height !== null).map(r => r.height!))
                      const minHeight = Math.min(...growthRecords.filter(r => r.height !== null).map(r => r.height!))
                      const height = maxHeight > minHeight 
                        ? ((record.height! - minHeight) / (maxHeight - minHeight)) * 100 
                        : 50
                      return (
                        <div key={record.id} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:from-green-600 hover:to-green-500"
                            style={{ height: `${height}%`, minHeight: '8px' }}
                            title={`${formatNumberAR(record.height, 1)} cm - ${new Date(record.timestamp).toLocaleDateString('es')}`}
                          />
                          <span className="text-xs text-gray-500 mt-1">{formatNumberAR(record.height, 1)}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {hasHeadCircumference && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Perímetro Cefálico (cm)</h3>
                <div className="h-32 flex items-end gap-2">
                  {growthRecords
                    .filter(r => r.headCircumference !== null)
                    .slice(0, 10)
                    .reverse()
                    .map((record, index) => {
                      const maxHC = Math.max(...growthRecords.filter(r => r.headCircumference !== null).map(r => r.headCircumference!))
                      const minHC = Math.min(...growthRecords.filter(r => r.headCircumference !== null).map(r => r.headCircumference!))
                      const height = maxHC > minHC 
                        ? ((record.headCircumference! - minHC) / (maxHC - minHC)) * 100 
                        : 50
                      return (
                        <div key={record.id} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all hover:from-purple-600 hover:to-purple-500"
                            style={{ height: `${height}%`, minHeight: '8px' }}
                            title={`${formatNumberAR(record.headCircumference, 1)} cm - ${new Date(record.timestamp).toLocaleDateString('es')}`}
                          />
                          <span className="text-xs text-gray-500 mt-1">{formatNumberAR(record.headCircumference, 1)}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de registros */}
      {growthRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <Ruler size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aún no hay registros
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza registrando el peso, altura y perímetro cefálico de tu hijo
          </p>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
          >
            <Plus className="mr-2" size={18} />
            Registrar Crecimiento
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Historial de Registros</h2>
          <div className="space-y-3">
            {growthRecords.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-sm font-medium text-gray-600">
                        {new Date(record.timestamp).toLocaleDateString('es', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleTimeString('es', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {record.weight && (
                        <div className="flex items-center gap-2">
                          <Scale className="text-blue-500" size={18} />
                          <span className="text-gray-700"><strong>{formatNumberAR(record.weight, 1)} kg</strong></span>
                        </div>
                      )}
                      {record.height && (
                        <div className="flex items-center gap-2">
                          <Gauge className="text-green-500" size={18} />
                          <span className="text-gray-700"><strong>{formatNumberAR(record.height, 1)} cm</strong></span>
                        </div>
                      )}
                      {record.headCircumference && (
                        <div className="flex items-center gap-2">
                          <Circle className="text-purple-500" size={18} />
                          <span className="text-gray-700"><strong>{formatNumberAR(record.headCircumference, 1)} cm</strong></span>
                        </div>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{record.notes}"</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(record)}
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de registro */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingRecord ? 'Editar Registro' : 'Registro de Crecimiento'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                  <X size={24} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline mr-2" size={16} />
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline mr-2" size={16} />
                      Hora
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scale className="inline mr-2" size={16} />
                    Peso (kg)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.weight}
                    onChange={(e) => {
                      // Permitir solo números, coma y punto
                      const value = e.target.value.replace(/[^\d,.-]/g, '')
                      // Reemplazar punto por coma si hay punto (asumir que es decimal)
                      const normalized = value.replace(/\./g, ',')
                      // Solo permitir una coma
                      const parts = normalized.split(',')
                      const finalValue = parts.length > 2 
                        ? parts[0] + ',' + parts.slice(1).join('')
                        : normalized
                      setFormData({ ...formData, weight: finalValue })
                    }}
                    placeholder="Ej: 3,5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Gauge className="inline mr-2" size={16} />
                    Altura (cm)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.height}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,.-]/g, '')
                      const normalized = value.replace(/\./g, ',')
                      const parts = normalized.split(',')
                      const finalValue = parts.length > 2 
                        ? parts[0] + ',' + parts.slice(1).join('')
                        : normalized
                      setFormData({ ...formData, height: finalValue })
                    }}
                    placeholder="Ej: 50,5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Circle className="inline mr-2" size={16} />
                    Perímetro Cefálico (cm)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.headCircumference}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,.-]/g, '')
                      const normalized = value.replace(/\./g, ',')
                      const parts = normalized.split(',')
                      const finalValue = parts.length > 2 
                        ? parts[0] + ',' + parts.slice(1).join('')
                        : normalized
                      setFormData({ ...formData, headCircumference: finalValue })
                    }}
                    placeholder="Ej: 35,0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || (!formData.weight && !formData.height && !formData.headCircumference)}
                    className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={18} />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={18} />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
