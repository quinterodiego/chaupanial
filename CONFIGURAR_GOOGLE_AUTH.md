# 🔐 Guía para Configurar Google OAuth - Chau Pañal

## 📋 Pasos para Configurar Google OAuth

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Haz clic en **"Nuevo Proyecto"**
4. Nombre del proyecto: `Chau Pañal` (o el que prefieras)
5. Haz clic en **"Crear"**

### 2. Habilitar Google+ API

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google+ API"** o **"Google Identity"**
3. Haz clic en **"Habilitar"**

### 3. Configurar Pantalla de Consentimiento OAuth

1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** (o "Interno" si tienes Google Workspace)
3. Haz clic en **"Crear"**
4. Completa la información:
   - **Nombre de la app**: `Chau Pañal`
   - **Email de soporte**: Tu email
   - **Logo**: (opcional) Sube el logo de tu app
   - **Dominio de la aplicación**: (opcional)
   - **Email del desarrollador**: Tu email
5. Haz clic en **"Guardar y continuar"**
6. En **"Scopes"**: Haz clic en **"Guardar y continuar"** (no necesitas agregar scopes adicionales)
7. En **"Usuarios de prueba"**: Agrega tu email de Google si quieres probar antes de publicar
8. Haz clic en **"Guardar y continuar"**

### 4. Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth 2.0"**
3. Configura:
   - **Tipo de aplicación**: "Aplicación web"
   - **Nombre**: `Chau Pañal Web Client`
4. En **"Orígenes JavaScript autorizados"**, agrega:
   - `http://localhost:3000` (para desarrollo)
   - `https://tu-dominio.vercel.app` (para producción)
5. En **"URI de redirección autorizados"**, agrega:
   - `http://localhost:3000/api/auth/callback/google` (para desarrollo)
   - `https://tu-dominio.vercel.app/api/auth/callback/google` (para producción)
6. Haz clic en **"Crear"**
7. **¡IMPORTANTE!** Copia el **Client ID** y **Client Secret** que aparecen

### 5. Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto (si no existe)
2. Agrega las siguientes variables:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=TU_SECRET_AQUI

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### 6. Generar NEXTAUTH_SECRET

Ejecuta este comando en tu terminal para generar un secret seguro:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET` en tu archivo `.env.local`

### 7. Verificar Configuración

1. Asegúrate de que tu archivo `.env.local` tenga todas las variables
2. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Ve a `http://localhost:3000`
4. Haz clic en "Iniciar Sesión"
5. Deberías ver la pantalla de Google OAuth

## ⚠️ Notas Importantes

- **NUNCA** subas el archivo `.env.local` a GitHub (ya está en `.gitignore`)
- Para producción en Vercel, agrega las variables de entorno en la configuración del proyecto
- El `NEXTAUTH_URL` debe coincidir exactamente con la URL de tu aplicación
- Si cambias de dominio, actualiza las URIs de redirección en Google Cloud Console

## 🚀 Configuración para Producción (Vercel)

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega todas las variables de `.env.local`:
   - `NEXTAUTH_URL` = `https://tu-dominio.vercel.app`
   - `NEXTAUTH_SECRET` = (el mismo secret o uno nuevo)
   - `GOOGLE_CLIENT_ID` = (tu Client ID)
   - `GOOGLE_CLIENT_SECRET` = (tu Client Secret)
4. Asegúrate de agregar las URIs de redirección de producción en Google Cloud Console

## ❓ Problemas Comunes

### Error: "redirect_uri_mismatch"
- Verifica que las URIs de redirección en Google Cloud Console coincidan exactamente
- Asegúrate de incluir `http://localhost:3000/api/auth/callback/google` para desarrollo

### Error: "invalid_client"
- Verifica que el `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de no tener espacios extra al copiar/pegar

### Error: "access_denied"
- Verifica que la pantalla de consentimiento OAuth esté configurada correctamente
- Si estás en modo de prueba, asegúrate de agregar tu email como usuario de prueba

---

¿Necesitas ayuda? ¡Pregúntame! 🚀

