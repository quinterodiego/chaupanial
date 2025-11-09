import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './components/AuthProvider'
import { Toaster } from './components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chau Pañal - Control de Esfínteres',
  description: 'La app para acompañar a tu bebé en el proceso de control de esfínteres. Registros, seguimiento y tips para este momento tan importante.',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${inter.className} app-container`}>
        <AuthProvider>
          <div className="safe-area">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}