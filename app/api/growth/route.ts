import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET: Obtener registros de crecimiento
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userEmail = session.user.email
    
    // Obtener todas las actividades de tipo 'growth'
    const activities = await GoogleSheetsService.getActivities(userEmail)
    
    // Filtrar solo las de crecimiento
    const growthRecords = activities.activities
      .filter(act => act.type === 'growth')
      .map(act => ({
        id: act.id,
        timestamp: act.timestamp,
        weight: act.details?.weight || null,
        height: act.details?.height || null,
        headCircumference: act.details?.headCircumference || null,
        notes: act.details?.notes || null,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ records: growthRecords })
  } catch (error) {
    console.error('Error en GET /api/growth:', error)
    return NextResponse.json(
      { error: 'Error al obtener registros de crecimiento' },
      { status: 500 }
    )
  }
}

// POST: Guardar nuevo registro de crecimiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { weight, height, headCircumference, notes, date, time } = body

    // Validar que al menos un valor esté presente
    if (!weight && !height && !headCircumference) {
      return NextResponse.json(
        { error: 'Debes ingresar al menos un valor (peso, altura o perímetro cefálico)' },
        { status: 400 }
      )
    }

    const userEmail = session.user.email

    // Obtener nombre del bebé
    const familyInfo = await GoogleSheetsService.getFamilyInfo(userEmail)
    const babyName = familyInfo.babyName || 'Bebé'

    // Combinar fecha y hora
    let timestamp = new Date()
    if (date) {
      timestamp = new Date(date)
      if (time) {
        const [hours, minutes] = time.split(':')
        timestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      } else {
        timestamp.setHours(timestamp.getHours(), timestamp.getMinutes(), 0, 0)
      }
    }

    // Guardar como actividad de tipo 'growth'
    const result = await GoogleSheetsService.saveActivity({
      userEmail,
      babyName,
      activityType: 'growth',
      details: {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        headCircumference: headCircumference ? parseFloat(headCircumference) : null,
        notes: notes || null,
      },
      timestamp,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al guardar el registro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      record: {
        weight,
        height,
        headCircumference,
        notes,
        timestamp: timestamp.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error en POST /api/growth:', error)
    return NextResponse.json(
      { error: 'Error al guardar el registro de crecimiento' },
      { status: 500 }
    )
  }
}

