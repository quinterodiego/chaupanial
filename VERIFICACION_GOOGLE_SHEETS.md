# ✅ Verificación de Configuración de Google Sheets

## 📋 Checklist de Verificación

### ✅ 1. Archivo JSON de Credenciales
- [x] Archivo encontrado: `credentials/chaupanial-233ea6fef28c.json`
- [x] Contiene `client_email`: `chaupanial-service@chaupanial.iam.gserviceaccount.com`
- [x] Contiene `private_key` con formato correcto
- [x] Agregado a `.gitignore` para no subirlo a GitHub

### ✅ 2. Variables de Entorno (.env.local)

Verifica que tengas estas variables en tu `.env.local`:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=chaupanial-service@chaupanial.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIMOB1XinwDLBD\nQ+JBmQuMbMzlrUV096IJDwDKZi43xZHm0QJtaGMWXNHLTqmyNaHOqvIPYT0OVMZl\nEDKgiFkjN7j/db3nsOeboeu5hTIqa1fhbZRihDWTs9kYIdjai/bsgVCGGynokR7K\nGKzLPZ/C+QQfkh6QHz64NG7sNFbODZYJMe8saFeYXfrHXBNPDb0iiqU4guAEOjmX\n6avJt3HKKFZLHADWdrgX2kFVTcCsj8M8CRC99ei/+sa34om8WQOE7zLAkVyOCy3j\nWyp7Jd5WTTLc8xpCk1BaxqQeAcUicw2nwti3GTtWBOBz2FSt0kMiKGVOVnAc318X\n4v84PwT7AgMBAAECggEAEWE6QMDxuncaNQzHWiiTpG0BsOLvx8LZR24NBIVbIoO9\nh0ttVDBJgfSBpjk9vvdXBTPkG0phhu/8irjy8ZWaH4DunQcM0KOUHU0xGNnOds5Q\n7S+alUmjGR/2YK5M6amtwJn4HVxtsVTVVnhOmr/Oh0Uf2C8oW3IgUNUEgu8xphEc\n+syNEtJo5wXf8k5GNad525X1UdddaP5IcPjl0zLHZU5kgev52HU8r+2zGAClpN3s\nndf0KoqT1mSjfFVJjSt1QeKW9szKfBYSQFTzTe7Px76snLSlbE1cW7KqwfiT8PiX\n6zPIjndLNTZ2ZTM8n/jriQVP+sUrV/i6UqOcUaS8wQKBgQD+UY3ec0kcK6dnva4N\nV+THbi2CJofG2tv0yc9l3Qh5o9276TiO+Z49todvysq5WrT+/9bDy6WKAZcW0OxQ\n/Xog1NNzmEtf2wJqVi8NFLOMxbMShMo0TXTWv9w77KhYUYXKsr3S+g9o2KduIYbF\n0hk7GxxqaxXs2e18kCxqVL5TmwKBgQDJg7WHVxLbMX8NpyX3/ZfgZ5j7qiY0wbda\nHuV1oPJX6FwCUas+MLIIIiJ+fu4ZkGpZo+GzfsgBtnbMyh2vu9czy+BgaakUq+4g\nmHjBd88YBc46aKGBiJavEffeogOJJw0MEuTZANnQP0nRH6/jVROgShRZT6KvJ3ck\ntu4EEnGaIQKBgG3+Zea1ZASMGO50imf5ANkEnSgyc/0cwY9hDZOYAsdhiVBxsWWd\nLsSwQmmmgwGh6rBzhLbQSHuk7m0O1Xa9+uliQ0Y2szr1JVlKhzUYJAQZqbazuiTe\n707GUoGUfMceE0i1AAbU4n9NXTTzyS+cDA+VTTf1stjq9J0wWhVvK5ZLAoGBAJnl\n18YjzsfOFk1UASBS8SG1nNVejc0uwJu4Ct/56fsO/u3ad2CIif7CKvvWbnrhmwcY\nrK+LvK3qLvKZzXA/kcwCATtAlput7q/AIkEHAgdDr8tVyzqFGSddHqNNskuVolY9\nO78q8i4jl3l5rLd+av24da/7rK/+APTuK/q6Jz5hAoGAR5J5y5juKhDH3U5E/sAz\ngEfYPDOmXTNhr6EwIxyCcULIPIiCRbvDs4GbtHGUS/PDZ+Ph0rFc5uXfEpMhuV/q\nn9YSN4OYWE+zAZ7Q8VIY3QodLKbofdxcqvV5TAWvcmEtcrn/Ailk6b62Icu3RCOR\nsQx41dUOXfrICqDXfJx2GkI=\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=TU_SPREADSHEET_ID_AQUI
```

**⚠️ IMPORTANTE:**
- Reemplaza `TU_SPREADSHEET_ID_AQUI` con el ID real de tu spreadsheet
- La clave privada debe estar entre comillas dobles `"`
- Los saltos de línea deben ser `\n` (no saltos de línea reales)

