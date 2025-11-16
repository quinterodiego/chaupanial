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
    activityType: 'feeding' | 'sleep' | 'diaper' | 'milestone' | 'esfinteres' | 'growth'
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

  // Actualizar una actividad existente
  static async updateActivity(data: {
    userEmail: string
    originalTimestamp: string // Timestamp original para identificar la actividad
    babyName?: string
    activityType?: 'feeding' | 'sleep' | 'diaper' | 'milestone' | 'esfinteres'
    details?: any
    timestamp?: Date // Nuevo timestamp si se cambia la fecha/hora
  }) {
    try {
      // Obtener todas las actividades para encontrar la fila
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Actividades!A:E',
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { success: false, error: 'No se encontraron actividades' }
      }

      // Buscar la fila que coincide con el email y timestamp original
      const rowIndex = rows.findIndex((row, index) => {
        if (index === 0) return false // Saltar header
        return row[1] === data.userEmail && row[0] === data.originalTimestamp
      })

      if (rowIndex === -1) {
        return { success: false, error: 'Actividad no encontrada' }
      }

      // La fila en Sheets es rowIndex + 1 (porque las filas empiezan en 1)
      const sheetRow = rowIndex + 1

      // Preparar los valores actualizados
      const originalRow = rows[rowIndex]
      const newTimestamp = data.timestamp ? data.timestamp.toISOString() : originalRow[0]
      const newBabyName = data.babyName !== undefined ? data.babyName : originalRow[2]
      const newActivityType = data.activityType !== undefined ? data.activityType : originalRow[3]
      const newDetails = data.details !== undefined ? JSON.stringify(data.details) : originalRow[4]

      // Actualizar la fila completa
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Actividades!A${sheetRow}:E${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newTimestamp, data.userEmail, newBabyName, newActivityType, newDetails]],
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Error actualizando actividad:', error)
      return { success: false, error }
    }
  }

  // Eliminar una actividad
  static async deleteActivity(userEmail: string, timestamp: string) {
    try {
      // Obtener todas las actividades para encontrar la fila
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Actividades!A:E',
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { success: false, error: 'No se encontraron actividades' }
      }

      // Buscar la fila que coincide con el email y timestamp
      const rowIndex = rows.findIndex((row, index) => {
        if (index === 0) return false // Saltar header
        return row[1] === userEmail && row[0] === timestamp
      })

      if (rowIndex === -1) {
        return { success: false, error: 'Actividad no encontrada' }
      }

      // La fila en Sheets es rowIndex + 1 (porque las filas empiezan en 1)
      const sheetRow = rowIndex + 1

      // Obtener el sheetId de la hoja "Actividades"
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      })

      const activitiesSheet = spreadsheet.data.sheets?.find(
        sheet => sheet.properties?.title === 'Actividades'
      )

      if (!activitiesSheet?.properties?.sheetId) {
        return { success: false, error: 'No se encontró la hoja Actividades' }
      }

      const sheetId = activitiesSheet.properties.sheetId

      // Eliminar la fila usando batchUpdate
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex: sheetRow - 1, // El índice empieza en 0
                  endIndex: sheetRow, // End index es exclusivo
                },
              },
            },
          ],
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Error eliminando actividad:', error)
      return { success: false, error }
    }
  }

  // ========== FUNCIONES DE FAMILIA (PREMIUM) ==========

  // Obtener información de la familia (nombre del niño, usuarios compartidos)
  static async getFamilyInfo(userEmail: string) {
    try {
      // Intentar obtener información de la hoja Familias
      let familyInfo = {
        babyName: 'Bebé',
        sharedUsers: [] as Array<{ email: string; name: string; role: string; isOwner: boolean }>,
        familyId: null as string | null,
        userRole: 'padre' as string,
        userName: '' as string,
        isOwner: false as boolean,
      }

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Familias!A:E', // A=FamilyID, B=UserEmail, C=BabyName, D=IsOwner, E=Role
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
            
            // Obtener el nombre del niño (del owner o de cualquier miembro de la familia)
            // Primero intentar del owner
            const owner = familyMembers.find(row => {
              const isOwner = row[3]
              return isOwner === 'true' || isOwner === true || isOwner === 'TRUE'
            })
            
            if (owner && owner[2] && owner[2].trim()) {
              familyInfo.babyName = owner[2].trim()
            } else {
              // Si no hay owner o no tiene nombre, buscar en cualquier miembro de la familia
              const memberWithName = familyMembers.find(row => row[2] && row[2].trim())
              if (memberWithName && memberWithName[2]) {
                familyInfo.babyName = memberWithName[2].trim()
              }
            }
            
            // Obtener información de usuarios compartidos (excluyendo al usuario actual)
            // Primero obtener todos los emails de la familia
            const familyEmails = familyMembers
              .filter(row => row[1] !== userEmail)
              .map(row => row[1])
            
            // Obtener nombres de los usuarios desde la hoja Usuarios
            const usersInfo = await Promise.all(
              familyEmails.map(async (email) => {
                const userInfo = await this.getUserByEmail(email)
                return {
                  email,
                  name: userInfo.name || email.split('@')[0], // Si no tiene nombre, usar parte del email
                }
              })
            )
            
            // Crear mapa de emails a nombres
            const emailToName = new Map(usersInfo.map(u => [u.email, u.name]))
            
            // Mapear miembros con sus nombres
            familyInfo.sharedUsers = familyMembers
              .filter(row => row[1] !== userEmail)
              .map(row => ({
                email: row[1],
                name: emailToName.get(row[1]) || row[1].split('@')[0], // Nombre o parte del email
                role: row[4] || 'padre', // E=Role, por defecto 'padre'
                isOwner: row[3] === 'true' || row[3] === true || row[3] === 'TRUE',
              }))
            
            // Obtener el rol del usuario actual, nombre y si es owner
            const currentUser = familyMembers.find(row => row[1] === userEmail)
            if (currentUser) {
              familyInfo.userRole = currentUser[4] || 'padre'
              familyInfo.isOwner = currentUser[3] === 'true' || currentUser[3] === true || currentUser[3] === 'TRUE'
              
              // Obtener el nombre del usuario actual desde la hoja Usuarios
              const currentUserInfo = await this.getUserByEmail(userEmail)
              familyInfo.userName = currentUserInfo.name || userEmail.split('@')[0]
            }
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
        userRole: 'padre',
        userName: '',
        isOwner: false,
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
        // La hoja no existe, intentar crearla
        try {
          // Obtener información del spreadsheet para ver las hojas existentes
          const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
          })
          
          const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || []
          
          if (!existingSheets.includes('Familias')) {
            // Crear la hoja Familias usando batchUpdate
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: SPREADSHEET_ID,
              requestBody: {
                requests: [
                  {
                    addSheet: {
                      properties: {
                        title: 'Familias',
                      },
                    },
                  },
                ],
              },
            })
          }
          
          // Esperar un momento para que la hoja se cree
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Crear los headers
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Familias!A1:E1',
            valueInputOption: 'RAW',
            requestBody: {
              values: [['FamilyID', 'UserEmail', 'BabyName', 'IsOwner', 'Role']],
            },
          })
        } catch (createError) {
          console.error('Error creando hoja Familias:', createError)
          // Si no se puede crear la hoja, intentar usar update directamente
          // (puede que la hoja exista pero esté vacía)
          try {
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: 'Familias!A1:E1',
              valueInputOption: 'RAW',
              requestBody: {
                values: [['FamilyID', 'UserEmail', 'BabyName', 'IsOwner', 'Role']],
              },
            })
          } catch (updateError) {
            console.error('Error actualizando hoja Familias:', updateError)
            return { success: false, error: 'No se pudo crear la hoja Familias. Verifica que tengas permisos y que la hoja exista en Google Sheets.' }
          }
        }
      }

      // Generar un ID único para la familia
      const familyId = `family-${Date.now()}-${Math.random().toString(36).substring(7)}`

      // Agregar el owner a la familia (por defecto rol 'padre')
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[familyId, ownerEmail, babyName, true, 'padre']],
        },
      })

      return { success: true, familyId: familyId as string }
    } catch (error) {
      console.error('Error creando familia:', error)
      return { success: false, error }
    }
  }

  // Actualizar nombre del niño
  static async updateBabyName(userEmail: string, babyName: string) {
    try {
      let familyInfo = await this.getFamilyInfo(userEmail)
      
      if (!familyInfo.familyId) {
        // Si no tiene familia, crear una
        const createResult = await this.createFamily(userEmail, babyName)
        if (!createResult.success) {
          return createResult
        }
        // Obtener la información actualizada
        familyInfo = await this.getFamilyInfo(userEmail)
      }

      if (!familyInfo.familyId) {
        return { success: false, error: 'No se pudo crear o encontrar la familia' }
      }

      // Actualizar el nombre del niño en todos los registros de la familia
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:E',
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { success: false, error: 'Familia no encontrada' }
      }

      // Actualizar todas las filas de esta familia
      const familyRows = rows
        .map((row, index) => ({ row, index: index + 1 }))
        .filter(({ row, index }) => index > 0 && row[0] === familyInfo.familyId)

      // Actualizar todas las filas de la familia en un solo batch
      const updateRequests = familyRows.map(({ index }) => ({
        range: `Familias!C${index}`,
        values: [[babyName]],
      }))

      for (const updateRequest of updateRequests) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: updateRequest.range,
          valueInputOption: 'RAW',
          requestBody: {
            values: updateRequest.values,
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
  static async inviteUserToFamily(ownerEmail: string, invitedEmail: string, role: string = 'padre') {
    try {
      const familyInfo = await this.getFamilyInfo(ownerEmail)
      
      if (!familyInfo.familyId) {
        // Si no tiene familia, crear una
        const result = await this.createFamily(ownerEmail, 'Bebé')
        if (!result.success) {
          return { success: false, error: 'Error al crear familia' }
        }
        const newFamilyInfo = await this.getFamilyInfo(ownerEmail)
        familyInfo.familyId = newFamilyInfo.familyId || result.familyId || null
        familyInfo.babyName = newFamilyInfo.babyName
      }

      // Verificar que el usuario invitado existe
      const invitedUser = await this.getUserByEmail(invitedEmail)
      if (!invitedUser.exists) {
        return { success: false, error: 'El usuario no existe. Debe registrarse primero.' }
      }

      // Verificar que el usuario invitado no esté ya en la familia
      if (familyInfo.sharedUsers.some(user => user.email === invitedEmail)) {
        return { success: false, error: 'El usuario ya está en la familia' }
      }

      // Agregar el usuario invitado a la familia
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[familyInfo.familyId, invitedEmail, familyInfo.babyName, false, role]],
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Error invitando usuario:', error)
      return { success: false, error }
    }
  }

  // Actualizar rol de un usuario en la familia
  static async updateUserRole(userEmail: string, targetEmail: string, newRole: string) {
    try {
      const familyInfo = await this.getFamilyInfo(userEmail)
      
      if (!familyInfo.familyId) {
        return { success: false, error: 'No se encontró la familia' }
      }

      // Verificar que el usuario que hace la solicitud es el owner
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:E',
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { success: false, error: 'No se encontraron familias' }
      }

      // Verificar que el usuario actual es el owner
      const currentUserRow = rows.find((row, index) => index > 0 && row[1] === userEmail)
      if (!currentUserRow || (currentUserRow[3] !== 'true' && currentUserRow[3] !== true && currentUserRow[3] !== 'TRUE')) {
        return { success: false, error: 'Solo el dueño de la familia puede actualizar roles' }
      }

      // Buscar la fila del usuario objetivo
      const targetUserRowIndex = rows.findIndex((row, index) => {
        if (index === 0) return false // Saltar header
        return row[0] === familyInfo.familyId && row[1] === targetEmail
      })

      if (targetUserRowIndex === -1) {
        return { success: false, error: 'Usuario no encontrado en la familia' }
      }

      // La fila en Sheets es targetUserRowIndex + 1 (porque las filas empiezan en 1)
      const sheetRow = targetUserRowIndex + 1

      // Actualizar el rol
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Familias!E${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newRole]],
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Error actualizando rol:', error)
      return { success: false, error }
    }
  }

  // Actualizar el rol del usuario actual
  static async updateMyRole(userEmail: string, newRole: string) {
    try {
      const familyInfo = await this.getFamilyInfo(userEmail)
      
      if (!familyInfo.familyId) {
        return { success: false, error: 'No se encontró la familia' }
      }

      // Obtener todas las filas de la familia
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:E',
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { success: false, error: 'No se encontraron familias' }
      }

      // Buscar la fila del usuario actual
      const userRowIndex = rows.findIndex((row, index) => {
        if (index === 0) return false // Saltar header
        return row[0] === familyInfo.familyId && row[1] === userEmail
      })

      if (userRowIndex === -1) {
        return { success: false, error: 'Usuario no encontrado en la familia' }
      }

      // La fila en Sheets es userRowIndex + 1 (porque las filas empiezan en 1)
      const sheetRow = userRowIndex + 1

      // Actualizar el rol
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Familias!E${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newRole]],
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Error actualizando mi rol:', error)
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

  // ========== FUNCIONES DE COMUNIDAD ==========

  // Obtener todos los foros disponibles
  static async getForums() {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Foros!A:E', // A=ID, B=Nombre, C=Descripcion, D=Icono, E=Categoria
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        // Si no hay foros, crear los foros por defecto
        return await this.initializeDefaultForums()
      }

      // Saltar el header (fila 0)
      const forums = rows.slice(1).map(row => ({
        id: row[0],
        name: row[1] || '',
        description: row[2] || '',
        icon: row[3] || '💬',
        category: row[4] || 'general',
      }))

      return { forums }
    } catch (error) {
      console.error('Error obteniendo foros:', error)
      // Si la hoja no existe, crear los foros por defecto
      return await this.initializeDefaultForums()
    }
  }

  // Inicializar foros por defecto
  static async initializeDefaultForums() {
    try {
      // Verificar si la hoja Foros existe
      try {
        await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Foros!A1',
        })
      } catch (error) {
        // La hoja no existe, crearla
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
        })
        
        const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || []
        
        if (!existingSheets.includes('Foros')) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: 'Foros',
                    },
                  },
                },
              ],
            },
          })
          
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Crear headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Foros!A1:E1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ID', 'Nombre', 'Descripcion', 'Icono', 'Categoria']],
          },
        })
      }

      // Foros por defecto
      const defaultForums = [
        ['lactancia', 'Lactancia', 'Comparte experiencias y consejos sobre lactancia materna', '🍼', 'salud'],
        ['alimentacion', 'Alimentación', 'Tips y recetas para la alimentación complementaria', '🥄', 'salud'],
        ['sueño', 'Sueño', 'Consejos para ayudar a tu bebé a dormir mejor', '😴', 'desarrollo'],
        ['desarrollo', 'Desarrollo', 'Hitos del desarrollo y estimulación temprana', '👶', 'desarrollo'],
        ['salud', 'Salud General', 'Consultas sobre salud y bienestar del bebé', '🏥', 'salud'],
      ]

      // Agregar foros por defecto
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Foros!A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: defaultForums,
        },
      })

      return {
        forums: defaultForums.map(row => ({
          id: row[0],
          name: row[1],
          description: row[2],
          icon: row[3],
          category: row[4],
        })),
      }
    } catch (error) {
      console.error('Error inicializando foros:', error)
      // Retornar foros por defecto en memoria si falla
      return {
        forums: [
          { id: 'lactancia', name: 'Lactancia', description: 'Comparte experiencias sobre lactancia', icon: '🍼', category: 'salud' },
          { id: 'alimentacion', name: 'Alimentación', description: 'Tips de alimentación complementaria', icon: '🥄', category: 'salud' },
          { id: 'sueño', name: 'Sueño', description: 'Consejos para el sueño del bebé', icon: '😴', category: 'desarrollo' },
          { id: 'desarrollo', name: 'Desarrollo', description: 'Hitos del desarrollo', icon: '👶', category: 'desarrollo' },
          { id: 'salud', name: 'Salud General', description: 'Consultas sobre salud', icon: '🏥', category: 'salud' },
        ],
      }
    }
  }

  // Obtener posts de un foro
  static async getForumPosts(forumId: string, options?: { limit?: number }) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Posts!A:G', // A=ID, B=ForoID, C=UserEmail, D=Titulo, E=Contenido, F=Timestamp, G=Likes
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { posts: [] }
      }

      // Filtrar posts del foro (saltando header)
      const posts = rows
        .slice(1)
        .filter(row => row[1] === forumId)
        .map(row => {
          try {
            const likes = row[6] ? parseInt(row[6]) || 0 : 0
            return {
              id: row[0],
              forumId: row[1],
              userEmail: row[2],
              title: row[3] || '',
              content: row[4] || '',
              timestamp: row[5] || new Date().toISOString(),
              likes: likes,
            }
          } catch (error) {
            console.error('Error parseando post:', error)
            return null
          }
        })
        .filter(post => post !== null)
        .sort((a, b) => {
          // Ordenar por fecha descendente (más recientes primero)
          return new Date(b!.timestamp).getTime() - new Date(a!.timestamp).getTime()
        })

      // Aplicar límite si se proporciona
      const limitedPosts = options?.limit ? posts.slice(0, options.limit) : posts

      return { posts: limitedPosts }
    } catch (error) {
      console.error('Error obteniendo posts:', error)
      return { posts: [] }
    }
  }

  // Crear un nuevo post (solo Premium)
  static async createPost(data: {
    forumId: string
    userEmail: string
    title: string
    content: string
  }) {
    try {
      // Verificar si la hoja Posts existe
      try {
        await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Posts!A1',
        })
      } catch (error) {
        // Crear la hoja Posts
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
        })
        
        const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || []
        
        if (!existingSheets.includes('Posts')) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: 'Posts',
                    },
                  },
                },
              ],
            },
          })
          
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Crear headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Posts!A1:G1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ID', 'ForoID', 'UserEmail', 'Titulo', 'Contenido', 'Timestamp', 'Likes']],
          },
        })
      }

      const postId = `post-${Date.now()}-${Math.random().toString(36).substring(7)}`
      const timestamp = new Date().toISOString()

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Posts!A:G',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[postId, data.forumId, data.userEmail, data.title, data.content, timestamp, 0]],
        },
      })

      return { success: true, postId }
    } catch (error) {
      console.error('Error creando post:', error)
      return { success: false, error }
    }
  }

  // Obtener comentarios de un post
  static async getPostComments(postId: string) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Comentarios!A:E', // A=ID, B=PostID, C=UserEmail, D=Contenido, E=Timestamp
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { comments: [] }
      }

      // Filtrar comentarios del post (saltando header)
      const comments = rows
        .slice(1)
        .filter(row => row[1] === postId)
        .map(row => ({
          id: row[0],
          postId: row[1],
          userEmail: row[2],
          content: row[3] || '',
          timestamp: row[4] || new Date().toISOString(),
        }))
        .sort((a, b) => {
          // Ordenar por fecha ascendente (más antiguos primero)
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        })

      return { comments }
    } catch (error) {
      console.error('Error obteniendo comentarios:', error)
      return { comments: [] }
    }
  }

  // Crear un comentario
  static async createComment(data: {
    postId: string
    userEmail: string
    content: string
  }) {
    try {
      // Verificar si la hoja Comentarios existe
      try {
        await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Comentarios!A1',
        })
      } catch (error) {
        // Crear la hoja Comentarios
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
        })
        
        const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || []
        
        if (!existingSheets.includes('Comentarios')) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: 'Comentarios',
                    },
                  },
                },
              ],
            },
          })
          
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Crear headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Comentarios!A1:E1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ID', 'PostID', 'UserEmail', 'Contenido', 'Timestamp']],
          },
        })
      }

      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(7)}`
      const timestamp = new Date().toISOString()

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Comentarios!A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[commentId, data.postId, data.userEmail, data.content, timestamp]],
        },
      })

      return { success: true, commentId }
    } catch (error) {
      console.error('Error creando comentario:', error)
      return { success: false, error }
    }
  }

  // Contar comentarios del usuario en el día actual
  static async getTodayCommentCount(userEmail: string): Promise<number> {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Comentarios!A:E', // A=ID, B=PostID, C=UserEmail, D=Contenido, E=Timestamp
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return 0
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      today.setHours(0, 0, 0, 0)

      const todayComments = rows
        .slice(1) // Saltar header
        .filter(row => {
          if (row[2] !== userEmail) return false // C=UserEmail
          
          try {
            const commentDate = new Date(row[4]) // E=Timestamp
            commentDate.setHours(0, 0, 0, 0)
            return commentDate.getTime() === today.getTime()
          } catch (error) {
            return false
          }
        })

      return todayComments.length
    } catch (error) {
      console.error('Error contando comentarios:', error)
      return 0
    }
  }

  // Obtener información del usuario para mostrar en posts/comentarios
  static async getUserInfoForCommunity(email: string) {
    try {
      const user = await this.getUserByEmail(email)
      return {
        name: user.name || email.split('@')[0],
        image: user.image || '',
        email: email,
      }
    } catch (error) {
      console.error('Error obteniendo info de usuario:', error)
      return {
        name: email.split('@')[0],
        image: '',
        email: email,
      }
    }
  }
}