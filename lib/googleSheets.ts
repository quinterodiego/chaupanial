import { google } from 'googleapis'

// Configuración de Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
          'Argentina', // País por defecto
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

  // Verificar si usuario es premium
  static async checkPremiumStatus(email: string): Promise<boolean> {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Usuarios!B:E', // Email a Premium status
      })

      const rows = response.data.values
      if (!rows) return false

      // Buscar el email del usuario
      const userRow = rows.find(row => row[0] === email)
      return userRow ? Boolean(userRow[3]) : false
    } catch (error) {
      console.error('Error verificando premium:', error)
      return false
    }
  }

  // Actualizar usuario a premium
  static async upgradeToPremium(email: string) {
    try {
      // Primero encontrar la fila del usuario
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Usuarios!B:E',
      })

      const rows = response.data.values
      if (!rows) throw new Error('Usuario no encontrado')

      const userRowIndex = rows.findIndex(row => row[0] === email)
      if (userRowIndex === -1) throw new Error('Usuario no encontrado')

      // Actualizar el status premium (columna E, índice 3)
      const range = `Usuarios!E${userRowIndex + 1}` // +1 porque las filas empiezan en 1
      
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
    activityType: 'feeding' | 'sleep' | 'diaper' | 'milestone'
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
}