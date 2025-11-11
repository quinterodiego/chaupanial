import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET - Obtener actividades del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const isPremium = session.user.isPremium || false

    // Obtener actividades desde Google Sheets
    // Si es Premium, usar getSharedActivities para incluir registros compartidos
    const result = isPremium
      ? await GoogleSheetsService.getSharedActivities(session.user.email, {
          limit: limit,
        })
      : await GoogleSheetsService.getActivities(session.user.email, {
          limit: limit,
        })

    // Si no es premium, filtrar solo últimos 30 días
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const activities = isPremium
      ? result.activities
      : result.activities.filter(activity => {
          const activityDate = new Date(activity.timestamp)
          return activityDate >= thirtyDaysAgo
        })

    return NextResponse.json({
      activities,
      monthlyCount: result.monthlyCount,
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
    const { type, details, babyName, timestamp } = body

    // Validar tipo de actividad
    if (!['feeding', 'sleep', 'diaper', 'milestone', 'esfinteres'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de actividad inválido' },
        { status: 400 }
      )
    }

    // Usar timestamp personalizado si se proporciona, sino usar la fecha actual
    const activityTimestamp = timestamp ? new Date(timestamp) : new Date()

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

    // Si es Premium, obtener el nombre del niño de la familia
    let finalBabyName = babyName || 'Bebé'
    if (isPremium && !babyName) {
      const familyInfo = await GoogleSheetsService.getFamilyInfo(session.user.email!)
      finalBabyName = familyInfo.babyName || 'Bebé'
    }

    // Guardar actividad en Google Sheets
    const result = await GoogleSheetsService.saveActivity({
      userEmail: session.user.email!,
      babyName: finalBabyName,
      activityType: type,
      details: details || {},
      timestamp: activityTimestamp,
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

