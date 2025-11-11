import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET - Obtener comentarios de un post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const postId = decodeURIComponent(params.id)

    const result = await GoogleSheetsService.getPostComments(postId)

    // Obtener información de usuarios para cada comentario
    const commentsWithUserInfo = await Promise.all(
      result.comments.map(async (comment) => {
        const userInfo = await GoogleSheetsService.getUserInfoForCommunity(comment.userEmail)
        return {
          ...comment,
          userName: userInfo.name,
          userImage: userInfo.image,
        }
      })
    )

    return NextResponse.json({ comments: commentsWithUserInfo })
  } catch (error) {
    console.error('Error obteniendo comentarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener comentarios' },
      { status: 500 }
    )
  }
}

