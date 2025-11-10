# 📊 Guía Completa: Configurar Google Sheets como Base de Datos

## 📋 Pasos para Configurar Google Sheets

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Haz clic en **"Nuevo Proyecto"**
4. Nombre del proyecto: `Chau Pañal` (o el que prefieras)
5. Haz clic en **"Crear"**
6. Espera a que se cree el proyecto y selecciónalo

### 2. Habilitar Google Sheets API

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google Sheets API"**
3. Haz clic en **"Habilitar"**
4. También habilita **"Google Drive API"** (necesaria para crear/editar spreadsheets)

### 3. Crear Service Account

1. Ve a **"IAM y administración"** → **"Cuentas de servicio"**
2. Haz clic en **"+ CREAR CUENTA DE SERVICIO"**
3. Completa:
   - **Nombre**: `chaupanial-service`
   - **ID**: Se genera automáticamente
   - **Descripción**: `Service account para Chau Pañal`
4. Haz clic en **"Crear y continuar"**
5. En **"Otorgar acceso a esta cuenta de servicio"**, puedes saltar este paso por ahora
6. Haz clic en **"Listo"**

### 4. Crear y Descargar Credenciales JSON

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear (`chaupanial-service`)
2. Ve a la pestaña **"Claves"**
3. Haz clic en **"Agregar clave"** → **"Crear nueva clave"**
4. Selecciona **"JSON"**
5. Haz clic en **"Crear"**
6. **¡IMPORTANTE!** Se descargará un archivo JSON. Guárdalo en un lugar seguro.

### 5. Extraer Información del JSON

Abre el archivo JSON descargado. Necesitarás estos valores:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "chaupanial-service@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

**Valores que necesitas:**
- `client_email`: El email del service account
- `private_key`: La clave privada completa (incluye los headers)

### 6. Crear el Spreadsheet en Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea un nuevo spreadsheet llamado **"Chau Pañal - Base de Datos"**
3. Crea las siguientes hojas (pestañas en la parte inferior):

#### Hoja 1: "Usuarios"
Crea esta estructura en la primera fila (A1-F1):
```
A1: Fecha_Registro
B1: Email
C1: Nombre
D1: Imagen
E1: Es_Premium
F1: País
```

#### Hoja 2: "Actividades"
Crea esta estructura en la primera fila (A1-E1):
```
A1: Timestamp
B1: Email_Usuario
C1: Nombre_Bebé
D1: Tipo_Actividad
E1: Detalles_JSON
```

#### Hoja 3: "Pagos" (opcional, para futuro)
```
A1: Fecha_Pago
B1: Email_Usuario
C1: Monto
D1: Estado
E1: Transaction_ID
```

### 7. Compartir el Spreadsheet con el Service Account

1. En tu spreadsheet, haz clic en el botón **"Compartir"** (arriba a la derecha)
2. En el campo de email, pega el **`client_email`** del JSON (ejemplo: `chaupanial-service@tu-proyecto.iam.gserviceaccount.com`)
3. **IMPORTANTE:** Dale permisos de **"Editor"** (no solo "Lector")
4. Desmarca la opción **"Notificar a las personas"** (no es necesario)
5. Haz clic en **"Compartir"**

### 8. Obtener el Spreadsheet ID

1. Abre tu spreadsheet en Google Sheets
2. Mira la URL en el navegador:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_AQUI/edit
   ```
3. Copia el **SPREADSHEET_ID** (la parte larga entre `/d/` y `/edit`)

### 9. Configurar Variables de Entorno

Abre tu archivo `.env.local` y agrega estas variables:

```env
# Google Sheets API
GOOGLE_SHEETS_CLIENT_EMAIL=chaupanial-service@tu-proyecto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=tu-spreadsheet-id-aqui
```

**⚠️ IMPORTANTE sobre GOOGLE_SHEETS_PRIVATE_KEY:**
- Debe estar entre comillas dobles `"`
- Debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Los saltos de línea deben ser `\n` (no saltos de línea reales)
- Copia el valor completo de `private_key` del JSON

**Ejemplo completo:**
```env
GOOGLE_SHEETS_CLIENT_EMAIL=chaupanial-service@mi-proyecto-123456.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
```

### 10. Verificar la Configuración

1. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```
2. Intenta hacer login y registrar una actividad
3. Ve a tu spreadsheet y verifica que se hayan agregado los datos

## 🔍 Verificación de la Estructura

### Hoja "Usuarios"
Debería verse así después de que alguien se registre:
```
Fecha_Registro          | Email                    | Nombre    | Imagen | Es_Premium | País
2024-01-15T10:30:00Z   | usuario@gmail.com        | Juan      | url    | FALSE      | Argentina
```

### Hoja "Actividades"
Debería verse así después de registrar un esfínter:
```
Timestamp               | Email_Usuario            | Nombre_Bebé | Tipo_Actividad | Detalles_JSON
2024-01-15T14:30:00Z   | usuario@gmail.com        | Bebé        | esfinteres     | {"type":"pipi","notes":"..."}
```

## ❌ Solución de Problemas Comunes

### Error: "The caller does not have permission"
- **Solución:** Verifica que compartiste el spreadsheet con el `client_email` del service account con permisos de **"Editor"**

### Error: "ERR_OSSL_UNSUPPORTED"
- **Solución:** Verifica que `GOOGLE_SHEETS_PRIVATE_KEY` esté correctamente formateada con comillas dobles y `\n` para los saltos de línea

### Error: "Spreadsheet not found"
- **Solución:** Verifica que el `GOOGLE_SHEETS_SPREADSHEET_ID` sea correcto (cópialo de la URL del spreadsheet)

### No se guardan los datos
- Verifica que las hojas se llamen exactamente: **"Usuarios"** y **"Actividades"** (con mayúsculas)
- Verifica que la primera fila tenga los headers correctos
- Verifica que el service account tenga permisos de **"Editor"**

## 📝 Notas Importantes

- **NUNCA** subas el archivo JSON de credenciales a GitHub
- **NUNCA** subas el archivo `.env.local` a GitHub
- Si expones las credenciales, revócalas inmediatamente en Google Cloud Console
- El spreadsheet debe estar compartido con el service account para que funcione

## 🚀 Siguiente Paso

Una vez configurado, puedes:
1. Ver los datos en tiempo real en Google Sheets
2. Exportar los datos fácilmente
3. Hacer análisis en Excel/Google Sheets
4. Compartir el spreadsheet con tu equipo (si es necesario)

---

¿Necesitas ayuda con algún paso? ¡Pregúntame! 🚀

