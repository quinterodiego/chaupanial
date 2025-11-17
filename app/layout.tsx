import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './components/AuthProvider'
import { Toaster } from './components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Peque Diario - Acompañando el crecimiento de tu hijo',
  description: 'La app integral para padres que acompaña el crecimiento de tu hijo desde el nacimiento. Registro de crecimiento, sueño, alimentación, hitos y control de esfínteres.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-192x192.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8CCFE0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#8CCFE0" />
      </head>
      <body className={`${inter.className} app-container`} suppressHydrationWarning>
        <AuthProvider>
          <div className="safe-area">
            {children}
          </div>
          <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>Peque Diario</strong> no reemplaza la consulta con pediatras ni otros profesionales de la salud.
              </p>
              <p>© {new Date().getFullYear()} Peque Diario. Todos los derechos reservados.</p>
            </div>
          </footer>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}