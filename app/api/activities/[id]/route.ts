import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// PUT - Actualizar una actividad
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, details, babyName, timestamp } = body

    // Decodificar el ID (timestamp original)
    const originalTimestamp = decodeURIComponent(params.id)

    // Validar tipo de actividad si se proporciona
    if (type && !['feeding', 'sleep', 'diaper', 'milestone', 'esfinteres'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de actividad inválido' },
        { status: 400 }
      )
    }

    // Preparar datos para actualizar
    const updateData: any = {
      userEmail: session.user.email,
      originalTimestamp: originalTimestamp,
    }

    if (type) updateData.activityType = type
    if (details !== undefined) updateData.details = details
    if (babyName !== undefined) updateData.babyName = babyName
    if (timestamp) updateData.timestamp = new Date(timestamp)

    // Actualizar actividad en Google Sheets
    const result = await GoogleSheetsService.updateActivity(updateData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al actualizar actividad' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Actividad actualizada correctamente'
    })
  } catch (error) {
    console.error('Error actualizando actividad:', error)
    return NextResponse.json(
      { error: 'Error al actualizar actividad' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una actividad
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Decodificar el ID (timestamp original)
    const timestamp = decodeURIComponent(params.id)

    // Eliminar actividad en Google Sheets
    const result = await GoogleSheetsService.deleteActivity(session.user.email, timestamp)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al eliminar actividad' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Actividad eliminada correctamente'
    })
  } catch (error) {
    console.error('Error eliminando actividad:', error)
    return NextResponse.json(
      { error: 'Error al eliminar actividad' },
      { status: 500 }
    )
  }
}

