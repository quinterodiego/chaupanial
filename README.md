# Peque Diario 👶

![Peque Diario Logo](https://via.placeholder.com/200x100/8CCFE0/E9A5B4?text=Peque+Diario)

**Acompañando el crecimiento de tu hijo** - La app integral para padres que acompaña el crecimiento de tu hijo desde el nacimiento.

## 🚀 Características principales

Peque Diario es una aplicación PWA (Progressive Web App) diseñada para acompañar a los padres en el seguimiento integral del crecimiento y desarrollo de sus hijos, desde el nacimiento hasta los primeros años.

### 📱 Módulos principales

#### 🏠 Inicio
- Resumen del día con últimos registros
- Accesos rápidos a todas las secciones
- Vista general del progreso

#### 📏 Crecimiento
- Registro de peso, altura y perímetro cefálico
- Gráficos de evolución
- Comparación con percentiles
- Historial completo

#### 🌙 Sueño
- Registro de siestas y horas nocturnas
- Promedios diarios y semanales
- Patrones de sueño
- Estadísticas de descanso

#### 🍎 Alimentación
- Registro de comidas y tomas
- Notas y observaciones
- Filtros por tipo y fecha
- Historial alimentario

#### 🌈 Hitos y Recuerdos
- Registro de logros y momentos especiales
- Fotos y notas
- Línea de tiempo visual
- Compartir con familiares

#### 🚽 Etapa Chau Pañal
- Registro de control de esfínteres
- Calendario de progreso
- Estadísticas y gráficos
- Tips personalizados

#### ⚙️ Perfil
- Datos del niño (nombre, fecha de nacimiento, foto)
- Configuración general
- Gestión de familia (Premium)
- Exportación de datos

### 🆓 **Versión Gratuita (Siempre gratis)**

#### Funcionalidades incluidas:
- ✅ Registro básico de todas las secciones
- ✅ Historial de últimos 30 días
- ✅ Estadísticas básicas
- ✅ Un solo niño por cuenta
- ✅ Tips diarios
- ✅ Acceso a comunidad de padres
- ⚠️ Límite de 50 registros por mes (por sección)

### 👑 **Versión Premium (Pago único: $28.999 ARS)**

#### ✨ **Todo lo de la versión gratuita +**

- 🚀 Registros ilimitados (sin límite mensual)
- 🚀 Historial completo (sin límite de días)
- 🚀 Calendario completo de progreso
- 🚀 Gestión de familia (múltiples niños)
- 🚀 Compartir registros con familiares
- 🚀 Exportar registros para pediatra (PDF)
- 🚀 Modo oscuro
- 🚀 Gráficos y estadísticas avanzadas

## 🛠️ Stack tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **PWA**: Service Workers + Manifest
- **Autenticación**: NextAuth.js + Google OAuth
- **Base de datos**: Google Sheets (temporal, migrable a PostgreSQL/MongoDB)
- **Deploy**: Vercel
- **Dominio**: holapeque.com.ar

## 📋 Estructura del proyecto

```
app/
├── api/                    # API routes
│   ├── activities/         # Registros de actividades
│   ├── auth/               # Autenticación
│   └── family/             # Gestión de familia
├── components/             # Componentes reutilizables
│   ├── MainNav.tsx         # Navegación principal
│   ├── Onboarding.tsx      # Onboarding inicial
│   └── ui/                 # Componentes UI
├── dashboard/              # Dashboard principal
│   ├── page.tsx            # Inicio (resumen del día)
│   ├── crecimiento/        # Sección de crecimiento
│   ├── sueno/              # Sección de sueño
│   ├── alimentacion/       # Sección de alimentación
│   ├── hitos/              # Sección de hitos
│   ├── esfinteres/         # Sección de control de esfínteres
│   └── perfil/             # Perfil del niño
└── community/              # Comunidad de padres
```

## 🗄️ Modelos de datos

### ChildProfile
```typescript
{
  id: string
  userId: string
  name: string
  birthDate: Date
  photo?: string
  growth: GrowthRecord[]
  sleep: SleepRecord[]
  meals: MealRecord[]
  milestones: MilestoneRecord[]
  pottyTraining: PottyTrainingRecord[]
}
```

### Tipos de registros
- **GrowthRecord**: peso, altura, perímetro cefálico, fecha
- **SleepRecord**: inicio, fin, tipo (siesta/nocturno), duración
- **MealRecord**: tipo, cantidad, notas, fecha/hora
- **MilestoneRecord**: título, descripción, foto, fecha
- **PottyTrainingRecord**: tipo (pipi/caca), notas, fecha/hora

## 🚀 Inicio rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Google Cloud (para OAuth y Sheets)

### Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/holapeque.git
cd holapeque
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-aqui
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_SHEETS_CLIENT_EMAIL=tu-service-account@...
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEETS_SPREADSHEET_ID=tu-spreadsheet-id
```

4. Ejecutar en desarrollo
```bash
npm run dev
```

5. Abrir en el navegador
```
http://localhost:3000
```

## 📝 Notas importantes

### ⚠️ Disclaimer médico
**Peque Diario no reemplaza la consulta con pediatras ni otros profesionales de la salud.** Esta aplicación es una herramienta de apoyo para el registro y seguimiento, pero siempre se debe consultar con profesionales de la salud para decisiones médicas.

### 🔐 Seguridad
- Autenticación mediante Google OAuth
- Datos almacenados de forma segura
- JWT + LocalStorage para persistencia de sesión

### 🌐 Dominio
- Dominio de producción: `holapeque.com.ar`
- Sin caracteres especiales (ñ, tildes) en URIs
- Configurado para PWA en dispositivos móviles

## 📄 Licencia

Este proyecto es privado y de uso exclusivo.

## 👥 Contribuir

Este es un proyecto privado. Para consultas o sugerencias, contactar al equipo de desarrollo.

---

**Peque Diario** - Acompañando el crecimiento de tu hijo desde el nacimiento 👶
