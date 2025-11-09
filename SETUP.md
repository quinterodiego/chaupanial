# 🚀 Guía de Configuración - Chaupanial

## 📋 Checklist de configuración inicial

### 1. 🔧 Configurar Google Cloud Console

#### a) Crear proyecto
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear nuevo proyecto "Chaupanial"
3. Habilitar las APIs necesarias:
   - Google Sheets API
   - Google Drive API (opcional)

#### b) Crear Service Account
1. IAM & Admin → Service Accounts
2. Crear nueva service account
3. Descargar JSON de credenciales
4. Copiar `client_email` y `private_key` a `.env.local`

### 2. 📊 Configurar Google Sheets

#### a) Crear spreadsheet
1. Crear nuevo Google Sheets llamado "Chaupanial-DB"
2. Crear hojas: "Usuarios", "Actividades", "Pagos"
3. Compartir con el email del service account (editor)

#### b) Estructura de datos sugerida:

**Hoja "Usuarios":**
```
A: Fecha_Registro | B: Email | C: Nombre | D: Imagen | E: Es_Premium | F: País
```

**Hoja "Actividades":**
```
A: Timestamp | B: Email_Usuario | C: Nombre_Bebé | D: Tipo_Actividad | E: Detalles_JSON
```

### 3. 🔐 Configurar Google OAuth

1. APIs & Services → Credentials
2. Crear OAuth 2.0 Client IDs
3. Configurar dominios autorizados:
   - `http://localhost:3000` (desarrollo)
   - `https://tudominio.com` (producción)
4. Copiar Client ID y Secret a `.env.local`

### 4. 💳 Configurar MercadoPago

1. Crear cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Crear aplicación
3. Obtener credenciales de prueba y producción
4. Configurar webhook para notificaciones

### 5. 📱 Configurar PWA

1. Crear iconos de la app (192x192, 512x512)
2. Personalizar colores en `manifest.json`
3. Configurar service worker para offline

## 🔒 Archivo .env.local

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=TU_SECRET_SUPER_SEGURO_AQUI

# Google OAuth  
GOOGLE_CLIENT_ID=tu-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=tu-service@tu-proyecto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=tu-spreadsheet-id

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token
MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key

# Configuración
PREMIUM_PRICE_ARS=4999
```

## 🚀 Comandos para desarrollo

```bash
# Instalar dependencias
npm install

# Agregar PWA support
npm install next-pwa

# Desarrollo
npm run dev

# Build producción
npm run build

# Verificar tipos
npm run lint
```

## 📊 Métricas clave a trackear

- **Conversión gratuito → premium**: Objetivo 5-10%
- **Retención D7**: Objetivo 40%+  
- **DAU/MAU**: Objetivo 20%+
- **LTV**: Objetivo $2000+ ARS por usuario premium

## 🎯 Funcionalidades prioritarias para MVP

1. ✅ Registro/login con Google
2. ✅ Dashboard básico
3. 🔄 Seguimiento de comidas/sueño
4. 🔄 Calendario vacunas argentino
5. 🔄 Sistema de pago premium
6. 🔄 Consultas básicas con pediatras

## 💡 Ideas de contenido premium

- **Guías especializadas**: "Primeros 100 días", "Lactancia en Argentina"
- **Consultas**: Video llamadas con pediatras locales
- **Reportes**: PDFs para llevar al médico
- **Comunidad**: Grupos premium por zona/edad del bebé
- **Notificaciones**: Recordatorios inteligentes personalizados

---

**¿Necesitas ayuda con algún paso?** ¡Estoy aquí para ayudarte! 🚀