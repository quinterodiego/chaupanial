'use client'

import { MainNav } from '../components/MainNav'
import { Header } from '../components/Header'
import { Onboarding } from '../components/Onboarding'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      checkProfile()
    }
  }, [status, session, router])

  const checkProfile = async () => {
    try {
      const response = await fetch('/api/child-profile')
      if (response.ok) {
        const data = await response.json()
        setHasProfile(data.hasProfile === true)
      } else {
        setHasProfile(false)
      }
    } catch (error) {
      console.error('Error verificando perfil:', error)
      setHasProfile(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = async (data: { name: string; birthDate: string }) => {
    try {
      const response = await fetch('/api/child-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          birthDate: data.birthDate,
        }),
      })

      if (response.ok) {
        setHasProfile(true)
      } else {
        alert('Error al guardar el perfil. Por favor, intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error guardando perfil:', error)
      alert('Error al guardar el perfil. Por favor, intenta nuevamente.')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Mostrar onboarding si no tiene perfil
  if (hasProfile === false) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <MainNav />
    </div>
  )
}

