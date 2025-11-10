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
      // Guardar o actualizar el usuario en Google Sheets
      if (account?.provider === 'google' && user.email) {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await GoogleSheetsService.getUserByEmail(user.email)
          
          if (existingUser.exists) {
            // Usuario existe: actualizar información si cambió
            await GoogleSheetsService.updateUser({
              email: user.email,
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              // No actualizar isPremium aquí, se mantiene el valor existente
            })
          } else {
            // Usuario nuevo: guardarlo
            await GoogleSheetsService.saveUser({
              email: user.email,
              name: user.name || 'Usuario',
              image: user.image || undefined,
              isPremium: false, // Nuevo usuario empieza como gratuito
            })
          }
          
          return true
        } catch (error) {
          console.error('Error guardando/actualizando usuario:', error)
          return true // Permitir acceso aunque falle el guardado
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Si el usuario viene de un login exitoso, redirigir al dashboard
      if (url === baseUrl || url === `${baseUrl}/` || url.startsWith(`${baseUrl}/api/auth`)) {
        return `${baseUrl}/dashboard`
      }
      // Si hay una URL específica, usarla
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Por defecto, redirigir al dashboard
      return `${baseUrl}/dashboard`
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