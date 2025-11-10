'use client'

import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Clock, Calendar } from 'lucide-react'

interface Activity {
  id: string
  timestamp: string
  type: 'esfinteres'
  details: any
}

interface ChartsViewProps {
  activities: Activity[]
}

const COLORS = {
  pis: '#3B82F6', // blue-500
  caca: '#A855F7', // purple-500
  'pipi-caca': '#6366F1', // indigo-500
  seco: '#10B981', // green-500
}

export function ChartsView({ activities }: ChartsViewProps) {
  // Procesar datos para gráfico de líneas (registros por día)
  const dailyData = useMemo(() => {
    const grouped: Record<string, { date: string; pis: number; caca: number; 'pipi-caca': number; seco: number; total: number }> = {}

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          pis: 0,
          caca: 0,
          'pipi-caca': 0,
          seco: 0,
          total: 0,
        }
      }

      const type = activity.details?.type || 'seco'
      if (type === 'pipi' || type === 'húmedo') {
        grouped[dateKey].pis++
        grouped[dateKey].total++
      } else if (type === 'caca' || type === 'sucio') {
        grouped[dateKey].caca++
        grouped[dateKey].total++
      } else if (type === 'pipi-caca') {
        grouped[dateKey]['pipi-caca']++
        grouped[dateKey].total++
      } else if (type === 'seco') {
        grouped[dateKey].seco++
        grouped[dateKey].total++
      }
    })

    // Ordenar por fecha
    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('es', { day: 'numeric', month: 'short' }),
      }))
  }, [activities])

  // Procesar datos para gráfico de barras (por tipo)
  const typeData = useMemo(() => {
    const counts = {
      pis: 0,
      caca: 0,
      'pipi-caca': 0,
      seco: 0,
    }

    activities.forEach(activity => {
      const type = activity.details?.type || 'seco'
      if (type === 'pipi' || type === 'húmedo') counts.pis++
      else if (type === 'caca' || type === 'sucio') counts.caca++
      else if (type === 'pipi-caca') counts['pipi-caca']++
      else if (type === 'seco') counts.seco++
    })

    return [
      { name: 'Pis', value: counts.pis, color: COLORS.pis },
      { name: 'Caca', value: counts.caca, color: COLORS.caca },
      { name: 'Pis y Caca', value: counts['pipi-caca'], color: COLORS['pipi-caca'] },
      { name: 'Seco', value: counts.seco, color: COLORS.seco },
    ].filter(item => item.value > 0)
  }, [activities])

  // Procesar datos para gráfico de horarios (patrones de horarios)
  const hourlyData = useMemo(() => {
    const hourlyCounts: Record<number, number> = {}

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const hour = date.getHours()
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
    })

    return Array.from({ length: 24 }, (_, i) => ({
      hora: `${String(i).padStart(2, '0')}:00`,
      registros: hourlyCounts[i] || 0,
    }))
  }, [activities])

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (activities.length === 0) {
      return {
        total: 0,
        promedioDiario: 0,
        horarioMasComun: null as string | null,
        tipoMasComun: null as string | null,
      }
    }

    // Total de registros
    const total = activities.length

    // Promedio diario
    const days = new Set(activities.map(a => new Date(a.timestamp).toISOString().split('T')[0]))
    const promedioDiario = total / days.size

    // Horario más común
    const hourlyCounts: Record<number, number> = {}
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours()
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
    })
    const maxHour = Object.entries(hourlyCounts).reduce((a, b) => 
      hourlyCounts[Number(a[0])] > hourlyCounts[Number(b[0])] ? a : b
    )
    const horarioMasComun = maxHour ? `${String(Number(maxHour[0])).padStart(2, '0')}:00` : null

    // Tipo más común
    const typeCounts: Record<string, number> = {}
    activities.forEach(activity => {
      const type = activity.details?.type || 'seco'
      let typeKey = 'seco'
      if (type === 'pipi' || type === 'húmedo') typeKey = 'pis'
      else if (type === 'caca' || type === 'sucio') typeKey = 'caca'
      else if (type === 'pipi-caca') typeKey = 'pipi-caca'
      
      typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1
    })
    const maxType = Object.entries(typeCounts).reduce((a, b) => 
      typeCounts[a[0]] > typeCounts[b[0]] ? a : b
    )
    const tipoMasComun = maxType ? maxType[0] : null

    return {
      total,
      promedioDiario: Math.round(promedioDiario * 10) / 10,
      horarioMasComun,
      tipoMasComun: tipoMasComun === 'pis' ? 'Pis' : 
                    tipoMasComun === 'caca' ? 'Caca' : 
                    tipoMasComun === 'pipi-caca' ? 'Pis y Caca' : 
                    tipoMasComun === 'seco' ? 'Seco' : null,
    }
  }, [activities])

  // Datos semanales
  const weeklyData = useMemo(() => {
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const weeklyCounts: Record<number, number> = {}

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const dayOfWeek = date.getDay()
      weeklyCounts[dayOfWeek] = (weeklyCounts[dayOfWeek] || 0) + 1
    })

    return weekDays.map((day, index) => ({
      dia: day,
      registros: weeklyCounts[index] || 0,
    }))
  }, [activities])

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gráficos y Estadísticas</h2>
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="mx-auto mb-4 text-gray-300" size={48} />
          <p>No hay suficientes registros para mostrar gráficos</p>
          <p className="text-sm mt-2">Crea algunos registros para ver estadísticas visuales</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Resumidas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas Generales</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-600" size={20} />
              <p className="text-sm font-medium text-gray-600">Total Registros</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-600" size={20} />
              <p className="text-sm font-medium text-gray-600">Promedio Diario</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.promedioDiario}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-green-600" size={20} />
              <p className="text-sm font-medium text-gray-600">Horario Más Común</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.horarioMasComun || 'N/A'}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-indigo-600" size={20} />
              <p className="text-sm font-medium text-gray-600">Tipo Más Común</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.tipoMasComun || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Líneas - Registros por Día */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Registros por Día</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} name="Total" />
            <Line type="monotone" dataKey="pis" stroke={COLORS.pis} strokeWidth={2} name="Pis" />
            <Line type="monotone" dataKey="caca" stroke={COLORS.caca} strokeWidth={2} name="Caca" />
            <Line type="monotone" dataKey="pipi-caca" stroke={COLORS['pipi-caca']} strokeWidth={2} name="Pis y Caca" />
            <Line type="monotone" dataKey="seco" stroke={COLORS.seco} strokeWidth={2} name="Seco" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos en Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Por Tipo */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Registros por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1">
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pastel - Distribución */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  const percent = entry.percent || 0
                  const name = entry.name || ''
                  return `${name}: ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Horarios */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Patrones de Horarios</h3>
        <p className="text-sm text-gray-600 mb-4">Distribución de registros a lo largo del día</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="registros" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico Semanal */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Registros por Día de la Semana</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="registros" fill="#A855F7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

