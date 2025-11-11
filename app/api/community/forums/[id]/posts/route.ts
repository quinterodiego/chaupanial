import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET - Obtener posts de un foro
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const forumId = decodeURIComponent(params.id)
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const result = await GoogleSheetsService.getForumPosts(forumId, { limit })

    // Obtener información de usuarios para cada post
    const postsWithUserInfo = await Promise.all(
      result.posts.map(async (post) => {
        const userInfo = await GoogleSheetsService.getUserInfoForCommunity(post.userEmail)
        return {
          ...post,
          userName: userInfo.name,
          userImage: userInfo.image,
        }
      })
    )

    return NextResponse.json({ posts: postsWithUserInfo })
  } catch (error) {
    console.error('Error obteniendo posts:', error)
    return NextResponse.json(
      { error: 'Error al obtener posts' },
      { status: 500 }
    )
  }
}

