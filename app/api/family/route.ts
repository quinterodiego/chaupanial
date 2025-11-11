import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET - Obtener información de la familia (nombre del niño, usuarios compartidos)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const isPremium = session.user.isPremium || false
    
    if (!isPremium) {
      return NextResponse.json({ error: 'Esta funcionalidad es solo para usuarios Premium' }, { status: 403 })
    }

    // Obtener información de la familia
    const familyInfo = await GoogleSheetsService.getFamilyInfo(session.user.email)

    return NextResponse.json(familyInfo)
  } catch (error) {
    console.error('Error obteniendo información de familia:', error)
    return NextResponse.json(
      { error: 'Error al obtener información de familia' },
      { status: 500 }
    )
  }
}

// POST - Crear o actualizar familia (nombre del niño, invitar usuario)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const isPremium = session.user.isPremium || false
    
    if (!isPremium) {
      return NextResponse.json({ error: 'Esta funcionalidad es solo para usuarios Premium' }, { status: 403 })
    }

    const body = await request.json()
    const { action, babyName, invitedEmail, role, targetEmail, newRole } = body

    if (action === 'updateBabyName') {
      // Actualizar nombre del niño
      const result = await GoogleSheetsService.updateBabyName(session.user.email, babyName)
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Error al actualizar nombre del niño' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Nombre del niño actualizado' })
    }

    if (action === 'inviteUser') {
      // Invitar a otro usuario
      if (!invitedEmail) {
        return NextResponse.json(
          { error: 'Email requerido' },
          { status: 400 }
        )
      }

      const userRole = role || 'padre' // Por defecto 'padre'
      const result = await GoogleSheetsService.inviteUserToFamily(session.user.email, invitedEmail, userRole)
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Error al invitar usuario' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Usuario invitado correctamente' })
    }

    if (action === 'updateUserRole') {
      // Actualizar rol de otro usuario (solo owner)
      if (!targetEmail || !newRole) {
        return NextResponse.json(
          { error: 'Email y rol requeridos' },
          { status: 400 }
        )
      }

      const result = await GoogleSheetsService.updateUserRole(session.user.email, targetEmail, newRole)
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Error al actualizar rol' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Rol actualizado correctamente' })
    }

    if (action === 'updateMyRole') {
      // Actualizar rol del usuario actual
      if (!newRole) {
        return NextResponse.json(
          { error: 'Rol requerido' },
          { status: 400 }
        )
      }

      const result = await GoogleSheetsService.updateMyRole(session.user.email, newRole)
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Error al actualizar rol' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Rol actualizado correctamente' })
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error gestionando familia:', error)
    return NextResponse.json(
      { error: 'Error al gestionar familia' },
      { status: 500 }
    )
  }
}

