import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './components/AuthProvider'
import { Toaster } from './components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chau Pañal - Control de Esfínteres',
  description: 'La app para acompañar a tu bebé en el proceso de control de esfínteres. Registros, seguimiento y tips para este momento tan importante.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#8CCFE0" />
      </head>
      <body className={`${inter.className} app-container`} suppressHydrationWarning>
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