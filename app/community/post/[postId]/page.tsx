'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '../../../components/Header'
import { Button } from '../../../components/ui/button'
import { ArrowLeft, MessageCircle, Heart, Clock, User, Send, Crown, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Post {
  id: string
  forumId: string
  userEmail: string
  userName: string
  userImage: string
  title: string
  content: string
  timestamp: string
  likes: number
}

interface Comment {
  id: string
  postId: string
  userEmail: string
  userName: string
  userImage: string
  content: string
  timestamp: string
}

export default function PostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [todayCommentCount, setTodayCommentCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      setIsPremium(session.user.isPremium || false)
      loadPost()
    }
  }, [status, session, router, postId])

  const loadPost = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/community/posts/${encodeURIComponent(postId)}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setComments(data.comments || [])
        
        // Contar comentarios del usuario hoy
        if (session?.user?.email) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const todayComments = data.comments.filter((c: Comment) => {
            if (c.userEmail !== session.user.email) return false
            const commentDate = new Date(c.timestamp)
            return commentDate >= today
          })
          setTodayCommentCount(todayComments.length)
        }
      } else {
        router.push('/community')
      }
    } catch (error) {
      console.error('Error cargando post:', error)
      router.push('/community')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      return
    }

    // Verificar límites de versión gratuita
    if (!isPremium && todayCommentCount >= 3) {
      setError('Has alcanzado el límite de comentarios gratuitos (3 por día). Actualiza a Premium para comentarios ilimitados.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: newComment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          setError('Has alcanzado el límite de comentarios gratuitos (3 por día). Actualiza a Premium para comentarios ilimitados.')
          setTodayCommentCount(data.commentCount || 3)
          return
        }
        throw new Error(data.error || 'Error al crear comentario')
      }

      setNewComment('')
      setTodayCommentCount(data.todayCommentCount || todayCommentCount + 1)
      setError(null)
      loadPost() // Recargar post y comentarios
    } catch (error: any) {
      setError(error.message || 'Error al crear comentario')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!session || !post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Botón Volver */}
        <Button
          onClick={() => router.push(`/community/${post.forumId}`)}
          variant="ghost"
          className="mb-4 sm:mb-6 px-2 sm:px-3"
        >
          <ArrowLeft className="sm:mr-2" size={16} />
          <span className="hidden sm:inline">Volver al Foro</span>
          <span className="sm:hidden">Volver</span>
        </Button>

        {/* Post Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              {post.userImage ? (
                <img src={post.userImage} alt={post.userName} className="w-12 h-12 rounded-full" />
              ) : (
                <User className="text-gray-600" size={24} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-800">{post.userName}</span>
                {isPremium && (
                  <Crown className="text-yellow-500" size={14} />
                )}
                <span className="text-sm text-gray-500">
                  {new Date(post.timestamp).toLocaleDateString('es', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {post.title}
              </h1>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-500">
              <Heart size={18} />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle size={18} />
              <span>{comments.length} comentario{comments.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </motion.div>

        {/* Banner de límite de comentarios (Gratis) */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Versión Gratuita:</strong> Has usado {todayCommentCount} de 3 comentarios hoy.
                  {todayCommentCount >= 3 && (
                    <Button
                      onClick={() => router.push('/premium')}
                      variant="link"
                      className="ml-1 sm:ml-2 text-blue-600 underline p-0 h-auto text-xs sm:text-sm"
                    >
                      Actualiza a Premium
                    </Button>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formulario de Comentario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Escribe un comentario</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-3 sm:space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value)
                setError(null)
              }}
              placeholder="Escribe tu comentario aquí..."
              rows={4}
              disabled={!isPremium && todayCommentCount >= 3}
              className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
              maxLength={500}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="text-xs text-gray-500">
                {newComment.length}/500 caracteres
              </p>
              <Button
                onClick={handleCreateComment}
                disabled={isSubmitting || !newComment.trim() || (!isPremium && todayCommentCount >= 3)}
                className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white w-full sm:w-auto text-sm sm:text-base"
              >
                <Send className="mr-2" size={14} />
                {isSubmitting ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Lista de Comentarios */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            Comentarios ({comments.length})
          </h2>
          {comments.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow-lg">
              <MessageCircle className="mx-auto text-gray-300 mb-3 sm:mb-4" size={40} />
              <p className="text-sm sm:text-base text-gray-600">No hay comentarios aún</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Sé el primero en comentar</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      {comment.userImage ? (
                        <img src={comment.userImage} alt={comment.userName} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
                      ) : (
                        <User className="text-gray-600" size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                        <span className="font-semibold text-gray-800 text-sm sm:text-base">{comment.userName}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(comment.timestamp).toLocaleDateString('es', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

