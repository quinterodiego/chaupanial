import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// POST - Crear un comentario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { postId, content } = body

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (content.trim().length < 3) {
      return NextResponse.json(
        { error: 'El comentario debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    // Verificar límites de versión gratuita (máximo 3 comentarios por día)
    const isPremium = session.user.isPremium || false
    
    if (!isPremium) {
      const todayCommentCount = await GoogleSheetsService.getTodayCommentCount(session.user.email!)
      const FREE_LIMIT_COMMENTS = 3
      
      if (todayCommentCount >= FREE_LIMIT_COMMENTS) {
        return NextResponse.json(
          { 
            error: 'Has alcanzado el límite de comentarios gratuitos (3 por día)',
            limitReached: true,
            commentCount: todayCommentCount
          },
          { status: 403 }
        )
      }
    }

    const result = await GoogleSheetsService.createComment({
      postId,
      userEmail: session.user.email!,
      content: content.trim(),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al crear comentario' },
        { status: 500 }
      )
    }

    // Obtener el contador actualizado
    const updatedCount = await GoogleSheetsService.getTodayCommentCount(session.user.email!)

    return NextResponse.json({ 
      success: true,
      commentId: result.commentId,
      todayCommentCount: updatedCount,
      message: 'Comentario creado correctamente'
    })
  } catch (error) {
    console.error('Error creando comentario:', error)
    return NextResponse.json(
      { error: 'Error al crear comentario' },
      { status: 500 }
    )
  }
}

