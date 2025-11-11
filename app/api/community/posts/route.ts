import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// POST - Crear un nuevo post (solo Premium)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const isPremium = session.user.isPremium || false
    
    if (!isPremium) {
      return NextResponse.json(
        { error: 'Solo usuarios Premium pueden crear posts' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { forumId, title, content } = body

    if (!forumId || !title || !content) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (title.trim().length < 3) {
      return NextResponse.json(
        { error: 'El título debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: 'El contenido debe tener al menos 10 caracteres' },
        { status: 400 }
      )
    }

    const result = await GoogleSheetsService.createPost({
      forumId,
      userEmail: session.user.email!,
      title: title.trim(),
      content: content.trim(),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al crear post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      postId: result.postId,
      message: 'Post creado correctamente'
    })
  } catch (error) {
    console.error('Error creando post:', error)
    return NextResponse.json(
      { error: 'Error al crear post' },
      { status: 500 }
    )
  }
}

