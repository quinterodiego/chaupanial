import { google } from 'googleapis'

// Función para formatear correctamente la clave privada
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined
  
  // Reemplazar \\n por saltos de línea reales
  let formatted = key.replace(/\\n/g, '\n')
  
  // Asegurar que tenga los headers correctos
  if (!formatted.includes('BEGIN PRIVATE KEY') && !formatted.includes('BEGIN RSA PRIVATE KEY')) {
    // Si no tiene headers, asumimos que es solo el contenido
    formatted = `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----\n`
  }
  
  return formatted
}

// Configuración de Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: formatPrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

export class GoogleSheetsService {
  // Guardar nuevo usuario
  static async saveUser(userData: {
    email: string
    name: string
    image?: string
    isPremium?: boolean
  }) {
    try {
      const values = [
        [
          new Date().toISOString(),
          userData.email,
          userData.name,
          userData.image || '',
          userData.isPremium || false,
          '', // País (opcional)
        ]
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Usuarios!A:F',
        valueInputOption: 'RAW',
        requestBody: { values },
      })

      return { success: true }
    } catch (error) {
      console.error('Error guardando usuario:', error)
      return { success: false, error }
    }
  }

  // Verificar si usuario existe y obtener su información
  static async getUserByEmail(email: string): Promise<{
    exists: boolean
    rowIndex: number
    isPremium: boolean
    name?: string
    image?: string
  }> {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Usuarios!B:F', // B=Email, C=Nombre, D=Imagen, E=Premium, F=País
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { exists: false, rowIndex: -1, isPremium: false }
      }

      // Buscar el email del usuario (saltando el header en la fila 0)
      // row[0] = Email (columna B)
      // row[1] = Nombre (columna C)
      // row[2] = Imagen (columna D)
      // row[3] = Premium (columna E)
      const userRowIndex = rows.findIndex((row, index) => index > 0 && row[0] === email)
      
      if (userRowIndex === -1) {
        return { exists: false, rowIndex: -1, isPremium: false }
      }

      const userRow = rows[userRowIndex]
      return {
        exists: true,
        rowIndex: userRowIndex, // Índice en el array (0=header, 1=primer usuario)
        isPremium: Boolean(userRow[3]),
        name: userRow[1],
        image: userRow[2],
      }
    } catch (error) {
      console.error('Error verificando usuario:', error)
      return { exists: false, rowIndex: -1, isPremium: false }
    }
  }

  // Verificar si usuario es premium (método de compatibilidad)
  static async checkPremiumStatus(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email)
    return user.isPremium
  }

  // Actualizar información del usuario existente
  static async updateUser(userData: {
    email: string
    name?: string
    image?: string
    isPremium?: boolean
  }) {
    try {
      const user = await this.getUserByEmail(userData.email)
      
      if (!user.exists) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      // Calcular la fila en Sheets (rowIndex + 1 porque las filas empiezan en 1, y +1 porque la fila 1 es el header)
      const sheetRow = user.rowIndex + 1

      // Actualizar solo los campos que se proporcionaron
      const updates: Array<{ range: string; values: any[][] }> = []

      if (userData.name !== undefined) {
        updates.push({
          range: `Usuarios!C${sheetRow}`,
          values: [[userData.name]]
        })
      }

      if (userData.image !== undefined) {
        updates.push({
          range: `Usuarios!D${sheetRow}`,
          values: [[userData.image || '']]
        })
      }

      if (userData.isPremium !== undefined) {
        updates.push({
          range: `Usuarios!E${sheetRow}`,
          values: [[userData.isPremium]]
        })
      }

      // Ejecutar todas las actualizaciones
      for (const update of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: update.range,
          valueInputOption: 'RAW',
          requestBody: { values: update.values },
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      return { success: false, error }
    }
  }

  // Actualizar usuario a premium
  static async upgradeToPremium(email: string) {
    try {
      // Primero encontrar la fila del usuario
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Usuarios!B:E', // B=Email, C=Nombre, D=Imagen, E=Premium
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) throw new Error('No hay usuarios en la base de datos')
      
      // La primera fila es el header, así que buscamos desde la fila 1
      const userRowIndex = rows.findIndex((row, index) => index > 0 && row[0] === email)
      if (userRowIndex === -1) throw new Error('Usuario no encontrado')

      // Actualizar el status premium (columna E)
      // userRowIndex ya es el índice en el array (0=header, 1=primer usuario, etc.)
      // Pero en Sheets, las filas empiezan en 1, y la fila 1 es el header
      // Entonces la fila del usuario es userRowIndex + 1
      const range = `Usuarios!E${userRowIndex + 1}`
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[true]]
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Error actualizando a premium:', error)
      return { success: false, error }
    }
  }

  // Guardar registro de actividad del bebé
  static async saveActivity(data: {
    userEmail: string
    babyName: string
    activityType: 'feeding' | 'sleep' | 'diaper' | 'milestone' | 'esfinteres'
    details: any
    timestamp: Date
  }) {
    try {
      const values = [
        [
          data.timestamp.toISOString(),
          data.userEmail,
          data.babyName,
          data.activityType,
          JSON.stringify(data.details),
        ]
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Actividades!A:E',
        valueInputOption: 'RAW',
        requestBody: { values },
      })

      return { success: true }
    } catch (error) {
      console.error('Error guardando actividad:', error)
      return { success: false, error }
    }
  }

  // Obtener actividades del usuario
  static async getActivities(userEmail: string, options?: {
    limit?: number
    startDate?: Date
    endDate?: Date
  }) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Actividades!A:E', // A=Timestamp, B=Email, C=BabyName, D=Type, E=Details
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { activities: [], monthlyCount: 0 }
      }

      // Filtrar por email del usuario (saltando el header en la fila 0)
      // row[0] = Timestamp
      // row[1] = Email_Usuario
      // row[2] = Nombre_Bebé
      // row[3] = Tipo_Actividad
      // row[4] = Detalles_JSON
      const userActivities = rows
        .filter((row, index) => index > 0 && row[1] === userEmail)
        .map((row, index) => {
          try {
            const details = row[4] ? JSON.parse(row[4]) : {}
            return {
              id: `activity-${index}-${row[0]}`,
              timestamp: row[0],
              type: row[3] || 'esfinteres',
              details: details,
              babyName: row[2] || 'Bebé',
            }
          } catch (error) {
            console.error('Error parseando detalles:', error)
            return {
              id: `activity-${index}-${row[0]}`,
              timestamp: row[0],
              type: row[3] || 'esfinteres',
              details: {},
              babyName: row[2] || 'Bebé',
            }
          }
        })
        .filter(activity => {
          // Filtrar por fecha si se proporciona
          if (options?.startDate) {
            const activityDate = new Date(activity.timestamp)
            if (activityDate < options.startDate) return false
          }
          if (options?.endDate) {
            const activityDate = new Date(activity.timestamp)
            if (activityDate > options.endDate) return false
          }
          return true
        })
        .sort((a, b) => {
          // Ordenar por fecha descendente (más recientes primero)
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })

      // Contar registros del mes actual
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyCount = userActivities.filter(activity => {
        const activityDate = new Date(activity.timestamp)
        return activityDate >= startOfMonth
      }).length

      // Aplicar límite si se proporciona
      const activities = options?.limit 
        ? userActivities.slice(0, options.limit)
        : userActivities

      return { activities, monthlyCount }
    } catch (error) {
      console.error('Error obteniendo actividades:', error)
      return { activities: [], monthlyCount: 0 }
    }
  }
}