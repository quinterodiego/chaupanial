import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

// GET - Obtener actividades del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Por ahora retornamos datos vacíos, luego implementamos la lectura desde Sheets
    // TODO: Implementar lectura desde Google Sheets
    const activities: any[] = []
    const monthlyCount = 0

    return NextResponse.json({
      activities,
      monthlyCount,
    })
  } catch (error) {
    console.error('Error obteniendo actividades:', error)
    return NextResponse.json(
      { error: 'Error al obtener actividades' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva actividad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, details, babyName } = body

    // Validar tipo de actividad
    if (!['feeding', 'sleep', 'diaper', 'milestone'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de actividad inválido' },
        { status: 400 }
      )
    }

    // Verificar límites de versión gratuita
    const isPremium = session.user.isPremium || false
    
    if (!isPremium) {
      // TODO: Contar registros del mes actual desde Sheets
      // Por ahora permitimos, luego implementamos el límite
      const monthlyCount = 0 // TODO: Obtener desde Sheets
      const FREE_LIMIT_MONTHLY = 50
      
      if (monthlyCount >= FREE_LIMIT_MONTHLY) {
        return NextResponse.json(
          { 
            error: 'Límite de registros alcanzado',
            limitReached: true,
            monthlyCount 
          },
          { status: 403 }
        )
      }
    }

    // Guardar actividad en Google Sheets
    const result = await GoogleSheetsService.saveActivity({
      userEmail: session.user.email!,
      babyName: babyName || 'Bebé',
      activityType: type,
      details: details || {},
      timestamp: new Date(),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Error al guardar actividad' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Actividad registrada correctamente'
    })
  } catch (error) {
    console.error('Error guardando actividad:', error)
    return NextResponse.json(
      { error: 'Error al guardar actividad' },
      { status: 500 }
    )
  }
}

