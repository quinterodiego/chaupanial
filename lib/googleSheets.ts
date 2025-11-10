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

  // ========== FUNCIONES DE FAMILIA (PREMIUM) ==========

  // Obtener información de la familia (nombre del niño, usuarios compartidos)
  static async getFamilyInfo(userEmail: string) {
    try {
      // Intentar obtener información de la hoja Familias
      let familyInfo = {
        babyName: 'Bebé',
        sharedUsers: [] as string[],
        familyId: null as string | null,
      }

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Familias!A:D', // A=FamilyID, B=UserEmail, C=BabyName, D=IsOwner
        })

        const rows = response.data.values
        if (rows && rows.length > 1) {
          // Buscar el usuario en las familias
          const userFamily = rows.find((row, index) => index > 0 && row[1] === userEmail)
          
          if (userFamily) {
            const familyId = userFamily[0]
            familyInfo.familyId = familyId
            
            // Obtener todos los usuarios de esta familia
            const familyMembers = rows.filter((row, index) => index > 0 && row[0] === familyId)
            
            // Obtener el nombre del niño (del owner)
            const owner = familyMembers.find(row => row[3] === 'true' || row[3] === true)
            if (owner && owner[2]) {
              familyInfo.babyName = owner[2]
            }
            
            // Obtener emails de usuarios compartidos (excluyendo al usuario actual)
            familyInfo.sharedUsers = familyMembers
              .filter(row => row[1] !== userEmail)
              .map(row => row[1])
          }
        }
      } catch (error) {
        // Si la hoja Familias no existe, crear una familia por defecto
        console.log('Hoja Familias no existe, creando familia por defecto')
        await this.createFamily(userEmail, 'Bebé')
        familyInfo.babyName = 'Bebé'
      }

      return familyInfo
    } catch (error) {
      console.error('Error obteniendo información de familia:', error)
      return {
        babyName: 'Bebé',
        sharedUsers: [],
        familyId: null,
      }
    }
  }

  // Crear una nueva familia
  static async createFamily(ownerEmail: string, babyName: string) {
    try {
      // Verificar si la hoja Familias existe, si no, crearla
      try {
        await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Familias!A1',
        })
      } catch (error) {
        // Crear la hoja Familias con headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Familias!A1:D1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [['FamilyID', 'UserEmail', 'BabyName', 'IsOwner']],
          },
        })
      }

      // Generar un ID único para la familia
      const familyId = `family-${Date.now()}-${Math.random().toString(36).substring(7)}`

      // Agregar el owner a la familia
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:D',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[familyId, ownerEmail, babyName, true]],
        },
      })

      return { success: true, familyId }
    } catch (error) {
      console.error('Error creando familia:', error)
      return { success: false, error }
    }
  }

  // Actualizar nombre del niño
  static async updateBabyName(userEmail: string, babyName: string) {
    try {
      const familyInfo = await this.getFamilyInfo(userEmail)
      
      if (!familyInfo.familyId) {
        // Si no tiene familia, crear una
        return await this.createFamily(userEmail, babyName)
      }

      // Actualizar el nombre del niño en todos los registros de la familia
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:D',
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { success: false, error: 'Familia no encontrada' }
      }

      // Actualizar todas las filas de esta familia
      const familyRows = rows
        .map((row, index) => ({ row, index: index + 1 }))
        .filter(({ row }) => row[0] === familyInfo.familyId)

      for (const { index } of familyRows) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Familias!C${index}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[babyName]],
          },
        })
      }

      // También actualizar el nombre en todas las actividades de la familia
      const activitiesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Actividades!A:E',
      })

      const activityRows = activitiesResponse.data.values
      if (activityRows && activityRows.length > 1) {
        const familyEmails = familyRows.map(({ row }) => row[1])
        
        for (let i = 1; i < activityRows.length; i++) {
          if (familyEmails.includes(activityRows[i][1])) {
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: `Actividades!C${i + 1}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [[babyName]],
              },
            })
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error actualizando nombre del niño:', error)
      return { success: false, error }
    }
  }

  // Invitar usuario a la familia
  static async inviteUserToFamily(ownerEmail: string, invitedEmail: string) {
    try {
      const familyInfo = await this.getFamilyInfo(ownerEmail)
      
      if (!familyInfo.familyId) {
        // Si no tiene familia, crear una
        const result = await this.createFamily(ownerEmail, 'Bebé')
        if (!result.success) {
          return { success: false, error: 'Error al crear familia' }
        }
        const newFamilyInfo = await this.getFamilyInfo(ownerEmail)
        familyInfo.familyId = newFamilyInfo.familyId || result.familyId
        familyInfo.babyName = newFamilyInfo.babyName
      }

      // Verificar que el usuario invitado existe
      const invitedUser = await this.getUserByEmail(invitedEmail)
      if (!invitedUser.exists) {
        return { success: false, error: 'El usuario no existe. Debe registrarse primero.' }
      }

      // Verificar que el usuario invitado no esté ya en la familia
      if (familyInfo.sharedUsers.includes(invitedEmail)) {
        return { success: false, error: 'El usuario ya está en la familia' }
      }

      // Agregar el usuario invitado a la familia
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:D',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[familyInfo.familyId, invitedEmail, familyInfo.babyName, false]],
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Error invitando usuario:', error)
      return { success: false, error }
    }
  }

  // Obtener actividades compartidas (para usuarios Premium con familia)
  static async getSharedActivities(userEmail: string, options?: {
    limit?: number
    startDate?: Date
    endDate?: Date
  }) {
    try {
      const familyInfo = await this.getFamilyInfo(userEmail)
      
      // Si no tiene familia, usar getActivities normal
      if (!familyInfo.familyId) {
        return await this.getActivities(userEmail, options)
      }

      // Obtener todos los emails de la familia
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:B',
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return await this.getActivities(userEmail, options)
      }

      const familyEmails = rows
        .filter((row, index) => index > 0 && row[0] === familyInfo.familyId)
        .map(row => row[1])

      // Obtener actividades de todos los miembros de la familia
      const activitiesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Actividades!A:E',
      })

      const activityRows = activitiesResponse.data.values
      if (!activityRows || activityRows.length === 0) {
        return { activities: [], monthlyCount: 0 }
      }

      // Filtrar actividades de miembros de la familia
      const sharedActivities = activityRows
        .filter((row, index) => index > 0 && familyEmails.includes(row[1]))
        .map((row, index) => {
          try {
            const details = row[4] ? JSON.parse(row[4]) : {}
            return {
              id: `activity-${index}-${row[0]}`,
              timestamp: row[0],
              type: row[3] || 'esfinteres',
              details: details,
              babyName: row[2] || familyInfo.babyName,
              userEmail: row[1],
            }
          } catch (error) {
            console.error('Error parseando detalles:', error)
            return {
              id: `activity-${index}-${row[0]}`,
              timestamp: row[0],
              type: row[3] || 'esfinteres',
              details: {},
              babyName: row[2] || familyInfo.babyName,
              userEmail: row[1],
            }
          }
        })
        .filter(activity => {
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
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })

      // Contar registros del mes actual
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyCount = sharedActivities.filter(activity => {
        const activityDate = new Date(activity.timestamp)
        return activityDate >= startOfMonth
      }).length

      // Aplicar límite si se proporciona
      const activities = options?.limit 
        ? sharedActivities.slice(0, options.limit)
        : sharedActivities

      return { activities, monthlyCount }
    } catch (error) {
      console.error('Error obteniendo actividades compartidas:', error)
      return { activities: [], monthlyCount: 0 }
    }
  }
}