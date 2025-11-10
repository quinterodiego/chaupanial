# 🔧 Solución: Error de Google Sheets API (ERR_OSSL_UNSUPPORTED)

## Problema

Si ves este error:
```
Error: error:1E08010C:DECODER routines::unsupported
ERR_OSSL_UNSUPPORTED
```

Significa que la clave privada de Google Sheets no está correctamente formateada en tu archivo `.env.local`.

## Solución

### 1. Verificar el formato de la clave privada

La clave privada debe estar en este formato en tu `.env.local`:

```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Importante:**
- Debe estar entre comillas dobles `"`
- Debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Los saltos de línea deben ser `\n` (no saltos de línea reales)
- No debe tener espacios extra al inicio o final

### 2. Cómo obtener la clave privada correctamente

1. Descarga el archivo JSON de credenciales desde Google Cloud Console
2. Abre el archivo JSON
3. Copia el valor de `private_key` (incluye los headers)
4. En tu `.env.local`, pégalo así:

```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_AQUI\n-----END PRIVATE KEY-----\n"
```

**Ejemplo completo:**
```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS0+f6Fm+5U9b+LvF8B5U9F5v5F5v5F5v5F5v5F5v5F5v5F\n-----END PRIVATE KEY-----\n"
```

### 3. Verificar que las variables estén configuradas

Asegúrate de tener estas variables en tu `.env.local`:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=tu-spreadsheet-id
```

### 4. Si el error persiste

1. **Verifica que el archivo `.env.local` esté en la raíz del proyecto**
2. **Reinicia el servidor de desarrollo** después de cambiar `.env.local`
3. **Verifica que no haya espacios extra** antes o después de las comillas
4. **Asegúrate de que la clave privada esté completa** (no cortada)

### 5. Alternativa: Usar JWT directamente

Si el problema persiste, puedes usar el método JWT directamente:

```typescript
import { JWT } from 'google-auth-library'

const jwtClient = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: formatPrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
```

## Nota importante

- **NUNCA** subas tu archivo `.env.local` a GitHub
- La clave privada es sensible y debe mantenerse secreta
- Si expones la clave, revócala inmediatamente en Google Cloud Console

---

¿Necesitas ayuda? Verifica que tu clave privada esté correctamente formateada con los headers y los `\n` para los saltos de línea.

