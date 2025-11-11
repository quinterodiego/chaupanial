import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET - Obtener un post específico con sus comentarios
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

    // Obtener el post desde todos los foros
    const allForums = await GoogleSheetsService.getForums()
    let post = null

    for (const forum of allForums.forums) {
      const result = await GoogleSheetsService.getForumPosts(forum.id)
      const foundPost = result.posts.find(p => p.id === postId)
      if (foundPost) {
        post = foundPost
        break
      }
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Obtener información del usuario
    const userInfo = await GoogleSheetsService.getUserInfoForCommunity(post.userEmail)

    // Obtener comentarios
    const commentsResult = await GoogleSheetsService.getPostComments(postId)

    // Obtener información de usuarios para cada comentario
    const commentsWithUserInfo = await Promise.all(
      commentsResult.comments.map(async (comment) => {
        const commentUserInfo = await GoogleSheetsService.getUserInfoForCommunity(comment.userEmail)
        return {
          ...comment,
          userName: commentUserInfo.name,
          userImage: commentUserInfo.image,
        }
      })
    )

    return NextResponse.json({
      post: {
        ...post,
        userName: userInfo.name,
        userImage: userInfo.image,
      },
      comments: commentsWithUserInfo,
    })
  } catch (error) {
    console.error('Error obteniendo post:', error)
    return NextResponse.json(
      { error: 'Error al obtener post' },
      { status: 500 }
    )
  }
}

