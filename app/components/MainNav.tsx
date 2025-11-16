'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Ruler, Moon, Apple, Star, Droplet, Settings } from 'lucide-react'
import { Button } from './ui/button'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Inicio' },
  { path: '/dashboard/crecimiento', icon: Ruler, label: 'Crecimiento' },
  { path: '/dashboard/sueno', icon: Moon, label: 'Sueño' },
  { path: '/dashboard/alimentacion', icon: Apple, label: 'Alimentación' },
  { path: '/dashboard/hitos', icon: Star, label: 'Hitos' },
  { path: '/dashboard/esfinteres', icon: Droplet, label: 'Etapa Chau Pañal' },
  { path: '/dashboard/perfil', icon: Settings, label: 'Perfil' },
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="container mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path || 
              (item.path !== '/dashboard' && pathname?.startsWith(item.path))
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center gap-1 h-full w-full rounded-none ${
                  isActive 
                    ? 'text-[#8CCFE0] bg-[#8CCFE0]/10' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

