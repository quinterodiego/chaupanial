import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

// GET: Obtener perfil del niño
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userEmail = session.user.email
    
    // Obtener información de la familia (que incluye el nombre del niño)
    const familyInfo = await GoogleSheetsService.getFamilyInfo(userEmail)
    
    // Si tiene familia pero el nombre es "Bebé" (valor por defecto), considerar que no completó onboarding
    // Si tiene un nombre personalizado, considerar que ya completó el onboarding
    const hasCompletedOnboarding = familyInfo.familyId && 
                                   familyInfo.babyName && 
                                   familyInfo.babyName !== 'Bebé' &&
                                   familyInfo.babyName.trim() !== ''
    
    if (!hasCompletedOnboarding) {
      return NextResponse.json({ 
        hasProfile: false,
        profile: null 
      })
    }

    // Obtener fecha de nacimiento desde la hoja Familias (columna F)
    let birthDate = null
    try {
      const { google } = require('googleapis')
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })
      const sheets = google.sheets({ version: 'v4', auth })
      const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Familias!A:F', // A=FamilyID, B=UserEmail, C=BabyName, D=IsOwner, E=Role, F=BirthDate
      })

      const rows = response.data.values || []
      const userRow = rows.find((row: any[], index: number) => index > 0 && row[1] === userEmail)
      
      if (userRow && userRow[5]) {
        birthDate = userRow[5]
      }
    } catch (error) {
      console.error('Error obteniendo fecha de nacimiento:', error)
      // No fallar si no se puede obtener la fecha
    }
    
    return NextResponse.json({
      hasProfile: true,
      profile: {
        name: familyInfo.babyName,
        birthDate: birthDate,
      }
    })
  } catch (error) {
    console.error('Error en GET /api/child-profile:', error)
    return NextResponse.json(
      { error: 'Error al obtener el perfil' },
      { status: 500 }
    )
  }
}

// POST: Guardar perfil del niño (onboarding)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, birthDate } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const userEmail = session.user.email

    // Verificar si ya tiene familia
    let familyInfo = await GoogleSheetsService.getFamilyInfo(userEmail)
    
    // Guardar fecha de nacimiento en la hoja Familias (columna F)
    const { google } = require('googleapis')
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

    if (!familyInfo.familyId) {
      // Crear familia con el nombre del niño
      const createResult = await GoogleSheetsService.createFamily(userEmail, name)
      if (!createResult.success) {
        return NextResponse.json(
          { error: 'Error al crear el perfil' },
          { status: 500 }
        )
      }
      familyInfo = await GoogleSheetsService.getFamilyInfo(userEmail)
      
      // Si se creó la familia, guardar la fecha de nacimiento (incluso si está vacía)
      if (familyInfo.familyId) {
        try {
          // Obtener la fila del usuario recién creada
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Familias!A:F',
          })

          const rows = response.data.values || []
          const userRowIndex = rows.findIndex((row: any[], index: number) => 
            index > 0 && row[1] === userEmail && row[0] === familyInfo.familyId
          )

          if (userRowIndex > 0) {
            const sheetRow = userRowIndex + 1
            const birthDateValue = birthDate || ''
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: `Familias!F${sheetRow}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [[birthDateValue]],
              },
            })
          }
        } catch (error) {
          console.error('Error guardando fecha de nacimiento al crear familia:', error)
        }
      }
    } else {
      // Actualizar nombre del niño si ya tiene familia
      await GoogleSheetsService.updateBabyName(userEmail, name)
      
      // Actualizar fecha de nacimiento en todas las filas de la familia
      // Guardar incluso si es null o vacío (para poder borrarla)
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Familias!A:F', // A=FamilyID, B=UserEmail, C=BabyName, D=IsOwner, E=Role, F=BirthDate
        })

        const rows = response.data.values || []
        
                 // Buscar todas las filas de la familia para actualizar la fecha de nacimiento
                 const familyRows = rows
                   .map((row: any[], index: number) => ({ row, index: index + 1 }))
                   .filter(({ row, index }: { row: any[], index: number }) => index > 1 && row[0] === familyInfo.familyId)

        // Actualizar fecha de nacimiento en todas las filas de la familia (columna F)
        // Usar cadena vacía si birthDate es null o undefined
        const birthDateValue = birthDate || ''
        for (const { index } of familyRows) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Familias!F${index}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [[birthDateValue]],
            },
          })
        }
      } catch (error) {
        console.error('Error guardando fecha de nacimiento:', error)
        // No fallar si no se puede guardar la fecha, el nombre ya se guardó
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        name,
        birthDate,
      }
    })
  } catch (error) {
    console.error('Error en POST /api/child-profile:', error)
    return NextResponse.json(
      { error: 'Error al guardar el perfil' },
      { status: 500 }
    )
  }
}

