'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '../../components/Header'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Plus, MessageCircle, Heart, Clock, User, Crown, Search } from 'lucide-react'
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

interface Forum {
  id: string
  name: string
  description: string
  icon: string
  category: string
}

export default function ForumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const forumId = params.forumId as string
  const [forum, setForum] = useState<Forum | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      setIsPremium(session.user.isPremium || false)
      loadForumInfo()
      loadPosts()
    }
  }, [status, session, router, forumId])

  const loadForumInfo = async () => {
    try {
      const response = await fetch('/api/community/forums')
      if (response.ok) {
        const data = await response.json()
        const foundForum = data.forums?.find((f: Forum) => f.id === forumId)
        if (foundForum) {
          setForum(foundForum)
        } else {
          // Si no se encuentra el foro, redirigir a la lista
          router.push('/community')
        }
      }
    } catch (error) {
      console.error('Error cargando información del foro:', error)
    }
  }

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/community/forums/${encodeURIComponent(forumId)}/posts`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        console.error('Error en respuesta:', response.status)
      }
    } catch (error) {
      console.error('Error cargando posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forumId,
          title: newPost.title,
          content: newPost.content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear post')
      }

      setNewPost({ title: '', content: '' })
      setShowCreatePost(false)
      loadPosts()
    } catch (error: any) {
      alert(error.message || 'Error al crear post')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || (isLoading && !forum)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando foro...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!forum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Foro no encontrado</p>
            <Button onClick={() => router.push('/community')}>
              Volver a Comunidad
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Filtrar posts por búsqueda
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/community')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="mr-2" size={16} />
              Volver
            </Button>
            <div>
              {forum ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{forum.icon}</span>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {forum.name}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {forum.description}
                    </p>
                  </div>
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-gray-800">
                  Cargando foro...
                </h1>
              )}
            </div>
          </div>
          {isPremium && (
            <Button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white"
            >
              <Plus className="mr-2" size={16} />
              Nuevo Post
            </Button>
          )}
        </div>

        {/* Banner para usuarios gratuitos */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Crown className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-1">Versión Gratuita</p>
                <p className="text-sm text-gray-700 mb-2">
                  Puedes leer todos los posts y comentar (máximo 3 comentarios por día).
                  <Button
                    onClick={() => router.push('/premium')}
                    variant="link"
                    className="ml-2 text-yellow-600 underline p-0 h-auto"
                  >
                    Actualiza a Premium para crear posts
                  </Button>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formulario de nuevo post (Premium) */}
        <AnimatePresence>
          {showCreatePost && isPremium && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg mb-6 overflow-hidden"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Post</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Título de tu post..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Escribe tu post aquí..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newPost.content.length}/2000 caracteres
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreatePost}
                    disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim()}
                    className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white"
                  >
                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreatePost(false)
                      setNewPost({ title: '', content: '' })
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 mb-4">No hay posts en este foro aún</p>
            {isPremium && (
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-white"
              >
                <Plus className="mr-2" size={16} />
                Crear Primer Post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => router.push(`/community/post/${post.id}`)}
                className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    {post.userImage ? (
                      <img src={post.userImage} alt={post.userName} className="w-10 h-10 rounded-full" />
                    ) : (
                      <User className="text-gray-600" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">{post.userName}</span>
                      {isPremium && (
                        <Crown className="text-yellow-500" size={14} />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(post.timestamp).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      Ver comentarios
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart size={16} />
                    <span className="text-sm">{post.likes}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

