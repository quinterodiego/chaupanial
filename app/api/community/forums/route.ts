import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET - Obtener todos los foros disponibles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const forums = await GoogleSheetsService.getForums()

    return NextResponse.json(forums)
  } catch (error) {
    console.error('Error obteniendo foros:', error)
    return NextResponse.json(
      { error: 'Error al obtener foros' },
      { status: 500 }
    )
  }
}

