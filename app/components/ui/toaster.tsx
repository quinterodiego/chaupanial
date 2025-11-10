'use client'

import * as Toast from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Toaster() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'error' | 'warning'
    open: boolean
  }>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Escuchar eventos de toast desde window
    const handleToast = (event: CustomEvent) => {
      const { title, description, variant = 'default' } = event.detail
      const id = Math.random().toString(36).substring(7)
      setToasts((prev) => [...prev, { id, title, description, variant, open: true }])
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('toast' as any, handleToast as EventListener)
      return () => {
        window.removeEventListener('toast' as any, handleToast as EventListener)
      }
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Toast.Provider swipeDirection="right" duration={5000}>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          open={toast.open}
          onOpenChange={(open) => {
            if (!open) {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            } else {
              setToasts((prev) =>
                prev.map((t) => (t.id === toast.id ? { ...t, open } : t))
              )
            }
          }}
          className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 flex items-start gap-3"
        >
          <div className="flex-1">
            {toast.title && (
              <Toast.Title className="font-semibold text-gray-900 mb-1">
                {toast.title}
              </Toast.Title>
            )}
            {toast.description && (
              <Toast.Description className="text-sm text-gray-600">
                {toast.description}
              </Toast.Description>
            )}
          </div>
          <Toast.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <X size={16} />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-0 right-0 z-[100] flex flex-col p-4 gap-2 w-full max-w-sm m-0 list-none outline-none" />
    </Toast.Provider>
  )
}

// Función helper para mostrar toasts
export function toast(title?: string, description?: string, variant: 'default' | 'success' | 'error' | 'warning' = 'default') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toast', {
        detail: { title, description, variant },
      })
    )
  }
}

