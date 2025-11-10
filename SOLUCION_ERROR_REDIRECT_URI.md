# 🔧 Solución: Error redirect_uri_mismatch

## ❌ Error
```
Error 400: redirect_uri_mismatch
Acceso bloqueado: la solicitud de Chau Pañal no es válida
```

## 🔍 Causa
La URI de redirección configurada en Google Cloud Console no coincide exactamente con la que usa NextAuth.

## ✅ Solución Paso a Paso

### 1. Identificar tu URL de Producción

Primero, identifica la URL exacta de tu aplicación en Vercel:
- Ejemplo: `https://chaupanial.vercel.app`
- O tu dominio personalizado: `https://chaupanial.com`

### 2. Configurar URIs en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **"APIs y servicios"** → **"Credenciales"**
4. Haz clic en tu **OAuth 2.0 Client ID** (el que estás usando)
5. En **"URI de redirección autorizados"**, asegúrate de tener EXACTAMENTE estas URIs:

#### Para Desarrollo (Local):
```
http://localhost:3000/api/auth/callback/google
```

#### Para Producción (Vercel):
```
https://tu-dominio.vercel.app/api/auth/callback/google
```

**⚠️ IMPORTANTE:**
- La URI debe ser EXACTAMENTE igual (sin trailing slash)
- Debe incluir `https://` (no `http://` en producción)
- Debe terminar en `/api/auth/callback/google`
- No debe tener espacios ni caracteres extra

### 3. Verificar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Verifica que tengas estas variables:

```
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-aqui
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

**⚠️ IMPORTANTE:**
- `NEXTAUTH_URL` debe ser EXACTAMENTE igual a tu URL de Vercel
- No debe tener trailing slash (`/`)
- Debe usar `https://` (no `http://`)

### 4. Verificar Orígenes JavaScript Autorizados

En Google Cloud Console, en tu OAuth 2.0 Client ID, también verifica **"Orígenes JavaScript autorizados"**:

#### Para Desarrollo:
```
http://localhost:3000
```

#### Para Producción:
```
https://tu-dominio.vercel.app
```

### 5. Guardar y Esperar

1. Haz clic en **"Guardar"** en Google Cloud Console
2. **Espera 5-10 minutos** para que los cambios se propaguen
3. Intenta iniciar sesión nuevamente

### 6. Verificar que Funciona

1. Ve a tu aplicación en Vercel
2. Haz clic en "Iniciar Sesión"
3. Deberías poder iniciar sesión con Google sin errores

## 🔍 Verificar la URI Exacta que Usa NextAuth

Si quieres verificar qué URI está usando NextAuth, puedes agregar un console.log temporalmente:

```typescript
// En app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // ... resto de la configuración
}
```

La URI que NextAuth usa es:
```
{NEXTAUTH_URL}/api/auth/callback/google
```

Donde `NEXTAUTH_URL` es la variable de entorno que configuraste.

## 📝 Ejemplo Completo

Si tu app está en `https://chaupanial.vercel.app`:

### En Google Cloud Console:
**URI de redirección autorizados:**
```
http://localhost:3000/api/auth/callback/google
https://chaupanial.vercel.app/api/auth/callback/google
```

**Orígenes JavaScript autorizados:**
```
http://localhost:3000
https://chaupanial.vercel.app
```

### En Vercel (Environment Variables):
```
NEXTAUTH_URL=https://chaupanial.vercel.app
NEXTAUTH_SECRET=tu-secret
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

## ⚠️ Errores Comunes

### ❌ Error: URI con trailing slash
```
https://chaupanial.vercel.app/api/auth/callback/google/  ← INCORRECTO
https://chaupanial.vercel.app/api/auth/callback/google   ← CORRECTO
```

### ❌ Error: HTTP en producción
```
http://chaupanial.vercel.app/api/auth/callback/google  ← INCORRECTO
https://chaupanial.vercel.app/api/auth/callback/google ← CORRECTO
```

### ❌ Error: NEXTAUTH_URL incorrecto
```
NEXTAUTH_URL=https://chaupanial.vercel.app/  ← INCORRECTO (trailing slash)
NEXTAUTH_URL=https://chaupanial.vercel.app   ← CORRECTO
```

## 🚀 Después de Configurar

1. Guarda los cambios en Google Cloud Console
2. Espera 5-10 minutos
3. Reinicia el deployment en Vercel (opcional, pero recomendado)
4. Prueba iniciar sesión nuevamente

---

¿Necesitas ayuda? ¡Pregúntame! 🚀

