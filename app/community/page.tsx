'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '../components/Header'
import { Button } from '../components/ui/button'
import { MessageCircle, Users, Search, Crown, ArrowRight, Heart, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Forum {
  id: string
  name: string
  description: string
  icon: string
  category: string
}

export default function CommunityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [forums, setForums] = useState<Forum[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      loadForums()
    }
  }, [status, router])

  const loadForums = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/community/forums')
      if (response.ok) {
        const data = await response.json()
        setForums(data.forums || [])
      }
    } catch (error) {
      console.error('Error cargando foros:', error)
    } finally {
      setIsLoading(false)
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

  if (!session) {
    return null
  }

  // Filtrar foros por búsqueda
  const filteredForums = forums.filter(forum =>
    forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    forum.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Comunidad de Padres
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Conecta con otros padres, comparte experiencias y encuentra apoyo
          </p>
        </div>

        {/* Búsqueda */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar foros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Lista de Foros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredForums.map((forum, index) => (
            <motion.div
              key={forum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => router.push(`/community/${forum.id}`)}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow active:scale-95"
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl flex-shrink-0">{forum.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                    {forum.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {forum.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500 capitalize">
                  {forum.category}
                </span>
                <ArrowRight className="text-gray-400 flex-shrink-0" size={18} />
              </div>
            </motion.div>
          ))}
        </div>

        {filteredForums.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">No se encontraron foros</p>
          </div>
        )}
      </main>
    </div>
  )
}

