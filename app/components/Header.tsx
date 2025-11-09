'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { User, LogOut, Crown, Baby } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => router.push('/')}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#A8D8EA] to-[#FFB3BA] text-gray-800 shadow-lg group-hover:shadow-xl transition-shadow">
            <Baby size={24} className="text-gray-700" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] bg-clip-text text-transparent">
              Chau Pañal
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Tu compañero en el control de esfínteres</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {session ? (
            <>
              {!session.user?.isPremium && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/premium')}
                  className="hidden sm:flex items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Crown size={16} className="text-yellow-600" />
                  <span>Premium</span>
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-9 h-9 rounded-full ring-2 ring-primary-200 hover:ring-primary-400 transition-all"
                    />
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    ¡Hola, {session.user?.name?.split(' ')[0]}!
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </>
          ) : (
            <Button 
              onClick={() => signIn('google')}
              className="bg-gradient-to-r from-[#A8D8EA] to-[#FFB3BA] hover:from-[#98C8DA] hover:to-[#EFA3AA] text-gray-800 shadow-md hover:shadow-lg transition-all"
            >
              <User size={18} className="mr-2" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Entrar</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}