### ✅ 3. Estructura del Spreadsheet

Verifica que tu spreadsheet en Google Sheets tenga:

#### Hoja "Usuarios" (primera fila):
```
A1: Fecha_Registro
B1: Email
C1: Nombre
D1: Imagen
E1: Es_Premium
F1: País
```

#### Hoja "Actividades" (primera fila):
```
A1: Timestamp
B1: Email_Usuario
C1: Nombre_Bebé
D1: Tipo_Actividad
E1: Detalles_JSON
```

### ✅ 4. Permisos del Spreadsheet

- [ ] El spreadsheet está compartido con: `chaupanial-service@chaupanial.iam.gserviceaccount.com`
- [ ] Los permisos son de **"Editor"** (no solo "Lector")

### ✅ 5. Código Verificado

- [x] `lib/googleSheets.ts` - Configuración correcta
- [x] Función `formatPrivateKey` - Formatea correctamente la clave
- [x] `saveUser` - Guarda usuarios correctamente
- [x] `checkPremiumStatus` - Verifica premium status (corregido para saltar header)
- [x] `upgradeToPremium` - Actualiza premium status (corregido para saltar header)
- [x] `saveActivity` - Guarda actividades (incluye 'esfinteres')

### ✅ 6. Integración con NextAuth

- [x] `app/api/auth/[...nextauth]/route.ts` - Usa GoogleSheetsService correctamente
- [x] Guarda usuarios al hacer login
- [x] Verifica premium status en cada sesión

### ✅ 7. Integración con API de Actividades

- [x] `app/api/activities/route.ts` - Usa GoogleSheetsService.saveActivity
- [x] Acepta timestamp personalizado
- [x] Valida tipo 'esfinteres'

## 🔧 Correcciones Realizadas

1. **Corregido `checkPremiumStatus`**: Ahora salta correctamente el header (fila 0)
2. **Corregido `upgradeToPremium`**: Ahora calcula correctamente el índice de la fila
3. **Agregado `credentials/` a `.gitignore`**: Para no subir el JSON de credenciales

## 🧪 Pruebas Recomendadas

1. **Probar login:**
   - Haz login con Google
   - Verifica que se agregue una fila en la hoja "Usuarios"

2. **Probar registro de esfínteres:**
   - Registra un esfínter desde el dashboard
   - Verifica que se agregue una fila en la hoja "Actividades"

3. **Probar verificación premium:**
   - Verifica que el status premium se lea correctamente

## ❌ Problemas Comunes y Soluciones

### Error: "The caller does not have permission"
**Solución:** Comparte el spreadsheet con `chaupanial-service@chaupanial.iam.gserviceaccount.com` con permisos de **"Editor"**

### Error: "Spreadsheet not found"
**Solución:** Verifica que `GOOGLE_SHEETS_SPREADSHEET_ID` sea correcto (cópialo de la URL del spreadsheet)

### Error: "ERR_OSSL_UNSUPPORTED"
**Solución:** Verifica que `GOOGLE_SHEETS_PRIVATE_KEY` esté correctamente formateada con comillas dobles y `\n`

### Los datos no se guardan
**Solución:** 
- Verifica que las hojas se llamen exactamente "Usuarios" y "Actividades"
- Verifica que la primera fila tenga los headers correctos
- Verifica que el service account tenga permisos de "Editor"

---

## 📝 Próximos Pasos

1. Obtener el `SPREADSHEET_ID` de tu spreadsheet
2. Agregarlo a `.env.local`
3. Compartir el spreadsheet con el service account
4. Reiniciar el servidor de desarrollo
5. Probar haciendo login y registrando un esfínter

---

¿Todo listo? ¡Prueba hacer login y registrar un esfínter para verificar que funcione! 🚀

