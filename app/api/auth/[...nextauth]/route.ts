import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Verificar si es usuario premium desde Google Sheets
      if (session.user?.email) {
        try {
          const isPremium = await GoogleSheetsService.checkPremiumStatus(session.user.email)
          session.user.isPremium = isPremium
        } catch (error) {
          console.error('Error verificando premium:', error)
          session.user.isPremium = false
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Guardar el usuario en Google Sheets
      if (account?.provider === 'google' && user.email) {
        try {
          // Verificar si el usuario ya existe
          const isPremium = await GoogleSheetsService.checkPremiumStatus(user.email)
          
          // Si no existe, guardarlo (checkPremiumStatus retorna false si no existe)
          // Por ahora guardamos siempre, luego optimizamos para no duplicar
          await GoogleSheetsService.saveUser({
            email: user.email,
            name: user.name || 'Usuario',
            image: user.image || undefined,
            isPremium: isPremium,
          })
          
          return true
        } catch (error) {
          console.error('Error guardando usuario:', error)
          return true // Permitir acceso aunque falle el guardado
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }